"""퍼지 SKU 매칭 테스트"""
import pytest
from unittest.mock import MagicMock
from routes.fuzzy_match import normalize_text, tokenize, token_similarity


class TestNormalizeText:
    def test_basic_normalize(self):
        assert normalize_text('한우 등심 세트 1KG') == '한우등심세트1kg'

    def test_unit_replace(self):
        assert normalize_text('한우등심 킬로그램') == '한우등심kg'
        assert normalize_text('소고기 그램') == '소고기g'

    def test_special_chars(self):
        assert normalize_text('등심(1kg)') == '등심1kg'

    def test_empty(self):
        assert normalize_text('') == ''
        assert normalize_text(None) == ''


class TestTokenize:
    def test_basic(self):
        tokens = tokenize('한우등심세트1kg')
        assert '한우등심세트' in tokens or '한우' in tokens
        assert '1' in tokens
        assert 'kg' in tokens

    def test_mixed(self):
        tokens = tokenize('한우 등심 세트 ABC 123')
        assert '한우' in tokens
        assert '등심' in tokens
        assert 'ABC' in tokens
        assert '123' in tokens

    def test_empty(self):
        assert tokenize('') == []
        assert tokenize(None) == []


class TestTokenSimilarity:
    def test_identical(self):
        assert token_similarity(['한우', '등심'], ['한우', '등심']) == 1.0

    def test_partial(self):
        sim = token_similarity(['한우', '등심', '세트'], ['한우', '등심', '선물'])
        assert 0.3 <= sim <= 0.7

    def test_no_overlap(self):
        assert token_similarity(['한우'], ['돼지']) == 0.0

    def test_empty(self):
        assert token_similarity([], ['한우']) == 0.0


class TestFuzzyMatchAPI:
    def test_fuzzy_match_exact(self, client, mock_db):
        """정확 매칭 테스트"""
        _, mock_cursor = mock_db

        # 1번 호출: vendor_mappings 정확 매칭 성공
        mock_cursor.fetchone.return_value = {
            'sku_product_id': 1,
            'sku_name': '한우등심세트 1kg',
            'product_name': '한우 등심 세트'
        }

        response = client.post('/api/fuzzy-match', json={
            'vendor_name': '테스트거래처',
            'items': [{'product_name': '한우 등심 세트'}]
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'results' in data

    def test_fuzzy_match_empty(self, client, mock_db):
        """빈 배열 테스트"""
        response = client.post('/api/fuzzy-match', json={
            'vendor_name': '테스트',
            'items': []
        })
        assert response.status_code == 200
        assert response.get_json()['results'] == []

    def test_matching_aliases_list(self, client, mock_db):
        """별칭 목록 조회"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.return_value = [
            {'id': 1, 'sku_product_id': 1, 'alias_name': '등심세트', 'sku_name': '한우등심세트 1kg'}
        ]

        response = client.get('/api/matching-aliases')
        assert response.status_code == 200
        data = response.get_json()
        assert 'aliases' in data

    def test_create_matching_alias(self, client, mock_db):
        """별칭 등록"""
        _, mock_cursor = mock_db
        mock_cursor.fetchone.return_value = {
            'id': 1, 'sku_product_id': 1, 'alias_name': '등심세트'
        }

        response = client.post('/api/matching-aliases', json={
            'sku_product_id': 1,
            'alias_name': '등심세트'
        })
        assert response.status_code == 201

    def test_create_alias_missing_fields(self, client, mock_db):
        """별칭 등록 - 필수 필드 누락"""
        response = client.post('/api/matching-aliases', json={
            'alias_name': ''
        })
        assert response.status_code == 400

    def test_delete_matching_alias(self, client, mock_db):
        """별칭 삭제"""
        response = client.delete('/api/matching-aliases/1')
        assert response.status_code == 200
