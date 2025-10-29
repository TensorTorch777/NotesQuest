"""Document processing utilities (robust PDF extraction)"""
import logging
from typing import Any
from fastapi import UploadFile

logger = logging.getLogger(__name__)

def _normalize_ws(text: str) -> str:
    # collapse weird whitespace while preserving paragraphs and bullets
    import re
    text = text.replace("\r", "")
    # keep blank lines (paragraphs), but normalize runs of spaces/tabs
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.split("\n")]
    # remove leading bullet artifacts like '•  ' duplicated
    lines = [re.sub(r"^[•\-\u2022]+[ \t]*", "- ", ln) for ln in lines]
    # rebuild with single newline, keep empty lines
    return "\n".join(lines).strip()


class DocumentProcessor:
    """Process uploaded documents and extract text"""

    def __init__(self):
        self.supported_formats = ['.txt', '.pdf', '.docx', '.md']

    async def process_file(self, file: UploadFile) -> str:
        """Process uploaded file and extract text content (returns a single string)."""
        try:
            content = await file.read()

            # Get file extension
            filename = (file.filename or "").lower()
            file_ext = filename.split('.')[-1] if '.' in filename else ""

            if file_ext in ['txt', 'text', 'md', 'markdown']:
                return content.decode('utf-8', errors='ignore').strip()

            if file_ext == 'pdf':
                return await self._process_pdf_pymupdf(content)

            if file_ext in ['docx', 'doc']:
                return await self._process_docx(content)

            # Fallback: best-effort text decode
            logger.warning(f"Unknown file type: {file_ext}, attempting text decode")
            return content.decode('utf-8', errors='ignore').strip()

        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            raise ValueError(f"Failed to process document: {str(e)}")

    # -------------------- PDF (preferred: PyMuPDF) --------------------

    async def _process_pdf_pymupdf(self, content: bytes) -> str:
        """
        Extract text with PyMuPDF (fitz), preserving page boundaries and
        more reliable paragraph order than PyPDF2. Falls back to PyPDF2 if needed.
        """
        try:
            import fitz  # PyMuPDF
            import io

            doc = fitz.open(stream=content, filetype="pdf")
            if doc.needs_pass:
                # try empty password; otherwise bail early with a clear error
                if not doc.authenticate(""):
                    raise ValueError("Encrypted PDF: password required")

            pages = []
            for i in range(len(doc)):
                page = doc.load_page(i)
                # "text" is good for paragraphs; "blocks" if you want layout later
                txt = page.get_text("text")
                txt = _normalize_ws(txt)
                # add explicit page markers for downstream summarizer
                if txt:
                    pages.append(f"[Page {i+1}]\n{txt}")
                else:
                    pages.append(f"[Page {i+1}]\n")  # keep placeholder so page count matches

            doc.close()
            return "\n\n".join(pages).strip()

        except ImportError:
            logger.warning("PyMuPDF (pymupdf) not installed, falling back to PyPDF2")
            return await self._process_pdf_pypdf2(content)
        except Exception as e:
            logger.error(f"PyMuPDF PDF processing error: {e}")
            # Last-resort fallback to PyPDF2
            try:
                return await self._process_pdf_pypdf2(content)
            except Exception:
                raise

    async def _process_pdf_pypdf2(self, content: bytes) -> str:
        """Fallback PDF extraction with PyPDF2 (less reliable layout)."""
        try:
            import PyPDF2
            import io

            pdf_file = io.BytesIO(content)
            reader = PyPDF2.PdfReader(pdf_file)
            if reader.is_encrypted:
                try:
                    reader.decrypt("")  # try empty password
                except Exception:
                    raise ValueError("Encrypted PDF: password required")

            pages = []
            for i, page in enumerate(reader.pages):
                try:
                    t = page.extract_text() or ""
                except Exception:
                    t = ""
                t = _normalize_ws(t)
                pages.append(f"[Page {i+1}]\n{t}")
            return "\n\n".join(pages).strip()

        except ImportError:
            logger.error("PyPDF2 not installed; cannot process PDFs without PyMuPDF.")
            raise ValueError("PDF processing requires either PyMuPDF (pymupdf) or PyPDF2")
        except Exception as e:
            logger.error(f"PyPDF2 PDF processing error: {e}")
            raise ValueError(f"Failed to process PDF: {str(e)}")

    # -------------------- DOCX --------------------

    async def _process_docx(self, content: bytes) -> str:
        """Process DOCX file."""
        try:
            import docx
            import io

            doc_file = io.BytesIO(content)
            doc = docx.Document(doc_file)

            lines = []
            for p in doc.paragraphs:
                txt = (p.text or "").rstrip()
                if txt:
                    lines.append(txt)
                else:
                    lines.append("")  # preserve paragraph gaps

            # Add a synthetic page header for consistency with PDF output
            text = "[Page 1]\n" + "\n".join(lines)
            return _normalize_ws(text)

        except ImportError:
            logger.warning("python-docx not installed, cannot process DOCX")
            raise ValueError("DOCX processing requires python-docx package")
        except Exception as e:
            logger.error(f"DOCX processing error: {e}")
            raise ValueError(f"Failed to process DOCX: {str(e)}")

    # -------------------- Validation --------------------

    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file extension only."""
        try:
            filename = file.filename or ""
            file_ext = filename.split('.')[-1].lower() if '.' in filename else ""
            return file_ext in ['txt', 'pdf', 'docx', 'doc', 'md', 'markdown']
        except Exception:
            return False
