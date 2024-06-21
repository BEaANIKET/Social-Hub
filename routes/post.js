import { Router, json } from "express";
import { Post } from "../models/post.models.js";
import { verify } from "../middleware/verify.js";
import { populate } from "dotenv";
import { User } from "../models/user.models.js";

const postRouter = new Router();

postRouter.get("/allpost", async (req, res) => {
  try {
    const post = await Post.find().populate("postedBy", "name _id").populate("comments.postedBy", "name _id");
    res.status(200).json({
      message: "All posts",
      post,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});
postRouter.post("/createpost", verify, async (req, res) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body || !url) {
      res.status(422).json({
        error: "Please provide All the feild",
      });
      return;
    }

    const post = new Post({
      title,
      body,
      image: url,
      postedBy: req.user,
    });
    await post.save();

    // res.send("ok")
    res.status(200).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

postRouter.get("/mypost", verify, async (req, res) => {
  try {
    const userpost = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "_id name"
    );

    res.status(200);
    res.json({
      message: "My posts",
      userpost,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

postRouter.put("/like", verify, async (req, res) => {
  //   console.log(req.body);

  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    //   console.log(post);

    const updatedData = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: req.user._id,
        },
      },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ error: "Error updating post" });
    }

    //   console.log("Updated Data ->>", updatedData);

    res.status(200).json({
      message: "Post liked successfully",
      updatedData,
    });
  } catch (error) {
    console.log("Error liking post: ", error);
    res.status(500).json({ error: error.message });
  }
});
postRouter.put("/unlike", verify, async (req, res) => {
  // console.log(req.body);

  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedData = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: req.user._id,
        },
      },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ error: "Error updating post" });
    }

    // console.log("updated User ", updatedData);/

    res.status(200).json({
      message: "Post liked successfully",
      updatedData,
    });
  } catch (error) {
    console.log("Error liking post: ", error);
    res.status(500).json({ error: error.message });
  }
});
postRouter.put("/comment", verify, async (req, res) => {
  // console.log(req.body);

  try {
    const comment = {
      text: req.body.text,
      postedBy: req.user._id,
    }
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedData = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: comment,
        },
      },
      { new: true }
    ).populate('comments.postedBy', ' _id name')

    if (!updatedData) {
      return res.status(404).json({ error: "Error updating post" });
    }

    console.log("updated User ", updatedData);

    res.status(200).json({
      message: "Post commented successfully",
      updatedData,
    });
  } catch (error) {
    console.log("Error commented post: ", error);
    res.status(500).json({ error: error.message });
  }
});

postRouter.delete('/deletepost/:postId', verify, async (req, res) => {
  const postId = req.params.postId;
  console.log(postId);
  try {
    const postData = await Post.findById(postId).populate('postedBy', '_id');

    if (!postData) {
      return res.status(404).json({ error: "Post not found" });
    }
    console.log("postDAta ", postData);
    console.log("req.user ", req.user);

    if (postData.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const deletedPost = await Post.deleteOne({ _id: postId });
    console.log("deletedPost ", deletedPost);
    if (deletedPost) {
      return res.status(200).json({ message: "Post deleted successfully" });
    } else {
      return res.status(422).json({ error: "Post deletion failed" });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


postRouter.get('/getsubpost', verify, async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: { $in: req.user.following } })
      .populate("postedBy", "_id name")
      .populate("comments.postedBy", "_id name")
      .exec();

    if(!posts){
      res.status(404)
      .json({
        error: "Post not found",
      })
    }

    res
    .status(200)
    .json({ posts });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
})


export { postRouter };
