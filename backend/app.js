const express = require('express');
const authRoutes = require('./routes/authRoutes');
// const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend origin
  credentials: true,              // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
// app.use('/api/users', authRoutes);
// app.use(errorHandler); // global error handler

module.exports = app;
