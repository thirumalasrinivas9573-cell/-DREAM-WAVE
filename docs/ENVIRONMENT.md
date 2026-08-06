# Dream Wave AI Environment Guide

`server/.env.example` is the canonical key list. Never commit `.env`, provider credentials, private keys, database URIs, or local AI/editor configuration.

## Required in production

- `NODE_ENV=production`
- `MONGODB_URL`: TLS MongoDB URI using a least-privilege application user.
- `JWT_SECRET`: independently generated high-entropy secret, minimum 32 bytes.
- `AUTH_CHALLENGE_SECRET`: different high-entropy secret for challenge hashing.
- `CLIENT_URL`: exact primary SPA origin.
- `PUBLIC_APP_URL`: exact public site origin.
- `COOKIE_REFRESH_ONLY=true`
- `TRUST_PROXY=true` behind Render or another reverse proxy.

## Authentication delivery

- `RESEND_API_KEY`
- `EMAIL_FROM`: verified sender identity.
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

Production validation fails fast when required authentication delivery configuration is absent.

## Optional integrations

- `OPENAI_API_KEY`: required for AI mentor, lessons, summaries, reports, and roadmap generation.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: required when payments are enabled.
- `MJ_API_KEY`: optional service-to-service protection for `/api/mj`.
- `EXTRA_CORS_ORIGINS`: comma-separated trusted preview origins only.
- `STUDENT_ASSET_ROOT`: persistent storage path for profile assets.

## Token and cookie tuning

- `JWT_ACCESS_TTL` defaults to a short access lifetime.
- `JWT_REFRESH_TTL_MS` and `JWT_REFRESH_TTL_SHORT_MS` control remembered and short sessions.
- `REFRESH_COOKIE_NAME` defaults to `dw_refresh`.

Do not reuse JWT, challenge, provider, or database secrets between development, staging, and production.

## Client build

- `VITE_API_URL`: optional absolute API base ending in `/api`. Omit for same-origin/proxied `/api`.
- Netlify uses Node `20.19.0` and must set its base directory to `client`.

Vite variables are public at build time. Never place secrets in `VITE_*`.

## Secret rotation policy

Rotate immediately after suspected exposure, staff access changes, or provider alerts. Rotation sequence:

1. Create a new credential in the provider.
2. Update the deployment secret store.
3. deploy and verify health/authentication.
4. Revoke the old credential.
5. Purge exposed values from git history and invalidate affected sessions when relevant.

See `docs/SECURITY_RELEASE_BLOCKERS.md` before any Version 1 deployment.
