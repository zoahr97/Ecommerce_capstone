const express = require('express');

const productController = require(
  '../controllers/productController'
);

const {
  verifyToken,
  verifyAdmin
} = require(
  '../middlewares/authMiddleware'
);

const router = express.Router();

/* הצגת המוצרים זמינה לכולם */

router.get(
  '/',
  productController.getAllProducts
);

/* פעולות ניהול זמינות רק למנהל */

router.post(
  '/',
  verifyToken,
  verifyAdmin,
  productController.createProduct
);

router.put(
  '/:id',
  verifyToken,
  verifyAdmin,
  productController.updateProduct
);

router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  productController.deleteProduct
);

module.exports = router;