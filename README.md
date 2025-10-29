# NotesQuest

AI-powered document summarization, quiz generation, and flashcard creation application.

## 🚀 Features

- **Document Processing**: Upload PDFs and extract text with OCR support
- **AI Summarization**: Generate comprehensive summaries with markdown formatting
- **Quiz Generation**: Create exam-quality multiple choice questions
- **Flashcards**: Generate interactive flashcards for active recall
- **AI Chat**: Conversational AI assistant powered by Qwen 2.5 model
- **User Authentication**: Secure login/signup with JWT tokens
- **History Management**: Access all your generated content
- **Export to PDF**: Download summaries as PDF files

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.10+
- MongoDB (local or Atlas)
- NVIDIA GPU with CUDA support (for AI service) - RTX 5080 recommended
- Git

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd NoteQuest
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp env.example .env
```

**Configure `backend/.env`:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5175

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/notesquest
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notesquest

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,txt,docx,md,png,jpg,jpeg,gif
```

**Start Backend:**
```bash
npm run dev  # Development mode
# OR
npm start    # Production mode
```

### 3. AI Service Setup

```bash
cd ai-service

# Create virtual environment (Windows)
python -m venv notesquest-ai-new
notesquest-ai-new\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify GPU access
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"
python -c "import torch; print(f'GPU: {torch.cuda.get_device_name(0)}')"
```

**Key Requirements:**
- PyTorch with CUDA support
- transformers >= 4.35.0
- bitsandbytes >= 0.41.0
- sentence-transformers (for embeddings)
- chromadb (for vector database)

**Start AI Service (Windows):**
```bash
start_qwen.bat
```

**Start AI Service (Linux/Mac):**
```bash
bash start_qwen.sh
```

The AI service will load Qwen 2.5-7B-Instruct model optimized for RTX 5080 (16GB VRAM) using FP16 quantization.

### 4. Frontend Setup

```bash
cd app
npm install
```

**Configure `app/.env`:**
```env
VITE_BACKEND_API_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

**Start Frontend:**
```bash
npm run dev
```

The application will be available at `http://localhost:5175`

## 📁 Project Structure

```
NoteQuest/
├── backend/           # Express.js backend API
│   ├── config/       # Database configuration
│   ├── middleware/   # Authentication middleware
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   └── utils/        # Utility functions
├── ai-service/       # FastAPI AI service
│   ├── models/       # AI model management
│   ├── utils/        # Document processing, vector DB
│   └── main.py       # FastAPI application
└── app/              # React frontend (Vite)
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API clients
    │   └── hooks/        # Custom hooks
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/history` - Get document history
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

### AI Services
- `POST /api/ai/generate-summary` - Generate summary
- `POST /api/ai/generate-quiz` - Generate quiz
- `POST /api/ai/generate-flashcards` - Generate flashcards
- `GET /api/ai/summary/:documentId` - Get summary
- `GET /api/ai/quiz/:documentId` - Get quiz
- `GET /api/ai/flashcards/:documentId` - Get flashcards

### Chat
- `GET /api/ai/chats` - Get all chats
- `GET /api/ai/chat/:chatId` - Get specific chat
- `POST /api/ai/chat/new` - Create new chat
- `POST /api/ai/chat` - Send message (non-streaming)
- `POST /api/ai/chat/save` - Save chat message
- `PUT /api/ai/chat/:chatId/title` - Update chat title
- `DELETE /api/ai/chat/:chatId` - Delete chat

### Users
- `GET /api/users/dashboard` - Get dashboard data
- `DELETE /api/users/account` - Delete user account

### AI Service (FastAPI)
- `POST /generate/summary` - Generate summary
- `POST /generate/quiz` - Generate quiz
- `POST /generate/flashcards` - Generate flashcards
- `POST /chat/stream` - Stream chat responses (SSE)
- `POST /embeddings/add` - Add document embeddings
- `POST /embeddings/search` - Search embeddings
- `GET /health` - Health check

## 🗄️ Database Models

- **User**: Authentication, profile, preferences
- **Document**: Uploaded files, metadata
- **Summary**: AI-generated summaries
- **Quiz**: AI-generated quiz questions
- **Flashcard**: AI-generated flashcards
- **Chat**: Chat conversations and messages

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- File type and size validation
- Input sanitization

## 🎨 Features in Detail

### Document Processing
- Supports PDF, TXT, DOCX, MD files
- OCR for scanned PDFs and images
- Automatic text extraction

### AI Summarization
- Map-reduce approach for long documents
- Token-aware chunking
- Markdown formatting support
- Export to PDF

### Quiz Generation
- Exam-quality MCQs
- Multiple difficulty levels
- 12-30 questions per document
- Scoring and review

### Flashcards
- 15-35 cards per document
- Interactive flip animation
- Navigation controls

### AI Chat
- Real-time token streaming
- Chat history with sidebar
- Title auto-generation
- Thinking process display

## 🚀 Deployment

### Backend (Vercel/Heroku)
1. Set environment variables
2. Connect MongoDB Atlas
3. Deploy with `vercel deploy` or Heroku CLI

### Frontend (Vercel)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Configure environment variables

### AI Service
- Requires GPU with CUDA support
- Recommended: RTX 5080 or similar (16GB+ VRAM)
- Can use cloud GPU services (AWS, GCP, RunPod)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# AI service tests
cd ai-service
python test_ai_service.py

# Verify dependencies
python check_dependencies.py
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity
- For Atlas: Check IP whitelist

### AI Service Not Starting
- Verify CUDA installation: `nvidia-smi`
- Check Python environment is activated
- Verify model files are downloaded
- Check VRAM availability

### Frontend Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify environment variables

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper headers in requests

## 📊 System Requirements

### Development
- Node.js 18+
- Python 3.10+
- MongoDB 6.0+
- 16GB RAM minimum
- NVIDIA GPU with 16GB+ VRAM (for AI service)

### Production
- Node.js 18+ LTS
- Python 3.10+
- MongoDB Atlas (recommended)
- GPU server for AI service

## 📝 License

Created with love by Nimish

## 🤝 Contributing

This is a personal project. For issues or questions, please create an issue in the repository.

---

**Note:** Make sure all three services (backend, AI service, frontend) are running for full functionality.

