@echo off
echo ============================================================
echo NoteQuest AI Service - Install Requirements
echo ============================================================
echo.

echo Activating qwen environment...
call conda activate qwen

if errorlevel 1 (
    echo Error: Could not activate qwen environment
    echo Please create it first: conda create -n qwen python=3.10
    pause
    exit /b 1
)

echo.
echo Installing PyTorch with CUDA 12.4 support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

echo.
echo Installing Transformers and related packages...
pip install transformers>=4.44.0 accelerate safetensors sentencepiece einops "protobuf<6" tqdm

echo.
echo Installing quantization packages...
pip install bitsandbytes>=0.48.1

echo.
echo Installing Vector DB...
pip install chromadb>=0.5.0 sentence-transformers>=2.2.2

echo.
echo Installing FastAPI...
pip install fastapi uvicorn pydantic

echo.
echo Installing document processors...
pip install pypdf python-docx pdfminer.six pdfplumber

echo.
echo ============================================================
echo Installation complete!
echo ============================================================
echo.
echo Run the following to verify:
echo   conda activate qwen
echo   python check_dependencies.py
echo.
pause

