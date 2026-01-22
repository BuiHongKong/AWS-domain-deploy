# Dev DynamoDB Setup Guide

Hướng dẫn tạo DynamoDB tables trên AWS cho môi trường development.

## Tạo Tables

```bash
cd terraform-dev
terraform init
terraform apply
```

Khi được hỏi xác nhận, gõ `yes` để tạo tables.

## Xem Table Names

Sau khi apply, xem tên tables:

```bash
terraform output
```

Hoặc xem cụ thể:

```bash
terraform output dev_orders_table_name
terraform output dev_menu_table_name
terraform output dev_restaurants_table_name
```

## Seed Data

Sau khi tạo tables, seed sample data:

```powershell
cd scripts
$env:AWS_REGION="ap-southeast-1"
$env:RESTAURANTS_TABLE="food-delivery-dev-restaurants"
$env:MENU_TABLE="food-delivery-dev-menu"
$env:ORDERS_TABLE="food-delivery-dev-orders"
# KHÔNG set AWS_ENDPOINT_URL (để dùng AWS thật)
node seed-data.js
```

## Chạy API với Dev Tables

```powershell
cd api
$env:AWS_REGION="ap-southeast-1"
$env:ORDERS_TABLE="food-delivery-dev-orders"
$env:MENU_TABLE="food-delivery-dev-menu"
$env:RESTAURANTS_TABLE="food-delivery-dev-restaurants"
# KHÔNG set AWS_ENDPOINT_URL
npm run dev
```

## Xóa Tables (khi không dùng)

```bash
cd terraform-dev
terraform destroy
```

Khi được hỏi xác nhận, gõ `yes` để xóa tables.

## Lưu ý

- Tables sử dụng `PAY_PER_REQUEST` billing mode (on-demand)
- Free tier: 25GB storage + 25 RCU/WCU trong 12 tháng đầu
- Tables được tag với `Environment=dev` để dễ quản lý
- Đảm bảo AWS credentials đã được configure: `aws configure list`
- Thư mục này độc lập với `terraform/` chính, có state riêng

## Table Names

- Orders: `food-delivery-dev-orders`
- Menu: `food-delivery-dev-menu`
- Restaurants: `food-delivery-dev-restaurants`
