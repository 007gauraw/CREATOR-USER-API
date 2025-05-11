import express from "express";
const router = express.Router();

// Define a route for video processing
router.get("/process", (req, res) => {
  res.send("Video processing route");
});

export default router;
