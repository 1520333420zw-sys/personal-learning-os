# Beta first revision: data and provider boundaries

## Local data and migration

- The existing `personal-learning-os:beta:v1` localStorage key remains in use. Payloads from `version: 1` or `version: 2` migrate to `version: 3` on load or JSON import. Saved tasks, sessions, attempts, wrong questions, reviews, vocabulary, notes, books, resources, finance, health, and goals are preserved. Stable IDs join new content with existing progress. The migration check includes an old note, a task, and a content-pack progress round trip.
- System content is authored in versioned content-pack modules. Packaged knowledge and question text is reconstructed from the app bundle; the local data key stores only personal overlays such as notes and mastery for packaged points, plus the user's own records. Pack versions are recorded in `contentPacks`. A future pack release should add new stable IDs and update `contentVersion` without changing a point's identity.
- `planningProfile` stores the user's exam goal, daily capacity, per-day shift/energy overrides, priorities, and rest preferences. AI-generated tasks carry `sourceType: "ai"`; only tasks explicitly marked `planningControl: "adjustable"` may be moved by an AI proposal. Manual and locked tasks remain in place.
- Study records continue to use `ownerId`. The Beta is browser-local, not account synchronized.
- PDF blobs are stored separately in IndexedDB through `PdfStorageAdapter`; metadata, page positions, and page notes live in the versioned Beta JSON. JSON export **does not include PDF bytes**. Keep original PDFs separately. A JSON import on another browser will show missing-file state until the PDF is imported again.
- PDF page count is entered manually. This build does not claim PDF text extraction, search, AI summarization, or R2 persistence.

## External providers

Open Library book discovery is available without a key. The other providers below are not configured by default. Their route handlers return `configured: false`, and the UI shows a clear empty state. Do not populate these endpoints with generated or unlicensed content.

| Capability | Server-side environment variables | Contract |
| --- | --- | --- |
| Resource discovery | `RESOURCE_SEARCH_API_URL`, optional `RESOURCE_SEARCH_API_KEY` | `GET <url>?q=<query>` returns `{ "items": [{ "title", "summary", "source", "url", "category" }] }` |
| External reading | `READING_FEED_API_URL`, optional `READING_FEED_API_KEY` | `GET <url>?category=<category>` returns `{ "items": [{ "title", "summary", "source", "publishedAt", "url", "category" }] }` |
| Political current affairs | `CURRENT_AFFAIRS_API_URL`, optional `CURRENT_AFFAIRS_API_KEY` | `GET <url>` returns the same dated item shape; source, valid publication date, and HTTPS original URL are required |
| AI action parsing | `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` | OpenAI-compatible chat-completions endpoint supporting JSON-object responses. Its parsed action is validated and shown for confirmation before any browser-local write. |
| AI study planning | Same `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` | `POST /api/ai-plan` accepts a bounded profile and study summary. It returns only validated add/move changes within available daily minutes. The browser shows a preview; confirmation writes local tasks. No delete operation is supported. |
| Book discovery | No secret; `OpenLibraryBookProvider` | `GET /api/books/search?q=...` fetches live metadata from Open Library Search API. Search topics act as book-list queries; only returned works are shown. A failed request shows an error, never fabricated books. |

Provider endpoints and credentials are read by Next.js route handlers only. Do not prefix secrets with `NEXT_PUBLIC_`. The current UI labels discovered resources as unverified third-party links even if a provider claims official status. Source classification needs independent verification before that label can be shown.

The Beta has no login, so its AI routes are publicly callable if deployed on a public Worker. **Do not add a metered AI key to the public deployment yet.** First place the site behind an owner-only access gate (for example Cloudflare Access) or add server-side authentication and rate limiting. This is an operational prerequisite for safely enabling AI, not something a hidden client key can solve.

Cloudflare Workers environment variables and secrets can be configured in the Workers dashboard. This OpenNext project has `nodejs_compat` and a 2026 compatibility date, so server-side `process.env` is available. See [Cloudflare Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/) and [Workers process compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/).

## Cloud persistence path

- D1 is **not required** for the current browser-local Beta. Future multi-device sync will require authentication and a server-authoritative owner-scoped repository plus migrations; merely binding D1 will not synchronize localStorage.
- R2 is **not required** for same-browser PDF reading. Durable PDF access across devices will require an R2 binding, authenticated upload/download routes, and a migration from IndexedDB blobs. The existing `PdfStorageAdapter` is the local implementation boundary.
- Cloudflare/OpenNext configuration is unchanged. Route handlers are used for optional external providers. No paid resource is provisioned here.

## Content integrity

- The 312 Psychology and Politics content packs add introductory learning explanations and one authored choice and short-answer practice item per major chapter. Their scope is a foundation, **not** a complete official syllabus or textbook. The app labels auto-derived high-yield items as `System priority`; no past-paper frequency is claimed. The `ExamPoint` model reserves AI-assisted and source-backed classifications for future verifiable inputs.
- Universal Learning currently has 13 subject-specific introductory paths with four knowledge points and one original choice question each. Its math, physics, chemistry, biology, computer-science, economics and other paths use different explanatory blocks. This is a foundation content pack, not a full university-level curriculum. The existing question-attempt, wrong-question, recitation, and review flows are reused.
- System recitation cards for the 312/Politics pack are added once per content-pack version. Personal recitation ratings and scheduling remain in the browser-local store. PDF remains optional; no system learning path requires an upload.
- Current AI planning needs the same server-side AI provider as action parsing. Without those secrets the profile and manual task planner work, while the AI plan control clearly reports the missing service. The deterministic plan validator is not represented as an AI generator.
- News, current affairs, reading feeds, resource results, and AI actions are never generated as sample live data. A provider must return a real source and original HTTPS URL; dated feeds require a publication timestamp.
