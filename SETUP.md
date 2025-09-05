# Job Hunting Application Setup

## Quick Start

1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../client
   npm install
   
   # Python Filter
   cd ../pythonfilter
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

2. **Environment Setup:**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `client/.env.example` to `client/.env`
   - Add your API keys

3. **Run Application:**
   ```bash
   # Option 1: Use startup script
   start.bat
   
   # Option 2: Manual start
   # Terminal 1: Python Flask
   cd pythonfilter && python app.py
   
   # Terminal 2: Node.js Backend
   cd backend && npm run dev
   
   # Terminal 3: React Frontend
   cd client && npm run dev
   ```

## Required API Keys

### Backend (.env)
```
DESCOPE_PROJECT_ID=your_descope_project_id
DESCOPE_MANAGEMENT_KEY=your_descope_management_key
MONGO_URI=mongodb://localhost:27017/jobhunting
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
PORT=5000
```

### Frontend (.env)
```
VITE_DESCOPE_PROJECT_ID=your_descope_project_id
VITE_DESCOPE_FLOW_URL=your_descope_flow_url
```

## Services

- **Frontend**: http://localhost:5173
- **Node.js Backend**: http://localhost:5000
- **Python Flask**: http://localhost:5001

## Features

✅ Descope Authentication with LinkedIn/Google OAuth
✅ Resume Upload & AI Parsing
✅ RapidAPI Job Fetching
✅ Python AI Job Filtering
✅ Google Calendar Integration
✅ Slack/WhatsApp Alerts
✅ AI Interview Preparation with YouTube Videos