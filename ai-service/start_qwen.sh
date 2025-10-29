#!/bin/bash
# Start Qwen2.5 AI Service on RTX 5080

echo "🚀 Starting Qwen2.5-7B AI Service with FP16..."
echo "GPU: RTX 5080 (16GB VRAM)"
echo ""

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "notesquest-ai-new/Scripts" ]; then
    source notesquest-ai-new/Scripts/activate
fi

# Check if GPU is available
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

