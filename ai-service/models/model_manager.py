# models/model_manager.py
import logging
from typing import Dict, Any
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

logger = logging.getLogger(__name__)


class ModelManager:
    def __init__(self, model_configs: Dict[str, Dict[str, Any]]):
        self.model_configs = model_configs
        self.models: Dict[str, Dict[str, Any]] = {}
        self.shared_base = None  # single shared base for summary/quiz/flashcards

    async def load_models(self):
        logger.info("🔄 Loading models...")

        base_model_path = self.model_configs["summary"]["model_path"]

        # Load Qwen in bfloat16 on GPU — fastest path on RTX 5080 (16GB)
        tokenizer = AutoTokenizer.from_pretrained(base_model_path, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            base_model_path,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            trust_remote_code=True,
        )

        if tokenizer.pad_token_id is None:
            tokenizer.pad_token = tokenizer.eos_token

        # Enable KV cache; DO NOT set cache_implementation to paged_attention here.
        model.config.use_cache = True
        # If you really want something explicit, uncomment the next two lines.
        # from transformers import GenerationConfig
        # model.generation_config = GenerationConfig.from_model_config(model.config)  # default cache impl

        self.shared_base = {"tokenizer": tokenizer, "model": model, "config": model.config}

        # Reuse the same instance for all tasks
        self.models["summary"] = self.shared_base
        self.models["quiz"] = self.shared_base
        self.models["flashcards"] = self.shared_base

        logger.info("✅ Base model loaded (bf16, device_map=auto) and assigned to all tasks.")

    def get(self, name: str):
        return self.models[name]

    async def health_check(self):
        return {
            k: {"loaded": True, "device": str(v["model"].device), "dtype": str(v["model"].dtype)}
            for k, v in self.models.items()
        }
