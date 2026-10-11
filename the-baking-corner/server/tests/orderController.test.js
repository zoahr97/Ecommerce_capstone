jest.mock('../models/orderModel', () => ({
  getOrdersByUserId: jest.fn(),
  getOrderItemsForUser: jest.fn(),
  cancelOrderForUser: jest.fn(),
  getAllOrders: jest.fn(),
  getOrderItemsByOrderId: jest.fn(),
  updateOrderStatus: jest.fn(),
  createOrder: jest.fn()
}));

const orderModel = require(
  '../models/orderModel'
);

const orderController = require(
  '../controllers/orderController'
);

const createResponse = () => {
  const res = {};

  res.status = jest
    .fn()
    .mockReturnValue(res);

  res.json = jest
    .fn()
    .mockReturnValue(res);

  return res;
};

describe('orderController', () => {
  let io;

  beforeEach(() => {
    jest.clearAllMocks();

    io = {
      emit: jest.fn()
    };
  });

  test(
    'returns 400 when the cart is empty',
    async () => {
      const req = {
        body: {
          cart: [],
          customerDetails: {}
        },
        user: {
          id: 1
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await orderController.createOrder(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(
        400
      );

      expect(res.json).toHaveBeenCalledWith({
        error: 'Cart is empty'
      });

      expect(
        orderModel.createOrder
      ).not.toHaveBeenCalled();
    }
  );

  test(
    'creates an order and emits real-time events',
    async () => {
      const customerDetails = {
        fullName: 'Test Customer',
        email: 'test@example.com',
        phone: '0500000000',
        city: 'Ashdod',
        address: 'Test Address',
        paymentMethod: 'cash'
      };

      orderModel.createOrder.mockResolvedValue({
        orderId: 41,
        totalPrice: 150
      });

      const req = {
        body: {
          cart: [
            {
              id: 2,
              quantity: 1
            },
            {
              id: 2,
              quantity: 2
            }
          ],
          customerDetails
        },
        user: {
          id: 4
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await orderController.createOrder(
        req,
        res
      );

      expect(
        orderModel.createOrder
      ).toHaveBeenCalledWith({
        userId: 4,
        cart: [
          {
            productId: 2,
            quantity: 3
          }
        ],
        customerDetails
      });

      expect(res.status).toHaveBeenCalledWith(
        201
      );

      expect(res.json).toHaveBeenCalledWith({
        message:
          'Order placed successfully',
        orderId: 41,
        totalPrice: 150,
        totalAmount: 150
      });

      expect(io.emit).toHaveBeenCalledWith(
        'orders:changed',
        expect.objectContaining({
          action: 'created',
          orderId: 41,
          userId: 4,
          status: 'pending'
        })
      );

      expect(io.emit).toHaveBeenCalledWith(
        'products:changed',
        expect.objectContaining({
          action: 'inventory-decreased',
          orderId: 41
        })
      );
    }
  );

  test(
    'cancels an order and emits inventory updates',
    async () => {
      orderModel.cancelOrderForUser
        .mockResolvedValue();

      const req = {
        params: {
          id: '7'
        },
        user: {
          id: 3
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await orderController.cancelMyOrder(
        req,
        res
      );

      expect(
        orderModel.cancelOrderForUser
      ).toHaveBeenCalledWith(7, 3);

      expect(res.json).toHaveBeenCalledWith({
        message:
          'Order cancelled successfully'
      });

      expect(io.emit).toHaveBeenCalledWith(
        'orders:changed',
        expect.objectContaining({
          action: 'cancelled',
          orderId: 7,
          userId: 3,
          status: 'cancelled'
        })
      );

      expect(io.emit).toHaveBeenCalledWith(
        'products:changed',
        expect.objectContaining({
          action: 'inventory-restored',
          orderId: 7
        })
      );
    }
  );
});