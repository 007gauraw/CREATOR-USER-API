import express from "express";
const router = express.Router();
import projectService from "../openshot_services/project-services.js";

// Route for creating and processing video from images
router.post("/process", async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or empty image URLs array" });
    }

    // Step 1: Create a new project
    const project = await projectService.createProject({
      name: `Video_${Date.now()}`,
      width: 1920,
      height: 1080,
    });

    // const project = { id: "3981" };
    // Step 2: Upload files to OpenShot with binary data
    const uploadPromises = imageUrls.map((url) => {
      const presignedUrl = url.presignedUrl || url;
      return projectService.uploadFileByUrl(project.id, presignedUrl, ".png");
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    //Step 3: Add clips for each uploaded file
    const clipPromises = uploadedFiles.map((file, index) => {
      return projectService.addClipToProject(project.id, {
        file: file.url, // Use the file ID returned from OpenShot
        position: parseFloat(index), // Each clip starts 5 seconds after the previous
        start: parseFloat(0),
        end: parseFloat(5), // Each clip is 5 seconds long
        layer: 1,
      });
    });

    const clipUploadResp = await Promise.all(clipPromises);

    // Step 4: Export the project as video
    const exportResult = await projectService.exportProject(project.id, {
      video_format: "mp4",
      quality: "high",
      video_codec: "libx264",
      video_bitrate: "8000000",
      audio_codec: "libmp3lame",
      audio_bitrate: "192000",
    });

    // Return the export details
    res.json({
      projectId: project.id,
      exportId: exportResult.id,
      status: exportResult.status,
      message: "Video processing started successfully",
    });
  } catch (error) {
    console.error("Error in video processing:", error);
    res.status(500).json({
      error: "Error processing video",
      details: error.message,
    });
  }
});

// Route to check export status
router.get("/status/:projectId/:exportId", async (req, res) => {
  try {
    const { projectId, exportId } = req.params;
    const status = await projectService.getExportStatus(projectId, exportId);
    res.json(status);
  } catch (error) {
    console.error("Error checking export status:", error);
    res.status(500).json({
      error: "Error checking export status",
      details: error.message,
    });
  }
});

// Route to download exported video
router.get("/download/:exportId", async (req, res) => {
  try {
    const { exportId } = req.params;
    const response = await projectService.downloadExport(exportId);

    // Set the appropriate headers from the OpenShot response
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Content-Length", response.headers["content-length"]);
    res.setHeader(
      "Content-Disposition",
      response.headers["content-disposition"]
    );

    // Pipe the video stream to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({
      error: "Error downloading video",
      details: error.message,
    });
  }
});

export default router;
