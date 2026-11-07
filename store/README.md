# Store listing placeholders

Arabic-first listing copy stubs for Google Play and App Store Connect.  
**Replace `REPLACE_*` URLs before submission.** These are not live listings.

| App | Folders |
|-----|---------|
| Customer (سقيا) | `customer/en-US`, `customer/ar` |
| Driver (سقيا سائق) | `driver/en-US`, `driver/ar` |

Also prepare (owner-hosted, not in this folder):

- Privacy policy (AR + EN) covering PDPL rights — see `docs/security/security-policy.md`
- Support email / delete-account URL (Play + Apple requirement)
- Screenshots: Arabic UI preferred for SA storefront

**Hosting note (2026-11-07):** no public privacy/support HTTPS URLs are checked in yet. Listing files still say `REPLACE_SUPPORT_URL`. Host pages outside the app binary (static site / docs domain), then replace placeholders. Step 5 vendor wiring: [`docs/deployment/vendor-keys-staging.md`](../docs/deployment/vendor-keys-staging.md).
