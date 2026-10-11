const express = require('express');

const {
  verifyToken,
  verifyAdmin
} = require(
  '../middlewares/authMiddleware'
);

const {
  uploadProductImage:
    uploadMiddleware
} = require(
  '../middlewares/uploadMiddleware'
);

const {
  uploadProductImage
} = require(
  '../controllers/uploadController'
);

const router = express.Router();

/*
  מפעיל את multer ומחזיר שגיאת
  JSON אם הקובץ אינו תקין.
*/
const handleProductImageFile = (
  req,
  res,
  next
) => {
  uploadMiddleware.single('image')(
    req,
    res,
    (error) => {
      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      return next();
    }
  );
};

router.post(
  '/product-image',
  verifyToken,
  verifyAdmin,
  handleProductImageFile,
  uploadProductImage
);

module.exports = router;