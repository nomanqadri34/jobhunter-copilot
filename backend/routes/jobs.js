import express from 'express';
import jwt from 'jsonwebtoken';
import { jobController } from '../controllers/jobController.js';

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Job search and management
router.get('/search', authMiddleware, jobController.searchJobs);
router.get('/recommendations', authMiddleware, jobController.getRecommendations);
router.get('/saved', authMiddleware, jobController.getSavedJobs);
router.get('/applied', authMiddleware, jobController.getAppliedJobs);
router.get('/:id', authMiddleware, jobController.getJob);

router.post('/save', authMiddleware, jobController.saveJob);
router.post('/apply', authMiddleware, jobController.applyJob);

// RapidAPI endpoints
router.get('/api/jsearch', jobController.searchJobsJSearch);
router.get('/api/ats-jobs', jobController.getActiveATSJobs);
router.get('/api/internships', jobController.getActiveInternships);
router.get('/api/interview/:interviewId', jobController.getInterviewDetails);
router.get('/api/search-all', jobController.searchAllJobs);
router.get('/api/interview-prep', jobController.getInterviewPrep);

router.post('/api/parse-resume', jobController.parseResume);

// Gemini AI endpoints
router.post('/api/generate-roadmap', jobController.generateRoadmap);
router.post('/api/generate-interview-prep', jobController.generateInterviewPrep);
router.post('/api/generate-skill-gap-analysis', jobController.generateSkillGapAnalysis);

export default router;