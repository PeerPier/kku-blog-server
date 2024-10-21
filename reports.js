const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Report = require("../models/report");
const Post = require("../models/blog");
const Comment = require("../models/comment");
const Like = require("../models/like");

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy")
      .populate({
        path: "post",
        populate: {
          path: "author",
          model: "User",
        },
      });

    // console.log(JSON.stringify(reports, null, 2));

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add a new report
router.post("/add", async (req, res) => {
  const { postId, reason, reportedBy } = req.body;

  if (!postId || !reason) {
    return res
      .status(400)
      .json({ message: "Post ID and reason for the report are required." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const reportData = {
      post: postId,
      reason,
      verified: false,
      reportedBy: reportedBy || null,
    };

    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      message: "Report submitted successfully.",
      report,
    });
    return "Success";
  } catch (error) {
    console.error("Failed to report post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Verify a report
router.patch("/:id/verify", async (req, res) => {
  const { verified } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.verified = verified;
    report.status = verified ? "Verified" : report.status;
    await report.save();

    res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("Error updating report:", error);
    res
      .status(500)
      .json({ message: "Error updating report: " + error.message });
  }
});

// Delete post associated with a report and verify the report
router.delete("/:reportId/deletePost", async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required to delete." });
  }

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });

    await Post.deleteOne({ _id: post._id });

    report.verified = true;
    report.status = "Declined";
    await report.save();

    res.status(200).json({
      message: "Post deleted successfully and report marked as declined.",
    });
  } catch (error) {
    console.error("Error deleting post and updating report:", error);
    res
      .status(500)
      .json({ message: "Error processing request: " + error.message });
  }
});

module.exports = router;
