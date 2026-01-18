/**
 * Admin API routes
 * For restaurant/admin management
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
 * GET /admin/orders
 * Get all orders (with filtering)
 */
router.get('/orders', async (req, res) => {
  try {
    const { status, restaurantId, limit = 50 } = req.query;

    const params = {
      TableName: ORDERS_TABLE,
      Limit: parseInt(limit)
    };

    // Add filter if status is specified
    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues = { ':status': status };
    }

    if (restaurantId) {
      if (params.FilterExpression) {
        params.FilterExpression += ' AND restaurantId = :restaurantId';
        params.ExpressionAttributeValues[':restaurantId'] = restaurantId;
      } else {
        params.FilterExpression = 'restaurantId = :restaurantId';
        params.ExpressionAttributeValues = { ':restaurantId': restaurantId };
      }
    }

    const result = await dynamodb.scan(params).promise();

    // Sort by createdAt descending
    const orders = (result.Items || []).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /admin/orders/:orderId
 * Get order details
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

/**
 * PUT /admin/orders/:orderId/status
 * Update order status
 */
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updateParams = {
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(updateParams).promise();

    res.json({
      success: true,
      order: result.Attributes
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

/**
 * GET /admin/stats
 * Get order statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const params = {
      TableName: ORDERS_TABLE
    };

    const result = await dynamodb.scan(params).promise();
    const orders = result.Items || [];

    // Calculate stats
    const stats = {
      total: orders.length,
      byStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      avgOrderValue: orders.length > 0
        ? Math.round(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length)
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * POST /admin/menu
 * Add menu item (admin only)
 */
router.post('/menu', async (req, res) => {
  try {
    const { itemId, name, description, price, restaurantId, category, imageUrl } = req.body;

    if (!itemId || !name || !price || !restaurantId) {
      return res.status(400).json({ error: 'Missing required fields: itemId, name, price, restaurantId' });
    }

    const menuItem = {
      itemId,
      name,
      description: description || '',
      price: parseFloat(price),
      restaurantId,
      category: category || 'other',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: MENU_TABLE,
      Item: menuItem
    }).promise();

    res.status(201).json({
      success: true,
      item: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

/**
 * GET /admin/menu
 * Get all menu items (admin view)
 */
router.get('/menu', async (req, res) => {
  try {
    const params = {
      TableName: MENU_TABLE
    };

    const result = await dynamodb.scan(params).promise();
    res.json({ items: result.Items || [] });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * PUT /admin/menu/:itemId
 * Update menu item
 */
router.put('/menu/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, restaurantId, category, imageUrl } = req.body;

    const updateParams = {
      TableName: MENU_TABLE,
      Key: { itemId },
      UpdateExpression: 'SET #name = :name, description = :description, price = :price, restaurantId = :restaurantId, category = :category, imageUrl = :imageUrl, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description || '',
        ':price': parseFloat(price),
        ':restaurantId': restaurantId,
        ':category': category || 'other',
        ':imageUrl': imageUrl || '',
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(updateParams).promise();

    res.json({
      success: true,
      item: result.Attributes
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

/**
 * DELETE /admin/menu/:itemId
 * Delete menu item
 */
router.delete('/menu/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    await dynamodb.delete({
      TableName: MENU_TABLE,
      Key: { itemId }
    }).promise();

    res.json({
      success: true,
      message: 'Menu item deleted'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

/**
 * GET /admin/restaurants
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
 * POST /admin/restaurants
 * Add restaurant
 */
router.post('/restaurants', async (req, res) => {
  try {
    const { restaurantId, name, description, cuisine, address } = req.body;

    if (!restaurantId || !name) {
      return res.status(400).json({ error: 'Missing required fields: restaurantId, name' });
    }

    const restaurant = {
      restaurantId,
      name,
      description: description || '',
      cuisine: cuisine || '',
      address: address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: RESTAURANTS_TABLE,
      Item: restaurant
    }).promise();

    res.status(201).json({
      success: true,
      restaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

/**
 * PUT /admin/restaurants/:restaurantId
 * Update restaurant
 */
router.put('/restaurants/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, cuisine, address } = req.body;

    const updateParams = {
      TableName: RESTAURANTS_TABLE,
      Key: { restaurantId },
      UpdateExpression: 'SET #name = :name, description = :description, cuisine = :cuisine, address = :address, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description || '',
        ':cuisine': cuisine || '',
        ':address': address || '',
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(updateParams).promise();

    res.json({
      success: true,
      restaurant: result.Attributes
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

/**
 * DELETE /admin/restaurants/:restaurantId
 * Delete restaurant
 */
router.delete('/restaurants/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    await dynamodb.delete({
      TableName: RESTAURANTS_TABLE,
      Key: { restaurantId }
    }).promise();

    res.json({
      success: true,
      message: 'Restaurant deleted'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

module.exports = router;
