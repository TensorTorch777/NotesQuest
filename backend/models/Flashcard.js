const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
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
  cards: [{
    front: {
      type: String,
      required: true
    },
    back: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  numCards: {
    type: Number,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  studySessions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cardsStudied: [{
      cardIndex: Number,
      difficulty: String,
      timeSpent: Number,
      mastered: Boolean
    }],
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
flashcardSchema.index({ documentId: 1 });
flashcardSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);





