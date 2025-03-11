const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getLocationFromIp } = require("../utils/geoLocation");
const axios = require('axios');

// Reverse geocoding function
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    
    return {
      city: response.data.address.city || response.data.address.town || response.data.address.village || 'Unknown',
      country: response.data.address.country || 'Unknown',
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reverse geocoding endpoint
const handleReverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const locationData = await reverseGeocode(latitude, longitude);
    
    if (!locationData) {
      return res.status(400).json({ message: "Failed to get location data" });
    }
    
    res.json(locationData);
  } catch (error) {
    console.error('Error in reverse geocoding endpoint:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Record login activity with client IP and location
    const location = await getLocationFromIp(req.clientIp);
    user.activities.push({
      type: "login",
      ipAddress: req.clientIp,
      location
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Record logout activity with client IP and location
    const location = await getLocationFromIp(req.clientIp);
    req.user.activities.push({
      type: "logout",
      ipAddress: req.clientIp,
      location
    });
    await req.user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user activities (admin only)
const getUserActivities = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getUserActivities,
  handleReverseGeocode
};
