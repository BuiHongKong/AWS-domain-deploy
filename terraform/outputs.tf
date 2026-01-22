output "ecr_api_repository_url" {
  description = "ECR repository URL for API service"
  value       = aws_ecr_repository.api.repository_url
}


output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "api_url" {
  description = "API endpoint URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for job executions"
  value       = aws_dynamodb_table.job_executions.name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "api_service_name" {
  description = "ECS service name for API"
  value       = aws_ecs_service.api.name
}

# Dev DynamoDB outputs
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
