import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return res.status(500).json({
        message: "Auth environment variables are missing",
      });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: "admin",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

router.get("/me", (req, res) => {
  return res.json({
    message: "Auth route working",
  });
});

export default router;