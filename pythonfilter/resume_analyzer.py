import spacy
import PyPDF2
import io
import re
from typing import Dict, List

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_skills(text: str) -> List[str]:
    """Extract technical skills from resume text"""
    skills_keywords = [
        'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
        'kubernetes', 'git', 'html', 'css', 'mongodb', 'postgresql', 'redis',
        'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas',
        'numpy', 'scikit-learn', 'angular', 'vue.js', 'typescript', 'go', 'rust',
        'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'flutter', 'django',
        'flask', 'spring', 'express', 'fastapi', 'graphql', 'rest api', 'api',
        'microservices', 'devops', 'ci/cd', 'jenkins', 'terraform', 'ansible'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skills_keywords:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))

def extract_experience_level(text: str) -> str:
    """Determine experience level from resume"""
    text_lower = text.lower()
    
    # Look for years of experience
    years_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
    years_match = re.search(years_pattern, text_lower)
    
    if years_match:
        years = int(years_match.group(1))
        if years < 2:
            return 'entry'
        elif years < 5:
            return 'associate'
        elif years < 8:
            return 'mid'
        else:
            return 'director'
    
    # Fallback to keyword matching
    if any(word in text_lower for word in ['senior', 'lead', 'principal', 'architect']):
        return 'director'
    elif any(word in text_lower for word in ['junior', 'intern', 'graduate', 'entry']):
        return 'entry'
    else:
        return 'associate'

def extract_job_titles(text: str) -> List[str]:
    """Extract job titles from resume"""
    doc = nlp(text)
    job_titles = []
    
    # Common job title patterns
    title_patterns = [
        r'software\s+(?:engineer|developer)',
        r'full\s+stack\s+developer',
        r'frontend\s+developer',
        r'backend\s+developer',
        r'data\s+(?:scientist|analyst|engineer)',
        r'machine\s+learning\s+engineer',
        r'devops\s+engineer',
        r'product\s+manager',
        r'project\s+manager'
    ]
    
    for pattern in title_patterns:
        matches = re.findall(pattern, text.lower())
        job_titles.extend(matches)
    
    return list(set(job_titles))

def analyze_resume(file) -> Dict:
    """Analyze resume and extract relevant information"""
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(file)
        
        # Extract information
        skills = extract_skills(text)
        experience_level = extract_experience_level(text)
        job_titles = extract_job_titles(text)
        
        # Suggest job preferences
        suggested_job_title = job_titles[0] if job_titles else "Software Developer"
        
        return {
            'skills': skills,
            'experience_level': experience_level,
            'job_titles': job_titles,
            'suggested_preferences': {
                'jobTitle': suggested_job_title,
                'experienceLevel': experience_level,
                'skills': ', '.join(skills[:10])  # Top 10 skills
            },
            'resume_text': text[:500] + '...' if len(text) > 500 else text
        }
        
    except Exception as e:
        raise Exception(f"Error analyzing resume: {str(e)}")