output "secret_arn" {
  value = aws_secretsmanager_secret.app.arn
}

output "secret_name" {
  value = aws_secretsmanager_secret.app.name
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db.arn
}
