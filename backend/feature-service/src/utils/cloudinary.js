import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      throw new Error("Missing Cloudinary credentials in environment variables");
    }
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    await fs.promises.unlink(localFilePath).catch(() => {});
    return uploadResult;
  } catch (error) {
    if (localFilePath) {
      await fs.promises.unlink(localFilePath).catch(() => {});
    }
    throw new Error(`Cloudinary upload failed: ${error?.message || "Unknown error"}`);
  }
};

export { uploadOnCloudinary };