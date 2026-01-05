import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    const region = process.env['AWS_REGION'];
    const accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
    const s3Url = process.env['S3_URL'];

    this.bucket = process.env['S3_BUCKET_NAME'] || '';

    if (!region || !accessKeyId || !secretAccessKey || !this.bucket) {
      console.warn("Missing AWS S3 configuration. Uploads may fail.");
    }

    const clientConfig: any = {
      region: region || 'auto',
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      forcePathStyle: !!s3Url,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    };

    if (s3Url) {
      clientConfig.endpoint = s3Url;
    }

    this.s3Client = new S3Client(clientConfig);
  }

  /**
   * Generates a presigned URL for uploading a file
   * @param key The key (path) where the file will be stored
   * @param contentType The MIME type of the file
   * @param expiresIn Expiration time in seconds (default 3600)
   */
  async getPresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // ACL: 'public-read', // Ensure the file is public if needed, or manage via bucket policy
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      // key might start with / but we want clean urls.
      // If s3Url is defined, we construct based on that, otherwise standard aws.
      // For simplicity/universality, we return the URL that can be used to accessing the object after upload.
      // If using CloudFront or custom domain, this logic might need adjustment.
      // Assuming standard S3 or compatible public access:

      let publicUrl = '';
      if (process.env['S3_PUBLIC_URL']) {
        // Use exact public URL from env (user concatenation request)
        const prefix = process.env['S3_PUBLIC_URL'].replace(/\/$/, '');
        const cleanKey = key.replace(/^\//, '');
        publicUrl = `${prefix}/${cleanKey}`;
      } else if (process.env['S3_PUBLIC_URL_PREFIX']) {
        // Legacy/Alternative config support
        const prefix = process.env['S3_PUBLIC_URL_PREFIX'].replace(/\/$/, '');
        const cleanKey = key.replace(/^\//, '');
        publicUrl = `${prefix}/${cleanKey}`;
      } else if (process.env['S3_URL']) {
        // Custom endpoint fallback (e.g. MinIO)
        // Note: For R2, S3_PUBLIC_URL_PREFIX is required as the API endpoint is not public
        const endpoint = process.env['S3_URL'].replace(/\/$/, '');
        const cleanKey = key.replace(/^\//, '');
        publicUrl = `${endpoint}/${this.bucket}/${cleanKey}`;
      } else {
        // Standard AWS S3
        publicUrl = `https://${this.bucket}.s3.${process.env['AWS_REGION']}.amazonaws.com/${key}`;
      }

      return { uploadUrl, key, publicUrl };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Error deleting file ${key}:`, error);
      // We might not want to throw here to avoid blocking other operations
    }
  }


}

export default new S3Service();
