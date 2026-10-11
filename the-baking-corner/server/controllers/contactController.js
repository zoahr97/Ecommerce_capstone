const pool = require('../config/db');

const createContactMessage = async (req, res) => {
  const {
    name,
    email,
    subject,
    message
  } = req.body;

  const cleanName =
    typeof name === 'string'
      ? name.trim()
      : '';

  const cleanEmail =
    typeof email === 'string'
      ? email.trim().toLowerCase()
      : '';

  const cleanSubject =
    typeof subject === 'string'
      ? subject.trim()
      : '';

  const cleanMessage =
    typeof message === 'string'
      ? message.trim()
      : '';

  if (
    !cleanName ||
    !cleanEmail ||
    !cleanSubject ||
    !cleanMessage
  ) {
    return res.status(400).json({
      error: 'All fields are required'
    });
  }

  if (!cleanEmail.includes('@')) {
    return res.status(400).json({
      error:
        'Please enter a valid email address'
    });
  }

  if (
    cleanName.length > 100 ||
    cleanEmail.length > 100 ||
    cleanSubject.length > 200 ||
    cleanMessage.length > 1000
  ) {
    return res.status(400).json({
      error: 'One of the fields is too long'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO contact_messages
        (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [
        cleanName,
        cleanEmail,
        cleanSubject,
        cleanMessage
      ]
    );

    const io = req.app.get('io');

    if (io) {
      io.emit('contact-messages:changed');
    }

    return res.status(201).json({
      message:
        'Contact message sent successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(
      'Error saving contact message:',
      error
    );

    return res.status(500).json({
      error: 'Could not save contact message'
    });
  }
};

const getAllContactMessages = async (
  req,
  res
) => {
  try {
    const [messages] = await pool.query(
      `SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      FROM contact_messages
      ORDER BY
        CASE WHEN status = 'new' THEN 0 ELSE 1 END,
        created_at DESC`
    );

    return res.json(messages);
  } catch (error) {
    console.error(
      'Error fetching contact messages:',
      error
    );

    return res.status(500).json({
      error:
        'Could not fetch contact messages'
    });
  }
};

const markContactMessageAsRead = async (
  req,
  res
) => {
  const messageId = Number(req.params.id);

  if (
    !Number.isInteger(messageId) ||
    messageId <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid message ID'
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE contact_messages
       SET status = 'read'
       WHERE id = ?`,
      [messageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Contact message not found'
      });
    }

    const io = req.app.get('io');

    if (io) {
      io.emit('contact-messages:changed');
    }

    return res.json({
      message:
        'Contact message marked as read'
    });
  } catch (error) {
    console.error(
      'Error updating contact message:',
      error
    );

    return res.status(500).json({
      error:
        'Could not update contact message'
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  markContactMessageAsRead
};