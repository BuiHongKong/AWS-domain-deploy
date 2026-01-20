# Food Delivery System - MVP

Food delivery platform với 2 service:
- **Customer Service**: Đặt món online
- **Admin Service**: Quản lý đơn hàng, menu, thống kê

## Kiến trúc

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Customer         │────▶│   API        │────▶│  DynamoDB   │
│ Dashboard        │     │  Service     │     │  (Orders,   │
│ (Port 5174)      │     │  (Port 3000) │     │   Menu)     │
└──────────────────┘     └──────────────┘     └─────────────┘
                                ▲                      ▲
                                │                      │
┌──────────────────┐            │                      │
│ Admin            │────────────┘                      │
│ Dashboard        │                                   │
│ (Port 5173)      │         (Admin updates status)    │
└──────────────────┘                                   │
                                                       │
                                                       │
```

## Components

### 1. API Service (`/api`)
**Customer Endpoints:**
- `GET /customer/menu` - Xem menu
- `GET /customer/restaurants` - Xem danh sách nhà hàng
- `POST /customer/orders` - Đặt hàng
- `GET /customer/orders/:orderId` - Theo dõi đơn hàng

**Admin Endpoints:**
- `GET /admin/orders` - Xem tất cả đơn hàng
- `GET /admin/orders/:orderId` - Chi tiết đơn hàng
- `PUT /admin/orders/:orderId/status` - Cập nhật trạng thái
- `GET /admin/stats` - Thống kê
- **Menu Management:**
  - `GET /admin/menu` - Xem tất cả menu items
  - `POST /admin/menu` - Thêm món vào menu
  - `PUT /admin/menu/:itemId` - Cập nhật menu item
  - `DELETE /admin/menu/:itemId` - Xóa menu item
- **Restaurant Management:**
  - `GET /admin/restaurants` - Xem tất cả restaurants
  - `POST /admin/restaurants` - Thêm restaurant
  - `PUT /admin/restaurants/:restaurantId` - Cập nhật restaurant
  - `DELETE /admin/restaurants/:restaurantId` - Xóa restaurant

### 2. Order Processing
- Admin tự update order status qua dashboard
- Không cần worker tự động - đơn giản hóa cho MVP

### 3. Customer Dashboard (`/customer-dashboard`)
- React + Vite (port 5174)
- Browse menu, add to cart, place orders, track status

### 4. Admin Dashboard (`/admin-dashboard`)
- React + Vite (port 5173)
- Quản lý đơn hàng, xem stats, manage menu

## Sample Data

Project includes sample data in `sample-data/` folder:
- `restaurants.json` - 4 sample restaurants
- `menu-items.json` - 19 menu items with images

Xem chi tiết và cách sử dụng trong `sample-data/README.md`

## Local Development

### 1. Setup Database Tables

> **Lưu ý:** Trước khi tạo tables, bạn cần chạy DynamoDB Local. Xem hướng dẫn setup DynamoDB Local ở phần sau.

**Tạo tables với AWS CLI (DynamoDB Local)**

```bash
# Orders table
aws dynamodb create-table \
  --table-name food-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 --region ap-southeast-1

# Menu table
aws dynamodb create-table \
  --table-name food-menu \
  --attribute-definitions AttributeName=itemId,AttributeType=S \
  --key-schema AttributeName=itemId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 --region ap-southeast-1

# Restaurants table
aws dynamodb create-table \
  --table-name restaurants \
  --attribute-definitions AttributeName=restaurantId,AttributeType=S \
  --key-schema AttributeName=restaurantId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 --region ap-southeast-1
```

### 2. Seed Sample Data

**Sử dụng Seed Script (Recommended):**

#### Local với DynamoDB Local

```bash
cd scripts
$env:AWS_REGION="ap-southeast-1"
$env:RESTAURANTS_TABLE="restaurants"
$env:MENU_TABLE="food-menu"
$env:ORDERS_TABLE="food-orders"
$env:AWS_ENDPOINT_URL="http://localhost:8000"
node seed-data.js
```

#### Seed lên AWS DynamoDB (Production/Dev)

```bash
cd scripts
$env:AWS_REGION="ap-southeast-1"
$env:RESTAURANTS_TABLE="fargate-processing-restaurants"
$env:MENU_TABLE="fargate-processing-food-menu"
# KHÔNG set AWS_ENDPOINT_URL để dùng AWS thật
node seed-data.js
```

**Lưu ý:**
- Đảm bảo AWS credentials đã được configure (`aws configure list`)
- Table names: Nếu đã deploy Terraform với `project_name` khác, dùng table names tương ứng
- Để lấy table names từ Terraform: `cd terraform && terraform output`
- Script sẽ import:
  - 4 restaurants (Italian, American, Asian, Japanese)
  - 19 menu items với hình ảnh (pizza, burgers, noodles, sushi, drinks, desserts)

**Xem thêm:** `sample-data/README.md` để biết cách seed data khác hoặc thêm data thủ công.

### 3. Run Services

**Terminal 1 - API:**
```powershell
cd api
npm install
$env:AWS_REGION="ap-southeast-1"
$env:ORDERS_TABLE="food-orders"
$env:MENU_TABLE="food-menu"
$env:RESTAURANTS_TABLE="restaurants"
$env:AWS_ENDPOINT_URL="http://localhost:8000"
npm run dev
```

**Terminal 2 - Customer Dashboard:**
```bash
cd customer-dashboard
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
# Open http://localhost:5174
```

**Terminal 3 - Admin Dashboard:**
```bash
cd admin-dashboard
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
# Open http://localhost:5173
```

## Flow hoạt động

1. **Customer đặt hàng:**
   - Mở http://localhost:5174 (Customer Dashboard)
   - Browse menu, add to cart
   - Điền thông tin, place order
   - Order được tạo với status `pending`

2. **Admin quản lý:**
   - Mở http://localhost:5173 (Admin Dashboard)
   - Xem tất cả orders với status `pending`
   - Update status thủ công: `pending → processing → preparing → ready → delivered`
   - Xem thống kê (total orders, revenue, by status)

**Lưu ý:** Admin tự update status qua dropdown trong dashboard - không cần worker tự động cho MVP

## Order Status Flow

```
pending → processing → preparing → ready → delivered
                                    ↓
                                cancelled
```

- **pending**: Đơn hàng mới tạo
- **processing**: Đang xử lý thanh toán
- **preparing**: Đang chuẩn bị món
- **ready**: Sẵn sàng giao
- **delivered**: Đã giao (admin update)
- **cancelled**: Đã hủy (admin update)

## Database Schema

### Orders Table
```json
{
  "orderId": "order_1234567890_abc",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "deliveryAddress": "123 Main St",
  "restaurantId": "rest-001",
  "items": [
    { "itemId": "pizza-001", "quantity": 2, "name": "Pizza", "price": 12.99 }
  ],
  "total": 25.98,
  "status": "pending",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Menu Table
```json
{
  "itemId": "pizza-001",
  "name": "Margherita Pizza",
  "description": "Classic pizza",
  "price": 12.99,
  "restaurantId": "rest-001",
  "category": "pizza",
  "imageUrl": "https://images.unsplash.com/...",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Restaurants Table
```json
{
  "restaurantId": "rest-001",
  "name": "Pizza Palace",
  "description": "Authentic Italian pizzas with fresh ingredients",
  "cuisine": "Italian",
  "address": "123 Main Street, Singapore",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## Next Steps

1. Add authentication (JWT tokens)
2. Add payment integration
3. Add delivery tracking
4. Add notification system (email/SMS)
5. Add restaurant management
6. Add reviews/ratings
7. Deploy to AWS Fargate
