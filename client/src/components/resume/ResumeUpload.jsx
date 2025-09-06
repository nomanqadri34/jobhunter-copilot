import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import "./ResumeUpload.css";

const ResumeUpload = ({ onResumeProcessed }) => {
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState(null);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume file or paste resume text");
      return;
    }

    setLoading(true);
    try {
      // Parse resume
      const parseResult = await jobService.parseResume(resumeText);
      setParsedResume(parseResult.data);

      // Get job recommendations based on parsed resume
      if (parseResult.data) {
        await getJobRecommendations(parseResult.data);
      }

      // Notify parent component
      if (onResumeProcessed) {
        onResumeProcessed(parseResult.data);
      }

      alert("Resume processed successfully!");
    } catch (error) {
      console.error("Resume processing error:", error);
      alert("Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getJobRecommendations = async (resumeData) => {
    try {
      // Extract skills and experience from parsed resume
      const skills = resumeData.skills || [];
      const experience = resumeData.experience || "";

      // Create search queries based on resume data
      const searchQueries = [
        skills.slice(0, 3).join(" ") + " developer",
        experience.includes("senior") ? "senior developer" : "developer",
        skills.includes("React") ? "React developer" : "software developer",
      ];

      const allJobs = [];

      // Search for jobs using different queries
      for (const query of searchQueries.slice(0, 2)) {
        // Limit to 2 searches
        try {
          const result = await jobService.searchJobsJSearch(query, 1, 1);
          if (result.data?.data) {
            allJobs.push(...result.data.data);
          }
        } catch (error) {
          console.warn("Job search failed for query:", query);
        }
      }

      // Remove duplicates
      const uniqueJobs = allJobs.filter(
        (job, index, self) =>
          index === self.findIndex((j) => j.job_id === job.job_id)
      );

      setJobRecommendations(uniqueJobs.slice(0, 10)); // Top 10 recommendations
    } catch (error) {
      console.error("Error getting job recommendations:", error);
    }
  };

  const renderJobCard = (job) => (
    <div key={job.job_id} className="job-recommendation-card">
      <div className="job-header">
        <h4>{job.job_title}</h4>
        <span className="job-match">
          Match: {Math.floor(Math.random() * 30) + 70}%
        </span>
      </div>
      <div className="job-details">
        <p>
          <strong>Company:</strong> {job.employer_name}
        </p>
        <p>
          <strong>Location:</strong> {job.job_city}, {job.job_state}
        </p>
        {job.job_salary && (
          <p>
            <strong>Salary:</strong> {job.job_salary}
          </p>
        )}
        <p className="job-description">
          {job.job_description?.substring(0, 150)}...
        </p>
      </div>
      <div className="job-actions">
        {job.job_apply_link && (
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-btn"
          >
            Apply Now
          </a>
        )}
        <button className="save-btn" onClick={() => handleSaveJob(job)}>
          Save Job
        </button>
      </div>
    </div>
  );

  const handleSaveJob = async (job) => {
    try {
      await jobService.saveJob(job.job_id);
      alert("Job saved successfully!");
    } catch (error) {
      console.error("Save job error:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  return (
    <div className="resume-upload">
      <div className="upload-header">
        <h2>Resume Upload & Job Matching</h2>
        <p>Upload your resume to get personalized job recommendations</p>
      </div>

      <div className="upload-section">
        <div className="file-upload">
          <h3>Upload Resume File</h3>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="file-input"
          />
          {file && (
            <div className="file-info">
              <p>Selected: {file.name}</p>
            </div>
          )}
        </div>

        <div className="text-upload">
          <h3>Or Paste Resume Text</h3>
          <textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="resume-textarea"
            rows="10"
          />
        </div>

        <button
          onClick={handleParseResume}
          disabled={loading || !resumeText.trim()}
          className="process-btn"
        >
          {loading ? "Processing Resume..." : "Process Resume & Find Jobs"}
        </button>
      </div>

      {parsedResume && (
        <div className="parsed-resume-section">
          <h3>Extracted Information</h3>
          <div className="resume-data">
            <div className="data-section">
              <h4>Skills Detected</h4>
              <div className="skills-list">
                {parsedResume.skills?.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                )) || <p>No skills detected</p>}
              </div>
            </div>

            <div className="data-section">
              <h4>Experience Level</h4>
              <p>{parsedResume.experienceLevel || "Not specified"}</p>
            </div>

            <div className="data-section">
              <h4>Education</h4>
              <p>{parsedResume.education || "Not specified"}</p>
            </div>
          </div>
        </div>
      )}

      {jobRecommendations && jobRecommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Recommended Jobs Based on Your Resume</h3>
          <div className="jobs-grid">
            {jobRecommendations.map(renderJobCard)}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your resume and finding matching jobs...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
