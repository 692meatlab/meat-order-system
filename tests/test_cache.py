"""TTL 캐시 테스트"""
import time
import pytest
from services.cache import TTLCache


class TestTTLCache:
    """TTLCache 단위 테스트"""

    def setup_method(self):
        self.cache = TTLCache(default_ttl=1)  # 1초 TTL

    def test_set_and_get(self):
        """기본 set/get 동작"""
        self.cache.set('key1', 'value1')
        assert self.cache.get('key1') == 'value1'

    def test_get_missing_key(self):
        """없는 키 조회 시 None"""
        assert self.cache.get('nonexistent') is None

    def test_ttl_expiration(self):
        """TTL 만료 후 None 반환"""
        self.cache.set('key1', 'value1', ttl=0.1)
        assert self.cache.get('key1') == 'value1'
        time.sleep(0.15)
        assert self.cache.get('key1') is None

    def test_custom_ttl(self):
        """커스텀 TTL 동작"""
        self.cache.set('key1', 'value1', ttl=5)
        assert self.cache.get('key1') == 'value1'

    def test_invalidate(self):
        """특정 키 삭제"""
        self.cache.set('key1', 'value1')
        self.cache.set('key2', 'value2')
        self.cache.invalidate('key1')
        assert self.cache.get('key1') is None
        assert self.cache.get('key2') == 'value2'

    def test_invalidate_prefix(self):
        """접두사로 시작하는 키 일괄 삭제"""
        self.cache.set('parts_cost', [1, 2, 3])
        self.cache.set('parts_extra', 'extra')
        self.cache.set('packaging', 'pkg')
        self.cache.invalidate_prefix('parts')
        assert self.cache.get('parts_cost') is None
        assert self.cache.get('parts_extra') is None
        assert self.cache.get('packaging') == 'pkg'

    def test_clear(self):
        """전체 캐시 초기화"""
        self.cache.set('a', 1)
        self.cache.set('b', 2)
        self.cache.clear()
        assert self.cache.get('a') is None
        assert self.cache.get('b') is None

    def test_stats(self):
        """캐시 통계"""
        self.cache.set('a', 1, ttl=10)
        self.cache.set('b', 2, ttl=0.01)
        time.sleep(0.02)
        stats = self.cache.stats()
        assert stats['total_keys'] == 2
        assert stats['active_keys'] == 1

    def test_overwrite_value(self):
        """같은 키에 값 덮어쓰기"""
        self.cache.set('key', 'v1')
        self.cache.set('key', 'v2')
        assert self.cache.get('key') == 'v2'

    def test_complex_values(self):
        """딕셔너리/리스트 값 저장"""
        data = {'parts': [{'name': '등심', 'price': 7800}]}
        self.cache.set('complex', data)
        result = self.cache.get('complex')
        assert result == data
        assert result['parts'][0]['name'] == '등심'
