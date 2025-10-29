#!/usr/bin/env python3
"""
Check all dependencies required for Qwen2.5-7B-Instruct
"""

import sys
import subprocess

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        version = sys.modules[import_name].__version__
        return True, version
    except ImportError:
        return False, None
    except AttributeError:
        # Package is installed but no __version__
        return True, "installed"

def main():
    print("=" * 60)
    print("NoteQuest AI Service - Dependency Check")
    print("=" * 60)
    print()
    
    # Core dependencies
    packages = [
        ("torch", "torch"),
        ("transformers", "transformers"),
        ("accelerate", "accelerate"),
        ("bitsandbytes", "bitsandbytes"),
        ("sentencepiece", "sentencepiece"),
        ("safetensors", "safetensors"),
        ("einops", "einops"),
        ("protobuf", "google.protobuf"),
        ("numpy", "numpy"),
        ("scipy", "scipy"),
        ("tqdm", "tqdm"),
        ("chromadb", "chromadb"),
        ("sentence-transformers", "sentence_transformers"),
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("pydantic", "pydantic"),
        ("pypdf", "pypdf"),
        ("python-docx", "docx"),
        ("pdfminer", "pdfminer"),
    ]
    
    all_ok = True
    missing = []
    
    print("Checking core dependencies...")
    print("-" * 60)
    for package, import_name in packages:
        installed, version = check_package(package, import_name)
        status = "✅" if installed else "❌"
        print(f"{status} {package:25s} {version if installed else 'MISSING'}")
        if not installed:
            missing.append(package)
            all_ok = False
    
    print()
    
    # Check PyTorch CUDA support
    print("Checking PyTorch CUDA support...")
    print("-" * 60)
    try:
        import torch
        print(f"✅ PyTorch version: {torch.__version__}")
        
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.version.cuda}")
            print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
            print(f"✅ CUDA devices: {torch.cuda.device_count()}")
        else:
            print("❌ CUDA not available")
            all_ok = False
    except Exception as e:
        print(f"❌ Error checking PyTorch: {e}")
        all_ok = False
    
    print()
    
    # Check Transformers version
    print("Checking Transformers library...")
    print("-" * 60)
    try:
        import transformers
        print(f"✅ Transformers version: {transformers.__version__}")
        
        # Check model compatibility
        from transformers import AutoTokenizer, AutoModelForCausalLM
        print(f"✅ AutoTokenizer available")
        print(f"✅ AutoModelForCausalLM available")
    except Exception as e:
        print(f"❌ Error checking Transformers: {e}")
        all_ok = False
    
    print()
    
    # Check Qwen model files
    print("Checking Qwen2.5 model files...")
    print("-" * 60)
    import os
    model_path = "models/Qwen2.5-7B-Instruct"
    if os.path.exists(model_path):
        print(f"✅ Model directory exists: {model_path}")
        
        required_files = [
            "config.json",
            "tokenizer.json",
            "tokenizer_config.json",
            "generation_config.json",
            "model.safetensors.index.json"
        ]
        
        for file in required_files:
            file_path = os.path.join(model_path, file)
            if os.path.exists(file_path):
                print(f"✅ {file}")
            else:
                print(f"❌ {file} MISSING")
                all_ok = False
    else:
        print(f"❌ Model directory not found: {model_path}")
        all_ok = False
    
    print()
    print("=" * 60)
    
    if all_ok:
        print("✅ All dependencies are installed!")
        print("✅ Qwen2.5-7B-Inasive model is ready!")
    else:
        print("❌ Some dependencies are missing!")
        print()
        print("Missing packages:")
        for pkg in missing:
            print(f"  - {pkg}")
        print()
        print("Install missing packages with:")
        print(f"  pip install {' '.join(missing)}")
    
    print("=" * 60)
    
    return all_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

