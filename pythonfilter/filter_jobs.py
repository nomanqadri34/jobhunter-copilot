import sys
import json
import re
from typing import List, Dict

def extract_skills_from_text(text: str) -> List[str]:
    """Extract technical skills from text using NLP"""
    common_skills = [
        'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
        'kubernetes', 'git', 'html', 'css', 'mongodb', 'postgresql', 'redis',
        'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas',
        'numpy', 'scikit-learn', 'angular', 'vue.js', 'typescript', 'go', 'rust',
        'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'flutter', 'django',
        'flask', 'spring', 'express', 'fastapi', 'graphql', 'rest api'
    ]
    
    text_lower = text.lower()
    found_skills = [skill for skill in common_skills if skill in text_lower]
    return found_skills

def calculate_job_score(job: Dict, preferences: Dict) -> float:
    """Calculate relevance score using simple matching"""
    score = 0.0
    
    # Title matching (40% weight)
    if preferences.get('jobTitle'):
        title_keywords = preferences['jobTitle'].lower().split()
        job_title = job.get('title', '').lower()
        title_matches = sum(1 for keyword in title_keywords if keyword in job_title)
        score += (title_matches / len(title_keywords)) * 0.40 if title_keywords else 0
    
    # Location matching (20% weight)
    if preferences.get('location'):
        job_location = job.get('location', '').lower()
        pref_location = preferences['location'].lower()
        if pref_location in job_location or job_location in pref_location:
            score += 0.20
    
    # Skills matching (30% weight)
    if preferences.get('skills') or preferences.get('resumeSkills'):
        user_skills = []
        if preferences.get('skills'):
            user_skills.extend([s.strip().lower() for s in preferences['skills'].split(',')])
        if preferences.get('resumeSkills'):
            user_skills.extend(preferences['resumeSkills'])
        
        job_text = (job.get('description', '') + ' ' + job.get('title', '')).lower()
        job_skills = extract_skills_from_text(job_text)
        
        if user_skills and job_skills:
            skill_matches = len(set(user_skills) & set(job_skills))
            score += (skill_matches / len(set(user_skills))) * 0.30
    
    # Company reputation boost (10% weight)
    reputable_companies = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'uber', 'airbnb']
    company = job.get('company', '').lower()
    if any(rep_company in company for rep_company in reputable_companies):
        score += 0.10
    
    return min(score, 1.0)

def filter_jobs(jobs_data: List[Dict], preferences: Dict = None) -> List[Dict]:
    """AI-powered job filtering and ranking"""
    if not jobs_data:
        return []
    
    # Add relevance scores
    for job in jobs_data:
        job['relevance_score'] = calculate_job_score(job, preferences or {})
    
    # Filter out low-relevance jobs (score < 0.2)
    filtered_jobs = [job for job in jobs_data if job['relevance_score'] >= 0.2]
    
    # Sort by relevance score (highest first)
    filtered_jobs.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    # Limit to top 20 jobs
    return filtered_jobs[:20]

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = sys.stdin.read().strip()
        if not input_data:
            json.dump([], sys.stdout)
            sys.exit(0)
            
        data = json.loads(input_data)
        
        # Handle both job list and job+preferences format
        if isinstance(data, dict) and 'jobs' in data:
            jobs = data['jobs']
            preferences = data.get('preferences', {})
        else:
            jobs = data
            preferences = {}
        
        # Process jobs
        filtered_jobs = filter_jobs(jobs, preferences)
        
        # Write output to stdout
        json.dump(filtered_jobs, sys.stdout)
        
    except Exception as e:
        # Return empty list on error
        json.dump([], sys.stdout)
        sys.exit(1)
