const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

app.use('/api', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api', userRoutes);
app.use('/api', statsRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Welcome to Beauty Salon Booking API" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
