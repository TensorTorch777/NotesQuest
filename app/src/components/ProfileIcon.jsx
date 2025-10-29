import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import backendAPI from '../services/backendApi';

export default function ProfileIcon() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await backendAPI.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    
    fetchUser();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase() || 'U';
    const lastInitial = lastName.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial || 'U';
  };

  // Get random background color for initials
  const getBgColor = () => {
    if (!user) return 'bg-gradient-to-br from-purple-500 to-purple-700';
    const colors = [
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-red-500 to-red-700',
      'bg-gradient-to-br from-yellow-500 to-yellow-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
    ];
    // Use user email or ID to consistently get same color
    const userString = user.email || user._id || user.id || '';
    const colorIndex = userString.length > 0 ? userString.charCodeAt(0) % colors.length : 0;
    return colors[colorIndex];
  };

  const handleLogout = async () => {
    try {
      await backendAPI.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete your account and all your data. Are you absolutely sure?')) {
      return;
    }

    try {
      await backendAPI.deleteProfile();
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error('Delete profile error:', error);
      alert('Failed to delete profile. Please try again.');
    }
  };

  if (!user) {
    return null; // Don't show anything if user is not loaded
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ${getBgColor()} hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50`}
        type="button"
      >
        {getInitials()}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/10"
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </span>
          </button>
          <button
            onClick={handleDeleteProfile}
            className="w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/20 transition-colors"
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">delete</span>
              Delete Profile
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

