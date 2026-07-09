terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "me-south-1"
}

variable "environment" {
  default = "staging"
}

variable "project_name" {
  default = "suqya"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-${var.environment}"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true
  db_name              = "suqya"
  username             = "suqya"
  password             = var.db_password
  multi_az             = var.environment == "production"
  skip_final_snapshot  = var.environment != "production"
  backup_retention_period = 35

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

variable "db_password" {
  type      = string
  sensitive = true
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.project_name}-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  tags = {
    Environment = var.environment
  }
}

# S3 for documents/POD
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-${var.environment}-assets"

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "s3_bucket" {
  value = aws_s3_bucket.assets.bucket
}
