# ECS Service for API (always running)

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = local.subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }

  # Prevent tasks from being replaced too quickly
  deployment_configuration {
    minimum_healthy_percent = 50
    maximum_percent         = 200
  }

  # Enable automatic task replacement if health check fails
  health_check_grace_period_seconds = 60

  depends_on = [
    aws_lb_listener.api
  ]

  tags = {
    Name        = "${var.project_name}-api-service"
    Environment = var.environment
  }
}
