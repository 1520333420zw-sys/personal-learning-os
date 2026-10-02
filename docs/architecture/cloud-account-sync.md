# Cloud account and multi-device sync

## Source of truth

After an account is connected, the versioned D1 `cloud_state` snapshot is the durable source of truth. `BetaState` in the browser remains the offline working copy and is the only state consumed by product UI. Content packs remain code-owned; only user overlays and user-created records are stored in the snapshot.

Existing browser data is uploaded unchanged when the user creates an account. Signing in on another device downloads the snapshot and then uses stable entity IDs, entity `updatedAt` values, deletion tombstones, and an optimistic cloud revision to merge concurrent edits.

## Account security

- The browser generates a 256-bit recovery key.
- D1 stores only its SHA-256 digest.
- Login exchanges the recovery key for a random, hashed server session.
- The browser receives only an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- Mutating endpoints also require a same-origin request.
- Existing GPT Action, external inbox, mirror, and scoped secrets are independent from the account session.

There is no email recovery in this personal-account version. Losing the recovery key means losing the ability to connect a new device, so the UI tells the user to keep it in a password manager.

## Backups

D1 keeps an automatic backup before every cloud state update and retains the latest 20 restore points. Users can also create a manual restore point. Restoring a backup creates a new revision rather than rewriting history in place. JSON export/import remains available as an independent offline backup.

## Required migration

Apply `migrations/0003_cloud_account.sql` to the existing `personal-learning-os-inbox` D1 database before using account APIs. It only creates new tables and indexes; it does not modify the external inbox or learning mirror tables.
