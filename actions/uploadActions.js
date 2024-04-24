"use server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
async function uploadPhotosToCloudinary(newFiles) {
  const multiplePhotosPromise = newFiles.map((file) =>
    cloudinary.v2.uploader.upload(file.filepath, { folder: "nextjs_upload" })
  );
  return await Promise.all(multiplePhotosPromise);
}
async function savePhotoSToLocal(formData) {
  const files = formData.getAll("files");
  const multipleBuffersPromise = files.map((file) =>
    file.arrayBuffer().then((data) => {
      const name = uuidv4();
      const buffer = Buffer.from(data);
      const ext = file.type.split("/")[1];
      //   const uploadDir = path.join(
      //     process.cwd(),
      //     "public",
      //     `/${name}_${ext}`
      //   );
      //  fs.writeFile(uploadDir, buffer);
      // this is not work vercel
      const tempdir = os.tmpdir();
      const uploadDir = path.join(tempdir, `/${name}.${ext}`);
      fs.writeFile(uploadDir, buffer);
      return { filepath: uploadDir, filename: name };
      // this work in vercel
    })
  );
  return await Promise.all(multipleBuffersPromise);
}
export async function uploadPhoto(formData) {
  try {
    const newFiles = await savePhotoSToLocal(formData);
    // upload photos to cloud
    const photos = await uploadPhotosToCloudinary(newFiles);
    //Delete photos file in temp
    newFiles.map((file) => fs.unlink(file.filepath));
    //secure_url;

    return {
      message: "Upload Success!",
      data: photos.map((photo) => photo?.secure_url),
    };
  } catch (error) {
    return { error: error.message };
  }
}
