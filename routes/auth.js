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
      return res.status(404).json({ error: "User not found" });
    }

    console.log(user);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "31d",
    });

    console.log(token);
    const options = {
      sameSite: "None",
      secure: true,
      httpOnly: true,
      // partitioned: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    res
      .status(200)
      .cookie("token", token, options)
      .cookie(
        "user",
        {
          id: user._id,
          name: user.name,
          email: user.email,
          followers: user.followers,
          following: user.following,
        },
        options
      )
      .json({
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          followers: user.followers,
          following: user.following,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", verify, async (req, res) => {
  const options = {
    httpOnly: false,
    sameSite: "Lax",
  };

  try {
    res.clearCookie("token", options).clearCookie("user", options);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to log out",
    });
  }
});

export { router };
