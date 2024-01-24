const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images',
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    allowed_formats: ["jpg", "png"],
    unique_filename: true
  }
});
export const parser = multer({ storage: storage });