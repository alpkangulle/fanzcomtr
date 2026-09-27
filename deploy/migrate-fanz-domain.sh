#!/usr/bin/env bash
set -Eeuo pipefail

if [ "$EUID" -ne 0 ]; then echo 'Alan adı geçişi için root yetkisi gerekli.'; exit 1; fi
base=/home/deploy/fans
release="$base/releases/20260927-fanz-domain"
env_file="$base/shared/runtime.env"
new_site=/etc/nginx/sites-available/fanz.com.tr
old_site=/etc/nginx/sites-available/fans.wai.com.tr
previous="$(readlink -f "$base/current")"
test -f "$release/.next/BUILD_ID"
test -f "$env_file"
test -f "$old_site"
test -d "$previous"
test "$(dig +short A fanz.com.tr | tail -1)" = 157.173.122.198
test "$(dig +short A www.fanz.com.tr | tail -1)" = 157.173.122.198
exec 9>"$base/shared/deploy.lock"
flock -n 9 || { echo 'Başka bir yayın işlemi sürüyor.'; exit 1; }

backup="$(mktemp -d "$base/shared/domain-backup.XXXXXXXX")"
chmod 700 "$backup"
cp -a "$env_file" "$backup/runtime.env"
cp -a "$old_site" "$backup/old-nginx"
if [ -e "$new_site" ]; then cp -a "$new_site" "$backup/new-nginx"; fi
had_new_link=false
if [ -L /etc/nginx/sites-enabled/fanz.com.tr ]; then had_new_link=true; fi
rollback(){
 echo 'Geçiş başarısız; önceki servis ve Nginx yapılandırmasına dönülüyor.'
 cp -a "$backup/runtime.env" "$env_file"
 cp -a "$backup/old-nginx" "$old_site"
 if [ -f "$backup/new-nginx" ]; then cp -a "$backup/new-nginx" "$new_site"; else rm -f "$new_site"; fi
 if [ "$had_new_link" = false ]; then rm -f /etc/nginx/sites-enabled/fanz.com.tr; fi
 ln -sfn "$previous" "$base/current.next"
 mv -Tf "$base/current.next" "$base/current"
 nginx -t && systemctl reload nginx || true
 systemctl restart fans-platform.service || true
}
trap rollback ERR

cat > "$new_site" <<'NGINX'
server {
 listen 80;
 listen [::]:80;
 server_name fanz.com.tr www.fanz.com.tr;
 location /.well-known/acme-challenge/ { root /var/www/fans-acme; }
 location / { return 302 https://fans.wai.com.tr$request_uri; }
}
NGINX
ln -sfn "$new_site" /etc/nginx/sites-enabled/fanz.com.tr
nginx -t
systemctl reload nginx
certbot certonly --webroot -w /var/www/fans-acme --cert-name fanz.com.tr -d fanz.com.tr -d www.fanz.com.tr --non-interactive --agree-tos --register-unsafely-without-email

write_new_site(){
 local robots_header="$1"
 cat > "$new_site" <<NGINX
server {
 listen 80;
 listen [::]:80;
 server_name fanz.com.tr www.fanz.com.tr;
 location /.well-known/acme-challenge/ { root /var/www/fans-acme; }
 location / { return 301 https://fanz.com.tr\$request_uri; }
}
server {
 listen 443 ssl;
 listen [::]:443 ssl;
 server_name www.fanz.com.tr;
 ssl_certificate /etc/letsencrypt/live/fanz.com.tr/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/fanz.com.tr/privkey.pem;
 include /etc/letsencrypt/options-ssl-nginx.conf;
 ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
 return 301 https://fanz.com.tr\$request_uri;
}
server {
 listen 443 ssl;
 listen [::]:443 ssl;
 server_name fanz.com.tr;
 ssl_certificate /etc/letsencrypt/live/fanz.com.tr/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/fanz.com.tr/privkey.pem;
 include /etc/letsencrypt/options-ssl-nginx.conf;
 ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
 client_max_body_size 32m;
 $robots_header
 location / {
  proxy_pass http://127.0.0.1:3042;
  proxy_http_version 1.1;
  proxy_set_header Host \$host;
  proxy_set_header X-Forwarded-Host \$host;
  proxy_set_header X-Forwarded-Proto \$scheme;
  proxy_set_header X-Real-IP \$remote_addr;
  proxy_set_header X-Forwarded-For \$remote_addr;
  proxy_set_header oai-authenticated-user-id "";
  proxy_set_header oai-authenticated-user-email "";
  proxy_read_timeout 60s;
 }
}
NGINX
}
write_new_site 'add_header X-Robots-Tag "noindex, nofollow" always;'
nginx -t
systemctl reload nginx

temp_env="$(mktemp "$base/shared/runtime.env.XXXXXXXX")"
sed 's|^SITE_ORIGIN=.*$|SITE_ORIGIN=https://fanz.com.tr|' "$env_file" > "$temp_env"
test "$(grep -c '^SITE_ORIGIN=https://fanz.com.tr$' "$temp_env")" -eq 1
chown deploy:deploy "$temp_env"
chmod 600 "$temp_env"
mv -f "$temp_env" "$env_file"
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
systemctl restart fans-platform.service
for attempt in {1..20}; do
 if curl -fsS --max-time 2 http://127.0.0.1:3042/api/health | python3 -c 'import json,sys;d=json.load(sys.stdin);sys.exit(0 if d.get("status")=="ok" and d.get("database")=="ok" else 1)' 2>/dev/null; then break; fi
 sleep 1
done
curl -fsS --max-time 10 --resolve fanz.com.tr:443:127.0.0.1 https://fanz.com.tr/semicenk | python3 -c 'import sys;s=sys.stdin.read();sys.exit(0 if "https://fanz.com.tr/semicenk" in s and "Semicenk Fan Topluluğu" in s else 1)'

cat > "$old_site" <<'NGINX'
server {
 listen 80;
 listen [::]:80;
 server_name fans.wai.com.tr;
 location /.well-known/acme-challenge/ { root /var/www/fans-acme; }
 location / { return 301 https://fanz.com.tr$request_uri; }
}
server {
 listen 443 ssl;
 listen [::]:443 ssl;
 server_name fans.wai.com.tr;
 ssl_certificate /etc/letsencrypt/live/fans.wai.com.tr/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/fans.wai.com.tr/privkey.pem;
 include /etc/letsencrypt/options-ssl-nginx.conf;
 ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
 return 301 https://fanz.com.tr$request_uri;
}
NGINX
write_new_site ''
nginx -t
systemctl reload nginx
curl -fsSI --max-time 10 --resolve fanz.com.tr:443:127.0.0.1 https://fanz.com.tr/semicenk | grep -qi '^HTTP/.* 200'
if curl -fsSI --max-time 10 --resolve fanz.com.tr:443:127.0.0.1 https://fanz.com.tr/semicenk | grep -qi '^x-robots-tag:.*noindex'; then false; fi
curl -fsSI --max-time 10 --resolve fans.wai.com.tr:443:127.0.0.1 https://fans.wai.com.tr/semicenk | grep -qi '^location: https://fanz.com.tr/semicenk'
trap - ERR
echo "Yeni alan adı yayında: https://fanz.com.tr/semicenk"
echo "Önceki sürüm: $previous"
echo "Geri dönüş yedeği: $backup"
