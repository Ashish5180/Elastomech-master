import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Protected Route Component (Only checking for the token)
const ProtectedRoute = ({ children }) => {
  // Get the token from cookies
  const token = Cookies.get("token");

  // If there's no token, redirect to login
  if (!token) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
