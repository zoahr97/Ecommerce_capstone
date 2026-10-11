const express = require('express');
const router = express.Router();

const {
  createContactMessage,
  getAllContactMessages,
  markContactMessageAsRead
} = require(
  '../controllers/contactController'
);

const {
  verifyToken,
  verifyAdmin
} = require(
  '../middlewares/authMiddleware'
);

// כל מבקר יכול לשלוח פנייה.
router.post(
  '/',
  createContactMessage
);

// רק מנהל יכול לראות או לשנות פניות.
router.get(
  '/',
  verifyToken,
  verifyAdmin,
  getAllContactMessages
);

router.patch(
  '/:id/read',
  verifyToken,
  verifyAdmin,
  markContactMessageAsRead
);

module.exports = router;