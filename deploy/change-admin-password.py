#!/usr/bin/env python3
"""Rotate the Fanz administrator password from an interactive server terminal."""

import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tempfile
import time
from urllib.request import urlopen


SHARED = Path('/home/deploy/fans/shared')
RUNTIME = SHARED / 'runtime.env'
SERVICE = 'fans-platform.service'


def atomic_replace(content: bytes, original_stat: os.stat_result) -> None:
    descriptor, temporary = tempfile.mkstemp(prefix='.runtime.env-', dir=SHARED)
    try:
        os.fchmod(descriptor, 0o600)
        os.fchown(descriptor, original_stat.st_uid, original_stat.st_gid)
        with os.fdopen(descriptor, 'wb') as output:
            output.write(content)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, RUNTIME)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def healthy() -> bool:
    for _ in range(20):
        try:
            with urlopen('http://127.0.0.1:3042/api/health', timeout=2) as response:
                state = json.load(response)
            if state.get('status') == 'ok' and state.get('database') == 'ok':
                return True
        except Exception:
            pass
        time.sleep(1)
    return False


def main() -> int:
    if os.geteuid() != 0 or not sys.stdin.isatty():
        print('Bu işlem root yetkili etkileşimli terminalde çalıştırılmalı.', file=sys.stderr)
        return 1
    current = getpass.getpass('Yeni yönetici parolası (en az 12 karakter): ')
    repeat = getpass.getpass('Yeni parolayı tekrar gir: ')
    if current != repeat or not 12 <= len(current) <= 256 or '\n' in current:
        print('Parolalar eşleşmeli ve 12–256 karakter olmalı.', file=sys.stderr)
        return 1
    original = RUNTIME.read_bytes()
    original_stat = RUNTIME.stat()
    text = original.decode('utf-8')
    if len(re.findall(r'^ADMIN_PASSWORD_HASH=', text, re.MULTILINE)) != 1 or len(re.findall(r'^ADMIN_SESSION_SECRET=', text, re.MULTILINE)) != 1:
        print('Yönetici ayarları beklenen biçimde değil; değişiklik yapılmadı.', file=sys.stderr)
        return 1
    salt = secrets.token_hex(16)
    hashed = hashlib.scrypt(current.encode('utf-8'), salt=salt.encode('ascii'), n=16384, r=8, p=1, dklen=64).hex()
    del current, repeat
    text = re.sub(r'^ADMIN_PASSWORD_HASH=.*$', f'ADMIN_PASSWORD_HASH={salt}:{hashed}', text, count=1, flags=re.MULTILINE)
    text = re.sub(r'^ADMIN_SESSION_SECRET=.*$', f'ADMIN_SESSION_SECRET={secrets.token_hex(48)}', text, count=1, flags=re.MULTILINE)
    atomic_replace(text.encode('utf-8'), original_stat)
    try:
        subprocess.run(['systemctl', 'restart', SERVICE], check=True)
        if not healthy():
            raise RuntimeError('Servis sağlık kontrolü başarısız.')
    except Exception as error:
        atomic_replace(original, original_stat)
        subprocess.run(['systemctl', 'restart', SERVICE], check=False)
        print(f'Değişiklik geri alındı: {error}', file=sys.stderr)
        return 1
    (SHARED / 'admin-initial-password.txt').unlink(missing_ok=True)
    print('Yönetici parolası değişti. Önceki yönetici oturumları kapatıldı.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
