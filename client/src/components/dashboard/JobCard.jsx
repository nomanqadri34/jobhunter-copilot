import React from 'react';
import { MapPin, Clock, DollarSign, Bookmark, ExternalLink } from 'lucide-react';
import { jobService } from '../../services/jobService';

export const JobCard = ({ job, onSave, onApply }) => {
  const handleSave = async () => {
    try {
      await jobService.saveJob(job._id);
      onSave?.(job._id);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleApply = async () => {
    try {
      await jobService.applyJob(job._id);
      onApply?.(job._id);
      // Open job application URL
      window.open(job.applyUrl, '_blank');
    } catch (error) {
      console.error('Failed to apply to job:', error);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    
    const format = (amount) => {
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`;
      }
      return `$${amount}`;
    };
    
    if (salary.min && salary.max) {
      return `${format(salary.min)} - ${format(salary.max)}`;
    }
    return salary.min ? `From ${format(salary.min)}` : `Up to ${format(salary.max)}`;
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        
        {job.aiScore && (
          <div className="ai-score">
            <span className="score">{job.aiScore}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>
      
      <div className="job-meta">
        <div className="meta-item">
          <MapPin size={16} />
          <span>{job.location}</span>
          {job.remote && <span className="remote-badge">Remote</span>}
        </div>
        
        <div className="meta-item">
          <DollarSign size={16} />
          <span>{formatSalary(job.salary)}</span>
        </div>
        
        <div className="meta-item">
          <Clock size={16} />
          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="job-description">
        <p>{job.description?.substring(0, 200)}...</p>
      </div>
      
      {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
          {job.skills.length > 5 && (
            <span className="skill-tag more">+{job.skills.length - 5} more</span>
          )}
        </div>
      )}
      
      {job.aiReason && (
        <div className="ai-reason">
          <p><strong>Why this matches:</strong> {job.aiReason}</p>
        </div>
      )}
      
      <div className="job-actions">
        <button className="btn-secondary" onClick={handleSave}>
          <Bookmark size={16} />
          Save
        </button>
        
        <button className="btn-primary" onClick={handleApply}>
          <ExternalLink size={16} />
          Apply Now
        </button>
      </div>
    </div>
  );
};