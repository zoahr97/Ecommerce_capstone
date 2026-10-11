const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userModel = require(
  '../models/userModel'
);

// POST /api/auth/register
const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password
  ) {
    return res.status(400).json({
      error: 'All fields are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error:
        'Password must contain at least 6 characters'
    });
  }

  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser =
      await userModel.findUserByEmail(
        normalizedEmail
      );

    if (existingUser) {
      return res.status(409).json({
        error:
          'A user with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const userId = await userModel.createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer'
    });

    return res.status(201).json({
      message:
        'Registration completed successfully',

      user: {
        id: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error(
      'Registration error:',
      error
    );

    return res.status(500).json({
      error: 'Registration failed'
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error:
        'Email and password are required'
    });
  }

  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user =
      await userModel.findUserByEmail(
        normalizedEmail
      );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const passwordIsValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordIsValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET is missing from .env'
      );

      return res.status(500).json({
        error:
          'Server authentication configuration error'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    return res.status(200).json({
      message: 'Login completed successfully',
      token,

      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      error: 'Login failed'
    });
  }
};

module.exports = {
  register,
  login
};