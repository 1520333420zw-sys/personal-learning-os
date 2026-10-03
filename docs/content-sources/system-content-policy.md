# System learning content policy

Personal Learning OS content packs contain original summaries and original practice written to teach stable introductory concepts. They do not reproduce a commercial textbook, question bank, or paid course.

The October 2026 core pack expands the authored 312 Psychology and Politics material while keeping every entry concise enough to review and extend. It remains a curated foundation rather than a claim to reproduce a complete commercial curriculum. The 13 universal-subject paths are introductory foundations and are deliberately reported as incomplete until each discipline receives a separately reviewed pack.

## Labels

- `系统内容`: an authored explanation or learning structure.
- `系统重点`: an editorial priority based on conceptual importance, not past-paper frequency.
- `系统练习`: an original exercise with `sourceType=system` and `isOfficial=false`.
- `真题/official`: reserved for material with a recorded, verifiable source. No current system-generated item uses this label.

## Source categories

The structure follows broadly taught disciplinary categories and standard public terminology. Current-affairs facts, copyrighted article text, exam-frequency counts, official years, and quotations are not inferred or fabricated. Live current affairs continue to require a configured provider with source, publication time, and original URL.

## Content updates

Every shipped pack has a manifest containing a pack ID, version, locale, subject, publication date, and checksum label. Pack text is code-owned. Personal notes, favorites, mastery, attempts, mistakes, recitation history, and review scheduling remain user-owned overlays and survive pack upgrades.

Large immutable packs are loaded by subject from `public/content/` and are not copied into cloud state. Only stable-ID progress overlays are included in local backup and cloud synchronization.
