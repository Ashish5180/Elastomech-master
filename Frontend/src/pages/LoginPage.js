import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion } from "framer-motion"; // Import Framer Motion
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
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, { expires: 7, path: "/" });
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
        navigate(data.user.role === "admin" ? "/admin" : "/worker");
      } else {
        setError(data.message || "Invalid credentials or role");
      }
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login
        </h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-red-500 text-sm text-center mb-4"
          >
            {error}
          </motion.p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="form-group">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="form-group">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Role:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold text-lg shadow-md hover:bg-purple-600 transition duration-300"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
