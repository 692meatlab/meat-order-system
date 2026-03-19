"""인메모리 TTL 캐시 - Thread-safe dict 기반"""
import time
import threading
import logging

logger = logging.getLogger('order-management')


class TTLCache:
    """Thread-safe 인메모리 캐시 (TTL 지원)"""

    def __init__(self, default_ttl=300):
        self._store = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl

    def get(self, key):
        """캐시에서 값 조회. 만료 시 None 반환."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if time.time() > entry['expires_at']:
                del self._store[key]
                return None
            return entry['value']

    def set(self, key, value, ttl=None):
        """캐시에 값 저장."""
        if ttl is None:
            ttl = self._default_ttl
        with self._lock:
            self._store[key] = {
                'value': value,
                'expires_at': time.time() + ttl
            }

    def invalidate(self, key):
        """특정 키 삭제."""
        with self._lock:
            self._store.pop(key, None)

    def invalidate_prefix(self, prefix):
        """접두사로 시작하는 모든 키 삭제."""
        with self._lock:
            keys_to_delete = [k for k in self._store if k.startswith(prefix)]
            for k in keys_to_delete:
                del self._store[k]

    def clear(self):
        """전체 캐시 초기화."""
        with self._lock:
            self._store.clear()

    def stats(self):
        """캐시 통계."""
        with self._lock:
            now = time.time()
            total = len(self._store)
            active = sum(1 for e in self._store.values() if now <= e['expires_at'])
            return {'total_keys': total, 'active_keys': active}


# 글로벌 캐시 인스턴스 (TTL 5분)
cache = TTLCache(default_ttl=300)
