const pool = require('../config/db');

const findActiveCouponByCode = async (code) => {
  const [rows] = await pool.query(
    `SELECT
      id,
      code,
      discount_type,
      discount_value,
      minimum_order_amount,
      expires_at,
      max_uses,
      used_count,
      is_active
     FROM coupons
     WHERE UPPER(code) = UPPER(?)
     LIMIT 1`,
    [code]
  );

  return rows[0] || null;
};

const getAllCoupons = async () => {
  const [rows] = await pool.query(
    `SELECT
      id,
      code,
      discount_type,
      discount_value,
      minimum_order_amount,
      expires_at,
      max_uses,
      used_count,
      is_active,
      created_at
     FROM coupons
     ORDER BY created_at DESC`
  );

  return rows;
};

const createCoupon = async ({
  code,
  discountType,
  discountValue,
  minimumOrderAmount,
  expiresAt,
  maxUses
}) => {
  const [result] = await pool.query(
    `INSERT INTO coupons (
      code,
      discount_type,
      discount_value,
      minimum_order_amount,
      expires_at,
      max_uses
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      expiresAt,
      maxUses
    ]
  );

  return result.insertId;
};

const updateCouponStatus = async (
  couponId,
  isActive
) => {
  const [result] = await pool.query(
    `UPDATE coupons
     SET is_active = ?
     WHERE id = ?`,
    [isActive, couponId]
  );

  return result.affectedRows;
};

module.exports = {
  findActiveCouponByCode,
  getAllCoupons,
  createCoupon,
  updateCouponStatus
};