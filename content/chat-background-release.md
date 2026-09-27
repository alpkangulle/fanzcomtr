# Mobile input focus and artist chat backgrounds

Release: 20260927-chat-background

All visible input, textarea, select and editable controls use at least 16px text on mobile widths and coarse-pointer devices, avoiding small-control automatic focus magnification while retaining user-controlled pinch zoom. No restrictive maximum-scale or user-scalable viewport flags were added.

ArtistChannel sets its background from the existing artistMedia map. Both embedded and directory fullscreen chats share this component. The message panel carries the photo, a dark gradient and dark message surfaces for readable text. A source/license link points to the artist gallery.

VisualViewport resize updates the chat height so fullscreen composition fits a reduced keyboard viewport. The listener ignores manually zoomed scales and is removed on unmount.

Validation: production webpack build and TypeScript passed. Isolated SQLite browser checks covered forms on eight routes, computed minimum text sizes, focus scale, eight distinct channel photos, reduced viewport composer visibility and minimize. Desktop/mobile screenshots were reviewed. These are browser-emulation checks; a physical iOS keyboard was not available.

Activate as root:
bash /home/deploy/fans/releases/20260927-chat-background/deploy/activate-release.sh

No migration or content changes are introduced. Existing deployment backups and rollback checks remain in place.
