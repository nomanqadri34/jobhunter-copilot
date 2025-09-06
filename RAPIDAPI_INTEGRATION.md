# RapidAPI Integration Guide

This document outlines the integration of multiple RapidAPI services into the job search application.

## Integrated APIs

### 1. JSearch API

- **Endpoint**: `https://jsearch.p.rapidapi.com/search`
- **Purpose**: Comprehensive job search across multiple job boards
- **Features**:
  - Search by keywords, location, country
  - Filter by date posted, employment type
  - Pagination support

### 2. Job Search API (ATS Expired)

- **Endpoint**: `https://job-search-api2.p.rapidapi.com/active-ats-expired`
- **Purpose**: Find jobs with expired ATS (Applicant Tracking System) postings
- **Features**: Access to jobs that may have less competition

### 3. Glassdoor Real-Time API

- **Endpoint**: `https://glassdoor-real-time.p.rapidapi.com/companies/interview-details`
- **Purpose**: Get detailed interview information from Glassdoor
- **Features**: Interview questions, process details, company insights

### 4. Internships API

- **Endpoint**: `https://internships-api.p.rapidapi.com/active-jb-7d`
- **Purpose**: Find active internship opportunities
- **Features**: Recent internship postings from the last 7 days

### 5. Resume Optimizer Pro API

- **Endpoint**: `https://resumeoptimizerpro.p.rapidapi.com/parse`
- **Purpose**: Parse and analyze resume content
- **Features**: Extract skills, experience, education from resume text

## Backend Implementation

### Service Layer (`backend/services/rapidApiService.js`)

```javascript
// Example usage
import rapidApiService from "./services/rapidApiService.js";

// Search jobs
const jobs = await rapidApiService.searchJobs(
  "software developer",
  1,
  1,
  "us",
  "all"
);

// Get interview details
const interview = await rapidApiService.getInterviewDetails("19018219");

// Parse resume
const parsed = await rapidApiService.parseResume(resumeText);
```

### API Endpoints

#### Job Search Endpoints

- `GET /api/jobs/api/jsearch` - Search jobs using JSearch API
- `GET /api/jobs/api/ats-jobs` - Get ATS expired jobs
- `GET /api/jobs/api/internships` - Get active internships
- `GET /api/jobs/api/search-all` - Combined search across all APIs

#### Interview & Resume Endpoints

- `GET /api/jobs/api/interview/:interviewId` - Get interview details
- `GET /api/jobs/api/interview-prep` - Get interview preparation materials
- `POST /api/jobs/api/parse-resume` - Parse resume text

## Frontend Implementation

### Components

#### AdvancedJobSearch Component

- Location: `client/src/components/jobs/AdvancedJobSearch.jsx`
- Features:
  - Multi-source job search
  - Resume parsing integration
  - Tabbed results view
  - Job saving functionality

#### InterviewDetails Component

- Location: `client/src/components/interview/InterviewDetails.jsx`
- Features:
  - Glassdoor interview details lookup
  - Interview preparation materials
  - STAR method guidance
  - Common interview questions

### Service Layer (`client/src/services/jobService.js`)

```javascript
// Example usage
import { jobService } from "../services/jobService";

// Search across all job sources
const results = await jobService.searchAllJobs("developer", "chicago");

// Get interview details
const interview = await jobService.getInterviewDetails("19018219");

// Parse resume
const parsed = await jobService.parseResume(resumeText);
```

## Environment Configuration

Add your RapidAPI key to the `.env` file:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Usage Examples

### 1. Basic Job Search

```bash
curl -X GET "http://localhost:8000/api/jobs/api/jsearch?query=developer%20jobs%20in%20chicago&page=1"
```

### 2. Get Interview Details

```bash
curl -X GET "http://localhost:8000/api/jobs/api/interview/19018219"
```

### 3. Parse Resume

```bash
curl -X POST "http://localhost:8000/api/jobs/api/parse-resume" \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "John Doe\nSoftware Engineer\n..."}'
```

### 4. Combined Search

```bash
curl -X GET "http://localhost:8000/api/jobs/api/search-all?query=developer&location=chicago"
```

## Testing

Run the API test script to verify all integrations:

```bash
cd backend
node test-apis.js
```

## Error Handling

All API calls include comprehensive error handling:

- Network timeouts
- Invalid API responses
- Rate limiting
- Authentication errors

## Rate Limiting

Be aware of RapidAPI rate limits:

- Free tier: Usually 100-1000 requests/month per API
- Monitor usage in RapidAPI dashboard
- Implement caching for frequently requested data

## Navigation

The new features are accessible through:

- **Advanced Search**: Sidebar → "Advanced Search"
- **Interview Details**: Sidebar → "Interview Details"
- **Resume Parsing**: Available in Advanced Search component

## Future Enhancements

1. **Caching**: Implement Redis caching for API responses
2. **Background Jobs**: Queue API calls for better performance
3. **Analytics**: Track API usage and success rates
4. **User Preferences**: Save preferred job sources per user
5. **Real-time Updates**: WebSocket integration for live job updates

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify RAPIDAPI_KEY in .env file
2. **Rate Limit Exceeded**: Check RapidAPI dashboard for usage
3. **Network Errors**: Ensure stable internet connection
4. **CORS Issues**: Verify backend CORS configuration

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will provide detailed API request/response logs.
