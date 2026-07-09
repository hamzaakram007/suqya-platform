# Entity Relationship Diagram

Database: PostgreSQL 16 + PostGIS extension

## dbdiagram.io Notation

```dbml
// Multi-tenancy
Table tenants {
  id uuid [pk]
  name varchar
  mode varchar [note: 'marketplace|private|franchise']
  parent_tenant_id uuid [ref: > tenants.id]
  status varchar
  created_at timestamp
}

Table tenant_settings {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  key varchar
  value jsonb
}

Table branches {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  name varchar
  city_id uuid
  location geography
}

// Identity
Table users {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  phone varchar [unique]
  email varchar
  role varchar
  status varchar
  created_at timestamp
}

Table user_profiles {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  name_ar varchar
  name_en varchar
  national_id varchar
  preferred_language varchar
  avatar_url varchar
}

Table roles {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  name varchar
  slug varchar
}

Table permissions {
  id uuid [pk]
  slug varchar [unique]
  description varchar
}

Table role_permissions {
  role_id uuid [ref: > roles.id]
  permission_id uuid [ref: > permissions.id]
}

Table sessions {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  refresh_token_hash varchar
  device_id uuid
  expires_at timestamp
}

Table devices {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  fcm_token varchar
  platform varchar
  last_seen_at timestamp
}

Table audit_logs {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  user_id uuid
  action varchar
  entity_type varchar
  entity_id uuid
  metadata jsonb
  created_at timestamp
}

// Geography
Table countries {
  id uuid [pk]
  code varchar [unique]
  name_ar varchar
  name_en varchar
}

Table regions {
  id uuid [pk]
  country_id uuid [ref: > countries.id]
  name_ar varchar
  name_en varchar
}

Table cities {
  id uuid [pk]
  region_id uuid [ref: > regions.id]
  name_ar varchar
  name_en varchar
}

Table districts {
  id uuid [pk]
  city_id uuid [ref: > cities.id]
  name_ar varchar
  name_en varchar
}

Table delivery_zones {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  name varchar
  boundary geography
  city_id uuid [ref: > cities.id]
}

Table addresses {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  label varchar
  building_number varchar
  street varchar
  district_id uuid [ref: > districts.id]
  city_id uuid [ref: > cities.id]
  postal_code varchar
  short_address varchar
  location geography
  is_default boolean
}

// Catalog
Table tank_sizes {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  capacity_liters int
  name_ar varchar
  name_en varchar
  is_active boolean
}

Table water_types {
  id uuid [pk]
  name_ar varchar
  name_en varchar
  is_potable boolean
}

Table water_sources {
  id uuid [pk]
  supplier_id uuid
  name varchar
  location geography
  water_type_id uuid [ref: > water_types.id]
}

Table quality_certificates {
  id uuid [pk]
  supplier_id uuid
  water_source_id uuid [ref: > water_sources.id]
  document_url varchar
  issued_at date
  expires_at date
}

// Fleet
Table suppliers {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  user_id uuid [ref: > users.id]
  company_name varchar
  commercial_registration varchar
  vat_number varchar
  status varchar
  operating_area geography
}

Table supplier_documents {
  id uuid [pk]
  supplier_id uuid [ref: > suppliers.id]
  type varchar
  document_url varchar
  expires_at date
}

Table trucks {
  id uuid [pk]
  supplier_id uuid [ref: > suppliers.id]
  plate_number varchar
  capacity_liters int
  status varchar
}

Table truck_maintenance {
  id uuid [pk]
  truck_id uuid [ref: > trucks.id]
  type varchar
  scheduled_at date
  completed_at date
  cost decimal
  notes text
}

Table drivers {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  user_id uuid [ref: > users.id]
  supplier_id uuid [ref: > suppliers.id]
  license_number varchar
  status varchar
  is_online boolean
  last_location geography
  performance_score decimal
}

Table driver_documents {
  id uuid [pk]
  driver_id uuid [ref: > drivers.id]
  type varchar
  document_url varchar
  expires_at date
}

Table driver_shifts {
  id uuid [pk]
  driver_id uuid [ref: > drivers.id]
  started_at timestamp
  ended_at timestamp
}

Table driver_locations {
  id uuid [pk]
  driver_id uuid [ref: > drivers.id]
  location geography
  recorded_at timestamp
}

// Pricing
Table pricing_rules {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  name varchar
  rule_type varchar
  base_price decimal
  is_active boolean
}

Table pricing_rule_conditions {
  id uuid [pk]
  pricing_rule_id uuid [ref: > pricing_rules.id]
  condition_type varchar
  condition_value jsonb
}

Table coupons {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  code varchar
  discount_type varchar
  discount_value decimal
  expires_at timestamp
}

// Orders
Table orders {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  customer_id uuid [ref: > users.id]
  supplier_id uuid [ref: > suppliers.id]
  driver_id uuid [ref: > drivers.id]
  address_id uuid [ref: > addresses.id]
  tank_size_id uuid [ref: > tank_sizes.id]
  status varchar
  payment_type varchar
  total_amount decimal
  vat_amount decimal
  sla_type varchar
  scheduled_at timestamp
  created_at timestamp
}

Table order_status_history {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  status varchar
  actor_id uuid
  notes text
  created_at timestamp
}

Table order_assignments {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  driver_id uuid [ref: > drivers.id]
  offered_at timestamp
  responded_at timestamp
  response varchar
}

Table order_tracking_points {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  location geography
  recorded_at timestamp
}

Table proof_of_delivery {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  photo_url varchar
  signature_url varchar
  otp_verified boolean
  delivered_at timestamp
}

Table order_disputes {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  raised_by uuid
  reason text
  status varchar
  resolution text
}

// Payments & Credit
Table transactions {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  order_id uuid [ref: > orders.id]
  amount decimal
  method varchar
  status varchar
  gateway_ref varchar
  created_at timestamp
}

Table wallets {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  balance decimal
  currency varchar
}

Table wallet_ledger {
  id uuid [pk]
  wallet_id uuid [ref: > wallets.id]
  amount decimal
  type varchar
  reference_id uuid
  created_at timestamp
}

Table credit_accounts {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  customer_id uuid [ref: > users.id]
  credit_limit decimal
  outstanding_balance decimal
  status varchar
  approved_by uuid
}

Table credit_transactions {
  id uuid [pk]
  credit_account_id uuid [ref: > credit_accounts.id]
  amount decimal
  type varchar
  due_date date
  created_at timestamp
}

// Billing & Accounting
Table invoices {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  order_id uuid [ref: > orders.id]
  invoice_number varchar
  type varchar
  subtotal decimal
  vat_amount decimal
  total decimal
  zatca_status varchar
  pdf_url varchar
  issued_at timestamp
}

Table invoice_lines {
  id uuid [pk]
  invoice_id uuid [ref: > invoices.id]
  description varchar
  quantity decimal
  unit_price decimal
  vat_rate decimal
  total decimal
}

Table invoice_zatca_submissions {
  id uuid [pk]
  invoice_id uuid [ref: > invoices.id]
  submission_type varchar
  zatca_uuid varchar
  qr_code text
  response jsonb
  submitted_at timestamp
}

Table journal_entries {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  reference_type varchar
  reference_id uuid
  description text
  posted_at timestamp
}

Table journal_lines {
  id uuid [pk]
  journal_entry_id uuid [ref: > journal_entries.id]
  account_id uuid [ref: > chart_of_accounts.id]
  debit decimal
  credit decimal
}

Table chart_of_accounts {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  code varchar
  name_ar varchar
  name_en varchar
  account_type varchar
}

// Operations
Table notifications {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  channel varchar
  title varchar
  body text
  read_at timestamp
  created_at timestamp
}

Table support_tickets {
  id uuid [pk]
  tenant_id uuid [ref: > tenants.id]
  user_id uuid [ref: > users.id]
  subject varchar
  status varchar
  created_at timestamp
}

Table ratings {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  rater_id uuid
  rated_id uuid
  score int
  comment text
}

Table recurring_orders {
  id uuid [pk]
  customer_id uuid [ref: > users.id]
  frequency varchar
  next_delivery_at timestamp
  is_active boolean
}
```

## Key Indexes

```sql
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status, created_at DESC);
CREATE INDEX idx_drivers_location ON drivers USING GIST(last_location);
CREATE INDEX idx_delivery_zones_boundary ON delivery_zones USING GIST(boundary);
CREATE INDEX idx_credit_accounts_customer ON credit_accounts(customer_id, status);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_driver_locations_time ON driver_locations(driver_id, recorded_at DESC);
```

## Relationships Summary

- `tenants` 1:N `users`, `orders`, `suppliers`, `pricing_rules`
- `users` 1:1 `user_profiles`, 1:N `addresses`, `orders` (as customer)
- `suppliers` 1:N `trucks`, `drivers`, `water_sources`
- `orders` 1:N `order_status_history`, `order_assignments`, `order_tracking_points`
- `orders` 1:1 `proof_of_delivery`, 1:N `transactions`, `invoices`
- `credit_accounts` 1:N `credit_transactions`
- `journal_entries` 1:N `journal_lines` → `chart_of_accounts`
