const couponModel =
  require('../models/couponModel');

const validateCoupon = async (req, res) => {
  const code =
    typeof req.body.code === 'string'
      ? req.body.code.trim().toUpperCase()
      : '';

  const totalAmount = Number(req.body.totalAmount);

  if (!code) {
    return res.status(400).json({
      error: 'Coupon code is required'
    });
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({
      error: 'Invalid order total'
    });
  }

  try {
    const coupon =
      await couponModel.findActiveCouponByCode(code);

    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon was not found'
      });
    }

    if (!coupon.is_active) {
      return res.status(400).json({
        error: 'This coupon is inactive'
      });
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at) < new Date()
    ) {
      return res.status(400).json({
        error: 'This coupon has expired'
      });
    }

    if (
      coupon.max_uses !== null &&
      Number(coupon.used_count) >=
        Number(coupon.max_uses)
    ) {
      return res.status(400).json({
        error: 'This coupon has reached its usage limit'
      });
    }

    const minimumOrderAmount =
      Number(coupon.minimum_order_amount);

    if (totalAmount < minimumOrderAmount) {
      return res.status(400).json({
        error: `This coupon requires an order of at least ₪${minimumOrderAmount.toFixed(2)}`
      });
    }

    const discountAmount =
      coupon.discount_type === 'percentage'
        ? (totalAmount * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);

    const safeDiscountAmount = Math.min(
      discountAmount,
      totalAmount
    );

    return res.json({
      message: 'Coupon applied successfully',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue:
          Number(coupon.discount_value)
      },
      discountAmount: safeDiscountAmount,
      finalTotal:
        totalAmount - safeDiscountAmount
    });
  } catch (error) {
    console.error(
      'Error validating coupon:',
      error
    );

    return res.status(500).json({
      error: 'Failed to validate coupon'
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons =
      await couponModel.getAllCoupons();

    return res.json(coupons);
  } catch (error) {
    console.error(
      'Error fetching coupons:',
      error
    );

    return res.status(500).json({
      error: 'Failed to fetch coupons'
    });
  }
};

const createCoupon = async (req, res) => {
  const code =
    typeof req.body.code === 'string'
      ? req.body.code.trim().toUpperCase()
      : '';

  const discountType =
    req.body.discountType;

  const discountValue =
    Number(req.body.discountValue);

  const minimumOrderAmount =
    Number(req.body.minimumOrderAmount || 0);

  const expiresAt =
    req.body.expiresAt || null;

  const maxUses =
    req.body.maxUses === '' ||
    req.body.maxUses === null ||
    req.body.maxUses === undefined
      ? null
      : Number(req.body.maxUses);

  if (!code) {
    return res.status(400).json({
      error: 'Coupon code is required'
    });
  }

  if (
    !['percentage', 'fixed'].includes(
      discountType
    )
  ) {
    return res.status(400).json({
      error: 'Invalid discount type'
    });
  }

  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    return res.status(400).json({
      error: 'Discount value must be positive'
    });
  }

  if (
    discountType === 'percentage' &&
    discountValue > 100
  ) {
    return res.status(400).json({
      error:
        'Percentage discount cannot exceed 100'
    });
  }

  if (
    !Number.isFinite(minimumOrderAmount) ||
    minimumOrderAmount < 0
  ) {
    return res.status(400).json({
      error:
        'Minimum order amount is invalid'
    });
  }

  if (
    maxUses !== null &&
    (
      !Number.isInteger(maxUses) ||
      maxUses <= 0
    )
  ) {
    return res.status(400).json({
      error:
        'Maximum uses must be a positive whole number'
    });
  }

  if (
    expiresAt &&
    Number.isNaN(
      new Date(expiresAt).getTime()
    )
  ) {
    return res.status(400).json({
      error: 'Invalid expiration date'
    });
  }

  try {
    const couponId =
      await couponModel.createCoupon({
        code,
        discountType,
        discountValue,
        minimumOrderAmount,
        expiresAt,
        maxUses
      });

    req.app.get('io')?.emit(
      'coupons:changed'
    );

    return res.status(201).json({
      message:
        'Coupon created successfully',
      id: couponId
    });
  } catch (error) {
    console.error(
      'Error creating coupon:',
      error
    );

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error:
          'A coupon with this code already exists'
      });
    }

    return res.status(500).json({
      error: 'Failed to create coupon'
    });
  }
};

const updateCouponStatus = async (
  req,
  res
) => {
  const couponId = Number(req.params.id);
  const isActive = req.body.isActive;

  if (
    !Number.isInteger(couponId) ||
    couponId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid coupon ID'
    });
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      error: 'isActive must be true or false'
    });
  }

  try {
    const affectedRows =
      await couponModel.updateCouponStatus(
        couponId,
        isActive
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        error: 'Coupon not found'
      });
    }

    req.app.get('io')?.emit(
      'coupons:changed'
    );

    return res.json({
      message: isActive
        ? 'Coupon activated successfully'
        : 'Coupon deactivated successfully'
    });
  } catch (error) {
    console.error(
      'Error updating coupon status:',
      error
    );

    return res.status(500).json({
      error:
        'Failed to update coupon status'
    });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCouponStatus
};