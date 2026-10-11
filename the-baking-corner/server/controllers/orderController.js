const orderModel = require(
  '../models/orderModel'
);

const sendServerError = (
  res,
  error,
  fallbackMessage
) => {
  return res
    .status(error.statusCode || 500)
    .json({
      error:
        error.message ||
        fallbackMessage
    });
};

const emitOrdersChanged = (
  req,
  details
) => {
  const io = req.app.get('io');

  if (!io) {
    return;
  }

  io.emit('orders:changed', {
    ...details,
    changedAt: new Date().toISOString()
  });
};

const emitInventoryChanged = (
  req,
  action,
  orderId
) => {
  const io = req.app.get('io');

  if (!io) {
    return;
  }

  io.emit('products:changed', {
    action,
    orderId,
    changedAt: new Date().toISOString()
  });
};

const getMyOrders = async (req, res) => {
  try {
    const orders =
      await orderModel.getOrdersByUserId(
        req.user.id
      );

    return res.json(orders);
  } catch (error) {
    console.error(
      'Error fetching customer orders:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to fetch your orders'
    );
  }
};

const getMyOrderItems = async (
  req,
  res
) => {
  try {
    const items =
      await orderModel.getOrderItemsForUser(
        req.params.id,
        req.user.id
      );

    return res.json(items);
  } catch (error) {
    console.error(
      'Error fetching customer order items:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to fetch order details'
    );
  }
};

const cancelMyOrder = async (
  req,
  res
) => {
  const orderId = Number(req.params.id);

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid order ID'
    });
  }

  try {
    await orderModel.cancelOrderForUser(
      orderId,
      req.user.id
    );

    emitOrdersChanged(req, {
      action: 'cancelled',
      orderId,
      userId: req.user.id,
      status: 'cancelled'
    });

    emitInventoryChanged(
      req,
      'inventory-restored',
      orderId
    );

    return res.json({
      message:
        'Order cancelled successfully'
    });
  } catch (error) {
    console.error(
      'Error cancelling order:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to cancel order'
    );
  }
};

const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await orderModel.getAllOrders();

    return res.json(orders);
  } catch (error) {
    console.error(
      'Error fetching orders:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to fetch orders'
    );
  }
};

const getOrderItems = async (
  req,
  res
) => {
  try {
    const items =
      await orderModel
        .getOrderItemsByOrderId(
          req.params.id
        );

    return res.json(items);
  } catch (error) {
    console.error(
      'Error fetching order items:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to fetch order items'
    );
  }
};

const updateOrderStatus = async (
  req,
  res
) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid order ID'
    });
  }

  if (
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      error: 'Invalid order status'
    });
  }

  try {
    await orderModel.updateOrderStatus(
      orderId,
      status
    );

    emitOrdersChanged(req, {
      action: 'status-updated',
      orderId,
      status
    });

    emitInventoryChanged(
      req,
      'order-status-updated',
      orderId
    );

    return res.json({
      message:
        'Order status and inventory updated successfully'
    });
  } catch (error) {
    console.error(
      'Error updating order status:',
      error
    );

    return sendServerError(
      res,
      error,
      'Failed to update order status'
    );
  }
};

const createOrder = async (
  req,
  res
) => {
  const {
    cart,
    customerDetails,
    couponCode
  } = req.body;

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return res.status(400).json({
      error: 'Cart is empty'
    });
  }

  if (
    !customerDetails ||
    !customerDetails.fullName ||
    !customerDetails.email ||
    !customerDetails.phone ||
    !customerDetails.city ||
    !customerDetails.address
  ) {
    return res.status(400).json({
      error:
        'Customer and shipping details are required'
    });
  }

  const allowedPaymentMethods = [
    'credit-card',
    'cash'
  ];

  if (
    !allowedPaymentMethods.includes(
      customerDetails.paymentMethod
    )
  ) {
    return res.status(400).json({
      error: 'Invalid payment method'
    });
  }

  const quantitiesByProduct =
    new Map();

  for (const item of cart) {
    const productId =
      Number(item.id);

    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        error:
          'Invalid product or quantity'
      });
    }

    const existingQuantity =
      quantitiesByProduct.get(
        productId
      ) || 0;

    quantitiesByProduct.set(
      productId,
      existingQuantity + quantity
    );
  }

  const normalizedCart =
    Array.from(
      quantitiesByProduct,
      ([productId, quantity]) => ({
        productId,
        quantity
      })
    );

  const normalizedCouponCode =
    typeof couponCode === 'string'
      ? couponCode.trim().toUpperCase()
      : null;

  try {
    const result =
      await orderModel.createOrder({
        userId: req.user.id,
        cart: normalizedCart,
        customerDetails,
        couponCode:
          normalizedCouponCode || null
      });

    emitOrdersChanged(req, {
      action: 'created',
      orderId: result.orderId,
      userId: req.user.id,
      status: 'pending'
    });

    emitInventoryChanged(
      req,
      'inventory-decreased',
      result.orderId
    );

    return res.status(201).json({
      message:
        'Order placed successfully',
      orderId: result.orderId,
      subtotal: result.subtotal,
      discountAmount:
        result.discountAmount,
      couponCode: result.couponCode,
      totalPrice: result.totalPrice,
      totalAmount: result.totalPrice
    });
  } catch (error) {
    console.error(
      'Error processing order:',
      error
    );

    return sendServerError(
      res,
      error,
      'Server error processing order'
    );
  }
};

module.exports = {
  getMyOrders,
  getMyOrderItems,
  cancelMyOrder,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  createOrder
};