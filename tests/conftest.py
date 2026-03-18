"""테스트 공통 설정 및 픽스처"""
import pytest
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def mock_db():
    """Mock DB 커넥션 - psycopg3 dict_row 패턴"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    # with conn.cursor() as cur: 패턴 지원
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    return mock_conn, mock_cursor


@pytest.fixture
def app(mock_db):
    """Flask 테스트 앱"""
    mock_conn, _ = mock_db

    with patch.dict(os.environ, {
        'DATABASE_URL': 'postgresql://test:test@localhost:5432/test',
        'SECRET_KEY': 'test-secret-key',
        'API_KEY': '',
    }):
        from app import app as flask_app
        flask_app.config['TESTING'] = True

        # app.py와 모든 Blueprint의 get_db를 패치
        with patch('app.get_db', return_value=mock_conn), \
             patch('routes.users.get_db', return_value=mock_conn), \
             patch('routes.sku.get_db', return_value=mock_conn), \
             patch('routes.vendors.get_db', return_value=mock_conn), \
             patch('routes.orders.get_db', return_value=mock_conn), \
             patch('routes.dashboard.get_db', return_value=mock_conn), \
             patch('routes.uploads.get_db', return_value=mock_conn), \
             patch('routes.inventory.get_db', return_value=mock_conn), \
             patch('routes.notifications.get_db', return_value=mock_conn), \
             patch('routes.backup.get_db', return_value=mock_conn), \
             patch('routes.fuzzy_match.get_db', return_value=mock_conn), \
             patch('routes.profitability.get_db', return_value=mock_conn), \
             patch('routes.forecast.get_db', return_value=mock_conn), \
             patch('routes.smart_order.get_db', return_value=mock_conn):
            yield flask_app


@pytest.fixture
def client(app):
    """Flask 테스트 클라이언트"""
    return app.test_client()


@pytest.fixture
def sample_user():
    """샘플 사용자 데이터"""
    return {'name': '홍길동'}


@pytest.fixture
def sample_order():
    """샘플 주문 데이터"""
    return {
        'user_id': 1,
        'vendor_name': '테스트거래처',
        'sku_name': '한우등심세트 1kg',
        'quantity': 5,
        'recipient': '김철수',
        'phone': '010-1234-5678',
        'address': '서울시 강남구',
        'memo': '경비실',
        'release_date': '2026-03-15',
        'order_date': '2026-03-13'
    }


@pytest.fixture
def sample_sku():
    """샘플 SKU 상품 데이터"""
    return {
        'sku_name': '한우등심세트 1kg',
        'selling_price': 89000,
        'packaging': '선물포장',
        'compositions': [
            {'part_name': '등심', 'weight': 500},
            {'part_name': '안심', 'weight': 500}
        ]
    }
