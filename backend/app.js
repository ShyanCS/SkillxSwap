const express = require('express');
const authRoutes = require('./routes/authRoutes');
// const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use('/api/users', authRoutes);
// app.use(errorHandler); // global error handler

module.exports = app;
