import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css'; // Ensure your CSS file is linked

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    // Remove the 'token' cookie
    Cookies.remove('token');
    localStorage.removeItem("user");
    // Navigate to the home page
    navigate('/');

    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        {/* Company Logo and Name */}
        <img
          src="https://elastomech.in/img/elstomatch%20logo.png"
          alt="Elastomech Logo"
          className="logo"
        />
        <span className="company-name">Elastomech</span>
      </div>
      <div className="navbar-actions">
        {/* Display username if logged in */}
        {user ? (
          <>
            <span className="username">Welcome, {user.username}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
