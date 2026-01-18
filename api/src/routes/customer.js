/**
 * Customer-facing API routes
 * For end users ordering food
 */

const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'food-orders';
const MENU_TABLE = process.env.MENU_TABLE || 'food-menu';
const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE || 'restaurants';

// Configure AWS SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * GET /customer/menu
 * Get all menu items from all restaurants
 */
router.get('/menu', async (req, res) => {
  try {
    const params = {
      TableName: MENU_TABLE
    };

    const result = await dynamodb.scan(params).promise();
    
    // Group by restaurant for easier display
    const menuByRestaurant = {};
    (result.Items || []).forEach(item => {
      const restaurantId = item.restaurantId || 'unknown';
      if (!menuByRestaurant[restaurantId]) {
        menuByRestaurant[restaurantId] = [];
      }
      menuByRestaurant[restaurantId].push(item);
    });

    res.json({
      items: result.Items || [],
      byRestaurant: menuByRestaurant
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * GET /customer/restaurants
 * Get all restaurants
 */
router.get('/restaurants', async (req, res) => {
  try {
    const params = {
      TableName: RESTAURANTS_TABLE
    };

    const result = await dynamodb.scan(params).promise();
    res.json({ restaurants: result.Items || [] });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

/**
 * POST /customer/orders
 * Place a new order
 */
router.post('/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, items, deliveryAddress, restaurantId } = req.body;

    // Validation
    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: customerName, customerPhone, items' });
    }

    // Calculate total
    const menuItems = await dynamodb.scan({ TableName: MENU_TABLE }).promise();
    const menuMap = {};
    (menuItems.Items || []).forEach(item => {
      menuMap[item.itemId] = item;
    });

    let total = 0;
    for (const orderItem of items) {
      const menuItem = menuMap[orderItem.itemId];
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${orderItem.itemId} not found` });
      }
      total += (menuItem.price * orderItem.quantity);
    }

    // Create order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = {
      orderId,
      customerName,
      customerPhone,
      deliveryAddress: deliveryAddress || '',
      restaurantId: restaurantId || 'default',
      items,
      total,
      status: 'pending', // pending -> processing -> preparing -> ready -> delivered
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: ORDERS_TABLE,
      Item: order
    }).promise();

    res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /customer/orders/:orderId
 * Get order status by ID
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await dynamodb.get({
      TableName: ORDERS_TABLE,
      Key: { orderId }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.Item });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
