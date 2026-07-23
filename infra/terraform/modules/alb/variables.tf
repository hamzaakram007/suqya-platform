variable "name_prefix" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "certificate_arn" {
  type    = string
  default = ""
}

variable "health_check_path" {
  type    = string
  default = "/v1/tenants/public"
}

variable "tags" {
  type    = map(string)
  default = {}
}
