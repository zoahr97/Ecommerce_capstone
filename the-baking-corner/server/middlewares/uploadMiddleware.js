const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(
      null,
      path.join(
        __dirname,
        '..',
        'uploads',
        'products'
      )
    );
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    callback(
      null,
      `${uniqueName}${extension}`
    );
  }
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        'Only JPG, PNG and WebP images are allowed'
      ),
      false
    );
  }
};

const uploadProductImage = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter
});

module.exports = {
  uploadProductImage
};