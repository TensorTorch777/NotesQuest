import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

print("=== Testing Phi-3-mini-4k-instruct on CPU (Fallback) ===")

# Load model on CPU
model_name = "./models/Phi-3-mini-4k-instruct"
print(f"Loading model: {model_name}")

start_time = time.time()
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,  # Use float32 for CPU
    device_map="cpu"  # Force CPU usage
)
load_time = time.time() - start_time

print(f"✅ Model loaded in {load_time:.2f} seconds")
print(f"Model device: {next(model.parameters()).device}")
print(f"Model dtype: {next(model.parameters()).dtype}")

# Test inference on CPU
print("\n=== Testing Educational Content Generation ===")

# Test 1: Summary Generation
prompt1 = """<|user|>
Create a concise summary of the following educational content about machine learning:

Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns. There are three main types: supervised learning (learning from labeled examples), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error with rewards).

<|assistant|>"""

print("Test 1: Summary Generation")
start_time = time.time()
inputs1 = tokenizer(prompt1, return_tensors="pt")  # CPU tensor
with torch.no_grad():
    outputs1 = model.generate(**inputs1, max_length=200, temperature=0.7, do_sample=True)
response1 = tokenizer.decode(outputs1[0][inputs1.input_ids.shape[1]:], skip_special_tokens=True)
inference_time1 = time.time() - start_time

print(f"✅ Summary generated in {inference_time1:.2f} seconds")
print(f"Response: {response1}")

# Test 2: Quiz Question Generation
prompt2 = """<|user|>
Generate a multiple-choice quiz question about machine learning:

What is the main difference between supervised and unsupervised learning?

A) Supervised learning uses labeled data, unsupervised learning finds patterns in unlabeled data
B) Supervised learning is faster than unsupervised learning
C) Unsupervised learning requires more computational power
D) There is no difference between them

<|assistant|>"""

print("\nTest 2: Quiz Question Generation")
start_time = time.time()
inputs2 = tokenizer(prompt2, return_tensors="pt")
with torch.no_grad():
    outputs2 = model.generate(**inputs2, max_length=300, temperature=0.8, do_sample=True)
response2 = tokenizer.decode(outputs2[0][inputs2.input_ids.shape[1]:], skip_special_tokens=True)
inference_time2 = time.time() - start_time

print(f"✅ Quiz question generated in {inference_time2:.2f} seconds")
print(f"Response: {response2}")

print(f"\n=== Performance Summary ===")
print(f"Model loading time: {load_time:.2f} seconds")
print(f"Average inference time: {(inference_time1 + inference_time2) / 2:.2f} seconds")
print(f"CPU inference working: ✅")

print("\n🎉 Phi-3-mini-4k-instruct is working on CPU!")
print("We can optimize GPU usage later. Ready to proceed with AI service setup!")







