import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import logger from "../../services/template/loggerServices.js";
dotenv.config();

process.env.AWS_SDK_LOAD_CONFIG = "1"; // Ensures AWS SDK respects ~/.aws/config
process.env.AWS_SDK_LOG_LEVEL = "debug";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (file) => {
  try {
    const timestamp = Date.now();
    const lastFileNamePart = file.originalname;

    const uploadParams = {
      Bucket: "xacco",
      Key: `${timestamp}_${encodeURIComponent(lastFileNamePart)}`,
      Body: file.buffer,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);

    if (data) {
      const s3ObjectUrl = `https://xacco.s3.ap-south-1.amazonaws.com/${timestamp}_${encodeURIComponent(lastFileNamePart)}`;
      return s3ObjectUrl;
    }
  } catch (err) {
    logger.error(err);
    console.error("Error uploading file:", err);
    throw err;
  }
};
