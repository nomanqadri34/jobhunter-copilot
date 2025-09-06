import React from "react";
import {
  Home,
  Briefcase,
  Bookmark,
  Calendar,
  MessageSquare,
  Upload,
  Settings,
  User,
  Search,
  FileText,
  Map,
} from "lucide-react";

export const Sidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "jobs", label: "Job Feed", icon: Briefcase },
    { id: "advanced-search", label: "Advanced Search", icon: Search },
    { id: "applied", label: "Applied Jobs", icon: Bookmark },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "interview", label: "Interview Prep", icon: MessageSquare },
    { id: "interview-details", label: "Interview Details", icon: FileText },
    { id: "career-roadmap", label: "Career Roadmap", icon: Map },
    { id: "resume", label: "Upload Resume", icon: Upload },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-item ${activeTab === id ? "active" : ""}`}
            onClick={() => onTabChange(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
