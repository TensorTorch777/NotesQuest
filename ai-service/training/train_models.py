import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import json
import logging
from typing import Dict, List, Any
import argparse
from pathlib import Path

logger = logging.getLogger(__name__)

class SummaryModelTrainer:
    """Trainer for fine-tuning Llama model for summary generation"""
    
    def __init__(self, model_name: str, output_dir: str):
        self.model_name = model_name
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        # Add padding token if not present
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
    def prepare_dataset(self, dataset_path: str) -> Dataset:
        """Prepare dataset for training"""
        
        with open(dataset_path, 'r') as f:
            data = json.load(f)
            
        # Format data for training
        formatted_data = []
        for item in data:
            # Create training prompt
            prompt = self._create_training_prompt(
                item['input'], 
                item['title'], 
                item['output']
            )
            
            # Tokenize
            tokens = self.tokenizer(
                prompt,
                truncation=True,
                max_length=2048,
                padding=False
            )
            
            formatted_data.append({
                'input_ids': tokens['input_ids'],
                'attention_mask': tokens['attention_mask']
            })
            
        return Dataset.from_list(formatted_data)
        
    def _create_training_prompt(self, content: str, title: str, summary: str) -> str:
        """Create training prompt for summary generation"""
        
        prompt = f"""<s>[INST] You are an expert at creating concise, informative summaries for educational content.

Task: Create a summary for the following content.

Title: {title}

Content:
{content[:1500]}...

Summary: [/INST] {summary} </s>"""
        
        return prompt
        
    def train(self, dataset: Dataset, num_epochs: int = 3, batch_size: int = 4, learning_rate: float = 2e-4):
        """Train the model"""
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=str(self.output_dir),
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            warmup_steps=100,
            learning_rate=learning_rate,
            logging_steps=10,
            save_steps=500,
            eval_steps=500,
            save_total_limit=2,
            prediction_loss_only=True,
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            gradient_accumulation_steps=4,
            fp16=True,
            report_to="none"
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Create trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=dataset,
            data_collator=data_collator,
            tokenizer=self.tokenizer
        )
        
        # Train
        logger.info("🚀 Starting training...")
        trainer.train()
        
        # Save model
        trainer.save_model()
        self.tokenizer.save_pretrained(self.output_dir)
        
        logger.info(f"✅ Training completed. Model saved to {self.output_dir}")

class QuizModelTrainer:
    """Trainer for fine-tuning Llama model for quiz generation"""
    
    def __init__(self, model_name: str, output_dir: str):
        self.model_name = model_name
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
    def prepare_dataset(self, dataset_path: str) -> Dataset:
        """Prepare dataset for training"""
        
        with open(dataset_path, 'r') as f:
            data = json.load(f)
            
        formatted_data = []
        for item in data:
            prompt = self._create_training_prompt(
                item['input'], 
                item['output']
            )
            
            tokens = self.tokenizer(
                prompt,
                truncation=True,
                max_length=2048,
                padding=False
            )
            
            formatted_data.append({
                'input_ids': tokens['input_ids'],
                'attention_mask': tokens['attention_mask']
            })
            
        return Dataset.from_list(formatted_data)
        
    def _create_training_prompt(self, content: str, quiz_data: Dict[str, Any]) -> str:
        """Create training prompt for quiz generation"""
        
        # Format quiz questions
        questions_text = ""
        for q in quiz_data['questions']:
            questions_text += f"Q: {q['question']}\n"
            questions_text += f"A: {q['options']['A']}\n"
            questions_text += f"B: {q['options']['B']}\n"
            questions_text += f"C: {q['options']['C']}\n"
            questions_text += f"D: {q['options']['D']}\n"
            questions_text += f"Answer: {q['correctAnswer']}\n"
            questions_text += f"Explanation: {q['explanation']}\n\n"
            
        prompt = f"""<s>[INST] You are an expert educator creating quiz questions for educational content.

Task: Create quiz questions based on the following content.

Content:
{content[:1500]}...

Quiz Questions: [/INST] {questions_text.strip()} </s>"""
        
        return prompt
        
    def train(self, dataset: Dataset, num_epochs: int = 5, batch_size: int = 2, learning_rate: float = 1e-4):
        """Train the model"""
        
        training_args = TrainingArguments(
            output_dir=str(self.output_dir),
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            warmup_steps=200,
            learning_rate=learning_rate,
            logging_steps=10,
            save_steps=500,
            eval_steps=500,
            save_total_limit=2,
            prediction_loss_only=True,
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            gradient_accumulation_steps=8,
            fp16=True,
            report_to="none"
        )
        
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=dataset,
            data_collator=data_collator,
            tokenizer=self.tokenizer
        )
        
        logger.info("🚀 Starting quiz model training...")
        trainer.train()
        
        trainer.save_model()
        self.tokenizer.save_pretrained(self.output_dir)
        
        logger.info(f"✅ Quiz model training completed. Model saved to {self.output_dir}")

class FlashcardModelTrainer:
    """Trainer for fine-tuning Llama model for flashcard generation"""
    
    def __init__(self, model_name: str, output_dir: str):
        self.model_name = model_name
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
    def prepare_dataset(self, dataset_path: str) -> Dataset:
        """Prepare dataset for training"""
        
        with open(dataset_path, 'r') as f:
            data = json.load(f)
            
        formatted_data = []
        for item in data:
            prompt = self._create_training_prompt(
                item['input'], 
                item['output']
            )
            
            tokens = self.tokenizer(
                prompt,
                truncation=True,
                max_length=2048,
                padding=False
            )
            
            formatted_data.append({
                'input_ids': tokens['input_ids'],
                'attention_mask': tokens['attention_mask']
            })
            
        return Dataset.from_list(formatted_data)
        
    def _create_training_prompt(self, content: str, flashcard_data: Dict[str, Any]) -> str:
        """Create training prompt for flashcard generation"""
        
        # Format flashcards
        cards_text = ""
        for card in flashcard_data['cards']:
            cards_text += f"Front: {card['front']}\n"
            cards_text += f"Back: {card['back']}\n"
            cards_text += f"Category: {card['category']}\n"
            cards_text += f"Difficulty: {card['difficulty']}\n\n"
            
        prompt = f"""<s>[INST] You are an expert educator creating flashcards for effective learning.

Task: Create flashcards based on the following content.

Content:
{content[:1500]}...

Flashcards: [/INST] {cards_text.strip()} </s>"""
        
        return prompt
        
    def train(self, dataset: Dataset, num_epochs: int = 4, batch_size: int = 2, learning_rate: float = 1.5e-4):
        """Train the model"""
        
        training_args = TrainingArguments(
            output_dir=str(self.output_dir),
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            warmup_steps=150,
            learning_rate=learning_rate,
            logging_steps=10,
            save_steps=500,
            eval_steps=500,
            save_total_limit=2,
            prediction_loss_only=True,
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            gradient_accumulation_steps=8,
            fp16=True,
            report_to="none"
        )
        
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=dataset,
            data_collator=data_collator,
            tokenizer=self.tokenizer
        )
        
        logger.info("🚀 Starting flashcard model training...")
        trainer.train()
        
        trainer.save_model()
        self.tokenizer.save_pretrained(self.output_dir)
        
        logger.info(f"✅ Flashcard model training completed. Model saved to {self.output_dir}")

def main():
    parser = argparse.ArgumentParser(description="Fine-tune Llama models for NoteQuest")
    parser.add_argument("--model_name", default="meta-llama/Llama-2-7b-chat-hf", help="Base model name")
    parser.add_argument("--task", choices=["summary", "quiz", "flashcard"], required=True, help="Task to train")
    parser.add_argument("--dataset", required=True, help="Path to training dataset")
    parser.add_argument("--output_dir", required=True, help="Output directory for trained model")
    parser.add_argument("--num_epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Training batch size")
    parser.add_argument("--learning_rate", type=float, default=2e-4, help="Learning rate")
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Train based on task
    if args.task == "summary":
        trainer = SummaryModelTrainer(args.model_name, args.output_dir)
        dataset = trainer.prepare_dataset(args.dataset)
        trainer.train(dataset, args.num_epochs, args.batch_size, args.learning_rate)
        
    elif args.task == "quiz":
        trainer = QuizModelTrainer(args.model_name, args.output_dir)
        dataset = trainer.prepare_dataset(args.dataset)
        trainer.train(dataset, args.num_epochs, args.batch_size, args.learning_rate)
        
    elif args.task == "flashcard":
        trainer = FlashcardModelTrainer(args.model_name, args.output_dir)
        dataset = trainer.prepare_dataset(args.dataset)
        trainer.train(dataset, args.num_epochs, args.batch_size, args.learning_rate)

if __name__ == "__main__":
    main()





