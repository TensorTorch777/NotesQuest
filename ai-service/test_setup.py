import torch
import transformers
import sys
import os

print("=== NoteQuest AI Setup Test ===")
print(f"Python version: {sys.version}")
print(f"PyTorch version: {torch.__version__}")
print(f"Transformers version: {transformers.__version__}")
print()

print("=== GPU Information ===")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"Current GPU: {torch.cuda.current_device()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print(f"GPU compute capability: {torch.cuda.get_device_properties(0).major}.{torch.cuda.get_device_properties(0).minor}")
    print()

    print("=== GPU Performance Test ===")
    try:
        # Test tensor operations
        x = torch.randn(1000, 1000).cuda()
        y = torch.randn(1000, 1000).cuda()
        z = torch.mm(x, y)
        print("✅ GPU tensor operations working!")
        print(f"Result shape: {z.shape}")
        print(f"GPU memory used: {torch.cuda.memory_allocated() / 1024**3:.4f} GB")
        
        # Test model loading
        print("\n=== Model Loading Test ===")
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        # Test with a small model first
        model_name = "microsoft/DialoGPT-small"
        print(f"Testing with model: {model_name}")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16)
        model = model.cuda()
        
        print("✅ Model loaded successfully on GPU!")
        print(f"Model device: {next(model.parameters()).device}")
        print(f"Model dtype: {next(model.parameters()).dtype}")
        
        # Test inference
        input_text = "Hello, how are you?"
        inputs = tokenizer(input_text, return_tensors="pt").to("cuda")
        
        with torch.no_grad():
            outputs = model.generate(**inputs, max_length=50, do_sample=True, temperature=0.7)
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"✅ Inference test successful!")
        print(f"Input: {input_text}")
        print(f"Output: {response}")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        
else:
    print("❌ CUDA not available!")

print("\n=== Library Import Test ===")
try:
    import accelerate
    print("✅ Accelerate imported successfully")
except ImportError as e:
    print(f"❌ Accelerate import failed: {e}")

try:
    import bitsandbytes
    print("✅ BitsAndBytes imported successfully")
except ImportError as e:
    print(f"❌ BitsAndBytes import failed: {e}")

try:
    import peft
    print("✅ PEFT imported successfully")
except ImportError as e:
    print(f"❌ PEFT import failed: {e}")

try:
    import fastapi
    print("✅ FastAPI imported successfully")
except ImportError as e:
    print(f"❌ FastAPI import failed: {e}")

try:
    import redis
    print("✅ Redis imported successfully")
except ImportError as e:
    print(f"❌ Redis import failed: {e}")

print("\n=== Setup Complete! ===")
print("Your RTX 5080 is ready for NoteQuest AI! 🚀")





