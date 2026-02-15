const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const wantListingRoutes = require('./routes/wantListings');
const vehicleRoutes = require('./routes/vehicles');
const notificationRoutes = require('./routes/notifications');
const introductionRoutes = require('./routes/introductions');
const adminRoutes = require('./routes/admin');
const favoritesRoutes = require('./routes/favorites');
const aiRoutes = require('./routes/ai');
const carImageRoutes = require('./routes/carImage');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/want-listings', wantListingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/introductions', introductionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/car-image', carImageRoutes);

// Global error handler for API
app.use('/api', errorHandler);

// Serve frontend static files
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Client-side routing fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

module.exports = app;
