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
test -d "$release/.next/cache" || { echo "Next.js önbellek dizini eksik; systemd ReadWritePaths bu yolu gerektirir."; exit 1; }
python3 - "$release/.next/routes-manifest.json" <<'PYSEO'
import json,sys
manifest=json.load(open(sys.argv[1]))
for route in manifest.get('headers',[]):
 if route.get('source')=='/:path*' and any(h['key'].lower()=='x-robots-tag' and 'noindex' in h['value'].lower() for h in route['headers']):
  sys.exit('Bu derleme tüm siteyi noindex yapıyor. SITE_ORIGIN=https://fanz.com.tr ile yeniden derleyin.')
PYSEO
test -f "$release/public/images/artists/semicenk.png"
test -f "$release/public/images/artists/manifest.jpg"
test -f "$release/public/images/artists/blok3.png"
test -f "$release/public/images/artists/burak-bulut.png"
test -f "$release/public/images/artists/sefo.png"
test -f "$release/public/images/albums/sefo-6782922492.jpg"
test -f "$release/public/images/albums/blok3-6773420726.jpg"
test -f "$release/public/images/manifest/zamansizdik.webp"
test -f "$release/public/images/manifest/londra-ovo-arena-afis.jpg"
test -f "$release/public/images/albums/semicenk.jpg"
test -f "$release/public/fonts/dm-sans-latin.woff2"
test -f "$base/shared/runtime.env"
test -f "$base/shared/fans.sqlite"
test -d "$previous"
case "$(readlink "$release/node_modules" 2>/dev/null || true)" in
 "$base/current"|"$base/current/"*) echo 'node_modules bağı current üzerinden kurulmuş; geçişte döngü oluşturur.'; exit 1;;
esac
test -f "$release/node_modules/next/dist/bin/next" || { echo 'Next.js bağımlılığı eksik'; exit 1; }
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
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/import-semicenk.py"
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/import-semicenk-archive.py"
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/import-dynamic-content.py"
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/import-sefo.py"
if [ "$previous" != "$release" ]; then switch_to "$release"; fi
if ! systemctl restart fans-platform.service; then rollback; exit 1; fi
if ! runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" python3 "$release/deploy/import-comment-history.py"; then rollback; exit 1; fi
healthy=false
for attempt in {1..20}; do
 if curl -fs --max-time 2 http://127.0.0.1:3042/api/health | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin);sys.exit(0 if d.get("status")=="ok" and d.get("database")=="ok" else 1)' 2>/dev/null; then healthy=true; break; fi
 sleep 1
done
if [ "$healthy" != true ]; then rollback; exit 1; fi
if ! curl -fsS --max-time 15 "$origin/" | /usr/bin/python3 -c 'import sys;s=sys.stdin.read();sys.exit(0 if "peek-rail" in s and "cover-link" in s else 1)'; then rollback; exit 1; fi
if ! curl -fsS --max-time 15 "$origin/sohbetler" -o /dev/null; then rollback; exit 1; fi
for artist in semicenk blok3 burak-bulut sefo tarkan mabel-matiz manifest sezen-aksu duman hadise ceza; do
 if ! curl -fsS --max-time 15 "$origin/$artist" | python3 -c 'import sys;s=sys.stdin.read();h=[s.find(">"+x+"</h2>") for x in ("Haberler","Konserler","Şarkılar","Albümler")];sys.exit(0 if all(i>=0 for i in h) and h==sorted(h) and "Fan Club Topluluğu" in s else 1)'; then rollback; exit 1; fi
done

if ! curl -fsS --max-time 10 "$origin/api/channels" | /usr/bin/python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if len(d.get("channels",[]))==11 else 1)'; then rollback; exit 1; fi
for path in sefo sefo/biyografi sefo/albumler sefo/haberler sefo/konserler sefo/sarkilar/sipanbabur; do
 if ! curl -fsS --max-time 15 "$origin/$path" -o /dev/null; then rollback; exit 1; fi
done
for path in haberler konserler albumler; do
 if ! curl -fsS --max-time 15 "$origin/semicenk/$path" -o /dev/null; then rollback; exit 1; fi
done
for path in manifest manifest/biyografi manifest/albumler manifest/sarkilar/toz-pembe manifest/konserler/konser-2026-10-16; do
 if ! curl -fsS --max-time 15 "$origin/$path" -o /dev/null; then rollback; exit 1; fi
done
if ! curl -fsS --max-time 15 "$origin/manifest/sarkilar/toz-pembe" | python3 -c 'import sys;s=sys.stdin.read();sys.exit(1 if "noindex" in s or "Manifest" not in s else 0)'; then rollback; exit 1; fi
if ! curl -fsS --max-time 15 "$origin/manifest/albumler/daha-iyi" | python3 -c 'import sys;s=sys.stdin.read();sys.exit(0 if "Yayın ve bağlam" in s and "Manifest arşivinde devam et" in s else 1)'; then rollback; exit 1; fi
for image in zamansizdik.webp londra-ovo-arena-afis.jpg; do
 if ! curl -fsS --max-time 15 "$origin/images/manifest/$image" -o /dev/null; then rollback; exit 1; fi
done


if ! curl -fsS --max-time 5 "$origin/api/member/session" | /usr/bin/python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if "member" in d else 1)'; then rollback; exit 1; fi
curl -fsS --max-time 15 "$origin/sezen-aksu" -o /dev/null
for path in admin/seo indexnow.txt; do
 if ! curl -fsS --max-time 15 "$origin/$path" -o /dev/null; then rollback; exit 1; fi
done
if [ "$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' "$origin/api/admin/seo")" != 401 ]; then rollback; exit 1; fi
if ! curl -fsS --max-time 10 "$origin/robots.txt" | python3 -c 'import sys;s=sys.stdin.read();sys.exit(0 if "Sitemap: https://fanz.com.tr/sitemap.xml" in s and "fans.wai.com.tr" not in s else 1)'; then rollback; exit 1; fi
if ! curl -fsSI --max-time 10 "$origin/semicenk" | python3 -c 'import sys;s=sys.stdin.read().lower();sys.exit(1 if any(line.startswith("x-robots-tag:") and ("noindex" in line or "none" in line) for line in s.splitlines()) else 0)'; then rollback; exit 1; fi
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" /usr/bin/python3 - <<'PYQUOTA'
import json,os,sqlite3
db=sqlite3.connect(os.environ['DATABASE_PATH'])
try:
 db.execute('BEGIN IMMEDIATE')
 value,revision=db.execute('SELECT value,revision FROM seo_config WHERE id=1').fetchone()
 config=json.loads(value)
 if config['dailyLimit']!=180:
  config['dailyLimit']=180
  db.execute('UPDATE seo_config SET value=?,revision=revision+1 WHERE id=1 AND revision=?',(json.dumps(config,ensure_ascii=False,separators=(',',':')),revision))
 db.commit()
 print('Google günlük bildirim sınırı: 180')
except:
 db.rollback()
 raise
finally:
 db.close()
PYQUOTA
runuser -u deploy -- env DATABASE_PATH="$base/shared/fans.sqlite" SITE_ORIGIN="$origin" /home/deploy/.nvm/versions/node/v22.23.2/bin/node "$release/deploy/seo-worker.mjs" >/dev/null 2>&1 &
printf 'Yayında: %s\nÖnceki sürüm: %s\n%s/semicenk\n' "$release" "$previous" "$origin"
