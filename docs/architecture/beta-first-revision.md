# Beta first revision: data and provider boundaries

## Local data and migration

- The existing `personal-learning-os:beta:v1` localStorage key remains in use. Its payload is migrated from `version: 1` to `version: 2` on load or JSON import. Saved tasks, sessions, questions, reviews, vocabulary, notes, books, resources, finance, health, and goals are preserved. New outline units and arrays are merged by stable ID.
- Study records continue to use `ownerId`. The Beta is browser-local, not account synchronized.
- PDF blobs are stored separately in IndexedDB through `PdfStorageAdapter`; metadata, page positions, and page notes live in the versioned Beta JSON. JSON export **does not include PDF bytes**. Keep original PDFs separately. A JSON import on another browser will show missing-file state until the PDF is imported again.
- PDF page count is entered manually. This build does not claim PDF text extraction, search, AI summarization, or R2 persistence.

## External providers

No provider is configured by default. Route handlers return `configured: false`, and the UI shows a clear empty state. Do not populate these endpoints with generated or unlicensed content.

| Capability | Server-side environment variables | Contract |
| --- | --- | --- |
| Resource discovery | `RESOURCE_SEARCH_API_URL`, optional `RESOURCE_SEARCH_API_KEY` | `GET <url>?q=<query>` returns `{ "items": [{ "title", "summary", "source", "url", "category" }] }` |
| External reading | `READING_FEED_API_URL`, optional `READING_FEED_API_KEY` | `GET <url>?category=<category>` returns `{ "items": [{ "title", "summary", "source", "publishedAt", "url", "category" }] }` |
| Political current affairs | `CURRENT_AFFAIRS_API_URL`, optional `CURRENT_AFFAIRS_API_KEY` | `GET <url>` returns the same dated item shape; source, valid publication date, and HTTPS original URL are required |
| AI action parsing | `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` | OpenAI-compatible chat-completions endpoint supporting JSON-object responses. Its parsed action is validated and shown for confirmation before any browser-local write. |

Provider endpoints and credentials are read by Next.js route handlers only. Do not prefix secrets with `NEXT_PUBLIC_`. The current UI labels discovered resources as unverified third-party links even if a provider claims official status. Source classification needs independent verification before that label can be shown.

Cloudflare Workers environment variables and secrets can be configured in the Workers dashboard. This OpenNext project has `nodejs_compat` and a 2026 compatibility date, so server-side `process.env` is available. See [Cloudflare Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/) and [Workers process compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/).

## Cloud persistence path

- D1 is **not required** for the current browser-local Beta. Future multi-device sync will require authentication and a server-authoritative owner-scoped repository plus migrations; merely binding D1 will not synchronize localStorage.
- R2 is **not required** for same-browser PDF reading. Durable PDF access across devices will require an R2 binding, authenticated upload/download routes, and a migration from IndexedDB blobs. The existing `PdfStorageAdapter` is the local implementation boundary.
- Cloudflare/OpenNext configuration is unchanged. Route handlers are used for optional external providers. No paid resource is provisioned here.

## Content integrity

- The Psychology and Politics outlines are original navigation structures. They are not represented as an official syllabus or complete textbook text. Existing seven concept entries and nine original system practice questions remain labeled as such.
- Subjective questions can be added from a user's own authorized material. Empty chapters state plainly that content has not yet been added.
- News, current affairs, reading feeds, resource results, and AI actions are never generated as sample live data. A provider must return a real source and original HTTPS URL; dated feeds require a publication timestamp.
