"""스마트 발주 테스트"""
import pytest
from unittest.mock import MagicMock, patch
from datetime import date, timedelta


class TestSmartOrderAPI:
    def test_recommendations_basic(self, client, mock_db):
        """발주 추천 기본"""
        _, mock_cursor = mock_db
        daily_data = [{'odate': date.today() - timedelta(days=i), 'qty': 3} for i in range(14)]
        dow_data = [{'dow': i, 'cnt': 10} for i in range(7)]

        mock_cursor.fetchall.side_effect = [
            # 재고 목록
            [{'sku_product_id': 1, 'sku_name': '한우등심세트 1kg', 'current_stock': 10, 'min_stock': 5}],
            # 활성 SKU
            [{'sku_name': '한우등심세트 1kg'}],
            # forecast 내부: 일별 주문량
            daily_data,
        ] + [dow_data] * 7  # dow_factor (7일분)

        response = client.get('/api/smart-order/recommendations?days=7')
        assert response.status_code == 200
        data = response.get_json()
        assert 'recommendations' in data
        assert 'summary' in data

    def test_recommendations_no_inventory(self, client, mock_db):
        """재고 데이터 없는 경우"""
        _, mock_cursor = mock_db
        daily_data = [{'odate': date.today() - timedelta(days=i), 'qty': 5} for i in range(7)]
        dow_data = [{'dow': i, 'cnt': 10} for i in range(7)]

        mock_cursor.fetchall.side_effect = [
            [],  # 재고 없음
            [{'sku_name': '한우등심세트 1kg'}],  # 활성 SKU
            daily_data,
        ] + [dow_data] * 7

        response = client.get('/api/smart-order/recommendations?days=7')
        assert response.status_code == 200

    def test_generate_order(self, client, mock_db):
        """발주서 데이터 생성"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.return_value = [
            {'vendor_name': '테스트거래처', 'sku_name': '한우등심세트 1kg'}
        ]

        response = client.post('/api/smart-order/generate', json={
            'items': [{'sku_name': '한우등심세트 1kg', 'quantity': 20}]
        })
        assert response.status_code == 200
        data = response.get_json()
        assert 'vendor_groups' in data

    def test_generate_order_empty(self, client, mock_db):
        """빈 발주 항목"""
        response = client.post('/api/smart-order/generate', json={
            'items': []
        })
        assert response.status_code == 400

    def test_urgency_calculation(self):
        """긴급도 산출"""
        from routes.smart_order import _calculate_urgency
        assert _calculate_urgency(0, 5, 3) == 'critical'
        assert _calculate_urgency(3, 5, 0) == 'critical'
        assert _calculate_urgency(5, 0, 2) == 'high'
        assert _calculate_urgency(20, 0, 3) == 'medium'
        assert _calculate_urgency(100, 0, 3) == 'low'
