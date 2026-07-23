variable "name_prefix" {
  type = string
}

variable "enable_versioning" {
  type    = bool
  default = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
