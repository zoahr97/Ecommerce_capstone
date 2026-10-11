const pool = require('../config/db');

const createHttpError = (
  message,
  statusCode
) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const getOrdersByUserId = async (
  userId
) => {
  const [orders] = await pool.query(
    `SELECT
      id,
      total_amount,
      status,
      order_date,
      shipping_city,
      shipping_address,
      payment_method
     FROM orders
     WHERE user_id = ?
     ORDER BY order_date DESC`,
    [userId]
  );

  return orders;
};

const getOrderItemsForUser = async (
  orderId,
  userId
) => {
  const [items] = await pool.query(
    `SELECT
      oi.id,
      p.name AS product_name,
      oi.quantity,
      oi.price_at_purchase,
      (
        oi.quantity *
        oi.price_at_purchase
      ) AS item_total
     FROM orders o
     JOIN order_items oi
       ON oi.order_id = o.id
     JOIN products p
       ON p.id = oi.product_id
     WHERE o.id = ?
       AND o.user_id = ?`,
    [orderId, userId]
  );

  return items;
};

const cancelOrderForUser = async (
  orderId,
  userId
) => {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] =
      await connection.query(
        `SELECT status
         FROM orders
         WHERE id = ?
           AND user_id = ?
         FOR UPDATE`,
        [orderId, userId]
      );

    if (orders.length === 0) {
      throw createHttpError(
        'Order not found',
        404
      );
    }

    if (orders[0].status !== 'pending') {
      throw createHttpError(
        'Only pending orders can be cancelled',
        400
      );
    }

    await connection.query(
      `UPDATE products p
       JOIN order_items oi
         ON oi.product_id = p.id
       SET p.stock =
         p.stock + oi.quantity
       WHERE oi.order_id = ?`,
      [orderId]
    );

    await connection.query(
      `UPDATE orders
       SET status = 'cancelled'
       WHERE id = ?
         AND user_id = ?`,
      [orderId, userId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllOrders = async () => {
  const [orders] = await pool.query(
    `SELECT *
     FROM orders
     ORDER BY order_date DESC`
  );

  return orders;
};

const getOrderItemsByOrderId = async (
  orderId
) => {
  const [items] = await pool.query(
    `SELECT
      oi.id,
      oi.product_id,
      p.name AS product_name,
      oi.quantity,
      oi.price_at_purchase,
      (
        oi.quantity *
        oi.price_at_purchase
      ) AS item_total
     FROM order_items oi
     JOIN products p
       ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return items;
};

const updateOrderStatus = async (
  orderId,
  newStatus
) => {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] =
      await connection.query(
        `SELECT status
         FROM orders
         WHERE id = ?
         FOR UPDATE`,
        [orderId]
      );

    if (orders.length === 0) {
      throw createHttpError(
        'Order not found',
        404
      );
    }

    const previousStatus =
      orders[0].status;

    if (
      previousStatus !== 'cancelled' &&
      newStatus === 'cancelled'
    ) {
      await connection.query(
        `UPDATE products p
         JOIN order_items oi
           ON oi.product_id = p.id
         SET p.stock =
           p.stock + oi.quantity
         WHERE oi.order_id = ?`,
        [orderId]
      );
    }

    if (
      previousStatus === 'cancelled' &&
      newStatus !== 'cancelled'
    ) {
      const [items] =
        await connection.query(
          `SELECT
            oi.product_id,
            oi.quantity,
            p.name,
            p.stock
           FROM order_items oi
           JOIN products p
             ON p.id = oi.product_id
           WHERE oi.order_id = ?
           FOR UPDATE`,
          [orderId]
        );

      for (const item of items) {
        if (
          Number(item.stock) <
          Number(item.quantity)
        ) {
          throw createHttpError(
            `Cannot reopen order. Not enough stock for ${item.name}`,
            400
          );
        }
      }

      for (const item of items) {
        await connection.query(
          `UPDATE products
           SET stock = stock - ?
           WHERE id = ?`,
          [
            item.quantity,
            item.product_id
          ]
        );
      }
    }

    await connection.query(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [newStatus, orderId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createOrder = async ({
  userId,
  cart,
  customerDetails,
  couponCode = null
}) => {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const validatedItems = [];
    let subtotal = 0;

    for (const item of cart) {
      const [products] =
        await connection.query(
          `SELECT
            id,
            name,
            price,
            stock
           FROM products
           WHERE id = ?
           FOR UPDATE`,
          [item.productId]
        );

      if (products.length === 0) {
        throw createHttpError(
          `Product ${item.productId} was not found`,
          404
        );
      }

      const product = products[0];

      if (
        Number(product.stock) <
        Number(item.quantity)
      ) {
        throw createHttpError(
          `Not enough stock for ${product.name}. Available: ${product.stock}`,
          400
        );
      }

      const realPrice =
        Number(product.price);

      subtotal +=
        realPrice * item.quantity;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: realPrice
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (
      typeof couponCode === 'string' &&
      couponCode.trim()
    ) {
      const normalizedCouponCode =
        couponCode.trim().toUpperCase();

      const [coupons] =
        await connection.query(
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
           FOR UPDATE`,
          [normalizedCouponCode]
        );

      if (coupons.length === 0) {
        throw createHttpError(
          'Coupon was not found',
          404
        );
      }

      const coupon = coupons[0];

      if (!coupon.is_active) {
        throw createHttpError(
          'This coupon is inactive',
          400
        );
      }

      if (
        coupon.expires_at &&
        new Date(coupon.expires_at) < new Date()
      ) {
        throw createHttpError(
          'This coupon has expired',
          400
        );
      }

      if (
        coupon.max_uses !== null &&
        Number(coupon.used_count) >=
          Number(coupon.max_uses)
      ) {
        throw createHttpError(
          'This coupon has reached its usage limit',
          400
        );
      }

      if (
        subtotal <
        Number(coupon.minimum_order_amount)
      ) {
        throw createHttpError(
          `This coupon requires an order of at least ₪${Number(
            coupon.minimum_order_amount
          ).toFixed(2)}`,
          400
        );
      }

      const rawDiscount =
        coupon.discount_type === 'percentage'
          ? (
              subtotal *
              Number(coupon.discount_value)
            ) / 100
          : Number(coupon.discount_value);

      discountAmount = Number(
        Math.min(
          rawDiscount,
          subtotal
        ).toFixed(2)
      );

      appliedCouponCode = coupon.code;

      await connection.query(
        `UPDATE coupons
         SET used_count = used_count + 1
         WHERE id = ?`,
        [coupon.id]
      );
    }

    const finalTotal = Number(
      (subtotal - discountAmount).toFixed(2)
    );

    const [orderResult] =
      await connection.query(
        `INSERT INTO orders (
          user_id,
          total_amount,
          status,
          customer_name,
          customer_email,
          customer_phone,
          shipping_city,
          shipping_address,
          payment_method
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          userId,
          finalTotal,
          'pending',
          customerDetails.fullName.trim(),
          customerDetails.email.trim(),
          customerDetails.phone.trim(),
          customerDetails.city.trim(),
          customerDetails.address.trim(),
          customerDetails.paymentMethod
        ]
      );

    const orderId =
      orderResult.insertId;

    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price_at_purchase
        ) VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.quantity,
          item.price
        ]
      );

      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [
          item.quantity,
          item.productId
        ]
      );
    }

    await connection.commit();

    return {
      orderId,
      subtotal,
      discountAmount,
      couponCode: appliedCouponCode,
      totalPrice: finalTotal
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getOrdersByUserId,
  getOrderItemsForUser,
  cancelOrderForUser,
  getAllOrders,
  getOrderItemsByOrderId,
  updateOrderStatus,
  createOrder
};