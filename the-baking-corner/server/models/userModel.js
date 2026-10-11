const pool = require('../config/db');

const findUserByEmail = async (
  email
) => {
  const [users] = await pool.query(
    `SELECT
      id,
      first_name,
      last_name,
      email,
      password,
      role
     FROM users
     WHERE email = ?`,
    [email]
  );

  return users[0] || null;
};

const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  role = 'customer'
}) => {
  const [result] = await pool.query(
    `INSERT INTO users (
      first_name,
      last_name,
      email,
      password,
      role
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      firstName,
      lastName,
      email,
      passwordHash,
      role
    ]
  );

  return result.insertId;
};

const getAllUsers = async () => {
  const [users] = await pool.query(
    `SELECT
      id,
      first_name,
      last_name,
      email,
      role
     FROM users
     ORDER BY id`
  );

  return users;
};

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers
};