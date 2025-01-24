import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker"); // Default role
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }), // Include selected role
      });

      const data = await response.json();

      if (response.ok) {
        // Use js-cookie to set the token (valid for 7 days)
        Cookies.set("token", data.token, { expires: 7, path: "/" });

        // Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Call onLogin passed from the parent component
        onLogin(data.user);

        // Redirect based on user role
        navigate(data.user.role === "admin" ? "/admin" : "/worker");
      } else {
        setError(data.message || "Invalid credentials or role");
      }
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
