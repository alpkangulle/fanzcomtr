#!/usr/bin/env bash
set -euo pipefail
if [ "$EUID" -ne 0 ]; then echo 'Bu geçiş systemd servisini yeniden başlatmak için yönetici yetkisi gerektirir.'; exit 1; fi
release="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
case "$release" in /home/deploy/fans/releases/*) ;; *) echo 'Beklenmeyen sürüm yolu'; exit 1;; esac
base=/home/deploy/fans
origin="$(sed -n 's/^SITE_ORIGIN=//p' "$base/shared/runtime.env" | tail -1)"
case "$origin" in https://fans.wai.com.tr|https://fanz.com.tr) ;; *) echo 'SITE_ORIGIN geçersiz'; exit 1;; esac
previous="$(readlink -f "$base/current")"
test -f "$release/.next/BUILD_ID"
test -f "$base/shared/runtime.env"
test -f "$base/shared/fans.sqlite"
test -d "$previous"
exec 9>"$base/shared/deploy.lock"
flock -n 9 || { echo 'Başka bir yayın işlemi sürüyor.'; exit 1; }
switch_to() {
 ln -s "$1" "$base/current.next"
 mv -Tf "$base/current.next" "$base/current"
}
rollback() {
 echo 'Sağlık kontrolü başarısız; önceki sürüme dönülüyor.'
 switch_to "$previous"
 systemctl restart fans-platform.service
}
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/backup-db.py"
(cd "$release" && runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" /home/deploy/.nvm/versions/node/v22.23.2/bin/node deploy/migrate.mjs)
if [ "$previous" != "$release" ]; then switch_to "$release"; fi
if ! systemctl restart fans-platform.service; then rollback; exit 1; fi
healthy=false
for attempt in {1..20}; do
 if curl -fs --max-time 2 http://127.0.0.1:3042/api/health | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin);sys.exit(0 if d.get("status")=="ok" and d.get("database")=="ok" else 1)' 2>/dev/null; then healthy=true; break; fi
 sleep 1
done
if [ "$healthy" != true ]; then rollback; exit 1; fi
if ! curl -fsS --max-time 15 "$origin/" | /usr/bin/python3 -c 'import sys;s=sys.stdin.read();sys.exit(0 if "peek-rail" in s and "cover-link" in s else 1)'; then rollback; exit 1; fi
for path in haberler konserler albumler; do
 if ! curl -fsS --max-time 15 "$origin/semicenk/$path" -o /dev/null; then rollback; exit 1; fi
done
if ! curl -fsS --max-time 5 "$origin/api/member/session" | /usr/bin/python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if "member" in d else 1)'; then rollback; exit 1; fi
curl -fsS --max-time 15 "$origin/sezen-aksu" -o /dev/null
printf 'Yayında: %s\nÖnceki sürüm: %s\n%s/semicenk\n' "$release" "$previous" "$origin"
