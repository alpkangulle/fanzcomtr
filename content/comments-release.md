# Moderated guest comments and contextual artist discovery

Release: 20260927-comments. Requires one-time migration 014 and activation.

Behavior:
- Engagement dock starts collapsed as a heart button on artist, entry, song and artist section pages.
- Every engagement surface includes an inline comment form and at most five approved comments.
- Guests submit a display name (2–50 characters) and message (1–600 characters). Members use their account name. Both enter pending moderation.
- Approved comments only appear in public lists, counts, artist rankings and social-feed counts.
- All-comments drawer slides up, traps focus, locks background scrolling, closes via Escape/outside click/down button/drag handle, restores opener focus and respects reduced-motion settings.
- Drawer pages through approved comments in batches of 50. No fixed total comment limit.
- Existing member likes remain account-bound. Guest commenting does not create a member account.
- Admin review: /admin/yorumlar, linked from /admin. Pending/approved/rejected filters, pagination, approve/reject/revoke approval. API enforces admin session, same-origin writes and optimistic updated timestamp.
- Rate limits: one comment per 15 seconds and ten per hour per signed-in member or HMAC-hashed guest IP; one SQL statement checks and inserts atomically. Raw IP addresses are not stored in comment rows.
- Existing already-public member comments/likes are copied into the new tables as approved, retaining IDs. Legacy tables remain untouched for additive rollback compatibility.
- Similar artist cards use current site genre metadata, exclude the current artist, and preserve the section. Song detail links lead to other artists' /sarkilar lists; biography links stay /biyografi. Cards sit immediately above the artist chat.

Storage:
page_comments stores optional member_id, guest_name, private actor_key, body, status, timestamps and deleted flag.
page_comment_likes preserves member likes of comments.
approved_page_comments is the filtered public view. Guest data is returned only as public display name after approval; actor_key is never exposed.

Validation:
Production build/type checking passed. Isolated copied-database API/browser tests verify guest and member pending states, approve/reject, hidden public counts, unauthorized admin rejection, same-origin and rate checks, 61-comment pagination, script text escaping, five inline comments, collapsed dock, open/close/Escape/drag and same-section recommendation links. Desktop 1440 and mobile 390 layouts checked for horizontal overflow.
Run tests/comments-qa.mjs only against the isolated localhost QA server and .data/comments-qa.sqlite, with CONTENT_TEST_ONLY=1 and PLAYWRIGHT_MODULE pointing to the installed Playwright module. QA server must use the test-only admin password configured in that script; never configure it in production. Fixture rows are written exclusively to the QA copy.
