#!/usr/bin/env bash
set -euo pipefail
[ "$EUID" -eq 0 ] || { echo 'Systemd kurulumu yönetici yetkisi gerektirir.'; exit 1; }
release="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
bash "$release/deploy/activate-release.sh"
install -m 0644 "$release/deploy/seo-control.service" /etc/systemd/system/seo-control.service
install -m 0644 "$release/deploy/seo-control.timer" /etc/systemd/system/seo-control.timer
systemctl daemon-reload
if systemctl cat google-submission.timer >/dev/null 2>&1; then systemctl disable --now google-submission.timer; fi
systemctl enable --now seo-control.timer
echo 'SEO paneli yayında. /admin/seo üzerinden ayarları ve hesap bağlantısını tamamlayın.'
systemctl list-timers seo-control.timer --no-pager
