import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import "./InterviewDetails.css";

const InterviewDetails = () => {
  const [interviewId, setInterviewId] = useState("");
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleGetInterviewDetails = async () => {
    if (!interviewId.trim()) {
      alert("Please enter an interview ID");
      return;
    }

    setLoading(true);
    try {
      const result = await jobService.getInterviewDetails(interviewId);
      setInterviewDetails(result.data);
      setActiveTab("details");
    } catch (error) {
      console.error("Error fetching interview details:", error);
      alert(
        "Failed to fetch interview details. Please check the interview ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetInterviewPrep = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      alert("Please enter both company name and job title");
      return;
    }

    setLoading(true);
    try {
      const result = await jobService.getInterviewPrep(companyName, jobTitle);
      setInterviewPrep(result.data);
      setActiveTab("prep");
    } catch (error) {
      console.error("Error fetching interview prep:", error);
      alert("Failed to fetch interview preparation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInterviewDetails = () => {
    if (!interviewDetails) return null;

    return (
      <div className="interview-details-content">
        <h3>Interview Details</h3>
        <div className="details-card">
          <pre>{JSON.stringify(interviewDetails, null, 2)}</pre>
        </div>
      </div>
    );
  };

  const renderInterviewPrep = () => {
    if (!interviewPrep) return null;

    return (
      <div className="interview-prep-content">
        <h3>
          Interview Preparation for {companyName} - {jobTitle}
        </h3>

        {interviewPrep.tips && (
          <div className="prep-section">
            <h4>General Interview Tips</h4>
            <ul className="tips-list">
              {interviewPrep.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {interviewPrep.searchResults && (
          <div className="prep-section">
            <h4>Related Job Opportunities</h4>
            <div className="search-results">
              {interviewPrep.searchResults.data?.data
                ?.slice(0, 5)
                .map((job, index) => (
                  <div key={index} className="job-result">
                    <h5>{job.job_title}</h5>
                    <p>
                      <strong>Company:</strong> {job.employer_name}
                    </p>
                    <p>
                      <strong>Location:</strong> {job.job_city}
                    </p>
                    <p className="job-snippet">
                      {job.job_description?.substring(0, 150)}...
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="prep-section">
          <h4>Common Interview Questions to Prepare</h4>
          <div className="questions-grid">
            <div className="question-category">
              <h5>Behavioral Questions</h5>
              <ul>
                <li>Tell me about yourself</li>
                <li>Why do you want to work here?</li>
                <li>Describe a challenging situation you faced</li>
                <li>Where do you see yourself in 5 years?</li>
              </ul>
            </div>
            <div className="question-category">
              <h5>Technical Questions</h5>
              <ul>
                <li>What are your technical strengths?</li>
                <li>How do you stay updated with technology?</li>
                <li>Describe your problem-solving approach</li>
                <li>What projects are you most proud of?</li>
              </ul>
            </div>
            <div className="question-category">
              <h5>Company-Specific Questions</h5>
              <ul>
                <li>What do you know about our company?</li>
                <li>Why this role specifically?</li>
                <li>How would you contribute to our team?</li>
                <li>What questions do you have for us?</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prep-section">
          <h4>STAR Method Template</h4>
          <div className="star-method">
            <div className="star-item">
              <strong>Situation:</strong> Describe the context or background
            </div>
            <div className="star-item">
              <strong>Task:</strong> Explain what you needed to accomplish
            </div>
            <div className="star-item">
              <strong>Action:</strong> Detail the specific actions you took
            </div>
            <div className="star-item">
              <strong>Result:</strong> Share the outcomes and what you learned
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="interview-details">
      <div className="interview-header">
        <h2>Interview Preparation & Details</h2>
        <p>Get interview insights and preparation materials</p>
      </div>

      <div className="interview-controls">
        <div className="control-section">
          <h3>Get Interview Details</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Glassdoor Interview ID (e.g., 19018219)"
              value={interviewId}
              onChange={(e) => setInterviewId(e.target.value)}
              className="interview-input"
            />
            <button
              onClick={handleGetInterviewDetails}
              disabled={loading || !interviewId.trim()}
              className="fetch-btn"
            >
              {loading ? "Loading..." : "Get Details"}
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Interview Preparation</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="interview-input"
            />
            <input
              type="text"
              placeholder="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="interview-input"
            />
            <button
              onClick={handleGetInterviewPrep}
              disabled={loading || !companyName.trim() || !jobTitle.trim()}
              className="prep-btn"
            >
              {loading ? "Loading..." : "Get Prep Materials"}
            </button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-tabs">
          <button
            className={activeTab === "details" ? "tab active" : "tab"}
            onClick={() => setActiveTab("details")}
          >
            Interview Details
          </button>
          <button
            className={activeTab === "prep" ? "tab active" : "tab"}
            onClick={() => setActiveTab("prep")}
          >
            Preparation Materials
          </button>
        </div>

        <div className="results-content">
          {loading ? (
            <div className="loading">Loading interview data...</div>
          ) : (
            <>
              {activeTab === "details" && renderInterviewDetails()}
              {activeTab === "prep" && renderInterviewPrep()}
              {!interviewDetails && !interviewPrep && (
                <div className="no-data">
                  Use the controls above to fetch interview details or
                  preparation materials
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails;
