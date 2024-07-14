import { Router } from "express";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { verify } from "../middleware/verify.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { io } from "../Socket/socket.js";

const userRoute = Router();
userRoute.get("/userprofile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    const userPosts = await Post.find({ postedBy: user._id });

    if (!userPosts) {
      res.status(404).json({ error: "Posts not found" });
    }
    res.status(200).json({
      user: user,
      userPosts: userPosts,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

userRoute.put("/follow", verify, async (req, res) => {
  const currUserId = req.user._id;
  const { followId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      currUserId,
      {
        $push: {
          following: followId,
        },
      },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    const followedUser = await User.findByIdAndUpdate(
      followId,
      {
        $push: {
          followers: currUserId,
        },
      },
      { new: true }
    );

    if (!followedUser) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: user,
      followedUser: followedUser,
      m: "follow succesfully ",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
userRoute.put("/unfollow", verify, async (req, res) => {
  // console.log("ashfkaf");

  const currUserId = req.user._id;
  const { followId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      currUserId,
      {
        $pull: {
          following: followId,
        },
      },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    const followedUser = await User.findByIdAndUpdate(
      followId,
      {
        $pull: {
          followers: currUserId,
        },
      },
      { new: true }
    );

    if (!followedUser) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: user,
      followedUser: followedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

userRoute.put("/updateprofile", verify, async (req, res) => {
  try {
    // Update user profile in the database
    // console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: req.body.name,
          bio: req.body.bio,
          image: req.body.image,
          link: req.body.link,
        },
      },
      { new: true }
    );

    // Handle case where user is not found
    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // If update is successful, respond with updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle any errors that occur during the update process
    // console.error("Error updating profile:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

let generatedOtp = {
  otp: "",
  expired: 0,
};

userRoute.post("/otpgenerate", async (req, res) => {

  const email = req.body.email
  const user = await User.findOne({email});
  if(!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }
  console.log(user);

  var generateOTP = function () {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 8; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };

  const otp = generateOTP();
  generatedOtp = {
    otp: otp,
    expired: Date.now() + 3600000,
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "socialhubofficial379@gmail.com",
      pass: "lupo lwwv deip kstk",
    },
  });

  const recevier = {
    from: "aniketchaturvedi309@gmail.com",
    to: req.body.email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please use the following code to reset your password: . This code will expire in 1 hour.`,
    html: `<p>You requested a password reset. Please use the following code to reset your password:</p>
           <div style="text-align: center;">
             <h1>${otp}</h1>
           </div>
           <p>This code will expire in 1 hour.</p>`,
  };
  transporter.sendMail(recevier, (error, emailRensponse) => {
    if (error) {
      console.log(error.message);
      res.status(404).json({
        error: error.message,
      })
      return
    }
    res.status(200).json({
      otp: otp,
      generatedOtp,
    });
  });
});

userRoute.post("/resetpassword", verify, async (req, res) => {
  const { otp, password } = req.body;
  const email = req.user.email;
  try {
    if (generatedOtp.expired <= Date.now()) {
      return res.status(400).json({
        error: "OTP expired",
      });
    }
    if (otp === generatedOtp.otp) {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(404).json({
          error: "Password is same as old password",
        });
      }
    

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({
        message: "Password updated successfully",
      });
    } else {
      res.status(404).json({
        error: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
    });
  }
});


export { userRoute };
