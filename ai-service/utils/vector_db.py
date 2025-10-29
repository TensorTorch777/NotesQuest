"""Vector Database management using ChromaDB"""
import logging
import os
from typing import List, Dict, Any, Optional
import uuid

logger = logging.getLogger(__name__)

try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    logger.warning("ChromaDB not available")

try:
    from sentence_transformers import SentenceTransformer
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False
    logger.warning("SentenceTransformers not available")

class VectorDB:
    """Vector database for document embeddings"""
    
    def __init__(self):
        if not CHROMA_AVAILABLE:
            raise ImportError("ChromaDB is required for vector database functionality")
        
        if not ST_AVAILABLE:
            raise ImportError("SentenceTransformers is required for embeddings")
        
        # Initialize Chroma client
        self.persist_directory = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight, fast model
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
        
        logger.info("✅ Vector database initialized")
    
    async def add_document(self, document_id: str, text: str, metadata: Dict[str, Any]) -> bool:
        """Add document chunks to vector database"""
        try:
            # Split text into chunks (512 characters with overlap)
            chunks = self._chunk_text(text, chunk_size=512, overlap=50)
            
            # Generate embeddings for each chunk
            embeddings = self.embedding_model.encode(chunks).tolist()
            
            # Prepare data for insertion
            ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    **metadata,
                    "chunk_index": i,
                    "chunk_text": chunk[:100]  # Store first 100 chars for preview
                }
                for i, chunk in enumerate(chunks)
            ]
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(chunks)} chunks to vector database for document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding document to vector DB: {e}")
            return False
    
    async def search(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search collection
            where = filter_metadata if filter_metadata else None
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    formatted_results.append({
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'similarity': 1 - results['distances'][0][i]  # Convert distance to similarity
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching vector DB: {e}")
            return []
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete all chunks for a document"""
        try:
            # Get all IDs for this document
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                logger.info(f"Deleted {len(results['ids'])} chunks for document {document_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document from vector DB: {e}")
            return False
    
    async def update_document(self, document_id: str, text: str, metadata: Dict[str, Any]) -> bool:
        """Update document by deleting and re-adding"""
        try:
            # Delete existing chunks
            await self.delete_document(document_id)
            
            # Add new chunks
            return await self.add_document(document_id, text, metadata)
            
        except Exception as e:
            logger.error(f"Error updating document in vector DB: {e}")
            return False
    
    def _chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            
            # Move start position with overlap
            start = end - overlap
        
        return chunks
    
    async def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document"""
        try:
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            chunks = []
            if results['documents']:
                for i in range(len(results['documents'])):
                    chunks.append({
                        'text': results['documents'][i],
                        'metadata': results['metadatas'][i] if results['metadatas'] else {},
                        'id': results['ids'][i] if results['ids'] else None
                    })
            
            return sorted(chunks, key=lambda x: x['metadata'].get('chunk_index', 0))
            
        except Exception as e:
            logger.error(f"Error getting document chunks: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check vector database health"""
        try:
            count = self.collection.count()
            return {
                "status": "healthy",
                "database": "chromadb",
                "collection": "documents",
                "total_chunks": count,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Singleton instance
_vector_db_instance = None

def get_vector_db() -> VectorDB:
    """Get or create vector database instance"""
    global _vector_db_instance
    if _vector_db_instance is None:
        try:
            _vector_db_instance = VectorDB()
        except ImportError:
            logger.warning("Vector database not available, continuing without it")
            return None
    return _vector_db_instance

