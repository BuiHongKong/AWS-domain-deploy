variable "aws_region" {
  description = "AWS region for DynamoDB tables"
  type        = string
  default     = "ap-southeast-1"
}

variable "table_prefix" {
  description = "Prefix for table names (for local testing)"
  type        = string
  default     = "food-delivery-local"
}
