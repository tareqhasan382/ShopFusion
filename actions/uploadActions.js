"use server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import os from "os";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const MAX_FILES = 3;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const uploadPhotosToCloudinary = async (files) => {
  const uploads = files.map((file) =>
    cloudinary.v2.uploader.upload(file.filepath, {
      folder: "shopfusion_products",
    })
  );
  return Promise.all(uploads);
};

const savePhotosToTemp = async (formData) => {
  const files = formData.getAll("files");

  if (files.length === 0 || files.length > MAX_FILES) {
    throw new Error(`Please select between 1 and ${MAX_FILES} images.`);
  }

  const savedFiles = await Promise.all(
    files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed.");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Each image must be smaller than 1MB.");
      }

      const name = randomUUID();
      const ext = file.type.split("/")[1] || "jpg";
      const tempDir = os.tmpdir();
      const filepath = path.join(tempDir, `${name}.${ext}`);
      await fs.writeFile(filepath, Buffer.from(await file.arrayBuffer()));
      return { filepath };
    })
  );

  return savedFiles;
};

export async function uploadPhoto(formData) {
  let savedFiles = [];
  try {
    savedFiles = await savePhotosToTemp(formData);
    const photos = await uploadPhotosToCloudinary(savedFiles);
    return {
      message: "Upload successful!",
      data: photos.map((photo) => photo?.secure_url),
    };
  } catch (error) {
    return { error: error.message };
  } finally {
    // Best-effort cleanup of temporary files.
    await Promise.allSettled(
      savedFiles.map((file) => fs.unlink(file.filepath))
    );
  }
}
