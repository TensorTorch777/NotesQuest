"""
Direct test of quiz generation to debug the hanging issue
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import sys

def test_quiz_generation():
    print("🔄 Loading model...")
    
    model_path = "models/Qwen2.5-7B-Instruct"
    
    # Load tokenizer
    print("📝 Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    
    # Load model
    print("🤖 Loading model...")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
    )
    
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    model.eval()
    
    # Simple test content
    test_content = """
    The nervous system is responsible for coordinating and controlling body functions. 
    It consists of neurons which transmit electrical signals. The brain is the control center.
    """
    
    # Prepare prompt
    messages = [
        {"role": "system", "content": "You generate exam-quality MCQs."},
        {"role": "user", "content": f"Generate 3 MCQs from this text.\n\nTEXT:\n{test_content}"}
    ]
    
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt")
    
    device = next(model.parameters()).device
    print(f"🔧 Device: {device} | inputs_device: {inputs['input_ids'].device}")
    
    inputs = {k: v.to(device) for k, v in inputs.items()}
    print(f"🔧 inputs_device AFTER move: {inputs['input_ids'].device}")
    
    # Generate with timeout simulation
    print("🔄 Starting model.generate()...")
    
    try:
        with torch.no_grad():
            out = model.generate(
                **inputs,
                max_new_tokens=200,
                max_length=inputs['input_ids'].shape[1] + 200,
                do_sample=False,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=(tokenizer.pad_token_id or tokenizer.eos_token_id),
                use_cache=True,
            )
        
        print(f"⚡ Output shape: {out.shape}")
        decoded = tokenizer.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        print("✅ Generated quiz:")
        print(decoded)
        
    except Exception as e:
        print(f"❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_quiz_generation()

