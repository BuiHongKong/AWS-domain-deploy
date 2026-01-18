# Sample Data for Food Delivery System

Sample data files for testing and development.

## Files

- `restaurants.json` - Sample restaurants data (4 restaurants)
- `menu-items.json` - Sample menu items with images (19 items)

## Data Structure

### Restaurant Format
```json
{
  "restaurantId": "rest-001",
  "name": "Pizza Palace",
  "description": "Authentic Italian pizzas",
  "cuisine": "Italian",
  "address": "123 Main Street, Singapore"
}
```

### Menu Item Format
```json
{
  "itemId": "pizza-001",
  "name": "Margherita Pizza",
  "description": "Classic Italian pizza",
  "price": 12.99,
  "restaurantId": "rest-001",
  "category": "pizza",
  "imageUrl": "https://images.unsplash.com/..."
}
```

## Image Sources

All images use Unsplash URLs with specific dimensions (500x500). Images are:
- Free to use (Unsplash license)
- Optimized for web display
- Can be replaced with your own images later

## Usage

### Option 1: Using Seed Script (Recommended)

```bash
# Local with DynamoDB Local
cd scripts
AWS_REGION=ap-southeast-1 \
RESTAURANTS_TABLE=food-delivery-local-restaurants \
MENU_TABLE=food-delivery-local-menu \
AWS_ENDPOINT_URL=http://localhost:8000 \
node seed-data.js

# Production/Dev with AWS DynamoDB
AWS_REGION=ap-southeast-1 \
RESTAURANTS_TABLE=fargate-processing-restaurants \
MENU_TABLE=fargate-processing-food-menu \
node seed-data.js
```

### Option 2: Using API Endpoints

```bash
# Add restaurants
curl -X POST http://localhost:3000/admin/restaurants \
  -H "Content-Type: application/json" \
  -d @sample-data/restaurants.json

# Add menu items (one by one)
curl -X POST http://localhost:3000/admin/menu \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "pizza-001",
    "name": "Margherita Pizza",
    "price": 12.99,
    "restaurantId": "rest-001",
    "category": "pizza",
    "imageUrl": "https://..."
  }'
```

### Option 3: Manual Import via Admin Dashboard

1. Start API and Admin Dashboard
2. Go to Restaurants tab → Add restaurants one by one
3. Go to Menu tab → Add menu items with image URLs

## Data Summary

- **Restaurants**: 4 (Italian, American, Asian, Japanese)
- **Menu Items**: 19 items
  - Pizza: 4 items
  - Burgers: 4 items
  - Noodles: 4 items
  - Sushi: 4 items
  - Drinks: 3 items
  - Desserts: 2 items

## Notes

- All prices are in USD (can be changed)
- Image URLs point to Unsplash CDN
- Restaurant IDs should match between restaurants.json and menu-items.json
- Categories: pizza, burger, noodle, sushi, drink, dessert
