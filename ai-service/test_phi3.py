import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import time

print("=== Testing Phi-3-mini-4k-instruct on RTX 5080 ===")

# Load model
model_name = "./models/Phi-3-mini-4k-instruct"
print(f"Loading model: {model_name}")

start_time = time.time()
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)
load_time = time.time() - start_time

print(f"✅ Model loaded in {load_time:.2f} seconds")
print(f"Model device: {next(model.parameters()).device}")
print(f"Model dtype: {next(model.parameters()).dtype}")

# Test inference
print("\n=== Testing Educational Content Generation ===")

# Test 1: Summary Generation
prompt1 = """<|user|>
Create a concise summary of the following educational content about machine learning:

Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns. There are three main types: supervised learning (learning from labeled examples), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error with rewards).

<|assistant|>"""

print("Test 1: Summary Generation")
start_time = time.time()
inputs1 = tokenizer(prompt1, return_tensors="pt").to("cuda")
with torch.no_grad():
    outputs1 = model.generate(**inputs1, max_length=200, temperature=0.7, do_sample=True)
response1 = tokenizer.decode(outputs1[0][inputs1.input_ids.shape[1]:], skip_special_tokens=True)
inference_time1 = time.time() - start_time

print(f"✅ Summary generated in {inference_time1:.2f} seconds")
print(f"Response: {response1}")

# Test 2: Quiz Question Generation
prompt2 = """<|user|>
Generate a multiple-choice quiz question about machine learning based on this content:

Machine learning algorithms can be categorized into supervised, unsupervised, and reinforcement learning. Supervised learning uses labeled training data to learn patterns, while unsupervised learning finds hidden patterns in unlabeled data. Reinforcement learning learns through interaction with an environment and receiving rewards or penalties.

<|assistant|>"""

print("\nTest 2: Quiz Question Generation")
start_time = time.time()
inputs2 = tokenizer(prompt2, return_tensors="pt").to("cuda")
with torch.no_grad():
    outputs2 = model.generate(**inputs2, max_length=300, temperature=0.8, do_sample=True)
response2 = tokenizer.decode(outputs2[0][inputs2.input_ids.shape[1]:], skip_special_tokens=True)
inference_time2 = time.time() - start_time

print(f"✅ Quiz question generated in {inference_time2:.2f} seconds")
print(f"Response: {response2}")

# Test 3: Flashcard Generation
prompt3 = """<|user|>
Create a flashcard for studying machine learning concepts:

Front: What is supervised learning?
Back: Supervised learning is a type of machine learning where algorithms learn from labeled training data to make predictions or decisions on new, unseen data.

<|assistant|>"""

print("\nTest 3: Flashcard Generation")
start_time = time.time()
inputs3 = tokenizer(prompt3, return_tensors="pt").to("cuda")
with torch.no_grad():
    outputs3 = model.generate(**inputs3, max_length=150, temperature=0.6, do_sample=True)
response3 = tokenizer.decode(outputs3[0][inputs3.input_ids.shape[1]:], skip_special_tokens=True)
inference_time3 = time.time() - start_time

print(f"✅ Flashcard generated in {inference_time3:.2f} seconds")
print(f"Response: {response3}")

print(f"\n=== Performance Summary ===")
print(f"Model loading time: {load_time:.2f} seconds")
print(f"Average inference time: {(inference_time1 + inference_time2 + inference_time3) / 3:.2f} seconds")
print(f"GPU memory used: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
print(f"GPU memory available: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")

print("\n🎉 Phi-3-mini-4k-instruct is working perfectly on your RTX 5080!")
print("Ready to proceed with NoteQuest AI service setup!")





