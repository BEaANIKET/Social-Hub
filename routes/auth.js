import express from "express";
import { Router } from "express";
import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verify } from "../middleware/verify.js";

const router = Router();

router.get("/protected", verify, (req, res) => {
  res.send(req.body);
});
router.post("/signup", async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide name, email, and password" });
    }

    if (name === "" || email === "" || password === "") {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existUser = await User.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    const userSaved = await user.save();
    if (userSaved) {
      return res.status(200).json({ message: "User created" });
    }

    res.status(500).json({ error: "Failed to create user" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "31d" }
    );

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    res.cookie("token", token, {
      expires: thirtyDaysFromNow,
      httpOnly: true,
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    })

    res.status(200).json({
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        followers: user.followers,
        following: user.following,
        image: user?.image,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/logout", verify, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
      path: '/',
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to log out",
    });
  }
});

router.post("/getcurrentuser", async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decryptedData = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      user: {
        id: decryptedData.id,
        name: decryptedData.name,
        email: decryptedData.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export { router };
