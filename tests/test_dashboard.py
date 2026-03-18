"""대시보드 및 거래처 성과 테스트 (A-4)"""
import pytest
from unittest.mock import MagicMock


def test_vendor_performance_basic(client, mock_db):
    """거래처 성과 기본 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'vendor_name': '거래처A',
            'total_orders': 50,
            'shipped_count': 45,
            'paid_count': 40,
            'invoice_count': 35,
            'avg_processing_days': 2.5
        }
    ]

    response = client.get('/api/vendor-performance?period=30')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vendors' in data
    assert len(data['vendors']) == 1
    assert data['vendors'][0]['vendor_name'] == '거래처A'
    assert 'grade' in data['vendors'][0]


def test_vendor_performance_score_calculation(client, mock_db):
    """성과 점수 계산 검증"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'vendor_name': '우수거래처',
            'total_orders': 100,
            'shipped_count': 95,
            'paid_count': 90,
            'invoice_count': 85,
            'avg_processing_days': 2.0
        }
    ]

    response = client.get('/api/vendor-performance?period=30')
    data = response.get_json()
    vendor = data['vendors'][0]
    # 높은 처리율 → 높은 점수
    assert vendor['score'] >= 70
    assert vendor['grade'] in ('S', 'A', 'B')


def test_vendor_performance_empty(client, mock_db):
    """거래처 데이터 없음"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/vendor-performance')
    assert response.status_code == 200
    data = response.get_json()
    assert data['vendors'] == []


def test_vendor_performance_detail(client, mock_db):
    """거래처 성과 상세"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.side_effect = [
        # 월별 추이
        [{'month': '2026-03', 'total_orders': 20, 'shipped_count': 18, 'paid_count': 15, 'total_qty': 100}],
        # 최근 주문
        [{'id': 1, 'sku_name': '한우등심세트', 'quantity': 5, 'order_date': None,
          'release_date': None, 'shipped': True, 'paid': True}]
    ]

    response = client.get('/api/vendor-performance/테스트거래처/detail?period=90')
    assert response.status_code == 200
    data = response.get_json()
    assert data['vendor_name'] == '테스트거래처'
    assert 'monthly' in data


def test_speed_score():
    """처리속도 점수 계산"""
    from routes.dashboard import _calculate_speed_score
    assert _calculate_speed_score(2) == 100
    assert _calculate_speed_score(5) > 0
    assert _calculate_speed_score(15) == 0
    assert _calculate_speed_score(None) == 50
