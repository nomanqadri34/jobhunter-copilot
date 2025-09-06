import React, { useState, useEffect } from "react";
import {
  Brain,
  Calendar,
  Clock,
  Play,
  BookOpen,
  MessageSquare,
  Target,
  Youtube,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { interviewService } from "../../services/interviewService";
import "./InterviewPrep.css";

export const InterviewPrep = ({
  jobTitle,
  userSkills,
  experienceLevel,
  googleTokens,
}) => {
  const [prepData, setPrepData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reminderData, setReminderData] = useState({
    company: "",
    interviewDate: "",
    interviewTime: "10:00",
  });
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  useEffect(() => {
    if (jobTitle) {
      generatePrep();
    }
  }, [jobTitle, userSkills, experienceLevel]);

  const generatePrep = async () => {
    setLoading(true);
    try {
      const response = await interviewService.generatePrep({
        jobTitle,
        userSkills: userSkills || [],
        experienceLevel: experienceLevel || "associate",
      });

      if (response.success) {
        setPrepData(response.data);
        setVideos(response.data.videos || []);
      }
    } catch (error) {
      console.error("Failed to generate interview prep:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async () => {
    if (!googleTokens) {
      alert(
        "Please connect your Google account first to create calendar reminders."
      );
      return;
    }

    if (!reminderData.company || !reminderData.interviewDate) {
      alert("Please fill in company name and interview date.");
      return;
    }

    setReminderLoading(true);
    try {
      const interviewDateTime = new Date(
        `${reminderData.interviewDate}T${reminderData.interviewTime}`
      );

      const response = await interviewService.createReminder({
        jobTitle,
        company: reminderData.company,
        interviewDate: interviewDateTime.toISOString(),
        googleTokens,
      });

      if (response.success) {
        setReminderSuccess(true);
        setTimeout(() => setReminderSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to create reminder:", error);
      alert("Failed to create calendar reminder. Please try again.");
    } finally {
      setReminderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="interview-prep loading">
        <div className="loading-spinner">
          <Brain className="animate-spin" size={32} />
          <p>Generating personalized interview preparation...</p>
        </div>
      </div>
    );
  }

  if (!prepData) {
    return (
      <div className="interview-prep empty">
        <div className="empty-state">
          <Brain size={48} />
          <h3>Interview Preparation</h3>
          <p>
            Enter a job title to generate personalized interview preparation
            materials.
          </p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="prep-overview">
      <div className="prep-stats">
        <div className="stat-card">
          <BookOpen size={24} />
          <div className="stat-info">
            <h4>{prepData.technicalTopics?.length || 0}</h4>
            <p>Technical Topics</p>
          </div>
        </div>

        <div className="stat-card">
          <MessageSquare size={24} />
          <div className="stat-info">
            <h4>{prepData.technicalQuestions?.length || 0}</h4>
            <p>Practice Questions</p>
          </div>
        </div>

        <div className="stat-card">
          <Target size={24} />
          <div className="stat-info">
            <h4>{prepData.skillsToHighlight?.length || 0}</h4>
            <p>Key Skills</p>
          </div>
        </div>

        <div className="stat-card">
          <Youtube size={24} />
          <div className="stat-info">
            <h4>{videos.length}</h4>
            <p>Video Resources</p>
          </div>
        </div>
      </div>

      <div className="prep-timeline">
        <h4>
          <Clock size={20} /> Preparation Timeline
        </h4>
        {prepData.timeline && (
          <div className="timeline">
            {Object.entries(prepData.timeline).map(([week, tasks]) => (
              <div key={week} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h5>{week.charAt(0).toUpperCase() + week.slice(1)}</h5>
                  <p>{tasks}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="prep-questions">
      <div className="question-section">
        <h4>Technical Questions</h4>
        <div className="questions-list">
          {prepData.technicalQuestions?.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-number">{index + 1}</div>
              <div className="question-text">{question}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="question-section">
        <h4>Behavioral Questions</h4>
        <div className="questions-list">
          {prepData.behavioralQuestions?.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-number">{index + 1}</div>
              <div className="question-text">{question}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="prep-topics">
      <div className="topics-grid">
        <div className="topic-section">
          <h4>Technical Topics to Study</h4>
          <div className="topic-tags">
            {prepData.technicalTopics?.map((topic, index) => (
              <span key={index} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="topic-section">
          <h4>Skills to Highlight</h4>
          <div className="topic-tags">
            {prepData.skillsToHighlight?.map((skill, index) => (
              <span key={index} className="topic-tag highlight">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="topic-section">
          <h4>Mock Interview Scenarios</h4>
          <div className="scenarios-list">
            {prepData.mockScenarios?.map((scenario, index) => (
              <div key={index} className="scenario-item">
                <Play size={16} />
                <span>{scenario}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="prep-videos">
      <div className="videos-grid">
        {videos.map((video, index) => (
          <div key={index} className="video-card">
            <div className="video-thumbnail">
              <img src={video.thumbnail} alt={video.title} />
              <div className="video-overlay">
                <Play size={24} />
              </div>
            </div>
            <div className="video-info">
              <h5>{video.title}</h5>
              <p className="video-channel">{video.channelTitle}</p>
              <p className="video-description">
                {video.description.substring(0, 100)}...
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReminder = () => (
    <div className="prep-reminder">
      <div className="reminder-form">
        <h4>
          <Calendar size={20} /> Create Interview Reminder
        </h4>
        <p>
          Add this interview to your Google Calendar with preparation reminders.
        </p>

        {reminderSuccess && (
          <div className="success-message">
            <CheckCircle size={16} />
            Interview reminder created successfully!
          </div>
        )}

        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            placeholder="e.g., Google, Microsoft"
            value={reminderData.company}
            onChange={(e) =>
              setReminderData((prev) => ({ ...prev, company: e.target.value }))
            }
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Interview Date</label>
            <input
              type="date"
              value={reminderData.interviewDate}
              onChange={(e) =>
                setReminderData((prev) => ({
                  ...prev,
                  interviewDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Interview Time</label>
            <input
              type="time"
              value={reminderData.interviewTime}
              onChange={(e) =>
                setReminderData((prev) => ({
                  ...prev,
                  interviewTime: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <button
          onClick={createReminder}
          disabled={reminderLoading || !googleTokens}
          className="btn-primary"
        >
          {reminderLoading ? "Creating..." : "Create Calendar Reminder"}
        </button>

        {!googleTokens && (
          <div className="warning-message">
            <AlertCircle size={16} />
            Connect your Google account to create calendar reminders
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="interview-prep">
      <div className="prep-header">
        <h3>Interview Preparation: {jobTitle}</h3>
        <p>
          AI-generated preparation materials tailored to your experience level
        </p>
      </div>

      <div className="prep-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Brain size={16} />
          Overview
        </button>

        <button
          className={`tab ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          <MessageSquare size={16} />
          Questions
        </button>

        <button
          className={`tab ${activeTab === "topics" ? "active" : ""}`}
          onClick={() => setActiveTab("topics")}
        >
          <BookOpen size={16} />
          Topics
        </button>

        <button
          className={`tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          <Youtube size={16} />
          Videos
        </button>

        <button
          className={`tab ${activeTab === "reminder" ? "active" : ""}`}
          onClick={() => setActiveTab("reminder")}
        >
          <Calendar size={16} />
          Reminder
        </button>
      </div>

      <div className="prep-content">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "questions" && renderQuestions()}
        {activeTab === "topics" && renderTopics()}
        {activeTab === "videos" && renderVideos()}
        {activeTab === "reminder" && renderReminder()}
      </div>
    </div>
  );
};
