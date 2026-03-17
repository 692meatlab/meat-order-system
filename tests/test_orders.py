"""주문 API 테스트"""
import json


def test_get_orders(client, mock_db):
    """주문 목록 조회 (페이지네이션)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'count': 0}
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/orders')
    assert response.status_code == 200
    data = response.get_json()
    assert 'orders' in data
    assert 'total' in data
    assert 'page' in data
    assert 'per_page' in data
    assert 'total_pages' in data


def test_get_orders_with_pagination(client, mock_db):
    """주문 페이지네이션 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'count': 150}
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/orders?page=2&per_page=50')
    assert response.status_code == 200
    data = response.get_json()
    assert data['page'] == 2
    assert data['per_page'] == 50
    assert data['total'] == 150
    assert data['total_pages'] == 3


def test_get_orders_with_filters(client, mock_db):
    """주문 필터링 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'count': 0}
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/orders?user_id=1&date_from=2026-01-01&date_to=2026-12-31')
    assert response.status_code == 200


def test_get_orders_with_status_filter(client, mock_db):
    """주문 상태 필터링 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'count': 0}
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/orders?status=registered')
    assert response.status_code == 200


def test_get_orders_per_page_limit(client, mock_db):
    """주문 조회 - per_page 최대 200 제한"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'count': 0}
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/orders?per_page=500')
    assert response.status_code == 200
    data = response.get_json()
    assert data['per_page'] == 200


def test_create_orders(client, mock_db, sample_order):
    """주문 생성 (bulk)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1}

    response = client.post('/api/orders', json={
        'orders': [sample_order],
        'user_id': 1
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'created_ids' in data
    assert data['count'] == 1


def test_create_orders_multiple(client, mock_db, sample_order):
    """주문 생성 - 복수 건"""
    _, mock_cursor = mock_db
    # fetchone이 호출될 때마다 다른 ID 반환
    mock_cursor.fetchone.side_effect = [{'id': 1}, {'id': 2}, {'id': 3}]

    orders = [sample_order.copy() for _ in range(3)]
    response = client.post('/api/orders', json={
        'orders': orders,
        'user_id': 1
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['count'] == 3
    assert len(data['created_ids']) == 3


def test_create_orders_empty(client):
    """주문 생성 - 빈 목록"""
    response = client.post('/api/orders', json={'orders': []})
    assert response.status_code == 400


def test_create_orders_no_orders_key(client):
    """주문 생성 - orders 키 누락"""
    response = client.post('/api/orders', json={'user_id': 1})
    assert response.status_code == 400


def test_update_order(client, mock_db):
    """주문 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1, 'shipped': True}

    response = client.put('/api/orders/1', json={'shipped': True})
    assert response.status_code == 200


def test_update_order_multiple_fields(client, mock_db):
    """주문 수정 - 여러 필드"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'shipped': True, 'paid': True, 'memo': '메모 수정'
    }

    response = client.put('/api/orders/1', json={
        'shipped': True,
        'paid': True,
        'memo': '메모 수정'
    })
    assert response.status_code == 200


def test_update_order_no_fields(client, mock_db):
    """주문 수정 - 유효 필드 없음"""
    response = client.put('/api/orders/1', json={'invalid_field': 'value'})
    assert response.status_code == 400


def test_bulk_update_orders(client, mock_db):
    """주문 일괄 수정"""
    response = client.post('/api/orders/bulk-update', json={
        'order_ids': [1, 2, 3],
        'updates': {'shipped': True}
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['updated'] == 3


def test_bulk_update_no_ids(client):
    """주문 일괄 수정 - ID 없음"""
    response = client.post('/api/orders/bulk-update', json={
        'order_ids': [],
        'updates': {'shipped': True}
    })
    assert response.status_code == 400


def test_bulk_update_multiple_fields(client, mock_db):
    """주문 일괄 수정 - 여러 필드"""
    response = client.post('/api/orders/bulk-update', json={
        'order_ids': [1, 2],
        'updates': {'shipped': True, 'paid': True, 'invoice_issued': True}
    })
    assert response.status_code == 200


def test_delete_order(client, mock_db):
    """주문 삭제"""
    response = client.delete('/api/orders/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True


def test_bulk_delete_orders(client, mock_db):
    """주문 일괄 삭제"""
    response = client.post('/api/orders/bulk-delete', json={
        'order_ids': [1, 2]
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['deleted'] == 2


def test_bulk_delete_no_ids(client):
    """주문 일괄 삭제 - ID 없음"""
    response = client.post('/api/orders/bulk-delete', json={'order_ids': []})
    assert response.status_code == 400


def test_order_stats(client, mock_db):
    """주문 통계"""
    _, mock_cursor = mock_db
    # fetchall은 by_vendor, by_month, by_sku 순서로 호출됨
    mock_cursor.fetchall.side_effect = [
        [{'vendor_name': '거래처A', 'count': 10, 'total_qty': 50, 'shipped_count': 5, 'paid_count': 3}],
        [{'month': '2026-03', 'count': 10, 'total_qty': 50}],
        [{'sku_name': '등심세트', 'count': 5, 'total_qty': 25}],
    ]
    mock_cursor.fetchone.return_value = {
        'total': 100, 'shipped': 50, 'paid': 30,
        'invoice_issued': 10, 'total_qty': 500
    }

    response = client.get('/api/orders/stats')
    assert response.status_code == 200
    data = response.get_json()
    assert 'summary' in data
    assert 'by_vendor' in data
    assert 'by_month' in data
    assert 'by_sku' in data


def test_check_duplicates(client, mock_db):
    """중복 주문 감지"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.post('/api/orders/check-duplicates', json={
        'orders': [{'recipient': '김철수', 'sku_name': '테스트', 'address': '서울'}]
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'duplicates' in data


def test_check_duplicates_found(client, mock_db):
    """중복 주문 감지 - 중복 발견"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 99, 'vendor_name': '기존거래처', 'sku_name': '테스트', 'quantity': 3,
         'recipient': '김철수', 'address': '서울', 'order_date': '2026-03-12', 'status': 'registered'}
    ]

    response = client.post('/api/orders/check-duplicates', json={
        'orders': [{'recipient': '김철수', 'sku_name': '테스트'}]
    })
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['duplicates']) == 1


def test_check_duplicates_empty(client, mock_db):
    """중복 주문 감지 - 빈 목록"""
    response = client.post('/api/orders/check-duplicates', json={'orders': []})
    assert response.status_code == 200
    data = response.get_json()
    assert data['duplicates'] == []


def test_anomaly_stats(client, mock_db):
    """이상치 통계"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'vendor_name': '거래처A', 'sku_name': '등심세트',
            'avg_qty': 5.0, 'stddev_qty': 1.2,
            'avg_price': 50000.0, 'stddev_price': 5000.0,
            'sample_count': 10
        }
    ]

    response = client.get('/api/orders/anomaly-stats')
    assert response.status_code == 200
    data = response.get_json()
    assert 'stats' in data


def test_anomaly_stats_with_none_values(client, mock_db):
    """이상치 통계 - None 값 처리"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'vendor_name': '거래처A', 'sku_name': '등심세트',
            'avg_qty': None, 'stddev_qty': None,
            'avg_price': None, 'stddev_price': None,
            'sample_count': 3
        }
    ]

    response = client.get('/api/orders/anomaly-stats')
    assert response.status_code == 200
    data = response.get_json()
    # None 값은 0으로 변환되어야 함
    assert data['stats'][0]['avg_qty'] == 0
    assert data['stats'][0]['stddev_qty'] == 0
