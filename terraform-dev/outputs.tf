output "dev_orders_table_name" {
  description = "DynamoDB table name for dev orders"
  value       = aws_dynamodb_table.dev_food_orders.name
}

output "dev_menu_table_name" {
  description = "DynamoDB table name for dev menu"
  value       = aws_dynamodb_table.dev_food_menu.name
}

output "dev_restaurants_table_name" {
  description = "DynamoDB table name for dev restaurants"
  value       = aws_dynamodb_table.dev_restaurants.name
}

output "dev_orders_table_arn" {
  description = "ARN of the dev orders table"
  value       = aws_dynamodb_table.dev_food_orders.arn
}

output "dev_menu_table_arn" {
  description = "ARN of the dev menu table"
  value       = aws_dynamodb_table.dev_food_menu.arn
}

output "dev_restaurants_table_arn" {
  description = "ARN of the dev restaurants table"
  value       = aws_dynamodb_table.dev_restaurants.arn
}
