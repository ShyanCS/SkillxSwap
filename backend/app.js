const express = require('express');
// const authRoutes = require('./routes/authRoutes'); // disabled -- see app.use('/api/auth', ...) below
const skillRoutes = require('./routes/skillRoutes');
const matchRoutes = require('./routes/matchRoutes');
const matchRequestRoutes = require('./routes/matchRequestRoutes');
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
// Auth is cut over to the Spring Boot backend (backend-java, :8080) as of
// Phase 1 of the rewrite -- disabled here to prove the frontend has no
// hidden fallback dependency on the Node auth routes. Re-enable only if
// rolling back Phase 1.
// app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/match-requests', matchRoutes);
app.use('/api/match-requests' , matchRequestRoutes);

// app.use('/api/users', authRoutes);
// app.use(errorHandler); // global error handler

module.exports = app;
