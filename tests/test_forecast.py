"""수요 예측 테스트"""
import pytest
from unittest.mock import MagicMock
from datetime import date, timedelta
from routes.forecast import weighted_moving_average, season_boost


class TestWeightedMovingAverage:
    def test_basic(self):
        data = [10, 20, 30, 40, 50]
        result = weighted_moving_average(data)
        assert result > 0
        # 최근 값에 가중치가 높으므로 단순 평균(30)보다 큼
        assert result > 30

    def test_single_value(self):
        assert weighted_moving_average([5]) == 5.0

    def test_empty(self):
        assert weighted_moving_average([]) == 0

    def test_window_limit(self):
        data = list(range(1, 31))
        result = weighted_moving_average(data, window=7)
        assert result > 0


class TestSeasonBoost:
    def test_normal_month(self):
        assert season_boost(date(2026, 5, 15)) == 1.0

    def test_december(self):
        assert season_boost(date(2026, 12, 20)) == 1.5

    def test_september(self):
        assert season_boost(date(2026, 9, 15)) == 1.4


class TestForecastAPI:
    def test_forecast_basic(self, client, mock_db):
        """SKU별 예측 기본"""
        _, mock_cursor = mock_db

        # 새 구조: 1) 활성 SKU  2) 배치 DOW 프리로드  3) 일별 주문량
        daily_data = [{'odate': date.today() - timedelta(days=i), 'qty': 5} for i in range(30)]
        dow_batch = [{'sku_name': '한우등심세트 1kg', 'dow': i, 'cnt': 10} for i in range(7)]

        mock_cursor.fetchall.side_effect = [
            [{'sku_name': '한우등심세트 1kg'}],  # 활성 SKU
            dow_batch,  # 배치 DOW 프리로드 (1 쿼리)
            daily_data,  # 일별 주문량
        ]

        response = client.get('/api/forecast?days=7')
        assert response.status_code == 200
        data = response.get_json()
        assert 'forecasts' in data
        assert data['days'] == 7

    def test_forecast_empty_data(self, client, mock_db):
        """주문 데이터 없는 SKU"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.side_effect = [
            [{'sku_name': 'empty-sku'}],  # 활성 SKU
            [],  # 배치 DOW 프리로드 (데이터 없음)
            [],  # 일별 주문량 없음
        ]

        response = client.get('/api/forecast?days=7')
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['forecasts']) >= 0

    def test_forecast_parts(self, client, mock_db):
        """부위별 소요량 예측"""
        _, mock_cursor = mock_db
        daily_data = [{'odate': date.today() - timedelta(days=i), 'qty': 5} for i in range(14)]
        dow_batch = [{'sku_name': '한우등심세트 1kg', 'dow': i, 'cnt': 10} for i in range(7)]

        mock_cursor.fetchall.side_effect = [
            [{'sku_name': '한우등심세트 1kg'}],  # 활성 SKU
            dow_batch,  # 배치 DOW 프리로드 (1 쿼리)
            daily_data,  # 일별 주문량
            [{'part_name': '등심', 'weight': 500}],  # 구성품
        ]

        response = client.get('/api/forecast/parts?days=7')
        assert response.status_code == 200
        data = response.get_json()
        assert 'parts' in data

    def test_forecast_accuracy(self, client, mock_db):
        """예측 정확도"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.return_value = [
            {'sku_name': '한우등심세트 1kg', 'mape': 15.5}
        ]

        response = client.get('/api/forecast/accuracy')
        assert response.status_code == 200
        data = response.get_json()
        assert 'accuracy' in data
        assert 'overall_mape' in data

    def test_forecast_days_limit(self, client, mock_db):
        """예측 일수 제한"""
        _, mock_cursor = mock_db
        mock_cursor.fetchall.side_effect = [
            [],  # 활성 SKU 없음
        ]

        response = client.get('/api/forecast?days=100')
        assert response.status_code == 200
        data = response.get_json()
        assert data['days'] == 30  # max 30
