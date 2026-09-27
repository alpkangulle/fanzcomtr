#!/usr/bin/env bash
set -euo pipefail
if [ "$EUID" -ne 0 ]; then echo 'Yayın için yönetici yetkisi gerekli.'; exit 1; fi
release="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
bash "$release/deploy/activate-release.sh"
(cd "$release" && runuser -u deploy -- env DATABASE_PATH=/home/deploy/fans/shared/fans.sqlite SITE_ORIGIN=https://fanz.com.tr /home/deploy/.nvm/versions/node/v22.23.2/bin/node deploy/enable-image-optimization.mjs)
curl -fsS --max-time 20 -H 'Accept: image/webp' -D - 'https://fanz.com.tr/images/artists/semicenk.png?w=640' -o /dev/null | python3 -c 'import sys;s=sys.stdin.read().lower();sys.exit(0 if "content-type: image/webp" in s else "Görsel optimizasyonu kontrolü başarısız; uygulama yayında ancak görsel ayarını kontrol edin.")'
echo 'İkon, iç bağlantılar ve hız paketi yayında.'
