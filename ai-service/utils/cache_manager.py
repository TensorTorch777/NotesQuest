"""Cache management for AI service"""
import asyncio
import json
import logging
from typing import Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CacheManager:
    """Simple in-memory cache manager"""
    
    def __init__(self):
        self.cache = {}
        self.redis_available = False
        
        # Try to connect to Redis if available
        try:
            import redis
            try:
                self.redis_client = redis.Redis(
                    host='localhost',
                    port=6379,
                    db=0,
                    decode_responses=True
                )
                # Test connection
                self.redis_client.ping()
                self.redis_available = True
                logger.info("✅ Redis cache connected")
            except:
                self.redis_client = None
                logger.warning("⚠️  Redis not available, using in-memory cache")
        except ImportError:
            self.redis_client = None
            logger.warning("⚠️  Redis package not installed, using in-memory cache")
    
    async def initialize(self):
        """Initialize cache manager"""
        logger.info("Cache manager initialized")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self.redis_available and self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
            else:
                # In-memory cache
                if key in self.cache:
                    item = self.cache[key]
                    # Check if expired
                    if datetime.now() < item['expires_at']:
                        return item['value']
                    else:
                        del self.cache[key]
            
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set value in cache with TTL"""
        try:
            if self.redis_available and self.redis_client:
                self.redis_client.setex(
                    key,
                    ttl,
                    json.dumps(value)
                )
            else:
                # In-memory cache
                self.cache[key] = {
                    'value': value,
                    'expires_at': datetime.now() + timedelta(seconds=ttl)
                }
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """Delete key from cache"""
        try:
            if self.redis_available and self.redis_client:
                self.redis_client.delete(key)
            else:
                if key in self.cache:
                    del self.cache[key]
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    async def clear(self):
        """Clear all cache"""
        try:
            if self.redis_available and self.redis_client:
                self.redis_client.flushdb()
            else:
                self.cache.clear()
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
    
    async def health_check(self) -> dict:
        """Check cache health"""
        try:
            if self.redis_available and self.redis_client:
                self.redis_client.ping()
                return {
                    "status": "healthy",
                    "type": "redis",
                    "size": self.redis_client.dbsize()
                }
            else:
                return {
                    "status": "healthy",
                    "type": "in-memory",
                    "size": len(self.cache)
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

