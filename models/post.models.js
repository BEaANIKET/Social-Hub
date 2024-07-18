import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  comments: [
    {
      text: String,
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
}, {timestamps: true});

export const Post = mongoose.model("Post", postSchema);
