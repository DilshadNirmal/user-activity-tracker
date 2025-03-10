const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getUserActivities,
} = require("../controllers/userController");
const { auth, adminAuth } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", auth, logout);

// Admin routes
router.get("/activities", adminAuth, getUserActivities);

module.exports = router;
