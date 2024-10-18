const mongoose = require("mongoose");

require("./user");
require("./comment");
require("./like");
require("./save");

// กำหนดโครงสร้างข้อมูลสำหรับโพสต์บล็อก
const postSchema = new mongoose.Schema(
  {
    blog_id: {
      type: String,
      // required: true,
      unique: true,
    },
    topic: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: false,
    },
    category: {
      type: [String],
      required: true,
    },
    banner: {
      type: String,
    },
    des: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: [],
    },
    tags: {
      type: [String],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    draft: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavedPost",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
