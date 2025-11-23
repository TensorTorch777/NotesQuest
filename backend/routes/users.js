const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const Chat = require('../models/Chat');
// Auth removed - no login required

const router = express.Router();

// Get user dashboard data (no auth required)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = null; // No user tracking

    // Get counts
    const [
      documentCount,
      summaryCount,
      quizCount,
      flashcardCount,
      recentDocuments
    ] = await Promise.all([
      Document.countDocuments({}),
      Summary.countDocuments({}),
      Quiz.countDocuments({}),
      Flashcard.countDocuments({}),
      Document.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title fileType createdAt')
    ]);

    // Get usage statistics
    const usageStats = {
      documentsProcessed: documentCount,
      summariesGenerated: summaryCount,
      quizzesGenerated: quizCount,
      flashcardsGenerated: flashcardCount,
      totalContent: documentCount + summaryCount + quizCount + flashcardCount
    };

    res.json({
      success: true,
      dashboard: {
        usage: usageStats,
        recentDocuments
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
});

// Get user statistics (no auth required)
router.get('/stats', async (req, res) => {
  try {
    const userId = null; // No user tracking
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get activity data
    const [
      documentsCreated,
      summariesGenerated,
      quizzesGenerated,
      flashcardsGenerated
    ] = await Promise.all([
      Document.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      Summary.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      Quiz.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      Flashcard.countDocuments({ 
        createdAt: { $gte: startDate } 
      })
    ]);

    // Get activity timeline
    const activityTimeline = await Document.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        period,
        activity: {
          documentsCreated,
          summariesGenerated,
          quizzesGenerated,
          flashcardsGenerated
        },
        timeline: activityTimeline
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// Get user history (no auth required)
router.get('/history', async (req, res) => {
  try {
    const userId = null; // No user tracking
    const { page = 1, limit = 10, type = 'all' } = req.query;

    const skip = (page - 1) * limit;
    let query = {}; // No user filtering

    // Filter by type if specified
    if (type !== 'all') {
      query.type = type;
    }

    // Get documents with related content
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('summaries', 'createdAt')
      .populate('quizzes', 'createdAt')
      .populate('flashcards', 'createdAt')
      .select('-extractedText'); // Exclude full text for list view

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      history: {
        documents,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          limit: parseInt(limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      message: error.message 
    });
  }
});

// Delete user account (disabled - no auth)
router.delete('/account', async (req, res) => {
  try {
    // Account deletion disabled - no user system
    return res.status(501).json({ 
      error: 'Account deletion not available - no authentication system' 
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      message: error.message 
    });
  }
});

module.exports = router;





