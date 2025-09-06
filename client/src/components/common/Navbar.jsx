import React from "react";
import { Search, User, Bell, Settings } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export const Navbar = ({ onSearch }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Clear auth store
      logout();

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");

      // Dispatch auth change event
      window.dispatchEvent(new Event("authStatusChanged"));

      // Navigate to login
      navigate("/login");
    } catch (error) {
      // Force navigation even if there's an error
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Real Job Hunter</h1>
      </div>

      <div className="navbar-search">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search jobs, companies..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="navbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <div className="user-menu">
          <button className="user-btn">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" />
            ) : (
              <User size={20} />
            )}
            <span>{user?.name}</span>
          </button>

          <div className="dropdown">
            <button className="dropdown-item">
              <Settings size={16} />
              Settings
            </button>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
