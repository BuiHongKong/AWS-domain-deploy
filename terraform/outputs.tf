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

