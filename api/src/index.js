/**
 * API Service - Food Delivery System
 * 
 * Stateless API server exposing endpoints for:
 * - Customer endpoints (menu, orders)
 * - Admin endpoints (orders, menu, restaurants management)
 * - Health checks (GET /health)
 * 
 * Runs continuously on Fargate behind an ALB.
 */

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const customerRoutes = require('./routes/customer');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';

// Configure AWS SDK
AWS.config.update({ region: AWS_REGION });

// Middleware
app.use(cors());
app.use(express.json());

// Food Delivery Routes
app.use('/customer', customerRoutes);
app.use('/admin', adminRoutes);

/**
 * Health check endpoint for ALB and ECS
 * Returns 200 if service is healthy
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'api',
    timestamp: new Date().toISOString()
  });
});


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API service listening on port ${PORT}`);
  console.log(`AWS Region: ${AWS_REGION}`);
  console.log(`Food Delivery API ready`);
});
