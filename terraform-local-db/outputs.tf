output "orders_table_name" {
  description = "Food orders table name"
  value       = aws_dynamodb_table.food_orders.name
}

output "menu_table_name" {
  description = "Food menu table name"
  value       = aws_dynamodb_table.food_menu.name
}

output "restaurants_table_name" {
  description = "Restaurants table name"
  value       = aws_dynamodb_table.restaurants.name
}
