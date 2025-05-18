import axios from "axios";
import dotenv from "dotenv";
import { json } from "express";
dotenv.config();

const OPENSHOT_API_URL =
  process.env.OPENSHOT_API_URL || "https://cloud.openshot.org";

class ProjectService {
  constructor() {
    this.baseURL = OPENSHOT_API_URL;
    this.auth = {
      username: process.env.OPENSHOT_USERNAME,
      password: process.env.OPENSHOT_PASSWORD,
    };
  }

  /**
   * Create a new project in OpenShot
   * @param {Object} projectData - Project creation parameters
   * @param {string} projectData.name - Name of the project
   * @param {string} [projectData.width=1920] - Width of the project (default: 1920)
   * @param {string} [projectData.height=1080] - Height of the project (default: 1080)
   * @param {number} [projectData.fps_num=30] - FPS numerator (default: 30)
   * @param {number} [projectData.fps_den=1] - FPS denominator (default: 1)
   * @param {string} [projectData.sample_rate=44100] - Audio sample rate (default: 44100)
   * @param {string} [projectData.channels=2] - Audio channels (default: 2)
   * @param {string} [projectData.channel_layout=3] - Audio channel layout (default: 3)
   * @returns {Promise<Object>} Created project data
   */
  async createProject(projectData) {
    try {
      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/`,
        auth: this.auth,
        data: {
          name: projectData.name,
          width: projectData.width || 1920,
          height: projectData.height || 1080,
          fps_num: projectData.fps_num || 30,
          fps_den: projectData.fps_den || 1,
          sample_rate: projectData.sample_rate || 44100,
          channels: projectData.channels || 2,
          channel_layout: projectData.channel_layout || 3,
          json: projectData.json || {},
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error creating OpenShot project:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Add a clip to an existing project
   * @param {string} projectId - ID of the project
   * @param {Object} clipData - Clip creation parameters
   * @param {string} clipData.file - URL or file ID of the media
   * @param {number} [clipData.position=0] - Position on the timeline
   * @param {number} [clipData.start=0] - Start time of clip
   * @param {number} [clipData.end=0] - End time of clip
   * @param {string} [clipData.layer=1] - Track/layer number
   * @param {string} [clipData.layer_name="Layer 1"] - Name of the layer
   * @param {Object} [clipData.json] - JSON data for the clip properties
   * @returns {Promise<Object>} Created clip data
   */
  async addClipToProject(projectId, clipData) {
    try {
      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/${projectId}/clips/`,
        auth: this.auth,
        data: {
          file: clipData.file,
          project: `${this.baseURL}/projects/${projectId}/`,
          position: clipData.position || 0,
          start: clipData.start || 0,
          end: clipData.end || 0,
          layer: clipData.layer || 1,
          json: clipData.json || {},
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error adding clip to project:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Export a project as a video
   * @param {string} projectId - ID of the project to export
   * @param {Object} exportData - Export parameters
   * @param {string} [exportData.export_type="video"] - Type of export (video, audio, image)
   * @param {string} [exportData.video_format="mp4"] - Video format (mp4, avi, etc.)
   * @param {string} [exportData.video_codec="libx264"] - Video codec
   * @param {string} [exportData.video_bitrate="8000000"] - Video bitrate
   * @param {string} [exportData.audio_codec="libmp3lame"] - Audio codec
   * @param {string} [exportData.audio_bitrate="192000"] - Audio bitrate
   * @param {number} [exportData.start_frame=1] - Starting frame
   * @param {number} [exportData.end_frame=null] - Ending frame (null for end of project)
   * @param {string} [exportData.quality="high"] - Export quality (low, medium, high)
   * @returns {Promise<Object>} Export status and details
   */
  async exportProject(projectId, exportData = {}) {
    try {
      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/${projectId}/exports/`,
        auth: this.auth,
        data: {
          export_type: exportData.export_type || "video",
          project: `${this.baseURL}/projects/${projectId}/`,
          video_format: exportData.video_format || "mp4",
          video_codec: exportData.video_codec || "libx264",
          video_bitrate: exportData.video_bitrate || "8000000",
          audio_codec: exportData.audio_codec || "libmp3lame",
          audio_bitrate: exportData.audio_bitrate || "192000",
          start_frame: exportData.start_frame || 1,
          json: {},

          // end_frame: exportData.end_frame ||  ,
          quality: exportData.quality || "high",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error exporting project:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Check the status of an export
   * @param {string} projectId - ID of the project
   * @param {string} exportId - ID of the export
   * @returns {Promise<Object>} Export status details
   */
  async getExportStatus(projectId, exportId) {
    try {
      const response = await axios({
        method: "get",
        url: `${this.baseURL}/projects/${projectId}/exports/${exportId}/`,
        auth: this.auth,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error checking export status:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Upload a file to OpenShot
   * @param {Object} fileData - File upload parameters
   * @param {string} fileData.project - Project ID
   * @param {string} fileData.media - File path or URL of the media
   * @param {string} [fileData.json] - JSON data for the file properties
   * @returns {Promise<Object>} Uploaded file data
   */
  async uploadFile(fileData) {
    try {
      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/${fileData.project}/files/`,
        auth: this.auth,
        data: {
          media: fileData.media,
          project: fileData.project,
          json: fileData.json || {},
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading file to OpenShot:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Convert presigned URL to binary and upload to OpenShot
   * @param {string} projectId - ID of the project
   * @param {string} presignedUrl - Presigned URL of the image
   * @returns {Promise<Object>} Uploaded file data from OpenShot
   */
  async uploadFileFromPresignedUrl(projectId, presignedUrl) {
    try {
      // First download the image from presigned URL
      const imageResponse = await fetch(presignedUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image from presigned URL");
      }

      // Get the binary data from the response
      const imageBuffer = await imageResponse.arrayBuffer();

      // Create form data with the binary file
      const formData = new FormData();
      formData.append("media", new Blob([imageBuffer], { type: "image/png" }));
      formData.append("project", `${this.baseURL}/projects/${projectId}/`);
      formData.append("json", "{}");

      // Upload to OpenShot
      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/${projectId}/files/`,
        auth: this.auth,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading file to OpenShot:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Upload a file to OpenShot by providing a URL for server-side download
   * @param {string} projectId - ID of the project
   * @param {string} fileUrl - URL of the file to be downloaded by the server
   * @param {string} [extension='.mp4'] - File extension for the random filename
   * @returns {Promise<Object>} Upload response from OpenShot
   */
  async uploadFileByUrl(projectId, fileUrl, extension = ".mp4") {
    try {
      // Generate random filename with timestamp and random number
      const randomName = `file_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}${extension}`;

      const response = await axios({
        method: "post",
        url: `${this.baseURL}/projects/${projectId}/files/`,
        auth: this.auth,
        data: {
          media: null,
          project: `${this.baseURL}/projects/${projectId}/`,
          json: {
            name: randomName,
            url: fileUrl,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading file by URL to OpenShot:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Download an exported video by its export ID
   * @param {string} exportId - ID of the export to download
   * @returns {Promise<Object>} Response with the video download data
   */
  async downloadExport(exportId) {
    try {
      const response = await axios({
        method: "get",
        url: `${this.baseURL}/exports/${exportId}/download/`,
        auth: this.auth,
        responseType: "stream",
      });

      return response;
    } catch (error) {
      console.error(
        "Error downloading export:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default new ProjectService();
