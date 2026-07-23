aws_region  = "me-south-1"
environment = "staging"

# db_password = "<set via TF_VAR_db_password or -var>"

domain_name = "api.staging.suqya.com"

# Smaller footprint for staging
db_instance_class    = "db.t3.medium"
db_allocated_storage = 100
redis_node_type      = "cache.t3.micro"

eks_desired_size = 2
eks_min_size     = 1
eks_max_size     = 4
