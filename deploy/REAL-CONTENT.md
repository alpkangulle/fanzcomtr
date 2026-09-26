# Reviewed editorial selection — 26 September 2026

Eight artist photographs with attribution/licence in `lib/artist-media.json`.
Eight official Apple catalogue records in `deploy/real-content`.
Eight album-release archive news items and eight concert announcements.
Tarkan, Sezen Aksu and Manifest concert records are past announcements, not claims that the events occurred.
Song lyrics are not copied; track titles link to the official music service.

Before building a clean checkout, run `python3 deploy/prepare-media.py` to download the 16 images into public/images. Then run `npm run build`.
The source URLs, credits and album metadata are versioned; downloaded image binaries remain in the deployment release.

Run `DATABASE_PATH=/path/to/test.sqlite python3 deploy/seed-real.py` on a copied database first.
The transaction deletes demo-prefixed entries, inserts the reviewed selection, preserves unrelated content and enriches the existing Semicenk EP's missing cover/track list. It creates a mode-0600 backup before writing.
A second run must not duplicate entries.
Verify with `DATABASE_PATH=/path/to/test.sqlite python3 tests/real-content-http.py` against the QA server on port 3043.

Activate with the root-run `deploy/activate-release.sh`; the remote connector cannot restart the privileged production service. The activation script applies the seed only after the new app health check succeeds. Backups are retained in the shared database directory.
