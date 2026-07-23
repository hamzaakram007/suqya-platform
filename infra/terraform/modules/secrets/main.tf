resource "random_password" "jwt" {
  count   = var.jwt_secret == "" ? 1 : 0
  length  = 64
  special = false
}

locals {
  jwt_secret = var.jwt_secret != "" ? var.jwt_secret : random_password.jwt[0].result

  database_url = "postgresql://${var.db_username}:${var.db_password}@${var.db_host}:${var.db_port}/${var.db_name}?schema=public"

  secret_payload = {
    DATABASE_URL = local.database_url
    REDIS_HOST   = var.redis_host
    REDIS_PORT   = tostring(var.redis_port)
    JWT_SECRET   = local.jwt_secret
    S3_BUCKET    = var.s3_bucket
    NODE_ENV     = "production"
  }
}

resource "aws_secretsmanager_secret" "app" {
  name                    = "${var.name_prefix}/app"
  description             = "Application secrets for ${var.name_prefix}"
  recovery_window_in_days = var.recovery_window_in_days

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id     = aws_secretsmanager_secret.app.id
  secret_string = jsonencode(local.secret_payload)
}

resource "aws_secretsmanager_secret" "db" {
  name                    = "${var.name_prefix}/database"
  description             = "Database credentials for ${var.name_prefix}"
  recovery_window_in_days = var.recovery_window_in_days

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = var.db_host
    port     = var.db_port
    dbname   = var.db_name
    engine   = "postgres"
  })
}
