terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    # Configure per environment:
    # bucket = "suqya-terraform-state"
    # key    = "staging/terraform.tfstate"
    # region = "me-south-1"
    # dynamodb_table = "suqya-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  name_prefix = local.name_prefix
  vpc_cidr    = var.vpc_cidr
  aws_region  = var.aws_region
  tags        = local.common_tags
}

# ---------------------------------------------------------------------------
# EKS
# ---------------------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  name_prefix         = local.name_prefix
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  node_instance_types = local.eks_node_instance_types
  desired_size        = local.eks_desired_size
  min_size            = local.eks_min_size
  max_size            = local.eks_max_size
  tags                = local.common_tags
}

# ---------------------------------------------------------------------------
# RDS — PostgreSQL 16 (PostGIS enabled via migration CREATE EXTENSION)
# ---------------------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]
  db_password                = var.db_password
  instance_class             = local.db_instance_class
  allocated_storage          = local.db_allocated_storage
  multi_az                   = local.is_production
  skip_final_snapshot        = !local.is_production
  backup_retention_period    = local.is_production ? 35 : 7
  tags                       = local.common_tags
}

# ---------------------------------------------------------------------------
# ElastiCache — Redis 7 for BullMQ
# ---------------------------------------------------------------------------
module "elasticache" {
  source = "./modules/elasticache"

  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]
  node_type                  = local.redis_node_type
  num_cache_nodes            = local.is_production ? 2 : 1
  tags                       = local.common_tags
}

# ---------------------------------------------------------------------------
# S3 — documents / POD assets
# ---------------------------------------------------------------------------
module "s3" {
  source = "./modules/s3"

  name_prefix       = local.name_prefix
  enable_versioning = local.is_production
  tags              = local.common_tags
}

# ---------------------------------------------------------------------------
# ALB — public ingress for API
# ---------------------------------------------------------------------------
module "alb" {
  source = "./modules/alb"

  name_prefix       = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  certificate_arn   = var.certificate_arn
  tags              = local.common_tags
}

# ---------------------------------------------------------------------------
# Secrets Manager — app + database credentials
# ---------------------------------------------------------------------------
module "secrets" {
  source = "./modules/secrets"

  name_prefix  = local.name_prefix
  db_host      = module.rds.address
  db_port      = module.rds.port
  db_name      = module.rds.db_name
  db_username  = "suqya"
  db_password  = var.db_password
  redis_host   = module.elasticache.primary_endpoint
  redis_port   = module.elasticache.port
  s3_bucket    = module.s3.bucket_name
  tags         = local.common_tags
}
