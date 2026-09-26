#!/usr/bin/env bash
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then echo 'Run this prepared script from an administrator terminal.' >&2; exit 1; fi
APP=/home/deploy/fans/current
HOSTNAME_FANS=fans.wai.com.tr
CONF=/etc/nginx/sites-available/fans.wai.com.tr
if [ -e "$CONF" ] || [ -L /etc/nginx/sites-enabled/fans.wai.com.tr ]; then echo 'A Fans nginx configuration already exists. Review it before replacing.' >&2; exit 1; fi
test -f "$APP/.next/BUILD_ID"
test -f /home/deploy/fans/shared/runtime.env
test -f /home/deploy/fans/shared/fans.sqlite
mkdir -p /var/www/fans-acme "$APP/.next/cache"
chown deploy:deploy "$APP/.next/cache"
cat > /etc/systemd/system/fans-platform.service <<'UNIT'
[Unit]
Description=Fans artist community platform
After=network.target
[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/fans/current
Environment=NODE_ENV=production
EnvironmentFile=/home/deploy/fans/shared/runtime.env
ExecStart=/home/deploy/.nvm/versions/node/v22.23.2/bin/node /home/deploy/fans/current/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3042
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/deploy/fans/shared /home/deploy/fans/current/.next/cache
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now fans-platform.service
for attempt in {1..20}; do if curl -fsS http://127.0.0.1:3042/api/health >/dev/null; then break; fi; sleep 1; done
curl -fsS http://127.0.0.1:3042/api/health >/dev/null
cat > "$CONF" <<'NGINX'
server {
 listen 80;
 listen [::]:80;
 server_name fans.wai.com.tr;
 location /.well-known/acme-challenge/ { root /var/www/fans-acme; }
 location / { return 503; }
}
NGINX
ln -s "$CONF" /etc/nginx/sites-enabled/fans.wai.com.tr
if ! nginx -t; then unlink /etc/nginx/sites-enabled/fans.wai.com.tr; exit 1; fi
systemctl reload nginx
certbot certonly --webroot -w /var/www/fans-acme -d "$HOSTNAME_FANS" --non-interactive --agree-tos --register-unsafely-without-email --deploy-hook "systemctl reload nginx"
cp "$CONF" /home/deploy/fans/shared/nginx-http-initial.conf
cat > "$CONF" <<'NGINX'
server {
 listen 80;
 listen [::]:80;
 server_name fans.wai.com.tr;
 location /.well-known/acme-challenge/ { root /var/www/fans-acme; }
 location / { return 301 https://fans.wai.com.tr$request_uri; }
}
server {
 listen 443 ssl;
 listen [::]:443 ssl;
 server_name fans.wai.com.tr;
 ssl_certificate /etc/letsencrypt/live/fans.wai.com.tr/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/fans.wai.com.tr/privkey.pem;
 include /etc/letsencrypt/options-ssl-nginx.conf;
 ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
 client_max_body_size 64k;
 add_header X-Robots-Tag "noindex, nofollow" always;
 location / {
  proxy_pass http://127.0.0.1:3042;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header oai-authenticated-user-id "";
  proxy_set_header oai-authenticated-user-email "";
  proxy_read_timeout 60s;
 }
}
NGINX
if ! nginx -t; then cp /home/deploy/fans/shared/nginx-http-initial.conf "$CONF"; nginx -t; exit 1; fi
systemctl reload nginx
curl --fail --silent --show-error https://fans.wai.com.tr/api/health
printf '\nFans is running at https://fans.wai.com.tr\nAdmin: https://fans.wai.com.tr/admin\n'
