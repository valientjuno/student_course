require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongodb = require("../db/connect");
const SECRET_KEY = process.env.JWT_SECRET;

const home = (req, res) => {
  res.send("Welcome to the home page");
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = mongodb.getDb().db();
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, userType: user.userType },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// Protected
const protectedRoute = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: "Protected content", user: decoded });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register Client
const register = async (req, res) => {
  const { fullName, email, password, userType } = req.body;
  try {
    if (!fullName || !email || !password || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const db = mongodb.getDb().db();
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
    };
    const result = await db.collection("users").insertOne(newUser);
    if (!result.acknowledged) {
      throw new Error("Failed to create user");
    }
    const token = generateToken(newUser);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertedId,
        fullName: newUser.fullName,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// generateToken
const generateToken = (user) => {
  return jwt.sign(
    { fullName: user.fullName, userType: user.userType },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = {
  home,
  login,
  logout,
  protectedRoute,
  register,
  generateToken,
};
