# Local DynamoDB Setup for Food Delivery

Chỉ tạo DynamoDB tables cần thiết để test project local.

## Tables Created

- `food-delivery-local-orders` - Lưu đơn hàng
- `food-delivery-local-menu` - Lưu menu items
- `food-delivery-local-restaurants` - Lưu thông tin nhà hàng

## Usage

### 1. Tạo tables

```bash
cd terraform-local-db
terraform init
terraform plan
terraform apply
```

### 2. Lấy table names

```bash
terraform output
```

### 3. Set environment variables để chạy API

```bash
# Windows PowerShell
$env:ORDERS_TABLE = $(terraform output -raw orders_table_name)
$env:MENU_TABLE = $(terraform output -raw menu_table_name)
$env:RESTAURANTS_TABLE = $(terraform output -raw restaurants_table_name)
$env:AWS_REGION = "ap-southeast-1"

# Linux/Mac
export ORDERS_TABLE=$(terraform output -raw orders_table_name)
export MENU_TABLE=$(terraform output -raw menu_table_name)
export RESTAURANTS_TABLE=$(terraform output -raw restaurants_table_name)
export AWS_REGION=ap-southeast-1
```

### 4. Chạy API

```bash
cd ../api
npm run dev
```

## Cleanup

Để xóa tables sau khi test:

```bash
cd terraform-local-db
terraform destroy
```

## Lưu ý

- Tables dùng `PAY_PER_REQUEST` billing mode (on-demand)
- Tables chỉ được tạo trên AWS DynamoDB thật (không phải DynamoDB Local)
- Để dùng DynamoDB Local, tạo tables bằng AWS CLI thay vì Terraform
