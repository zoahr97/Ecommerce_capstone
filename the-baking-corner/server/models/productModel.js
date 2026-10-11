const pool = require('../config/db');

const getAllProducts = async () => {
  const [products] = await pool.query(
    'SELECT * FROM products ORDER BY id'
  );

  return products;
};

const createProduct = async ({
  name,
  description,
  price,
  category,
  imageUrl,
  stock
}) => {
  const [result] = await pool.query(
    `INSERT INTO products (
      name,
      description,
      price,
      category,
      image_url,
      stock
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      price,
      category,
      imageUrl,
      stock
    ]
  );

  return result.insertId;
};

const updateProduct = async (
  productId,
  {
    name,
    description,
    price,
    category,
    imageUrl,
    stock
  }
) => {
  const [result] = await pool.query(
    `UPDATE products
     SET
       name = ?,
       description = ?,
       price = ?,
       category = ?,
       image_url = ?,
       stock = ?
     WHERE id = ?`,
    [
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      productId
    ]
  );

  return result.affectedRows;
};

const deleteProduct = async (
  productId
) => {
  const [result] = await pool.query(
    `DELETE FROM products
     WHERE id = ?`,
    [productId]
  );

  return result.affectedRows;
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};