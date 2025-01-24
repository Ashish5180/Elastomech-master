import express from "express";

// Predefined users with username, password, and role
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "worker", password: "worker123", role: "worker" },
];

// Function to generate random token
const generateToken = () => {
  return Math.random().toString(36).substring(2); // Generates a random token
};

// Create the router
const router = express.Router();

// POST route for user login
router.post("/signin", (req, res) => {
  const { username, password, role } = req.body;

  // Find the user based on username, password, and role
  const user = users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (user) {
    const token = generateToken(); // Generate token if user is found
    res.status(200).json({
      message: "Login successful",
      token: token, // Send the token to the client
      user: user,   // Send user details
    });
  } else {
    res.status(401).json({ message: "Invalid credentials or role" });
  }
});

export default router;
