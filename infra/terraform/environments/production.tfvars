aws_region  = "me-south-1"
environment = "production"

# db_password = "<set via TF_VAR_db_password or -var>"

domain_name = "api.suqya.com"

# Production sizing
db_instance_class    = "db.r6g.large"
db_allocated_storage = 200
redis_node_type      = "cache.r6g.large"

eks_desired_size = 3
eks_min_size     = 3
eks_max_size     = 6

# certificate_arn = "arn:aws:acm:me-south-1:ACCOUNT:certificate/UUID"
