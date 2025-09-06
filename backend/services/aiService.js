import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const aiService = {
  // Rank jobs based on user profile
  async rankJobs(jobs, user) {
    if (!process.env.GEMINI_API_KEY || jobs.length === 0) {
      return jobs;
    }

    try {
      const userProfile = {
        skills: user.resume?.skills || user.jobPreferences?.skills || [],
        experience: user.resume?.experience?.level || user.jobPreferences?.experienceLevel,
        preferences: user.jobPreferences
      };

      const prompt = `
Rank these ${jobs.length} jobs based on relevance to this user profile:

User Profile:
- Skills: ${userProfile.skills.join(', ')}
- Experience Level: ${userProfile.experience}
- Preferred Job Title: ${userProfile.preferences?.title}
- Preferred Location: ${userProfile.preferences?.location}

Jobs to rank:
${jobs.map((job, index) => `
${index + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Skills: ${job.skills?.join(', ') || 'Not specified'}
   Experience: ${job.experienceLevel}
   Description: ${job.description?.substring(0, 200)}...
`).join('')}

Return a JSON array with job rankings and scores (0-100):
[
  {"jobIndex": 1, "score": 95, "reason": "Perfect match for skills and experience"},
  {"jobIndex": 3, "score": 87, "reason": "Good skill match, location preference"}
]

Rank by: skill match (40%), experience level match (25%), location preference (20%), company reputation (15%)
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // Parse AI response
      let rankings;
      try {
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        rankings = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI rankings:', parseError);
        return jobs; // Return original order if parsing fails
      }

      // Apply rankings to jobs
      const rankedJobs = rankings
        .sort((a, b) => b.score - a.score)
        .map(ranking => {
          const job = jobs[ranking.jobIndex - 1];
          if (job) {
            job.aiScore = ranking.score;
            job.aiReason = ranking.reason;
          }
          return job;
        })
        .filter(Boolean);

      // Add unranked jobs at the end
      const rankedIndices = rankings.map(r => r.jobIndex - 1);
      const unrankedJobs = jobs.filter((_, index) => !rankedIndices.includes(index));

      return [...rankedJobs, ...unrankedJobs];
    } catch (error) {
      console.error('AI ranking error:', error);
      return jobs;
    }
  },

  // Parse resume text
  async parseResume(resumeText) {
    if (!process.env.GEMINI_API_KEY) {
      return this.fallbackResumeParser(resumeText);
    }

    try {
      const prompt = `
Analyze this resume and extract structured information in JSON format:

${resumeText}

Return JSON with this structure:
{
  "skills": ["skill1", "skill2", ...],
  "experience": {
    "level": "entry|associate|mid|senior|director",
    "years": number,
    "positions": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "2020-2023",
        "description": "Brief description"
      }
    ]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": 2020
    }
  ],
  "suggestedJobTitles": ["title1", "title2", ...],
  "summary": "Brief professional summary"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // Parse JSON response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.fallbackResumeParser(resumeText);
    } catch (error) {
      console.error('AI resume parsing error:', error);
      return this.fallbackResumeParser(resumeText);
    }
  },

  // Generate interview preparation
  async generateInterviewPrep(jobTitle, userSkills, experienceLevel) {
    if (!process.env.GEMINI_API_KEY) {
      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    }

    try {
      const prompt = `
Generate comprehensive interview preparation for a ${experienceLevel} ${jobTitle} position.

User Skills: ${userSkills.join(', ')}

Provide:
1. Technical topics to study
2. Common interview questions (10-15 questions)
3. Behavioral questions (5-8 questions)
4. Skills to highlight
5. Preparation timeline (2-3 weeks)
6. Mock interview scenarios
7. YouTube search queries for relevant tutorials

Format as JSON:
{
  "technicalTopics": ["topic1", "topic2", ...],
  "technicalQuestions": ["question1", "question2", ...],
  "behavioralQuestions": ["question1", "question2", ...],
  "skillsToHighlight": ["skill1", "skill2", ...],
  "timeline": {
    "week1": "Focus areas for week 1",
    "week2": "Focus areas for week 2",
    "week3": "Focus areas for week 3"
  },
  "mockScenarios": ["scenario1", "scenario2", ...],
  "youtubeQueries": ["search query 1", "search query 2", ...]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    } catch (error) {
      console.error('AI interview prep error:', error);
      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    }
  },

  // Generate YouTube search queries for interview prep
  async getYouTubeVideos(searchQueries) {
    if (!process.env.YOUTUBE_API_KEY) {
      return this.fallbackYouTubeVideos();
    }

    try {
      const videos = [];

      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 5,
            key: process.env.YOUTUBE_API_KEY,
            order: 'relevance'
          }
        });

        const queryVideos = response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          query: query
        }));

        videos.push(...queryVideos);
      }

      return videos;
    } catch (error) {
      console.error('YouTube API error:', error);
      return this.fallbackYouTubeVideos();
    }
  },

  // Fallback parsers
  fallbackResumeParser(text) {
    return {
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: {
        level: 'associate',
        years: 2,
        positions: []
      },
      education: [],
      suggestedJobTitles: ['Software Developer', 'Frontend Developer'],
      summary: 'Experienced developer with strong technical skills'
    };
  },

  fallbackInterviewPrep(jobTitle, experienceLevel) {
    return {
      technicalTopics: ['Data Structures', 'Algorithms', 'System Design'],
      technicalQuestions: [
        'Explain your experience with the tech stack',
        'How do you handle debugging complex issues?',
        'Describe a challenging project you worked on'
      ],
      behavioralQuestions: [
        'Tell me about yourself',
        'Why do you want this role?',
        'Describe a time you overcame a challenge'
      ],
      skillsToHighlight: ['Problem Solving', 'Communication', 'Teamwork'],
      timeline: {
        week1: 'Review technical fundamentals',
        week2: 'Practice coding problems',
        week3: 'Mock interviews and final prep'
      },
      mockScenarios: ['Technical phone screen', 'System design interview'],
      youtubeQueries: [`${jobTitle} interview questions`, `${experienceLevel} developer interview prep`]
    };
  },

  fallbackYouTubeVideos() {
    return [
      {
        id: 'sample1',
        title: 'Software Developer Interview Tips',
        description: 'Essential tips for software developer interviews',
        thumbnail: 'https://via.placeholder.com/320x180',
        channelTitle: 'Tech Interview Channel',
        publishedAt: new Date().toISOString(),
        url: 'https://www.youtube.com/watch?v=sample1',
        query: 'software developer interview'
      }
    ];
  }
};