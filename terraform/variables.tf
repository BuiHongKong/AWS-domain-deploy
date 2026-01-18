variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "fargate-processing"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "api_image_tag" {
  description = "Docker image tag for API service"
  type        = string
  default     = "latest"
}


variable "api_cpu" {
  description = "CPU units for API Fargate task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "Memory for API Fargate task (in MB)"
  type        = number
  default     = 512
}


variable "api_desired_count" {
  description = "Desired number of API service tasks"
  type        = number
  default     = 1
}


variable "vpc_id" {
  description = "VPC ID where resources will be deployed (leave empty to create new VPC)"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "Subnet IDs for Fargate tasks (leave empty to use default subnets)"
  type        = list(string)
  default     = []
}
