# Regulatory Compliance Matrix

## ZATCA E-Invoicing (Fatoora)

| Requirement | Implementation | Priority |
|-------------|----------------|----------|
| Phase 1 generation | UBL 2.1 XML + PDF/A-3 with embedded XML | P0 |
| Phase 2 integration | Fatoora API clearance (B2B) / 24h report (B2C) | P0 |
| QR code on invoices | TLV-encoded QR on all tax invoices | P0 |
| Cryptographic stamping | Certified EGS device/solution | P0 |
| UUID per invoice | Generated server-side, immutable | P0 |
| Simplified vs standard invoice | Auto-detect by customer type (B2C/B2B) | P0 |

## VAT

| Requirement | Implementation |
|-------------|----------------|
| 15% VAT on taxable supplies | Pricing engine adds VAT line items |
| VAT number on supplier profiles | CR + VAT validation workflow |
| VAT reports | Monthly VAT return export |

## PDPL (Personal Data Protection Law)

| Requirement | Implementation |
|-------------|----------------|
| Consent collection | Onboarding consent + granular preferences |
| Data residency | AWS me-south-1 (Bahrain) primary |
| Right to access/delete | Self-service data export + deletion request |
| Breach notification | Incident playbook, 72h notification process |
| Purpose limitation | Privacy policy per data category |
| DPA with processors | Moyasar, Unifonic, Google, AWS |

## Commercial Registration

| Requirement | Implementation |
|-------------|----------------|
| Supplier CR verification | Document upload + manual/auto verification |
| VAT certificate expiry alerts | Document vault with expiry notifications |
| Water quality certificates | Supplier document management with alerts |

## Saudi Address Standards

| Requirement | Implementation |
|-------------|----------------|
| National Address (SPL) fields | Building number, street, district, city, postal code |
| Short address code | Optional SPL integration |
| Hijri calendar | Credit due dates, report date pickers |
