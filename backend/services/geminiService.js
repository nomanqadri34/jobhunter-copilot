import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn('GEMINI_API_KEY not found in environment variables');
            return;
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async generateCareerRoadmap(jobTitle, currentSkills = [], experienceLevel = 'beginner') {
        if (!this.model) {
            throw new Error('Gemini API not properly configured');
        }

        const prompt = `
Create a comprehensive career roadmap for becoming a ${jobTitle}.

Current Context:
- Experience Level: ${experienceLevel}
- Current Skills: ${currentSkills.join(', ') || 'None specified'}

Please provide a detailed roadmap with the following structure:

1. **Overview**: Brief description of the ${jobTitle} role
2. **Prerequisites**: What someone needs before starting
3. **Learning Path** (organized by phases):
   - Phase 1: Foundation (0-3 months)
   - Phase 2: Intermediate (3-6 months) 
   - Phase 3: Advanced (6-12 months)
   - Phase 4: Specialization (12+ months)

For each phase, include:
- Key skills to learn
- Recommended resources (courses, books, tools)
- Practical projects to build
- Estimated time commitment

4. **Career Progression**: Different levels and salary expectations
5. **Industry Trends**: Current market demands and future outlook
6. **Networking & Community**: Where to connect with professionals
7. **Portfolio Requirements**: What to showcase to employers

Format the response in clear, actionable sections with specific recommendations.
Make it practical and achievable for someone at the ${experienceLevel} level.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate career roadmap');
        }
    }

    async generateInterviewPrep(jobTitle, companyName, jobDescription = '') {
        if (!this.model) {
            throw new Error('Gemini API not properly configured');
        }

        const prompt = `
Generate comprehensive interview preparation materials for a ${jobTitle} position at ${companyName}.

Job Context:
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Please provide:

1. **Company Research Points**:
   - Key things to know about ${companyName}
   - Recent news or developments
   - Company culture and values

2. **Technical Questions** (10-15 questions):
   - Role-specific technical questions
   - Problem-solving scenarios
   - System design questions (if applicable)

3. **Behavioral Questions** (8-10 questions):
   - STAR method examples
   - Leadership and teamwork scenarios
   - Conflict resolution situations

4. **Questions to Ask Interviewer**:
   - About the role and team
   - About company direction
   - About growth opportunities

5. **Preparation Checklist**:
   - What to research beforehand
   - What to bring/prepare
   - How to present your experience

6. **Red Flags to Watch For**:
   - Warning signs about the company/role
   - Questions that indicate problems

Format as a structured guide that's easy to follow and practice with.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate interview preparation');
        }
    }

    async generateSkillGapAnalysis(targetJob, currentSkills, currentExperience) {
        if (!this.model) {
            throw new Error('Gemini API not properly configured');
        }

        const prompt = `
Analyze the skill gap for someone wanting to become a ${targetJob}.

Current Profile:
- Current Skills: ${currentSkills.join(', ') || 'None specified'}
- Experience: ${currentExperience || 'No experience specified'}

Please provide:

1. **Skills Assessment**:
   - Skills you already have that are relevant
   - Skills you're missing for the target role
   - Skills that need improvement

2. **Priority Learning Plan**:
   - High priority skills (must learn first)
   - Medium priority skills (learn next)
   - Nice-to-have skills (learn later)

3. **Learning Resources**:
   - Free resources for each skill
   - Paid courses worth the investment
   - Hands-on practice opportunities

4. **Timeline Estimate**:
   - Realistic timeline to become job-ready
   - Milestones to track progress
   - When to start applying for jobs

5. **Portfolio Projects**:
   - Specific projects to demonstrate skills
   - How to showcase your learning journey

Be specific and actionable. Focus on the most efficient path to becoming employable.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate skill gap analysis');
        }
    }
}

export default new GeminiService();