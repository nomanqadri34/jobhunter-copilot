import React, { useState } from "react";
import { jobService } from "../../services/jobService";
import "./CareerRoadmap.css";

const CareerRoadmap = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRoadmap = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = currentSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);
      const result = await jobService.generateRoadmap(
        jobTitle,
        skillsArray,
        experienceLevel
      );
      setRoadmap(result.data);
    } catch (error) {
      console.error("Roadmap generation error:", error);
      alert("Failed to generate career roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a target job title");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = currentSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);
      const result = await jobService.generateSkillGapAnalysis(
        jobTitle,
        skillsArray,
        `${experienceLevel} level`
      );
      setRoadmap({ ...roadmap, skillGapAnalysis: result.data.analysis });
    } catch (error) {
      console.error("Skill gap analysis error:", error);
      alert("Failed to generate skill gap analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-roadmap">
      <div className="roadmap-header">
        <h2>AI-Powered Career Roadmap</h2>
        <p>Get a personalized career development plan using AI</p>
      </div>

      <div className="roadmap-form">
        <div className="form-section">
          <h3>Tell us about your career goals</h3>

          <div className="input-group">
            <label>Target Job Title *</label>
            <input
              type="text"
              placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="job-title-input"
            />
          </div>

          <div className="input-group">
            <label>Current Skills (comma-separated)</label>
            <textarea
              placeholder="e.g., JavaScript, React, Python, SQL, Project Management"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              className="skills-input"
              rows="3"
            />
          </div>

          <div className="input-group">
            <label>Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="experience-select"
            >
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading || !jobTitle.trim()}
              className="generate-btn primary"
            >
              {loading ? "Generating..." : "Generate Career Roadmap"}
            </button>

            <button
              onClick={handleSkillGapAnalysis}
              disabled={loading || !jobTitle.trim()}
              className="generate-btn secondary"
            >
              {loading ? "Analyzing..." : "Analyze Skill Gap"}
            </button>
          </div>
        </div>
      </div>

      {roadmap && (
        <div className="roadmap-results">
          {roadmap.roadmap && (
            <div className="roadmap-section">
              <h3>Your Personalized Career Roadmap</h3>
              <div className="roadmap-content">
                <pre>{roadmap.roadmap}</pre>
              </div>
            </div>
          )}

          {roadmap.skillGapAnalysis && (
            <div className="roadmap-section">
              <h3>Skill Gap Analysis</h3>
              <div className="roadmap-content">
                <pre>{roadmap.skillGapAnalysis}</pre>
              </div>
            </div>
          )}

          <div className="roadmap-actions">
            <button
              onClick={() => {
                const content = `Career Roadmap for ${jobTitle}\n\n${
                  roadmap.roadmap || ""
                }\n\n${roadmap.skillGapAnalysis || ""}`;
                navigator.clipboard.writeText(content);
                alert("Roadmap copied to clipboard!");
              }}
              className="action-btn"
            >
              Copy to Clipboard
            </button>

            <button
              onClick={() => {
                const content = `Career Roadmap for ${jobTitle}\n\n${
                  roadmap.roadmap || ""
                }\n\n${roadmap.skillGapAnalysis || ""}`;
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${jobTitle.replace(/\s+/g, "_")}_roadmap.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="action-btn"
            >
              Download as Text
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>AI is generating your personalized career roadmap...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
