# DynamoDB tables for Development Environment
# 
# This creates standalone DynamoDB tables for local development
# Usage: cd terraform-dev && terraform init && terraform apply

# DynamoDB table for food orders (dev)
resource "aws_dynamodb_table" "dev_food_orders" {
  name         = "food-delivery-dev-orders"
  billing_mode = "PAY_PER_REQUEST" # On-demand pricing, no need to specify capacity
  hash_key     = "orderId"

  attribute {
    name = "orderId"
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
    Name        = "food-delivery-dev-orders"
    Environment = "dev"
    Purpose     = "Local development"
  }
}

# DynamoDB table for menu items (dev)
resource "aws_dynamodb_table" "dev_food_menu" {
  name         = "food-delivery-dev-menu"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "itemId"

  attribute {
    name = "itemId"
    type = "S"
  }

  tags = {
    Name        = "food-delivery-dev-menu"
    Environment = "dev"
    Purpose     = "Local development"
  }
}

# DynamoDB table for restaurants (dev)
resource "aws_dynamodb_table" "dev_restaurants" {
  name         = "food-delivery-dev-restaurants"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "restaurantId"

  attribute {
    name = "restaurantId"
    type = "S"
  }

  tags = {
    Name        = "food-delivery-dev-restaurants"
    Environment = "dev"
    Purpose     = "Local development"
  }
}
