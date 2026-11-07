output "primary_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "port" {
  value = aws_elasticache_replication_group.redis.port
}

output "security_group_id" {
  value = aws_security_group.redis.id
}

output "replication_group_id" {
  value = aws_elasticache_replication_group.redis.id
}
