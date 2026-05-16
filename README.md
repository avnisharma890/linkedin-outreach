# LinkedIn Outreach Assistant — Boilerplate

A two-part starter for a lightweight, **manual-review** LinkedIn outreach tool.
You and your teammate fill in the business logic; the wiring is done.

> ⚠️ LinkedIn's ToS forbids automated scraping/messaging. This boilerplate is
> built around manual review + autofill (no auto-send, no bulk). Use at your
> own risk on your own account.

## Stack

| Layer | Choice |
|---|---|
| Web dashboard + APIs | Next.js 14 (App Router, TypeScript) |
| Database | MongoDB + Mongoose |
| State | Zustand |
| Styling | Tailwind CSS |
| AI | OpenRouter (free Gemini/Llama models) |
| Extension | Plasmo (MV3) |
| Deploy | Vercel (web), unpacked install (extension) |

## Folder Structure

```
linkedin-outreach/
├── web/                          # Next.js dashboard + APIs (deploy to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       ├── contacts/route.ts        # POST save / GET list
│   │   │       ├── contacts/check/route.ts  # POST { profileUrl } -> { exists }
│   │   │       └── generate-message/route.ts# POST profile -> { message }
│   │   ├── lib/
│   │   │   ├── mongodb.ts        # cached connection (serverless-safe)
│   │   │   └── openrouter.ts     # AI client
│   │   ├── models/Contact.ts     # Mongoose schema + unique index
│   │   └── store/useOutreachStore.ts
│   ├── .env.example
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── package.json
│
└── extension/                    # Plasmo MV3 extension
    ├── src/
    │   ├── popup.tsx             # Control panel
    │   ├── contents/linkedin.ts  # Content script: scrape + autofill
    │   └── lib/
    │       ├── api.ts            # talks to deployed /api/*
    │       └── filter.ts         # keyword matcher
    ├── .env.example
    ├── tsconfig.json
    └── package.json
```

## Setup

### 1. MongoDB
- Create a free cluster on MongoDB Atlas.
- Whitelist `0.0.0.0/0` (for Vercel) and grab the connection string.

### 2. OpenRouter
- Sign up at https://openrouter.ai, create an API key.
- Free models to try: `google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.2-3b-instruct:free`.

### 3. Web app
```bash
cd web
cp .env.example .env.local        # fill in MONGODB_URI + OPENROUTER_API_KEY
npm install
npm run dev                       # http://localhost:3000
```

Deploy:
```bash
vercel                            # set env vars in Vercel dashboard
```

### 4. Extension
```bash
cd extension
cp .env.example .env              # set PLASMO_PUBLIC_API_BASE to your Vercel URL
npm install
npm run dev                       # loads build/chrome-mv3-dev
```

Load in Chrome:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `extension/build/chrome-mv3-dev`

For a production build: `npm run build` → load `build/chrome-mv3-prod`.

## Flow

```
LinkedIn search page
    │
    ▼
[Scan] (content script) → scrape visible profile cards
    │
    ▼
filter by keywords (student, b.tech, full stack, mern, frontend, backend)
    │
    ▼
POST /api/contacts/check → skip if profileUrl already in DB
    │
    ▼
POST /api/generate-message → OpenRouter → personalized message
    │
    ▼
[Fill Message] → autofill LinkedIn's compose box (user reviews + sends manually)
    │
    ▼
POST /api/contacts → save { profileUrl, name, headline, messageSent:true, sentAt }
```

## Safety Defaults (already wired)

- Random 3–8s delay between per-profile actions (`extension/src/lib/api.ts:withJitter`)
- No auto-send — extension only **fills** the message box
- Hard cap of 20 profiles per scan batch (`MAX_BATCH` in content script)
- Duplicate guard via unique index on `profileUrl`

## What's left for you

Search for `// TODO:` in the code. Hot spots:
- DOM selectors in `extension/src/contents/linkedin.ts` (LinkedIn changes these often)
- Auth on the web APIs (currently open — add NextAuth or a shared secret header)
- Better dashboard metrics + reply tracking
- Prompt tuning in `web/src/lib/openrouter.ts`

## Future improvements

- Reply detection via LinkedIn notification scraping
- CSV export of contacts
- A/B testing different message templates
- Rate-limit middleware on the API
- Per-user accounts (NextAuth + Mongo adapter)
