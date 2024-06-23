import { Router } from "express";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { verify } from "../middleware/verify.js";

const userRoute = Router();
userRoute.get("/userprofile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    if (!user) {
        res.status(404)
        .json({ error: "User not found" })
    }

    const userPosts = await Post.find({ postedBy: user._id })

    if(!userPosts){
        res.status(404)
        .json({ error: "Posts not found" })
    }
    res.status(200).json({
      user: user,
      userPosts: userPosts,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal Server Error" })
  }
})

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
      m : "follow succesfully "
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
})
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
})

userRoute.put('/updateprofile', verify, async (req, res) => {
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
          link: req.body.link
        }
      },
      { new: true }
    );

    // Handle case where user is not found
    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // If update is successful, respond with updated user data
    res.status(200).json(updatedUser);

  } catch (error) {
    // Handle any errors that occur during the update process
    // console.error("Error updating profile:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});


export { userRoute };
