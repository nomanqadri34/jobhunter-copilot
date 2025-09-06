import Job from '../models/Job.js';
import User from '../models/User.js';
import { aiService } from '../services/aiService.js';
import rapidApiService from '../services/rapidApiService.js';
import geminiService from '../services/geminiService.js';

export const jobController = {
  // Search and fetch jobs
  async searchJobs(req, res) {
    try {
      const { query, location, remote, salaryMin, experienceLevel, page = 1, useResume = false } = req.query;
      const userId = req.user?.userId;

      let userPreferences = {
        title: query || 'software developer',
        location: location || 'United States',
        remote: remote === 'true',
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        experienceLevel: experienceLevel || 'associate',
        skills: ['JavaScript', 'React', 'Node.js']
      };

      let userProfile = {
        jobPreferences: userPreferences,
        resume: {
          skills: userPreferences.skills,
          experience: { level: userPreferences.experienceLevel }
        }
      };

      // If user is authenticated and wants to use resume data
      if (userId && useResume === 'true') {
        try {
          const user = await User.findById(userId);
          if (user && user.resume) {
            // Use resume data to enhance job search
            userProfile.resume = user.resume;
            userPreferences.skills = user.resume.skills || userPreferences.skills;
            userPreferences.experienceLevel = user.resume.experience?.level || userPreferences.experienceLevel;

            // Generate job titles based on resume if no query provided
            if (!query && user.resume.suggestedJobTitles?.length > 0) {
              userPreferences.title = user.resume.suggestedJobTitles[0];
            }
          }
        } catch (userError) {
          console.warn('Failed to fetch user resume data:', userError);
        }
      }

      console.log('Searching jobs with preferences:', userPreferences);

      // Fetch jobs from RapidAPI
      const searchQuery = `${userPreferences.title} jobs in ${userPreferences.location}`;
      const rapidApiJobs = await rapidApiService.searchJobs(searchQuery, 1, 1, 'us', 'all');

      const jobsArray = rapidApiJobs?.data || [];
      console.log(`Fetched ${jobsArray.length} jobs from RapidAPI`);

      // AI ranking based on user profile
      const rankedJobs = await aiService.rankJobs(jobsArray, userProfile);

      res.json({
        success: true,
        jobs: rankedJobs,
        total: rankedJobs.length,
        page: parseInt(page),
        resumeUsed: useResume === 'true' && userId
      });
    } catch (error) {
      console.error('Job search error:', error);
      res.status(500).json({ success: false, message: 'Failed to search jobs' });
    }
  },

  // Get personalized job recommendations based on resume
  async getRecommendations(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user || !user.resume) {
        return res.status(400).json({
          success: false,
          message: 'Please upload your resume first to get personalized recommendations'
        });
      }

      // Generate job search queries based on resume
      const searchQueries = user.resume.suggestedJobTitles || ['software developer'];
      const allJobs = [];

      // Search for jobs using different titles from resume
      for (const jobTitle of searchQueries.slice(0, 3)) { // Limit to 3 searches
        const searchParams = {
          title: jobTitle,
          location: user.jobPreferences?.location || 'United States',
          remote: user.jobPreferences?.remote || false,
          experienceLevel: user.resume.experience?.level || 'associate',
          skills: user.resume.skills || []
        };

        const jobs = await rapidApiService.searchJobs(searchParams);
        allJobs.push(...jobs);
      }

      // Remove duplicates based on job ID
      const uniqueJobs = allJobs.filter((job, index, self) =>
        index === self.findIndex(j => j.id === job.id)
      );

      // AI ranking based on user profile
      const rankedJobs = await aiService.rankJobs(uniqueJobs, user);

      res.json({
        success: true,
        jobs: rankedJobs.slice(0, 20), // Return top 20 recommendations
        total: rankedJobs.length,
        message: `Found ${rankedJobs.length} personalized recommendations based on your resume`
      });
    } catch (error) {
      console.error('Job recommendations error:', error);
      res.status(500).json({ success: false, message: 'Failed to get job recommendations' });
    }
  },

  // Get job details
  async getJob(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      res.json({ success: true, job });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get job' });
    }
  },

  // Save job
  async saveJob(req, res) {
    try {
      const { jobId } = req.body;
      const userId = req.user.userId;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedJobs: jobId }
      });

      res.json({ success: true, message: 'Job saved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to save job' });
    }
  },

  // Apply to job
  async applyJob(req, res) {
    try {
      const { jobId } = req.body;
      const userId = req.user.userId;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { appliedJobs: jobId }
      });

      res.json({ success: true, message: 'Job application recorded' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to record application' });
    }
  },

  // Get saved jobs
  async getSavedJobs(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).populate('savedJobs');

      res.json({ success: true, jobs: user.savedJobs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get saved jobs' });
    }
  },

  // Get applied jobs
  async getAppliedJobs(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).populate('appliedJobs');

      res.json({ success: true, jobs: user.appliedJobs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get applied jobs' });
    }
  },

  // Search jobs using JSearch API
  async searchJobsJSearch(req, res) {
    try {
      const { query, page = 1, numPages = 1, country = 'us', datePosted = 'all' } = req.query;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required' });
      }

      const jobs = await rapidApiService.searchJobs(query, page, numPages, country, datePosted);

      res.json({
        success: true,
        data: jobs,
        query,
        page: parseInt(page)
      });
    } catch (error) {
      console.error('JSearch API error:', error);
      res.status(500).json({ success: false, message: 'Failed to search jobs' });
    }
  },

  // Get active ATS expired jobs
  async getActiveATSJobs(req, res) {
    try {
      const jobs = await rapidApiService.getActiveATSExpiredJobs();

      res.json({
        success: true,
        data: jobs,
        message: 'Active ATS expired jobs retrieved successfully'
      });
    } catch (error) {
      console.error('ATS API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get ATS jobs' });
    }
  },

  // Get active internships
  async getActiveInternships(req, res) {
    try {
      const internships = await rapidApiService.getActiveInternships();

      res.json({
        success: true,
        data: internships,
        message: 'Active internships retrieved successfully'
      });
    } catch (error) {
      console.error('Internships API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get internships' });
    }
  },

  // Get interview details from Glassdoor
  async getInterviewDetails(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ success: false, message: 'Interview ID is required' });
      }

      const interviewDetails = await rapidApiService.getInterviewDetails(interviewId);

      res.json({
        success: true,
        data: interviewDetails,
        interviewId
      });
    } catch (error) {
      console.error('Glassdoor API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get interview details' });
    }
  },

  // Parse resume using Resume Optimizer Pro
  async parseResume(req, res) {
    try {
      const { resumeText } = req.body;

      if (!resumeText) {
        return res.status(400).json({ success: false, message: 'Resume text is required' });
      }

      const parsedResume = await rapidApiService.parseResume(resumeText);

      // If user is authenticated, save parsed resume data
      if (req.user?.userId) {
        try {
          await User.findByIdAndUpdate(req.user.userId, {
            $set: {
              'resume.parsedData': parsedResume,
              'resume.lastParsed': new Date()
            }
          });
        } catch (saveError) {
          console.warn('Failed to save parsed resume:', saveError);
        }
      }

      res.json({
        success: true,
        data: parsedResume,
        message: 'Resume parsed successfully'
      });
    } catch (error) {
      console.error('Resume parsing error:', error);
      res.status(500).json({ success: false, message: 'Failed to parse resume' });
    }
  },

  // Combined search across all job APIs
  async searchAllJobs(req, res) {
    try {
      const { query, location = '', page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required' });
      }

      const results = await rapidApiService.searchAllJobs(query, location, page);

      res.json({
        success: true,
        data: results,
        query,
        location,
        page: parseInt(page),
        message: 'Combined job search completed'
      });
    } catch (error) {
      console.error('Combined search error:', error);
      res.status(500).json({ success: false, message: 'Failed to search all job sources' });
    }
  },

  // Get interview preparation data
  async getInterviewPrep(req, res) {
    try {
      const { companyName, jobTitle } = req.query;

      if (!companyName || !jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Company name and job title are required'
        });
      }

      const prepData = await rapidApiService.getInterviewPrep(companyName, jobTitle);

      res.json({
        success: true,
        data: prepData,
        companyName,
        jobTitle,
        message: 'Interview preparation data retrieved successfully'
      });
    } catch (error) {
      console.error('Interview prep error:', error);
      res.status(500).json({ success: false, message: 'Failed to get interview preparation data' });
    }
  },

  // Generate career roadmap using Gemini AI
  async generateRoadmap(req, res) {
    try {
      const { jobTitle, currentSkills = [], experienceLevel = 'beginner' } = req.body;

      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }

      const roadmap = await geminiService.generateCareerRoadmap(jobTitle, currentSkills, experienceLevel);

      res.json({
        success: true,
        data: {
          roadmap,
          jobTitle,
          currentSkills,
          experienceLevel
        },
        message: 'Career roadmap generated successfully'
      });
    } catch (error) {
      console.error('Roadmap generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate career roadmap' });
    }
  },

  // Generate interview preparation using Gemini AI
  async generateInterviewPrep(req, res) {
    try {
      const { jobTitle, companyName, jobDescription = '' } = req.body;

      if (!jobTitle || !companyName) {
        return res.status(400).json({
          success: false,
          message: 'Job title and company name are required'
        });
      }

      const interviewPrep = await geminiService.generateInterviewPrep(jobTitle, companyName, jobDescription);

      res.json({
        success: true,
        data: {
          interviewPrep,
          jobTitle,
          companyName
        },
        message: 'Interview preparation generated successfully'
      });
    } catch (error) {
      console.error('Interview prep generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate interview preparation' });
    }
  },

  // Generate skill gap analysis using Gemini AI
  async generateSkillGapAnalysis(req, res) {
    try {
      const { targetJob, currentSkills = [], currentExperience = '' } = req.body;

      if (!targetJob) {
        return res.status(400).json({
          success: false,
          message: 'Target job title is required'
        });
      }

      const analysis = await geminiService.generateSkillGapAnalysis(targetJob, currentSkills, currentExperience);

      res.json({
        success: true,
        data: {
          analysis,
          targetJob,
          currentSkills,
          currentExperience
        },
        message: 'Skill gap analysis generated successfully'
      });
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate skill gap analysis' });
    }
  }
};