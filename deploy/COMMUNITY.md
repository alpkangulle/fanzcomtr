# Community release — 26 September 2026

This release changes mobile discovery to continuous horizontal rails: two cards and a visible part of the third on phones, four plus a hint of another on desktop. Cover images link to their entry pages. Artist home pages have real entry and song-title rails. Each public artist route ends in the same existing guest channel for that artist.

The site uses self-hosted DM Sans under the included SIL Open Font License (`public/fonts/OFL.txt`). Spotify Mix is exclusive to Spotify and is not bundled. Before a clean build, run `python3 deploy/prepare-media.py` and `python3 deploy/prepare-fonts.py`.

Membership uses an alias and a password, with no email collection. Registration/login/logout use an HttpOnly, SameSite=Lax cookie, a server-side hashed session token, scrypt password hashing and same-origin checks. Guests can read likes and comments; only logged-in members can change them. A member can remove their own comment; administrators can remove any comment through the DELETE API. Comments are plain text, limited to 600 characters and rate-limited to one every 15 seconds. The 50 most recent comments are shown. Password recovery, email verification and a moderation dashboard are not part of this release.

Migration `004_members_engagement.sql` is additive. `deploy/activate-release.sh` takes a SQLite backup then runs all pending migrations before switching the app. After restart, it checks the new rail and member endpoint; it falls back to the previous code on a failed health check. Additive schema changes remain in the shared database after a code rollback.

QA: copy the live database to a throwaway path, run migration with `DATABASE_PATH=... node deploy/migrate.mjs`, build, start on localhost:3043 with `SITE_ORIGIN=http://127.0.0.1:3043`, then run `DATABASE_PATH=... python3 tests/community-http.py`. The test creates only QA accounts and comments.
