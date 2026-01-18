/**
 * Admin Dashboard - Food Delivery Management
 * 
 * Features:
 * - View all orders and update status
 * - Manage menu items (CRUD)
 * - Manage restaurants (CRUD)
 * - View statistics
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState('orders');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Menu state
  const [menuItems, setMenuItems] = useState([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ itemId: '', name: '', description: '', price: '', restaurantId: '', category: '' });
  
  // Restaurants state
  const [restaurants, setRestaurants] = useState([]);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState({ restaurantId: '', name: '', description: '', cuisine: '', address: '' });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const url = statusFilter 
        ? `${API_URL}/admin/orders?status=${statusFilter}`
        : `${API_URL}/admin/orders`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/menu`);
      const data = await response.json();
      setMenuItems(data.items || []);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    }
  };

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/restaurants`);
      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      setError('Failed to load restaurants');
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
      fetchStats();
      const interval = setInterval(() => {
        fetchOrders();
        fetchStats();
      }, 5000);
      return () => clearInterval(interval);
    } else if (activeTab === 'menu') {
      fetchMenuItems();
      fetchRestaurants(); // Need restaurants for dropdown
    } else if (activeTab === 'restaurants') {
      fetchRestaurants();
    }
    setLoading(false);
  }, [activeTab, statusFilter]);

  // Order actions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        fetchStats();
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  };

  // Menu actions
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingMenuItem 
        ? `${API_URL}/admin/menu/${editingMenuItem.itemId}`
        : `${API_URL}/admin/menu`;
      
      const method = editingMenuItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });

      if (response.ok) {
        setShowMenuForm(false);
        setEditingMenuItem(null);
        setMenuForm({ itemId: '', name: '', description: '', price: '', restaurantId: '', category: '' });
        fetchMenuItems();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save menu item');
      }
    } catch (err) {
      setError('Failed to save menu item');
      console.error(err);
    }
  };

  const handleEditMenu = (item) => {
    setEditingMenuItem(item);
    setMenuForm({
      itemId: item.itemId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      restaurantId: item.restaurantId,
      category: item.category || ''
    });
    setShowMenuForm(true);
  };

  const handleDeleteMenu = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMenuItems();
      } else {
        setError('Failed to delete menu item');
      }
    } catch (err) {
      setError('Failed to delete menu item');
      console.error(err);
    }
  };

  // Restaurant actions
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingRestaurant 
        ? `${API_URL}/admin/restaurants/${editingRestaurant.restaurantId}`
        : `${API_URL}/admin/restaurants`;
      
      const method = editingRestaurant ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantForm)
      });

      if (response.ok) {
        setShowRestaurantForm(false);
        setEditingRestaurant(null);
        setRestaurantForm({ restaurantId: '', name: '', description: '', cuisine: '', address: '' });
        fetchRestaurants();
        if (activeTab === 'menu') fetchMenuItems(); // Refresh menu to update restaurant dropdown
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save restaurant');
      }
    } catch (err) {
      setError('Failed to save restaurant');
      console.error(err);
    }
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      restaurantId: restaurant.restaurantId,
      name: restaurant.name,
      description: restaurant.description || '',
      cuisine: restaurant.cuisine || '',
      address: restaurant.address || ''
    });
    setShowRestaurantForm(true);
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRestaurants();
        if (activeTab === 'menu') fetchMenuItems();
      } else {
        setError('Failed to delete restaurant');
      }
    } catch (err) {
      setError('Failed to delete restaurant');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff3cd',
      processing: '#cfe2ff',
      preparing: '#d1e7dd',
      ready: '#d4edda',
      delivered: '#155724',
      cancelled: '#f8d7da'
    };
    return colors[status] || '#f5f5f5';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🍽️ Food Delivery - Admin Dashboard</h1>
        <p>Manage orders, menu, restaurants, and view statistics</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button 
          className={activeTab === 'menu' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('menu')}
        >
          🍕 Menu
        </button>
        <button 
          className={activeTab === 'restaurants' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('restaurants')}
        >
          🏪 Restaurants
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {stats && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <div className="value">{stats.total}</div>
                </div>
                <div className="stat-card">
                  <h3>Revenue</h3>
                  <div className="value">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Order Value</h3>
                  <div className="value">${stats.avgOrderValue?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <div className="value">{stats.byStatus?.pending || 0}</div>
                </div>
              </div>

              {stats.byStatus && (
                <div className="chart-container">
                  <h2>Orders by Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(stats.byStatus).map(([status, count]) => ({ status, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          <div className="jobs-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Orders</h2>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px', fontSize: '14px' }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="loading">No orders found</div>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="timestamp" style={{ fontSize: '12px' }}>{order.orderId}</td>
                      <td>
                        <div><strong>{order.customerName}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customerPhone}</div>
                      </td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '12px' }}>
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>${order.total?.toFixed(2)}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ 
                            background: getStatusColor(order.status),
                            color: '#333'
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="timestamp">{formatDate(order.createdAt)}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          style={{ padding: '5px', fontSize: '12px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="jobs-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Menu Items</h2>
            <button className="btn" onClick={() => {
              setShowMenuForm(true);
              setEditingMenuItem(null);
              setMenuForm({ itemId: '', name: '', description: '', price: '', restaurantId: '', category: '' });
            }}>
              + Add Menu Item
            </button>
          </div>

          {showMenuForm && (
            <div className="order-form" style={{ marginBottom: '20px' }}>
              <h3>{editingMenuItem ? 'Edit' : 'Add'} Menu Item</h3>
              <form onSubmit={handleMenuSubmit}>
                <div className="form-group">
                  <label>Item ID *</label>
                  <input
                    type="text"
                    value={menuForm.itemId}
                    onChange={(e) => setMenuForm({ ...menuForm, itemId: e.target.value })}
                    required
                    disabled={!!editingMenuItem}
                    placeholder="pizza-001"
                  />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    required
                    placeholder="Margherita Pizza"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    placeholder="Classic tomato and mozzarella"
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    required
                    placeholder="12.99"
                  />
                </div>
                <div className="form-group">
                  <label>Restaurant ID *</label>
                  <select
                    value={menuForm.restaurantId}
                    onChange={(e) => setMenuForm({ ...menuForm, restaurantId: e.target.value })}
                    required
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map(r => (
                      <option key={r.restaurantId} value={r.restaurantId}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    placeholder="pizza, burger, pasta, etc."
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn">Save</button>
                  <button type="button" className="btn" style={{ background: '#6c757d' }} onClick={() => {
                    setShowMenuForm(false);
                    setEditingMenuItem(null);
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {menuItems.length === 0 ? (
            <div className="loading">No menu items found</div>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Restaurant</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.itemId}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.description || '-'}</td>
                    <td>${item.price?.toFixed(2)}</td>
                    <td>{item.restaurantId}</td>
                    <td>{item.category || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleEditMenu(item)}
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteMenu(item.itemId)}
                        style={{ padding: '5px 10px', fontSize: '12px', background: '#dc3545' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div className="jobs-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Restaurants</h2>
            <button className="btn" onClick={() => {
              setShowRestaurantForm(true);
              setEditingRestaurant(null);
              setRestaurantForm({ restaurantId: '', name: '', description: '', cuisine: '', address: '' });
            }}>
              + Add Restaurant
            </button>
          </div>

          {showRestaurantForm && (
            <div className="order-form" style={{ marginBottom: '20px' }}>
              <h3>{editingRestaurant ? 'Edit' : 'Add'} Restaurant</h3>
              <form onSubmit={handleRestaurantSubmit}>
                <div className="form-group">
                  <label>Restaurant ID *</label>
                  <input
                    type="text"
                    value={restaurantForm.restaurantId}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, restaurantId: e.target.value })}
                    required
                    disabled={!!editingRestaurant}
                    placeholder="rest-001"
                  />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    required
                    placeholder="Pizza Palace"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                    placeholder="Authentic Italian pizza"
                  />
                </div>
                <div className="form-group">
                  <label>Cuisine</label>
                  <input
                    type="text"
                    value={restaurantForm.cuisine}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                    placeholder="Italian"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    placeholder="123 Main St, City"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn">Save</button>
                  <button type="button" className="btn" style={{ background: '#6c757d' }} onClick={() => {
                    setShowRestaurantForm(false);
                    setEditingRestaurant(null);
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {restaurants.length === 0 ? (
            <div className="loading">No restaurants found</div>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Cuisine</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.restaurantId}>
                    <td>{restaurant.restaurantId}</td>
                    <td><strong>{restaurant.name}</strong></td>
                    <td>{restaurant.description || '-'}</td>
                    <td>{restaurant.cuisine || '-'}</td>
                    <td>{restaurant.address || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleEditRestaurant(restaurant)}
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                        style={{ padding: '5px 10px', fontSize: '12px', background: '#dc3545' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
