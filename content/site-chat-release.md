# Shared artist layouts, profile follows and chat directory

Release: 20260927-site-chat

- Generalize Semicenk's cover sizing, page heading and desktop navigation fixes to all eight artists.
- Improve biography text and heading contrast across artists.
- Remove follow navigation from desktop/mobile menus. Redirect /takip to /profil#takipler.
- Show and remove followed artists and fans inside the owner's profile; guests can manage their browser-bound artist follows.
- Add idempotent remove actions to both existing follow endpoints. Synchronize the legacy browser list when an artist is removed.
- Add /sohbetler with a read-only /api/channels directory. Ranking uses distinct message authors in the last 24 hours, then non-deleted message count, then current presence (65 seconds), then artist name. Refresh every 30 seconds; opening the directory does not join every room.
- Share links open the selected artist channel directly. Full-screen Radix dialog supports keyboard dismissal, a minimize button and downward touch gesture; a minimized button reopens the room.
- Preserve existing channel identity, messaging, moderation and guest support. Embedded desktop input no longer activates the mobile-only expanded state.
- Add the directory to sitemap and deployment health checks.

Validation: production build and TypeScript passed. Full browser audit covered 187 public routes at 1440 and 390 px. No horizontal overflow, cover-height mismatch, desktop navigation/content overlap or browser exceptions. Missing guest-profile H1 was fixed and checked again in a targeted audit. Tested direct channel links, menu links, fullscreen dimensions, keyboard/button/swipe minimize and reopening, sharing URL, artist and member unfollow with repeated remove requests, and absence of follow resurrection.

QA uses only .data/site-chat-qa.sqlite, copied from production. Test accounts and browser activity remain in that disposable database. No schema migration is needed for this release.

Activate as root:
bash /home/deploy/fans/releases/20260927-site-chat/deploy/activate-release.sh

The existing activation script backs up production data, applies existing migrations/seeds, restarts the service and rolls back the code symlink if health checks fail.
