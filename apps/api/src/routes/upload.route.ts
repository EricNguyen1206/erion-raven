import { Router } from "express";
import UploadController from "../controllers/upload.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/presigned-url", authenticateToken, UploadController.getPresignedUrl);


export default router;
