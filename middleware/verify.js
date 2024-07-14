import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verify = async (req, res, next) => {

  // console.log(req.cookies); // Useful for debugging
  const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyUser) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(verifyUser.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Authentication failed" });
  }
};
