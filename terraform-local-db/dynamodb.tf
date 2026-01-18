# DynamoDB table for food orders
resource "aws_dynamodb_table" "food_orders" {
  name         = "${var.table_prefix}-orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = {
    Name = "food-orders-local"
  }
}

# DynamoDB table for menu items
resource "aws_dynamodb_table" "food_menu" {
  name         = "${var.table_prefix}-menu"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "itemId"

  attribute {
    name = "itemId"
    type = "S"
  }

  tags = {
    Name = "food-menu-local"
  }
}

# DynamoDB table for restaurants
resource "aws_dynamodb_table" "restaurants" {
  name         = "${var.table_prefix}-restaurants"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "restaurantId"

  attribute {
    name = "restaurantId"
    type = "S"
  }

  tags = {
    Name = "restaurants-local"
  }
}
