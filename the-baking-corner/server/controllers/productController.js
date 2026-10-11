const productModel = require(
  '../models/productModel'
);

const allowedCategories = [
  'ingredients',
  'equipment'
];

const emitProductsChanged = (
  req,
  action,
  productId
) => {
  const io = req.app.get('io');

  if (!io) {
    return;
  }

  io.emit('products:changed', {
    action,
    productId,
    changedAt: new Date().toISOString()
  });
};

const validateProduct = (body) => {
  const {
    name,
    description = '',
    price,
    category,
    image_url = '',
    stock = 10
  } = body;

  const normalizedName =
    typeof name === 'string'
      ? name.trim()
      : '';

  const priceNumber = Number(price);
  const stockNumber = Number(stock);

  if (!normalizedName) {
    return {
      error: 'Product name is required'
    };
  }

  if (
    !Number.isFinite(priceNumber) ||
    priceNumber < 0
  ) {
    return {
      error:
        'Price must be a valid non-negative number'
    };
  }

  if (
    !Number.isInteger(stockNumber) ||
    stockNumber < 0
  ) {
    return {
      error:
        'Stock must be a non-negative integer'
    };
  }

  if (
    !allowedCategories.includes(category)
  ) {
    return {
      error: 'Invalid product category'
    };
  }

  return {
    product: {
      name: normalizedName,

      description:
        typeof description === 'string'
          ? description.trim()
          : '',

      price: priceNumber,
      category,

      imageUrl:
        typeof image_url === 'string'
          ? image_url.trim()
          : '',

      stock: stockNumber
    }
  };
};

const getAllProducts = async (
  req,
  res
) => {
  try {
    const products =
      await productModel.getAllProducts();

    return res
      .status(200)
      .json(products);
  } catch (error) {
    console.error(
      'Error fetching products:',
      error
    );

    return res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
};

const createProduct = async (
  req,
  res
) => {
  const validation =
    validateProduct(req.body);

  if (validation.error) {
    return res.status(400).json({
      error: validation.error
    });
  }

  try {
    const productId =
      await productModel.createProduct(
        validation.product
      );

    const createdProduct = {
      id: productId,
      name: validation.product.name,

      description:
        validation.product.description,

      price: validation.product.price,

      category:
        validation.product.category,

      image_url:
        validation.product.imageUrl,

      stock: validation.product.stock
    };

    emitProductsChanged(
      req,
      'created',
      productId
    );

    return res
      .status(201)
      .json(createdProduct);
  } catch (error) {
    console.error(
      'Error adding product:',
      error
    );

    return res.status(500).json({
      error: 'Failed to add product'
    });
  }
};

const updateProduct = async (
  req,
  res
) => {
  const productId =
    Number(req.params.id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid product ID'
    });
  }

  const validation =
    validateProduct(req.body);

  if (validation.error) {
    return res.status(400).json({
      error: validation.error
    });
  }

  try {
    const affectedRows =
      await productModel.updateProduct(
        productId,
        validation.product
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    emitProductsChanged(
      req,
      'updated',
      productId
    );

    return res.json({
      message:
        'Product updated successfully',
      product: {
        id: productId,
        name: validation.product.name,

        description:
          validation.product.description,

        price:
          validation.product.price,

        category:
          validation.product.category,

        image_url:
          validation.product.imageUrl,

        stock:
          validation.product.stock
      }
    });
  } catch (error) {
    console.error(
      'Error updating product:',
      error
    );

    return res.status(500).json({
      error:
        'Failed to update product'
    });
  }
};

const deleteProduct = async (
  req,
  res
) => {
  const productId =
    Number(req.params.id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid product ID'
    });
  }

  try {
    const affectedRows =
      await productModel.deleteProduct(
        productId
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    emitProductsChanged(
      req,
      'deleted',
      productId
    );

    return res.json({
      message:
        'Product deleted successfully'
    });
  } catch (error) {
    console.error(
      'Error deleting product:',
      error
    );

    return res.status(500).json({
      error:
        'Failed to delete product. It may belong to an existing order.'
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};