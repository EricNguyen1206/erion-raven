import { Request, Response } from "express";
import S3Service from "../services/s3.service";
import { v4 as uuidv4 } from "uuid";

class UploadController {
  constructor() {
    this.getPresignedUrl = this.getPresignedUrl.bind(this);
    this.configureCors = this.configureCors.bind(this);
  }

  public async configureCors(_req: Request, res: Response) {
    try {
      await S3Service.configureCors();
      return res.status(200).json({ message: "CORS configured successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to configure CORS" });
    }
  }

  public async getPresignedUrl(req: Request, res: Response) {
    try {
      const { filename, contentType, folder } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({ message: "Filename and content type are required" });
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
