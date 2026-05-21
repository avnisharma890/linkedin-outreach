# Production Deploy Guideline

This guide describes how to deploy and validate the **LinkedIn Outreach Assistant** in a production-like setup with safe defaults.

> ⚠️ Important: LinkedIn policies may restrict scraping and automated workflows. Keep usage manual-review-first (no auto-send), and use responsibly.

---

## 1) Architecture and hosting

- **Web app + APIs**: Deploy `web/` on **Vercel**.
- **Database**: Use **MongoDB Atlas**.
- **LLM provider**: Use **OpenRouter** API key with model fallback policy.
- **Browser extension**: Build from `extension/` (Plasmo MV3), then load packed/unpacked into Chrome.

---

## 2) Pre-deploy checklist

### Source control
- Ensure your branch is clean and merged from latest main/staging.
- Confirm all TODO-critical modules are reviewed (`mongodb.ts`, `openrouter.ts`, content script selectors).

### Required secrets
Prepare these values before deployment:

- `MONGODB_URI`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (recommended explicit model value)
- `API_SHARED_SECRET` (used by extension request header)

### Recommended security hardening (before public usage)
- Restrict MongoDB Atlas network access to known IP ranges if possible.
- Rotate API keys regularly.
- Add API rate limiting and stricter auth policy.
- Add monitoring/alerting for API error spikes and DB connection failures.

---

## 3) Deploy web app (Vercel)

### Step A — Project import
1. Create/import project in Vercel from repository.
2. Set root directory to `web`.

### Step B — Environment variables (Vercel Project Settings)
Add:

- `MONGODB_URI=<atlas-uri>`
- `OPENROUTER_API_KEY=<openrouter-key>`
- `OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free` (or your chosen model)
- `API_SHARED_SECRET=<shared-secret>`

### Step C — Build settings
- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output: default Next.js output

### Step D — Deploy and smoke test
After deploy, verify:

- `GET /` dashboard loads.
- `POST /api/contacts/check` returns auth/validation-compliant response.
- `POST /api/generate-message` handles valid + invalid payloads.
- `POST /api/contacts` writes successfully to Atlas.

---

## 4) Configure and build extension

### Step A — Extension env
In `extension/.env` set:

- `PLASMO_PUBLIC_API_BASE=https://<your-vercel-domain>`
- `PLASMO_PUBLIC_API_KEY=<same API_SHARED_SECRET>`

### Step B — Build
```bash
cd extension
npm install
npm run build
```

For local QA use `npm run dev` and load unpacked dev build.

### Step C — Chrome load
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select:
   - Dev: `extension/build/chrome-mv3-dev`
   - Prod: `extension/build/chrome-mv3-prod`

---

## 5) End-to-end production validation

Run on an active LinkedIn search/results page:

1. Click **Connect LinkedIn** in popup (connection handshake).
2. Click **Scan Profiles**.
3. Verify matching list appears.
4. Click **Generate Messages**.
5. Use **Fill Message** on a profile (manual review before send).
6. Confirm contact persisted in dashboard table.
7. Re-run same profile to ensure duplicate check skips it.

Expected behavior:
- No auto-send action should occur.
- Duplicate profile URL should be skipped.
- Message generation failures should be visible but non-fatal to batch.

---

## 6) Operational runbook

### If extension cannot connect to LinkedIn
- Ensure active tab URL starts with `https://www.linkedin.com/`.
- Reload LinkedIn tab and retry connection.
- Re-open popup to refresh extension state.

### If scraping returns zero unexpectedly
- LinkedIn DOM may have changed.
- Update selectors in `extension/src/contents/linkedin.ts` with fallback selectors.

### If API calls fail (401/403)
- Verify `PLASMO_PUBLIC_API_KEY` equals deployed `API_SHARED_SECRET`.
- Confirm Vercel env variables are set in the active environment.

### If message generation fails
- Check OpenRouter quota/model availability.
- Validate `OPENROUTER_API_KEY` and configured model.

### If contacts are not saved
- Validate MongoDB connectivity from web deployment logs.
- Verify schema/index constraints and payload format.

---

## 7) Recommended production improvements (next)

1. Add robust retry + exponential backoff for extension API client.
2. Add API rate-limit middleware on web endpoints.
3. Add centralized error telemetry (request id + structured logs).
4. Strengthen request validation and typed error envelopes across APIs.
5. Add automated E2E smoke test for Scan → Generate → Save flow.

---

## 8) Release checklist (copy/paste)

- [ ] Vercel env vars configured and verified
- [ ] Atlas connection validated in production logs
- [ ] OpenRouter key + model validated
- [ ] Extension API base points to production URL
- [ ] Extension API key matches shared secret
- [ ] LinkedIn handshake passes in popup
- [ ] Scan + generate + fill flow works
- [ ] Duplicate check works
- [ ] Dashboard reflects saved contacts
- [ ] Security review completed (auth/rate limit/logging)
