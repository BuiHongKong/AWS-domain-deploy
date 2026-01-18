# DynamoDB table for job execution metadata

resource "aws_dynamodb_table" "job_executions" {
  name           = "${var.project_name}-job-executions"
  billing_mode   = "PAY_PER_REQUEST" # On-demand pricing, scales automatically
  hash_key       = "jobId"

  attribute {
    name = "jobId"
    type = "S"
  }

  # Global Secondary Index for querying by status and timestamp
  global_secondary_index {
    name            = "StatusTimestampIndex"
    hash_key        = "status"
    range_key       = "startTime"
    projection_type = "ALL"
  }

  # Enable point-in-time recovery for production safety
  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-job-executions"
    Environment = var.environment
  }
}

# DynamoDB table for food orders

resource "aws_dynamodb_table" "food_orders" {
  name         = "${var.project_name}-food-orders"
  billing_mode = "PAY_PER_REQUEST"
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

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-food-orders"
    Environment = var.environment
  }
}

# DynamoDB table for menu items

resource "aws_dynamodb_table" "food_menu" {
  name         = "${var.project_name}-food-menu"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "itemId"

  attribute {
    name = "itemId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-food-menu"
    Environment = var.environment
  }
}

# DynamoDB table for restaurants

resource "aws_dynamodb_table" "restaurants" {
  name         = "${var.project_name}-restaurants"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "restaurantId"

  attribute {
    name = "restaurantId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-restaurants"
    Environment = var.environment
  }
}
