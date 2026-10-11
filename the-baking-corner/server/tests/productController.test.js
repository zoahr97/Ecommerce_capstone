jest.mock('../models/productModel', () => ({
  getAllProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn()
}));

const productModel = require(
  '../models/productModel'
);

const productController = require(
  '../controllers/productController'
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

describe('productController', () => {
  let io;

  beforeEach(() => {
    jest.clearAllMocks();

    io = {
      emit: jest.fn()
    };
  });

  test(
    'rejects a product with negative stock',
    async () => {
      const req = {
        params: {
          id: '1'
        },
        body: {
          name: 'Test Product',
          description: 'Description',
          price: 20,
          category: 'ingredients',
          image_url: '',
          stock: -1
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await productController.updateProduct(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(
        400
      );

      expect(res.json).toHaveBeenCalledWith({
        error:
          'Stock must be a non-negative integer'
      });

      expect(
        productModel.updateProduct
      ).not.toHaveBeenCalled();
    }
  );

  test(
    'creates a product and emits a real-time event',
    async () => {
      productModel.createProduct
        .mockResolvedValue(12);

      const req = {
        body: {
          name: 'Test Product',
          description: 'Test Description',
          price: 25,
          category: 'ingredients',
          image_url: '/images/test.jpg',
          stock: 8
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await productController.createProduct(
        req,
        res
      );

      expect(
        productModel.createProduct
      ).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test Description',
        price: 25,
        category: 'ingredients',
        imageUrl: '/images/test.jpg',
        stock: 8
      });

      expect(res.status).toHaveBeenCalledWith(
        201
      );

      expect(res.json).toHaveBeenCalledWith({
        id: 12,
        name: 'Test Product',
        description: 'Test Description',
        price: 25,
        category: 'ingredients',
        image_url: '/images/test.jpg',
        stock: 8
      });

      expect(io.emit).toHaveBeenCalledWith(
        'products:changed',
        expect.objectContaining({
          action: 'created',
          productId: 12
        })
      );
    }
  );

  test(
    'returns 404 when deleting a missing product',
    async () => {
      productModel.deleteProduct
        .mockResolvedValue(0);

      const req = {
        params: {
          id: '999'
        },
        app: {
          get: jest
            .fn()
            .mockReturnValue(io)
        }
      };

      const res = createResponse();

      await productController.deleteProduct(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(
        404
      );

      expect(res.json).toHaveBeenCalledWith({
        error: 'Product not found'
      });

      expect(
        io.emit
      ).not.toHaveBeenCalled();
    }
  );
});