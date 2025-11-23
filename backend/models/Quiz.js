const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  questionsText: {
    type: String
  },
  questions: [{
    question: {
      type: String,
      required: false
    },
    options: {
      A: { type: String },
      B: { type: String },
      C: { type: String },
      D: { type: String }
    },
    correctAnswer: {
      type: String,
      required: false,
      enum: ['A', 'B', 'C', 'D']
    },
    explanation: {
      type: String,
      required: false
    }
  }],
  numQuestions: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  model: {
    type: String,
    required: true
  },
  attempts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: String,
      isCorrect: Boolean
    }],
    score: Number,
    completedAt: Date
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
quizSchema.index({ documentId: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);





