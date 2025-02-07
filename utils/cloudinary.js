const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload img
const cloudinaryUploadImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return data;
  } catch (err) {
    return err;
  }
};

// Delete img
const cloudinaryDeleteImg = async (imgId) => {
  try {
    const result = await cloudinary.uploader.destroy(imgId, {
      resource_type: "auto",
    });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports = {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
};
