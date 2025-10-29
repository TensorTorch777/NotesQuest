@echo off
REM Start Qwen2.5 AI Service on RTX 5080 (Windows)

echo Starting Qwen2.5-7B AI Service with FP16...
echo GPU: RTX 5080 (16GB VRAM)
echo.

cd /d "%~dp0"

REM Activate virtual environment if it exists
if exist "notesquest-ai-new\Scripts\activate.bat" (
    call notesquest-ai-new\Scripts\activate.bat
)

REM Check if GPU is available
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
python -c "import torch; print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"

REM Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause

