from datetime import datetime
from typing import Any, Dict, List, Tuple, Optional
import torch
import time

class BaseChatWrapper:
    def __init__(self, model_data: Dict[str, Any]):
        self.tok = model_data["tokenizer"]
        self.model = model_data["model"]
        self.config = model_data["config"]
        self.model.eval()
        if self.tok.pad_token_id is None and self.tok.eos_token_id is not None:
            self.tok.pad_token = self.tok.eos_token

    def _chat(self, messages: List[Dict[str, str]], max_new_tokens: int = 600, temperature: float = 0.0) -> str:
        prompt = self.tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.tok(prompt, return_tensors="pt")
        # Get the device from the first parameter of the model (works for both single and multi-device)
        device = next(self.model.parameters()).device
        print(f"🔧 Device: {device} | inputs_device BEFORE move: {inputs['input_ids'].device}")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        print(f"🔧 inputs_device AFTER move: {inputs['input_ids'].device}")
        do_sample = temperature is not None and temperature > 0.0
        
        import time
        start = time.time()
        print("🔄 Starting model.generate()...")
        with torch.no_grad():
            out = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=do_sample,
                temperature=temperature if do_sample else None,
                top_p=0.9 if do_sample else None,
                repetition_penalty=1.05,
                eos_token_id=self.tok.eos_token_id,
                pad_token_id=(self.tok.pad_token_id or self.tok.eos_token_id),
                use_cache=True,
                num_beams=1,  # Greedy decoding for speed
                early_stopping=True,  # Stop early if EOS is generated
            )
        gen_time = time.time() - start
        actual_tokens = out.shape[1] - inputs["input_ids"].shape[1]
        print(f"⚡ Generation took {gen_time:.2f}s for {actual_tokens} tokens ({actual_tokens/gen_time:.1f} tok/s)")
        print(f"⚡ Output shape: {out.shape}")
        return self.tok.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()

    def _chat_stream(self, messages: List[Dict[str, str]], max_new_tokens: int = 600, temperature: float = 0.0):
        """
        Stream tokens as they're generated - true streaming like ChatGPT.
        Yields tokens one by one as the model generates them.
        """
        prompt = self.tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.tok(prompt, return_tensors="pt")
        device = next(self.model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        do_sample = temperature is not None and temperature > 0.0
        
        input_length = inputs["input_ids"].shape[1]
        generated_tokens = []
        
        print("🔄 Starting streaming generation...")
        import time
        start = time.time()
        
        with torch.no_grad():
            # Use generate with yield to stream tokens
            # We'll manually decode as tokens come in
            generated = inputs["input_ids"].clone()
            
            for _ in range(max_new_tokens):
                outputs = self.model(generated, use_cache=True)
                logits = outputs.logits[:, -1, :]
                
                if do_sample:
                    import torch.nn.functional as F
                    probs = F.softmax(logits / temperature, dim=-1)
                    next_token = torch.multinomial(probs, num_samples=1)
                else:
                    next_token = torch.argmax(logits, dim=-1).unsqueeze(-1)
                
                # Check for EOS
                if next_token.item() == self.tok.eos_token_id:
                    break
                
                generated = torch.cat([generated, next_token], dim=-1)
                generated_tokens.append(next_token.item())
                
                # Decode the new token and yield immediately (no delay for speed)
                decoded = self.tok.decode([next_token.item()], skip_special_tokens=True)
                yield decoded
        
        gen_time = time.time() - start
        print(f"⚡ Streaming generation took {gen_time:.2f}s for {len(generated_tokens)} tokens")

class SummaryGenerator(BaseChatWrapper):
    MAX_INPUT_TOKENS = 120_000
    MAX_CHUNKS = 24

    def _scan_input(self, text: str) -> Tuple[int, List[int]]:
        ids = self.tok.encode(text)
        return len(ids), ids

    def _choose_chunking(self, total_tokens: int) -> Tuple[int, int]:
        if total_tokens <= 2_000:   return 1_000, 60
        if total_tokens <= 8_000:   return 1_600, 100
        if total_tokens <= 20_000:  return 1_900, 140
        return 2_100, 160

    def _chunk_by_tokens(self, ids: List[int], max_tokens: int, overlap: int) -> List[str]:
        chunks, start, n = [], 0, len(ids)
        while start < n:
            end = min(start + max_tokens, n)
            chunks.append(self.tok.decode(ids[start:end]))
            if end == n: break
            start = max(0, end - overlap)
            if len(chunks) >= self.MAX_CHUNKS: break
        return chunks

    def _gen_budgets(self, num_chunks: int) -> Tuple[int, int]:
        # Reduced token budgets for faster generation
        if num_chunks <= 4:   return 120, 700
        if num_chunks <= 10:  return 100, 600
        if num_chunks <= 16:  return 80, 500
        return 60, 400

    async def generate(self, content: str, title: str, max_length: int = 0) -> Dict[str, Any]:
        total, ids = self._scan_input(content)
        if total > self.MAX_INPUT_TOKENS:
            raise ValueError(f"Input too large ({total} tokens). Split the PDF (< {self.MAX_INPUT_TOKENS}).")

        win, ov = self._choose_chunking(total)
        chunks = self._chunk_by_tokens(ids, win, ov)
        num_chunks = len(chunks)
        map_nt, reduce_nt = self._gen_budgets(num_chunks)

        import time
        sys_map = "Summarize accurately. Bullet points only. No hallucinations. No paragraphs."
        chunk_summaries: List[str] = []
        for i, c in enumerate(chunks):
            start_time = time.time()
            print(f"🔹 Processing chunk {i+1}/{len(chunks)} (budget: {map_nt} tokens)...")
            s = self._chat(
                [{"role": "system", "content": sys_map},
                 {"role": "user", "content": f"Summarize into crisp bullet points. Keep definitions and mechanisms.\n\n{c}"}],
                max_new_tokens=map_nt,
                temperature=0.0
            )
            elapsed = time.time() - start_time
            print(f"✅ Chunk {i+1} done in {elapsed:.1f}s ({len(s)} chars)")
            chunk_summaries.append(s)

        joined = "\n\n-----\n\n".join(chunk_summaries)
        reduce_prompt = (
            "Convert the combined notes into structured study notes.\n\n"
            "Rules:\n- KEEP important details; remove only exact duplicates.\n"
            "- DO NOT write paragraphs.\n- Group related ideas; keep bullets short.\n"
            "- Prefer mechanisms, definitions, cause→effect links.\n\n"
            "Output:\n"
            "### Executive Summary (4–6 short bullets)\n"
            "### Core Concepts (10–20 bullets)\n"
            "### Key Terms & Definitions (5–15 items)\n"
            "### Processes / Mechanisms (numbered steps if present)\n"
            "### Cause → Effect (if applicable)\n\n"
            f"{joined}"
        )
        print(f"🔄 Combining {num_chunks} chunks (budget: {reduce_nt} tokens)...")
        start_reduce = time.time()
        final = self._chat(
            [{"role": "system", "content": "You produce exam-ready structured notes."},
             {"role": "user", "content": reduce_prompt}],
            max_new_tokens=reduce_nt,
            temperature=0.0
        )
        reduce_time = time.time() - start_reduce
        print(f"✅ Reduce complete in {reduce_time:.1f}s")
        return {
            "content": final.strip(),
            "title": title,
            "model": f"Qwen2.5-7B-Instruct (Study Notes, map={map_nt}, reduce={reduce_nt}, chunks={num_chunks})",
            "timestamp": datetime.utcnow().isoformat(),
        }

class QuizGenerator(BaseChatWrapper):
    MAX_INPUT_TOKENS = 120_000
    MAX_CHUNKS = 20

    def _scan_input(self, text: str) -> Tuple[int, List[int]]:
        ids = self.tok.encode(text)
        return len(ids), ids

    def _choose_chunking(self, total_tokens: int) -> Tuple[int, int]:
        # Slightly bigger windows than summary because we want more context per chunk
        if total_tokens <= 2_000:   return 1_400, 80
        if total_tokens <= 8_000:   return 1_900, 120
        if total_tokens <= 20_000:  return 2_200, 150
        return 2_400, 180

    def _chunk_by_tokens(self, ids: List[int], max_tokens: int, overlap: int) -> List[str]:
        chunks, start, n = [], 0, len(ids)
        while start < n:
            end = min(start + max_tokens, n)
            chunks.append(self.tok.decode(ids[start:end]))
            if end == n: break
            start = max(0, end - overlap)
            if len(chunks) >= self.MAX_CHUNKS: break
        return chunks

    def _target_counts(self, total_tokens: int, num_chunks: int) -> Tuple[int, int]:
        # Aim for 12–30 questions based on document size
        baseline = max(12, min(30, total_tokens // 2500 + 10))
        per_chunk = max(3, min(6, baseline // max(1, num_chunks)))
        return baseline, per_chunk

    async def generate(self, content: str, title: str, num_questions: int = 0):
        total, ids = self._scan_input(content)
        if total > self.MAX_INPUT_TOKENS:
            raise ValueError(f"Input too large ({total} tokens). Split the PDF (< {self.MAX_INPUT_TOKENS}).")

        win, ov = self._choose_chunking(total)
        chunks = self._chunk_by_tokens(ids, win, ov)
        num_chunks = len(chunks)
        target_total, per_chunk = self._target_counts(total, num_chunks)

        # Map: fast small generations per chunk
        sys_map = (
            "Generate high-quality MCQs for exams. Strong distractors."
        )
        mapped: List[str] = []
        for i, c in enumerate(chunks):
            t0 = time.time()
            print(f"🧩 MCQ map chunk {i+1}/{num_chunks}: {per_chunk} Qs, budget 180 tokens")
            out = self._chat(
                [
                    {"role": "system", "content": sys_map},
                    {"role": "user", "content": f"""
Write {per_chunk} MCQs from the text. Follow strictly:
- One sentence per question
- 4 options A–D, only one correct
- Plausible distractors; rephrase; same category across options
- Shuffle correct letter across questions
- Output ONLY in this format:

Q1) Question?
A) Option
B) Option
C) Option
D) Option
Correct: <Letter>

TEXT:
{c}
"""}
                ],
                max_new_tokens=180,
                temperature=0.25,
            )
            print(f"✅ Map {i+1} in {time.time()-t0:.1f}s ({len(out)} chars)")
            mapped.append(out)

        joined = "\n\n-----\n\n".join(mapped)

        # Reduce: consolidate and trim to target_total
        reduce_prompt = f"""
Combine the MCQs below into a SINGLE quiz of {target_total} questions.
Rules:
- Keep only the best, non-duplicate questions
- Maintain the required format exactly (no extra commentary)
- Ensure distribution of correct letters is shuffled

MCQs:
{joined}
"""
        print(f"🧮 Reducing to {target_total} questions (budget 600 tokens)...")
        final = self._chat(
            [
                {"role": "system", "content": "You are a meticulous exam MCQ editor. Output strictly the MCQ list only."},
                {"role": "user", "content": reduce_prompt},
            ],
            max_new_tokens=600,
            temperature=0.2,
        )

        return {
            "questions": final.strip(),
            "title": title,
            "num_questions": target_total,
        }

class FlashcardGenerator(BaseChatWrapper):
    MAX_INPUT_TOKENS = 120_000
    MAX_CHUNKS = 20

    def _scan_input(self, text: str) -> Tuple[int, List[int]]:
        ids = self.tok.encode(text)
        return len(ids), ids

    def _choose_chunking(self, total_tokens: int) -> Tuple[int, int]:
        if total_tokens <= 2_000:   return 1_400, 80
        if total_tokens <= 8_000:   return 1_900, 120
        if total_tokens <= 20_000:  return 2_200, 150
        return 2_400, 180

    def _chunk_by_tokens(self, ids: List[int], max_tokens: int, overlap: int) -> List[str]:
        chunks, start, n = [], 0, len(ids)
        while start < n:
            end = min(start + max_tokens, n)
            chunks.append(self.tok.decode(ids[start:end]))
            if end == n: break
            start = max(0, end - overlap)
            if len(chunks) >= self.MAX_CHUNKS: break
        return chunks

    def _target_counts(self, total_tokens: int, num_chunks: int) -> Tuple[int, int]:
        # Aim for 15–35 flashcards based on document size
        baseline = max(15, min(35, total_tokens // 2000 + 15))
        per_chunk = max(4, min(7, baseline // max(1, num_chunks)))
        return baseline, per_chunk

    async def generate(self, content: str, title: str, num_cards: int = 0):
        total, ids = self._scan_input(content)
        if total > self.MAX_INPUT_TOKENS:
            raise ValueError(f"Input too large ({total} tokens). Split the PDF (< {self.MAX_INPUT_TOKENS}).")

        win, ov = self._choose_chunking(total)
        chunks = self._chunk_by_tokens(ids, win, ov)
        num_chunks = len(chunks)
        target_total, per_chunk = self._target_counts(total, num_chunks)

        # Map: fast small generations per chunk
        sys_map = "Generate concise flashcards for memory recall. Deterministic."
        mapped: List[str] = []
        for i, c in enumerate(chunks):
            t0 = time.time()
            print(f"🧩 Flashcard map chunk {i+1}/{num_chunks}: {per_chunk} cards, budget 200 tokens")
            out = self._chat(
                [
                    {"role": "system", "content": sys_map},
                    {"role": "user", "content": f"""
Generate {per_chunk} flashcards. Format (repeat for each):
Term: X
Definition: Y

TEXT:
{c}
"""}
                ],
                max_new_tokens=200,
                temperature=0.0,
            )
            print(f"✅ Map {i+1} in {time.time()-t0:.1f}s ({len(out)} chars)")
            mapped.append(out)

        joined = "\n\n-----\n\n".join(mapped)

        # Reduce: consolidate and trim to target_total
        reduce_prompt = f"""
Combine the flashcards below into a SINGLE set of {target_total} high-quality flashcards.
Rules:
+- Keep only the best, non-duplicate terms
+- Maintain the format exactly (Term: ... Definition: ...)
+- Ensure definitions are clear and concise

Flashcards:
{joined}
"""
        print(f"🧮 Reducing to {target_total} flashcards (budget 700 tokens)...")
        final = self._chat(
            [
                {"role": "system", "content": "You are a meticulous flashcard editor. Output strictly the flashcard list only."},
                {"role": "user", "content": reduce_prompt},
            ],
            max_new_tokens=700,
            temperature=0.0,
        )

        # Parse the final output into cards
        cards: List[Dict[str, str]] = []
        for block in final.split("Term:")[1:]:
            if "Definition:" in block:
                term, definition = block.split("Definition:", 1)
                term, definition = term.strip(), definition.strip()
                if term and definition:
                    cards.append({"term": term, "definition": definition})

        return {"flashcards": cards, "raw": final.strip(), "title": title, "num_cards": len(cards)}


class ChatGenerator(BaseChatWrapper):
    """Chat interface using Qwen model for conversational interactions."""
    
    async def generate(self, message: str, history: Optional[List[Dict[str, str]]] = None, max_tokens: int = 1000, temperature: float = 0.5, include_thinking: bool = True) -> Dict[str, Any]:
        """
        Generate a chat response with optional thinking/reasoning step.
        
        Args:
            message: User's message
            history: Conversation history as list of {role, content} dicts
            max_tokens: Maximum tokens to generate (default: 1000 for complete responses)
            temperature: Sampling temperature (0.0 = deterministic, 1.0 = creative) (default: 0.5 for balanced speed/quality)
            include_thinking: Whether to generate a thinking/reasoning step (default: True)
        
        Returns:
            Dict with 'message', 'thinking' (optional), and 'model' fields
        """
        try:
            import time
            start_time = time.time()
            
            # Build conversation messages
            messages = []
            thinking = None
            
            # Add system message if history is empty
            if not history or len(history) == 0:
                system_content = "You are a helpful AI assistant powered by Qwen. Provide clear, concise, and accurate responses. Be brief and to the point."
                if include_thinking:
                    system_content += " Before responding, think about the question and explain your reasoning."
                messages.append({
                    "role": "system",
                    "content": system_content
                })
            else:
                # Add history messages (last 6 to reduce context and speed up processing)
                for msg in history[-6:]:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Generate thinking step if enabled
            if include_thinking:
                thinking_messages = messages + [{
                    "role": "user",
                    "content": f"Think step by step about how to answer this question: {message}\n\nProvide your reasoning as if you're planning your response. Use bullet points to break down your thought process."
                }]
                
                thinking = self._chat(
                    thinking_messages,
                    max_new_tokens=300,
                    temperature=0.7
                )
                print(f"🧠 Thinking generated: {len(thinking)} chars")
            
            # Generate actual response
            response_messages = messages + [{
                "role": "user",
                "content": message
            }]
            
            print(f"💬 Chat request - message: {message[:50]}..., history: {len(history) if history else 0} messages, max_tokens: {max_tokens}")
            
            # Generate response with optimized parameters
            response = self._chat(
                response_messages,
                max_new_tokens=max_tokens,
                temperature=temperature
            )
            
            elapsed = time.time() - start_time
            print(f"✅ Chat response generated in {elapsed:.2f}s ({len(response)} chars)")
            
            result = {
                "message": response,
                "model": "Qwen2.5-7B-Instruct",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if thinking:
                result["thinking"] = thinking
            
            return result
            
        except Exception as e:
            print(f"❌ Chat generation error: {e}")
            raise

    def generate_stream(self, message: str, history: Optional[List[Dict[str, str]]] = None, max_tokens: int = 1000, temperature: float = 0.5, include_thinking: bool = True):
        """
        Stream chat response token by token - true streaming like ChatGPT.
        Yields: "thinking" or "message" type with token chunks.
        """
        try:
            # Build conversation messages
            messages = []
            
            # Add system message if history is empty
            if not history or len(history) == 0:
                system_content = "You are a helpful AI assistant powered by Qwen. Provide clear, concise, and accurate responses. Be brief and to the point."
                if include_thinking:
                    system_content += " Before responding, think about the question and explain your reasoning."
                messages.append({
                    "role": "system",
                    "content": system_content
                })
            else:
                # Add history messages (last 6 to reduce context and speed up processing)
                for msg in history[-6:]:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Generate thinking step if enabled
            if include_thinking:
                thinking_messages = messages + [{
                    "role": "user",
                    "content": f"Think step by step about how to answer this question: {message}\n\nProvide your reasoning as if you're planning your response. Use bullet points to break down your thought process."
                }]
                
                yield {"type": "thinking_start"}
                thinking_text = ""
                for token in self._chat_stream(thinking_messages, max_new_tokens=300, temperature=0.7):
                    thinking_text += token
                    yield {"type": "thinking", "token": token, "text": thinking_text}
                yield {"type": "thinking_complete", "text": thinking_text}
            
            # Generate actual response
            response_messages = messages + [{
                "role": "user",
                "content": message
            }]
            
            yield {"type": "message_start"}
            response_text = ""
            for token in self._chat_stream(response_messages, max_new_tokens=max_tokens, temperature=temperature):
                response_text += token
                yield {"type": "message", "token": token, "text": response_text}
            yield {"type": "message_complete", "text": response_text}
            
        except Exception as e:
            print(f"❌ Chat streaming error: {e}")
            yield {"type": "error", "message": str(e)}
