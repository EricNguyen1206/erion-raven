import { Request, Response } from "express";
import S3Service from "../services/s3.service";
import { v4 as uuidv4 } from "uuid";

class UploadController {
  constructor() {
    this.getPresignedUrl = this.getPresignedUrl.bind(this);
  }

  public async getPresignedUrl(req: Request, res: Response) {
    try {
      const { filename, contentType, folder } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({ message: "Filename and content type are required" });
      }

      // Allowed content types
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "video/mp4",
        "video/webm"
      ];

      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type" });
      }

      const fileExtension = filename.split('.').pop();
      const safeFilename = `${uuidv4()}.${fileExtension}`;
      // Clean folder path: default to 'uploads', remove leading/trailing slashes
      const cleanFolder = (folder || 'uploads').replace(/^\/+|\/+$/g, '');
      const key = `${cleanFolder}/${safeFilename}`;

      const { uploadUrl, publicUrl } = await S3Service.getPresignedUrl(key, contentType);

      return res.status(200).json({
        uploadUrl,
        publicUrl,
        key
      });
    } catch (error) {
      console.error("Upload controller error:", error);
      return res.status(500).json({ message: "Internal server error during upload preparation" });
    }
  }
}

export default new UploadController();
