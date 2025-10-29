from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import logging
import json

from models.model_manager import ModelManager
from models.specialized_models import SummaryGenerator, QuizGenerator, FlashcardGenerator, ChatGenerator
from utils.data_processor import DocumentProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NoteQuest AI Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

model_manager = ModelManager({
    "summary": {"model_path": "models/Qwen2.5-7B-Instruct"},
    "quiz": {"type": "base"},
    "flashcards": {"type": "base"},
})
processor = DocumentProcessor()

@app.on_event("startup")
async def startup_event():
    await model_manager.load_models()

class SummaryReq(BaseModel):
    content: str
    title: str

@app.post("/generate/summary")
async def generate_summary(req: SummaryReq):
    try:
        logger.info(f"📝 Generating summary for: {req.title[:50]}... (content length: {len(req.content)} chars)")
        gen = SummaryGenerator(model_manager.get("summary"))
        result = await gen.generate(req.content, req.title)
        logger.info(f"✅ Summary generated successfully")
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"❌ Summary generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class QuizReq(BaseModel):
    content: str
    title: str
    num_questions: int = 8

@app.post("/generate/quiz")
async def generate_quiz(req: QuizReq):
    try:
        logger.info(f"🎲 Generating quiz for: {req.title[:50]}... (content: {len(req.content)} chars, questions: {req.num_questions})")
        gen = QuizGenerator(model_manager.get("quiz"))
        result = await gen.generate(req.content, req.title, req.num_questions)
        logger.info("✅ Quiz generated successfully")
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"❌ Quiz generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class FlashReq(BaseModel):
    content: str
    title: str
    num_cards: int = 12

@app.post("/generate/flashcards")
async def generate_flashcards(req: FlashReq):
    gen = FlashcardGenerator(model_manager.get("flashcards"))
    result = await gen.generate(req.content, req.title, req.num_cards)
    return {"success": True, "data": result}

@app.post("/upload/document")
async def upload_document(file: UploadFile = File(...)):
    try:
        text = await processor.process_file(file)
        return {"success": True, "content": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatReq(BaseModel):
    message: str
    history: list = []

@app.post("/chat")
async def chat(req: ChatReq):
    try:
        logger.info(f"💬 Chat request - message: {req.message[:50]}..., history: {len(req.history)} messages")
        gen = ChatGenerator(model_manager.get("summary"))  # Use same model as summary
        # Increased max_tokens for complete responses, balanced temperature
        result = await gen.generate(req.message, req.history, max_tokens=1000, temperature=0.5)
        logger.info(f"✅ Chat response generated successfully")
        return {"success": True, "message": result["message"], "data": result}
    except Exception as e:
        logger.error(f"❌ Chat generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream")
async def chat_stream(req: ChatReq):
    """
    Stream chat response token by token using Server-Sent Events (SSE).
    This provides true streaming like ChatGPT - tokens appear as they're generated.
    """
    async def generate():
        try:
            gen = ChatGenerator(model_manager.get("summary"))
            for chunk in gen.generate_stream(req.message, req.history, max_tokens=1000, temperature=0.5):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"❌ Chat streaming failed: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/health")
async def health():
    return await model_manager.health_check()
