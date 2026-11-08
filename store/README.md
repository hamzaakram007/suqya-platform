# Store listing copy

Arabic-first listing copy for Google Play and App Store Connect (Customer + Driver).

| App | Folders |
|-----|---------|
| Customer (سقيا) | `customer/en-US`, `customer/ar` |
| Driver (سقيا سائق) | `driver/en-US`, `driver/ar` |

## Public HTTPS pages (legal-web)

Hosted by `apps/legal-web` on Vercel project **`suqya-legal`** (SSO/Vercel Auth **off** so store reviewers can open pages).

| Page | Arabic (default) | English |
|------|------------------|---------|
| Privacy | https://suqya-legal.vercel.app/privacy | https://suqya-legal.vercel.app/en/privacy |
| Support / account deletion | https://suqya-legal.vercel.app/support | https://suqya-legal.vercel.app/en/support |

**Contact email for listings:** `support@suqya.sa`

Also prepare before public launch:

- Screenshots: Arabic UI preferred for SA storefront  
- Upload-signed AAB (Play) / IPA (TestFlight on macOS) — see [`docs/deployment/publish-surfaces.md`](../docs/deployment/publish-surfaces.md)

### Redeploy legal pages

```bash
# After merge to the branch linked on the Vercel project:
npx vercel deploy --prod --yes --local-config vercel.legal.json
# Or: Vercel dashboard → suqya-legal → Redeploy
```
