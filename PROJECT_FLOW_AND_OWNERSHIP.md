# Project Flow, Ownership Split, and Execution Plan

## Contributors
- **vansh**
- **avni**

## Equal ownership (8 modules each)

### vansh owns (8)
1. `web/src/app/page.tsx`
2. `web/src/app/layout.tsx`
3. `web/src/app/globals.css`
4. `web/src/store/useOutreachStore.ts`
5. `web/src/app/api/contacts/route.ts`
6. `web/src/app/api/contacts/check/route.ts`
7. `web/src/app/api/generate-message/route.ts`
8. `web/src/app/api/_auth.ts`

### avni owns (8)
1. `web/src/lib/mongodb.ts`
2. `web/src/lib/openrouter.ts`
3. `web/src/models/Contact.ts`
4. `extension/src/popup.tsx`
5. `extension/src/contents/linkedin.ts`
6. `extension/src/lib/api.ts`
7. `extension/src/lib/filter.ts`
8. `PROJECT_FLOW_AND_OWNERSHIP.md`

---

## Who does what (clear task list)

### vansh — UI and API workflow tasks
- Add sorting and basic filters to the dashboard table (`name`, `sent`, `replied`).
- Implement proper loading, empty, and API error states in the dashboard UI.
- Improve `useOutreachStore` with a robust fetch lifecycle (loading/error/reset).
- Add pagination support to `/api/contacts` GET (`limit`, `cursor`, or `page`).
- Strengthen input validation for `/api/contacts` POST (required fields and sanitization).
- Improve profile URL normalization logic in `/api/contacts/check`.
- Add request validation and fallback response policy in `/api/generate-message`.
- Standardize shared-secret documentation and unauthorized error responses in `/_auth`.

### avni — extension runtime and platform tasks
- Make LinkedIn scraper selectors resilient (fallback selectors and guards).
- Make `MAX_BATCH` and rate-safety controls configurable for easier tuning.
- Improve extension popup UX: per-profile progress, skipped/retried badges.
- Add request retry with backoff in `extension/src/lib/api.ts` (safe retry rules).
- Make keyword configuration extensible in `extension/src/lib/filter.ts`.
- Improve error observability in the Mongo connection layer.
- Improve model fallback and timeout handling in the OpenRouter wrapper.
- Review Contact model indexes (`profileUrl` unique + useful secondary indexes).

---

## Joint checklist (both contributors)
1. Verify environment setup: both web and extension run locally.
2. Run the end-to-end flow:
   - Scan → duplicate check → generate message → fill → save contact → dashboard reflects.
3. Test API error scenarios (missing key, invalid payload, DB unavailable).
4. Run selector regression checks whenever LinkedIn UI changes.
5. Hold a weekly sync for completed tasks, blockers, and updated task split.

---

## End-to-end flow
1. The extension popup triggers **Scan Profiles**.
2. The content script scrapes visible LinkedIn profile cards.
3. Filter logic selects matching candidates.
4. The extension calls `/api/contacts/check` to skip duplicates.
5. The extension calls `/api/generate-message` to create personalized drafts.
6. The user clicks **Fill Message** (manual send only).
7. The extension calls `/api/contacts` to save the contact.
8. The dashboard fetches `/api/contacts` and displays stats and contact list.

---

## Header TODO rule (already applied in source files)
`TODO(owner: <vansh|avni>; collaborator: <avni|vansh>)`

- **Owner**: implementation and final PR changes.
- **Collaborator**: integration review, overflow support, and test verification.
