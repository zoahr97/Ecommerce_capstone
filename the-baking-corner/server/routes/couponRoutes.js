const express = require('express');
const router = express.Router();

const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCouponStatus
} = require(
  '../controllers/couponController'
);

const {
  verifyToken,
  verifyAdmin
} = require(
  '../middlewares/authMiddleware'
);

router.post(
  '/validate',
  verifyToken,
  validateCoupon
);

router.get(
  '/',
  verifyToken,
  verifyAdmin,
  getAllCoupons
);

router.post(
  '/',
  verifyToken,
  verifyAdmin,
  createCoupon
);

router.patch(
  '/:id/status',
  verifyToken,
  verifyAdmin,
  updateCouponStatus
);

module.exports = router;