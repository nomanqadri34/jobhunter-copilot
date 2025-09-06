import React, { useState, useEffect } from "react";
import { useDescope, useSession, useUser } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const Dashboard = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const { logout } = useDescope();
  const navigate = useNavigate();

  const { sessionToken } = useSession(); // Get session token
  const [jobPreferences, setJobPreferences] = useState({
    jobTitle: "",
    location: "",
    experienceLevel: "",
    jobType: "",
    skills: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchError, setJobSearchError] = useState(null);
  const [reminderMessage, setReminderMessage] = useState(null);
  const [interviewJobTitle, setInterviewJobTitle] = useState("");
  const [interviewExperience, setInterviewExperience] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [loadingInterviewQuestions, setLoadingInterviewQuestions] =
    useState(false);
  const [interviewError, setInterviewError] = useState(null);
  const [slackAlertMessage, setSlackAlertMessage] = useState("");
  const [slackResponse, setSlackResponse] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappResponse, setWhatsappResponse] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [interviewRoadmap, setInterviewRoadmap] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "interviewJobTitle") {
      setInterviewJobTitle(value);
    } else if (name === "interviewExperience") {
      setInterviewExperience(value);
    } else {
      setJobPreferences((prevPrefs) => ({
        ...prevPrefs,
        [name]: value,
      }));
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setJobSearchError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs/search",
        jobPreferences,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobSearchError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchJobsWithPreferences = async (preferences) => {
    setLoadingJobs(true);
    setJobSearchError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs/search",
        preferences,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobSearchError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Job Preferences Submitted:", jobPreferences);
    await fetchJobs();
  };

  const handleGenerateInterviewQuestions = async () => {
    setLoadingInterviewQuestions(true);
    setInterviewError(null);
    setInterviewRoadmap("");
    setYoutubeVideos([]);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/prepare",
        {
          jobTitle: interviewJobTitle,
          experience: interviewExperience,
          skills: jobPreferences.skills,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setInterviewRoadmap(response.data.roadmap);
      setYoutubeVideos(response.data.youtubeVideos || []);
    } catch (error) {
      console.error("Error generating interview preparation:", error);
      setInterviewError(
        "Failed to generate interview preparation. Please try again."
      );
    } finally {
      setLoadingInterviewQuestions(false);
    }
  };

  const handleSendSlackAlert = async () => {
    setSlackResponse(null);
    if (!slackAlertMessage) {
      alert("Please enter a message for the Slack alert.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/slack/alert",
        { message: slackAlertMessage },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setSlackResponse({ success: true, message: response.data.message });
      setSlackAlertMessage(""); // Clear message after sending
    } catch (error) {
      console.error("Error sending Slack alert:", error);
      setSlackResponse({
        success: false,
        message: error.response?.data?.message || "Failed to send Slack alert.",
      });
    }
  };

  const handleSendWhatsAppAlert = async () => {
    setWhatsappResponse(null);
    if (!whatsappMessage || !whatsappPhone) {
      alert("Please enter both message and phone number for WhatsApp alert.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/whatsapp/alert",
        { message: whatsappMessage, phoneNumber: whatsappPhone },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setWhatsappResponse({ success: true, message: response.data.message });
      setWhatsappMessage("");
      setWhatsappPhone("");
    } catch (error) {
      console.error("Error sending WhatsApp alert:", error);
      setWhatsappResponse({
        success: false,
        message:
          error.response?.data?.message || "Failed to send WhatsApp alert.",
      });
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResumeData(response.data);

      // Auto-fill preferences and trigger job search
      const suggestions = response.data.suggested_preferences;
      if (suggestions) {
        const autoPreferences = {
          jobTitle: suggestions.jobTitle || "Software Developer",
          location: "Remote",
          experienceLevel: suggestions.experienceLevel || "associate",
          jobType: "full-time",
          skills: suggestions.skills || "",
        };
        setJobPreferences(autoPreferences);

        // Automatically search for jobs based on resume
        fetchJobsWithPreferences(autoPreferences);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume";
      alert(`Resume upload failed: ${errorMessage}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSetReminder = async (job) => {
    setReminderMessage(null);
    const reminderDate = prompt(
      "Enter reminder date and time (YYYY-MM-DDTHH:MM:SS, e.g., 2024-12-25T10:00:00):"
    );
    if (!reminderDate) {
      return; // User cancelled
    }

    try {
      const eventStart = new Date(reminderDate);
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration

      const response = await axios.post(
        "http://localhost:5000/api/calendar/event",
        {
          summary: `Apply for ${job.title} at ${job.company}`,
          description: `Job Link: [Link to job if available]\nLocation: ${job.location}\nDescription: ${job.description}`,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setReminderMessage(`Reminder set: ${response.data.htmlLink}`);
    } catch (error) {
      console.error("Error setting reminder:", error);
      setReminderMessage(
        "Failed to set reminder. Please ensure your Google account is connected."
      );
    }
  };

  // Optionally fetch jobs on initial load if preferences are already set
  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      // You might want to load saved preferences here and then call fetchJobs
      // For now, we'll just fetch if there are any default preferences or after submission
    }
  }, [isAuthenticated, sessionToken]);

  if (isSessionLoading || isUserLoading) {
    return <div>Loading user session...</div>;
  }

  if (!isAuthenticated) {
    navigate("/"); // Redirect to login if not authenticated
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        Welcome to your Job Hunting Dashboard, {user?.name || user?.email}!
      </h1>
      <p>
        This is where you will manage your job preferences, view job listings,
        and get interview preparation.
      </p>
      <button onClick={handleLogout}>Logout</button>
      {reminderMessage && (
        <p
          style={{
            marginTop: "10px",
            color: reminderMessage.includes("Failed") ? "red" : "green",
          }}
        >
          {reminderMessage}
        </p>
      )}

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <h2>Upload Resume (Optional)</h2>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            disabled={uploadingResume}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          {uploadingResume && <p>Uploading and parsing resume...</p>}
          {resumeData && (
            <div
              style={{
                marginTop: "10px",
                padding: "15px",
                backgroundColor: "#f0f8ff",
                borderRadius: "4px",
              }}
            >
              <p>
                <strong>Resume parsed successfully!</strong>
              </p>
              <p>
                <strong>Auto-generated preferences:</strong>
              </p>
              <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                <li>Job Title: {jobPreferences.jobTitle}</li>
                <li>Experience Level: {jobPreferences.experienceLevel}</li>
                <li>Skills: {jobPreferences.skills}</li>
              </ul>
              <p style={{ color: "green" }}>
                🔍 Searching for matching jobs...
              </p>
            </div>
          )}
        </div>
      </div>

      {!resumeData && (
        <div
          style={{
            marginTop: "30px",
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <h2>
            Set Your Job Preferences (Optional - Upload Resume for Auto-Fill)
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              maxWidth: "500px",
            }}
          >
            <div>
              <label
                htmlFor="jobTitle"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Job Title:
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={jobPreferences.jobTitle}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                required
              />
            </div>
            <div>
              <label
                htmlFor="location"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Location:
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={jobPreferences.location}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="experienceLevel"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Experience Level:
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={jobPreferences.experienceLevel}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select...</option>
                <option value="entry">Entry Level</option>
                <option value="associate">Associate</option>
                <option value="mid">Mid-Senior Level</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="jobType"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Job Type:
              </label>
              <select
                id="jobType"
                name="jobType"
                value={jobPreferences.jobType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select...</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="skills"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Skills (comma-separated):
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={jobPreferences.skills}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Save Preferences
            </button>
          </form>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <h2>Interview Preparation</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "500px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              htmlFor="interviewJobTitle"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Job Title for Interview:
            </label>
            <input
              type="text"
              id="interviewJobTitle"
              name="interviewJobTitle"
              value={interviewJobTitle}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="interviewExperience"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Experience Level:
            </label>
            <select
              id="interviewExperience"
              name="interviewExperience"
              value={interviewExperience}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              required
            >
              <option value="">Select...</option>
              <option value="entry">Entry Level</option>
              <option value="associate">Associate</option>
              <option value="mid">Mid-Senior Level</option>
              <option value="director">Director</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <button
            onClick={handleGenerateInterviewQuestions}
            disabled={loadingInterviewQuestions}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loadingInterviewQuestions
              ? "Generating Questions..."
              : "Generate Interview Questions"}
          </button>
        </div>

        {interviewError && <p style={{ color: "red" }}>{interviewError}</p>}
        {interviewRoadmap && (
          <div style={{ marginTop: "20px" }}>
            <h3>Interview Preparation Roadmap:</h3>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
              }}
            >
              {interviewRoadmap}
            </div>
          </div>
        )}
        {youtubeVideos.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Recommended YouTube Videos:</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "15px",
              }}
            >
              {youtubeVideos.map((video, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px",
                    backgroundColor: "#fff",
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{ width: "100%", borderRadius: "4px" }}
                  />
                  <h4 style={{ margin: "10px 0 5px 0", fontSize: "14px" }}>
                    {video.title}
                  </h4>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      backgroundColor: "#ff0000",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Watch on YouTube
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <h2>Send Slack Alert</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "500px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              htmlFor="slackAlertMessage"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Message:
            </label>
            <textarea
              id="slackAlertMessage"
              name="slackAlertMessage"
              value={slackAlertMessage}
              onChange={(e) => setSlackAlertMessage(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              required
            ></textarea>
          </div>
          <button
            onClick={handleSendSlackAlert}
            style={{
              padding: "10px 20px",
              backgroundColor: "#621462",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Send Slack Alert
          </button>
          {slackResponse && (
            <p style={{ color: slackResponse.success ? "green" : "red" }}>
              {slackResponse.message}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <h2>Send WhatsApp Alert</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "500px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              htmlFor="whatsappPhone"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Phone Number (with country code, e.g., +1234567890):
            </label>
            <input
              type="tel"
              id="whatsappPhone"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              placeholder="+1234567890"
              required
            />
          </div>
          <div>
            <label
              htmlFor="whatsappMessage"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Message:
            </label>
            <textarea
              id="whatsappMessage"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              required
            ></textarea>
          </div>
          <button
            onClick={handleSendWhatsAppAlert}
            style={{
              padding: "10px 20px",
              backgroundColor: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Send WhatsApp Alert
          </button>
          {whatsappResponse && (
            <p style={{ color: whatsappResponse.success ? "green" : "red" }}>
              {whatsappResponse.message}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <h2>Job Listings</h2>
        {loadingJobs && <p>Loading jobs...</p>}
        {jobSearchError && <p style={{ color: "red" }}>{jobSearchError}</p>}
        {jobs.length === 0 && !loadingJobs && !jobSearchError && (
          <p>No jobs found. Adjust your preferences and search again.</p>
        )}
        {jobs.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                  {job.title}
                </h3>
                <p style={{ margin: "5px 0" }}>
                  <strong>Company:</strong> {job.company}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Location:</strong> {job.location}
                </p>
                {job.salary && (
                  <p
                    style={{
                      margin: "5px 0",
                      color: "#27ae60",
                      fontWeight: "bold",
                    }}
                  >
                    <strong>Salary:</strong> {job.salary}
                  </p>
                )}
                <p style={{ margin: "10px 0", lineHeight: "1.4" }}>
                  {job.description}
                </p>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Apply Now
                    </a>
                  )}
                  <button
                    onClick={() => handleSetReminder(job)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
