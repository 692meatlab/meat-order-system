"""재고 관리 API 테스트"""


def test_get_inventory(client, mock_db):
    """재고 목록 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'sku_product_id': 1, 'current_stock': 100, 'min_stock': 10,
         'sku_name': '한우등심세트 1kg', 'updated_at': '2026-03-18'}
    ]
    res = client.get('/api/inventory')
    assert res.status_code == 200
    data = res.get_json()
    assert 'inventory' in data


def test_update_inventory(client, mock_db):
    """재고 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'sku_product_id': 1, 'current_stock': 50, 'min_stock': 10,
        'updated_at': '2026-03-18'
    }
    res = client.put('/api/inventory/1', json={
        'current_stock': 50, 'min_stock': 10
    })
    assert res.status_code == 200


def test_adjust_inventory(client, mock_db):
    """재고 수동 조정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'current_stock': 100}
    res = client.post('/api/inventory/adjust', json={
        'sku_product_id': 1, 'change_qty': -10,
        'change_type': 'manual', 'note': '수동 차감'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['before_stock'] == 100
    assert data['after_stock'] == 90


def test_adjust_inventory_missing_params(client, mock_db):
    """필수 파라미터 없이 조정 시 400"""
    res = client.post('/api/inventory/adjust', json={
        'sku_product_id': 1, 'change_qty': 0
    })
    assert res.status_code == 400


def test_get_inventory_alerts(client, mock_db):
    """재고 부족 알림 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'sku_product_id': 1, 'current_stock': 5, 'min_stock': 10,
         'sku_name': '한우등심세트 1kg'}
    ]
    res = client.get('/api/inventory/alerts')
    assert res.status_code == 200
    data = res.get_json()
    assert 'alerts' in data


def test_adjust_inventory_increases_stock(client, mock_db):
    """재고 증가 조정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'current_stock': 50}
    res = client.post('/api/inventory/adjust', json={
        'sku_product_id': 1, 'change_qty': 20,
        'change_type': 'inbound', 'note': '입고'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['after_stock'] == 70
