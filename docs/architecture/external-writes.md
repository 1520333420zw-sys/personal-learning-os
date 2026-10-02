# ChatGPT external writes

The public website keeps the user's existing Beta data in that browser. A remote API cannot directly change another browser's localStorage. This feature therefore stores validated actions in a D1 inbox. The owner opens Home → ChatGPT external writes, enters a separate browser sync secret, reviews an action, and imports it. Import writes through the existing Beta state migration and storage path, without replacing existing arrays. Export/import JSON includes the receipt ledger.

## Cloudflare setup

1. Create a D1 database named `personal-learning-os-inbox` in Cloudflare. Add a Worker binding named `EXTERNAL_INBOX_DB` to this Worker, using the real D1 database ID in `wrangler.jsonc` under `d1_databases` before CLI deployment. For Git-connected deployment, configure the same binding in the Cloudflare Worker settings and keep the repository deployment configuration aligned; never commit a fabricated database ID.
2. Apply `migrations/0001_external_writes.sql` to that D1 database before enabling the endpoint. With Wrangler: `pnpm exec wrangler d1 migrations apply EXTERNAL_INBOX_DB --remote` after the binding has been added. Do not run a remote migration against an unintended database.
3. Keep the existing `EXTERNAL_WRITE_TOKEN`, `EXTERNAL_READ_TOKEN`, and `EXTERNAL_SYNC_TOKEN` as distinct Worker secrets. Add a fourth distinct secret of at least 32 characters named `GPT_ACTION_TOKEN`. It is the only credential entered in the unified private GPT Action. `EXTERNAL_SYNC_TOKEN` remains browser-only. Do not put any token in source code, OpenAPI, browser bundles, instructions, screenshots, or support logs. Existing `AI_API_*` settings are unrelated.
4. Redeploy the Worker after changing bindings or secrets. A missing binding or secret returns HTTP 503; unauthorized requests return HTTP 401. The endpoint never falls back to in-memory storage.

## Configure ChatGPT

GPT Builder rejects two Action configurations for the same domain and supplies one authentication setting for an Action. Use one private Action with `/chatgpt-personal-learning-os.openapi.yaml`. In the GPT editor select **Authentication → API Key → Bearer** and enter `GPT_ACTION_TOKEN`. The unified schema declares `listLearningCatalog`, `queueLearningWrite`, `revokeLearningWrite`, `getLearningSummary`, `listRecentStudySessions`, and `listLearningTasks`.

The gateway credential is deliberately separate from all scoped credentials. Server routes accept it only after verifying that it is at least 32 characters and differs from the write, read, and browser-sync tokens. Existing scoped schemas and tokens remain supported for regression and non-GPT clients, but the GPT Builder should import only the unified schema.

Suggested GPT instruction: “Convert the user's statement into one or more explicit actions supported by this schema. Ask for missing essential facts; do not invent dates, minutes, sources, URLs or question IDs. Call listLearningCatalog for subject/chapter/question IDs. For each independent action generate a UUID Idempotency-Key and reuse that same key on retries. Before calling queueLearningWrite, show the structured action to the user and obtain confirmation. After the API succeeds, say it is queued for import; do not claim browser data has changed. On a correction, call revokeLearningWrite with the returned receipt ID.”

Example: `今天学习了30分钟普通心理学` → `{ "type":"study_session", "date":"<user-local YYYY-MM-DD>", "durationMinutes":30, "sessionType":"learning", "subjectId":"subject-psychology-312", "chapterId":"psych-general" }`. `做错了5道心理学选择题` can be recorded as a practice study session with `incorrectCount:5` when no question IDs are known; individual wrong-book entries require a real `questionId` from the catalog. A count alone must not fabricate five question records.

## Safety and rollback

- The API accepts one of five strict action types, validates ranges and dates, limits request size, authenticates before parsing, and uses a unique `(owner_id, idempotency_key)` D1 constraint. Repeating the same request returns the same receipt; reusing its key with different data returns 409.
- The scoped write token can queue or revoke, the scoped read token can query the learning mirror, and the browser sync token can synchronize browser data. The dedicated GPT gateway token can invoke only the six documented GPT operations; it cannot list the private inbox, acknowledge imports, upload the browser mirror, or access the browser sync session endpoint. None is publicly embedded in the site.
- The owner can reject before import. After import, the receipt ledger records precisely which new local entities were created, so “Undo local import” removes only those entities. Deleting a receipt through the API after import requests rollback; the owner confirms it in the browser. Changes made to an imported entity after import will also be removed by undo.
- A local write is saved before the server receives an acknowledgement. If acknowledgement fails, the same receipt can be retried without a second local entity. Export personal data JSON before major corrections. D1 stores commands and audit status, not the full existing browser profile.
- This is single-owner access. The `owner_id` database column and token separation leave room for future per-user authentication. This release does not synchronize full browser data across devices.
