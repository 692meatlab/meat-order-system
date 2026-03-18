"""수익성 분석 테스트"""
import pytest
from unittest.mock import MagicMock


class TestProfitabilityAPI:
    def test_profitability_list(self, client, mock_db):
        """전체 SKU 수익성 목록"""
        _, mock_cursor = mock_db

        # fetchall: SKU 목록
        mock_cursor.fetchall.side_effect = [
            [{'id': 1, 'sku_name': '한우등심세트 1kg', 'selling_price': 89000, 'packaging': '선물포장'}],
            # compositions
            [{'part_name': '등심', 'weight': 500, 'price_per_100g': 7800, 'grade': '1++'}],
        ]
        mock_cursor.fetchone.side_effect = [
            {'packaging': '선물포장'},  # sku packaging
            {'price': 5000},  # packaging cost
        ]

        response = client.get('/api/profitability')
        assert response.status_code == 200
        data = response.get_json()
        assert 'products' in data
        assert 'summary' in data

    def test_profitability_detail(self, client, mock_db):
        """개별 SKU 원가 상세"""
        _, mock_cursor = mock_db

        mock_cursor.fetchone.side_effect = [
            {'id': 1, 'sku_name': '한우등심세트 1kg', 'selling_price': 89000, 'packaging': '선물포장'},
            {'packaging': '선물포장'},
            {'price': 5000},
        ]
        mock_cursor.fetchall.return_value = [
            {'part_name': '등심', 'weight': 500, 'price_per_100g': 7800, 'grade': '1++'}
        ]

        response = client.get('/api/profitability/1')
        assert response.status_code == 200
        data = response.get_json()
        assert 'sku_name' in data
        assert 'margin' in data
        assert 'details' in data

    def test_profitability_detail_not_found(self, client, mock_db):
        """존재하지 않는 SKU"""
        _, mock_cursor = mock_db
        mock_cursor.fetchone.return_value = None

        response = client.get('/api/profitability/999')
        assert response.status_code == 404

    def test_profitability_trends(self, client, mock_db):
        """월별 마진 추이"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.return_value = [
            {'month': '2026-01', 'total_revenue': 1000000, 'total_qty': 50, 'order_count': 30}
        ]

        response = client.get('/api/profitability/trends?months=3')
        assert response.status_code == 200
        data = response.get_json()
        assert 'trends' in data

    def test_margin_grade(self):
        """마진 등급 분류"""
        from routes.profitability import get_margin_grade
        assert get_margin_grade(0.5) == 'A'
        assert get_margin_grade(0.3) == 'B'
        assert get_margin_grade(0.15) == 'C'
        assert get_margin_grade(0.05) == 'D'

    def test_calculate_sku_cost(self, client, mock_db):
        """SKU 원가 계산"""
        _, mock_cursor = mock_db

        mock_cursor.fetchall.return_value = [
            {'part_name': '등심', 'weight': 500, 'price_per_100g': 7800, 'grade': '1++'},
            {'part_name': '안심', 'weight': 500, 'price_per_100g': 9000, 'grade': '1++'}
        ]
        mock_cursor.fetchone.side_effect = [
            {'packaging': '선물포장'},
            {'price': 5000}
        ]

        from routes.profitability import calculate_sku_cost
        result = calculate_sku_cost(mock_cursor, 1)

        assert result['parts_cost'] > 0
        assert result['packaging_cost'] == 5000
        assert result['total_cost'] == result['parts_cost'] + result['packaging_cost']
