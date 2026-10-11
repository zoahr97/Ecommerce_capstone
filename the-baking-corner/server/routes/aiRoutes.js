const express = require('express');

const aiController = require(
  '../controllers/aiController'
);

const {
  verifyToken
} = require(
  '../middlewares/authMiddleware'
);

const router = express.Router();

router.post(
  '/recipe',
  verifyToken,
  aiController.generateRecipe
);

module.exports = router;