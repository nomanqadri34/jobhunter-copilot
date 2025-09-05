# Job Hunting Application

A comprehensive job hunting platform with AI-powered filtering, social login, calendar integration, and multi-channel alerts.

## Features

- **Authentication**: Descope integration with LinkedIn & Google OAuth
- **Job Search**: AI-powered job filtering and ranking
- **Interview Prep**: AI-generated interview questions using Google Gemini
- **Calendar Integration**: Google Calendar reminders for job applications
- **Alerts**: Slack and WhatsApp notifications
- **Smart Filtering**: Python AI engine for job relevance scoring

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI Filter**: Python with scikit-learn
- **Database**: MongoDB
- **Authentication**: Descope
- **AI**: Google Gemini API

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure:
- Descope project ID and management key
- MongoDB connection string
- Google Gemini API key
- Slack webhook URL
- Twilio WhatsApp credentials

### 2. Frontend Setup

```bash
cd client
npm install
```

Copy `.env.example` to `.env` and configure:
- Descope project ID and flow URL

### 3. Python Filter Setup

```bash
cd pythonfilter
pip install -r requirements.txt
```

### 4. Descope Configuration

1. Create a Descope project
2. Configure LinkedIn and Google OAuth providers
3. Set up outbound app tokens for LinkedIn and Google APIs
4. Configure authentication flows

### 5. External Services

#### Google Calendar API
- Enable Google Calendar API in Google Cloud Console
- Configure OAuth consent screen
- Add calendar scopes in Descope

#### Slack Integration
- Create a Slack app
- Generate incoming webhook URL
- Add to environment variables

#### WhatsApp (Twilio)
- Create Twilio account
- Enable WhatsApp sandbox
- Get account SID, auth token, and WhatsApp number

## Running the Application

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd client && npm run dev`
4. Access application at `http://localhost:5173`

## Usage Flow

1. **Login**: Use Descope authentication with LinkedIn/Google
2. **Set Preferences**: Fill job preferences form
3. **Job Search**: AI fetches and filters jobs from multiple sources
4. **View Results**: Browse AI-ranked job listings
5. **Set Reminders**: Create Google Calendar events for applications
6. **Get Alerts**: Receive Slack/WhatsApp notifications
7. **Interview Prep**: Generate AI-powered interview questions

## API Endpoints

- `POST /api/jobs/search` - Search and filter jobs
- `POST /api/calendar/event` - Create calendar reminder
- `POST /api/slack/alert` - Send Slack notification
- `POST /api/whatsapp/alert` - Send WhatsApp notification
- `POST /api/interview/prepare` - Generate interview questions

## Environment Variables

### Backend (.env)
```
DESCOPE_PROJECT_ID=
DESCOPE_MANAGEMENT_KEY=
MONGO_URI=
GEMINI_API_KEY=
SLACK_WEBHOOK_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
PORT=5000
```

### Frontend (.env)
```
VITE_DESCOPE_PROJECT_ID=
VITE_DESCOPE_FLOW_URL=
```