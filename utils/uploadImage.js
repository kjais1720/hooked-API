import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (image,folder) => {
  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    folder: `social-media/${folder}`,
  });
  return result.secure_url;
};
