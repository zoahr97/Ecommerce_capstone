const express = require('express');

const {
  verifyToken,
  verifyAdmin
} = require(
  '../middlewares/authMiddleware'
);

const {
  getMyOrders,
  getMyOrderItems,
  cancelMyOrder,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  createOrder
} = require(
  '../controllers/orderController'
);

const router = express.Router();

/* הזמנות המשתמש המחובר */

router.get(
  '/my-orders',
  verifyToken,
  getMyOrders
);

router.get(
  '/my-orders/:id/items',
  verifyToken,
  getMyOrderItems
);

router.put(
  '/my-orders/:id/cancel',
  verifyToken,
  cancelMyOrder
);

/* הזמנות עבור מנהל */

router.get(
  '/orders',
  verifyToken,
  verifyAdmin,
  getAllOrders
);

router.get(
  '/orders/:id/items',
  verifyToken,
  verifyAdmin,
  getOrderItems
);

router.put(
  '/orders/:id/status',
  verifyToken,
  verifyAdmin,
  updateOrderStatus
);

/* ביצוע הזמנה חדשה */

router.post(
  '/orders',
  verifyToken,
  createOrder
);

module.exports = router;