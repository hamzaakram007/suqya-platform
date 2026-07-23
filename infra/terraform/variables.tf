variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "me-south-1"
}

variable "environment" {
  description = "Deployment environment (staging | production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "suqya"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = null
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = null
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = null
}

variable "eks_node_instance_types" {
  description = "EC2 instance types for EKS managed node group"
  type        = list(string)
  default     = null
}

variable "eks_desired_size" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = null
}

variable "eks_min_size" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = null
}

variable "eks_max_size" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = null
}

variable "domain_name" {
  description = "Primary domain for ALB ingress (e.g. api.suqya.com)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener (optional)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags applied to all resources"
  type        = map(string)
  default     = {}
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )

  is_production = var.environment == "production"

  db_instance_class      = coalesce(var.db_instance_class, local.is_production ? "db.r6g.large" : "db.t3.medium")
  db_allocated_storage   = coalesce(var.db_allocated_storage, local.is_production ? 200 : 100)
  redis_node_type        = coalesce(var.redis_node_type, local.is_production ? "cache.r6g.large" : "cache.t3.micro")
  eks_node_instance_types = coalesce(var.eks_node_instance_types, local.is_production ? ["m6i.large"] : ["t3.medium"])
  eks_desired_size       = coalesce(var.eks_desired_size, local.is_production ? 3 : 2)
  eks_min_size           = coalesce(var.eks_min_size, local.is_production ? 3 : 1)
  eks_max_size           = coalesce(var.eks_max_size, local.is_production ? 6 : 4)
}
