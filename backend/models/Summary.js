const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  maxLength: {
    type: Number,
    default: 500
  },
  model: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
summarySchema.index({ documentId: 1 });
summarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Summary', summarySchema);



