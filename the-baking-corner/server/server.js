const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const productRoutes = require(
  './routes/productRoutes'
);

const authRoutes = require(
  './routes/authRoutes'
);

const orderRoutes = require(
  './routes/orderRoutes'
);

const userRoutes = require(
  './routes/userRoutes'
);

const uploadRoutes = require(
  './routes/uploadRoutes'
);
const aiRoutes = require(
  './routes/aiRoutes'
);
const contactRoutes = require(
  './routes/contactRoutes'
);
const couponRoutes = require(
  './routes/couponRoutes'
);
const app = express();

/*
  Socket.IO needs an HTTP server rather
  than calling app.listen directly.
*/
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE'
    ]
  }
});

/*
  Makes the Socket.IO instance available
  inside controllers through req.app.
*/
app.set('io', io);

app.use(cors());
app.use(express.json());

/*
  Allows the browser to display images
  stored in the uploads directory.
*/
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// Public server status route
app.get('/', (req, res) => {
  res.send(
    'The Baking Corner Server is running!'
  );
});

// API routes
app.use(
  '/api/products',
  productRoutes
);

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/uploads',
  uploadRoutes
);
app.use(
  '/api/contact',
  contactRoutes
);
app.use(
  '/api/ai',
  aiRoutes
);
app.use(
  '/api/coupons',
  couponRoutes
);

app.use('/api', orderRoutes);


io.on('connection', (socket) => {
  console.log(
    `Socket client connected: ${socket.id}`
  );

  socket.on('disconnect', () => {
    console.log(
      `Socket client disconnected: ${socket.id}`
    );
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});