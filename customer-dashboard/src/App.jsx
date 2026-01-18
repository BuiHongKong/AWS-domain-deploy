/**
 * Customer Dashboard - Food Delivery Ordering App
 * 
 * Features:
 * - Browse menu items
 * - Add items to cart
 * - Place orders
 * - Track order status
 */

import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [menu, setMenu] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [orderTracking, setOrderTracking] = useState(null);

  useEffect(() => {
    fetchMenu();
    fetchRestaurants();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_URL}/customer/menu`);
      const data = await response.json();
      setMenu(data.items || []);
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/customer/restaurants`);
      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.itemId === item.itemId);
    if (existingItem) {
      setCart(cart.map(c => 
        c.itemId === item.itemId 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => 
        c.itemId === itemId ? { ...c, quantity } : c
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!customerName || !customerPhone) {
      setError('Please fill in your name and phone number');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setError(null);
      const orderItems = cart.map(c => ({
        itemId: c.itemId,
        quantity: c.quantity,
        name: c.name,
        price: c.price
      }));

      const response = await fetch(`${API_URL}/customer/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          items: orderItems,
          restaurantId: cart[0]?.restaurantId || 'default'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOrderPlaced(data.order);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      setError('Failed to place order');
      console.error(err);
    }
  };

  const trackOrder = async () => {
    if (!orderPlaced?.orderId) return;

    try {
      const response = await fetch(`${API_URL}/customer/orders/${orderPlaced.orderId}`);
      const data = await response.json();
      setOrderTracking(data.order);
    } catch (err) {
      console.error('Failed to track order:', err);
    }
  };

  useEffect(() => {
    if (orderPlaced) {
      trackOrder();
      const interval = setInterval(trackOrder, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [orderPlaced]);

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🍕 Food Delivery</h1>
        <p>Order delicious food online</p>
      </div>

      {error && <div className="error">{error}</div>}
      {orderPlaced && (
        <div className="success">
          Order placed! Order ID: {orderPlaced.orderId}
          {orderTracking && (
            <div style={{ marginTop: '10px' }}>
              Status: <span className={`status-badge ${orderTracking.status}`}>
                {orderTracking.status}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        <div>
          <h2>Menu</h2>
          <div className="menu-grid">
            {menu.map(item => (
              <div key={item.itemId} className="menu-item" onClick={() => addToCart(item)}>
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0',
                      marginBottom: '10px'
                    }}
                  />
                )}
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="price">${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="order-form">
              <h2>Order Details</h2>
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="123 Main St, City"
                />
              </div>
            </div>
          )}
        </div>

        <div className="cart">
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#666' }}>Your cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.itemId} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      style={{ marginRight: '5px', padding: '5px 10px' }}
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      style={{ padding: '5px 10px' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <button className="btn" onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
