"""SKU 상품 API 테스트"""


def test_get_sku_products(client, mock_db):
    """SKU 상품 목록 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/sku-products')
    assert response.status_code == 200
    data = response.get_json()
    assert 'products' in data


def test_get_sku_products_with_compositions(client, mock_db):
    """SKU 상품 조회 - 구성품 포함"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'id': 1, 'sku_name': '등심세트', 'packaging': '선물', 'selling_price': 89000,
            'created_at': '2026-03-13', 'comp_id': 10, 'part_name': '등심',
            'weight': 500, 'composition_type': 'weight'
        },
        {
            'id': 1, 'sku_name': '등심세트', 'packaging': '선물', 'selling_price': 89000,
            'created_at': '2026-03-13', 'comp_id': 11, 'part_name': '안심',
            'weight': 500, 'composition_type': 'weight'
        },
    ]

    response = client.get('/api/sku-products')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['products']) == 1
    assert len(data['products'][0]['compositions']) == 2


def test_create_sku_product(client, mock_db, sample_sku):
    """SKU 상품 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'sku_name': '한우등심세트 1kg', 'packaging': '선물포장',
        'selling_price': 89000, 'created_at': '2026-03-13'
    }
    mock_cursor.fetchall.return_value = [
        {'id': 10, 'sku_product_id': 1, 'part_name': '등심', 'weight': 500, 'composition_type': 'weight'},
        {'id': 11, 'sku_product_id': 1, 'part_name': '안심', 'weight': 500, 'composition_type': 'weight'},
    ]

    response = client.post('/api/sku-products', json=sample_sku)
    assert response.status_code == 201
    data = response.get_json()
    assert 'product' in data


def test_create_sku_no_name(client):
    """SKU 상품 생성 - 이름 누락"""
    response = client.post('/api/sku-products', json={})
    assert response.status_code == 400


def test_create_sku_empty_name(client):
    """SKU 상품 생성 - 빈 이름"""
    response = client.post('/api/sku-products', json={'sku_name': '   '})
    assert response.status_code == 400


def test_update_sku_product(client, mock_db):
    """SKU 상품 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'sku_name': '수정됨', 'packaging': '', 'selling_price': 0,
        'created_at': '2026-03-13'
    }
    mock_cursor.fetchall.return_value = []

    response = client.put('/api/sku-products/1', json={'sku_name': '수정됨'})
    assert response.status_code == 200
    data = response.get_json()
    assert 'product' in data


def test_update_sku_product_not_found(client, mock_db):
    """SKU 상품 수정 - 존재하지 않는 상품"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = None

    response = client.put('/api/sku-products/999', json={'sku_name': '없는상품'})
    assert response.status_code == 404


def test_delete_sku_product(client, mock_db):
    """SKU 상품 삭제"""
    response = client.delete('/api/sku-products/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True


def test_get_parts_cost(client, mock_db):
    """부위별 원가 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'part_name': '등심', 'price_per_100g': 7800, 'cost_type': 'weight'}
    ]

    response = client.get('/api/parts-cost')
    assert response.status_code == 200
    data = response.get_json()
    assert 'parts' in data


def test_create_parts_cost(client, mock_db):
    """부위별 원가 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'part_name': '등심', 'price_per_100g': 7800, 'cost_type': '한우'
    }

    response = client.post('/api/parts-cost', json={
        'part_name': '등심',
        'price_per_100g': 7800,
        'cost_type': '한우'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'part' in data


def test_create_parts_cost_no_name(client):
    """부위별 원가 생성 - 이름 누락"""
    response = client.post('/api/parts-cost', json={'price_per_100g': 7800})
    assert response.status_code == 400


def test_update_parts_cost(client, mock_db):
    """부위별 원가 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'part_name': '채끝', 'price_per_100g': 8500, 'cost_type': 'weight'
    }

    response = client.put('/api/parts-cost/1', json={
        'part_name': '채끝',
        'price_per_100g': 8500,
        'cost_type': 'weight'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'part' in data
    assert data['part']['part_name'] == '채끝'


def test_update_parts_cost_no_name(client):
    """부위별 원가 수정 - 이름 누락"""
    response = client.put('/api/parts-cost/1', json={'price_per_100g': 8500})
    assert response.status_code == 400


def test_update_parts_cost_not_found(client, mock_db):
    """부위별 원가 수정 - 존재하지 않는 항목"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = None

    response = client.put('/api/parts-cost/999', json={
        'part_name': '없는부위', 'price_per_100g': 1000
    })
    assert response.status_code == 404


def test_delete_parts_cost(client, mock_db):
    """부위별 원가 삭제"""
    response = client.delete('/api/parts-cost/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True


def test_get_packaging_cost(client, mock_db):
    """포장재 원가 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'packaging_name': '선물포장', 'price': 5000}
    ]

    response = client.get('/api/packaging-cost')
    assert response.status_code == 200
    data = response.get_json()
    assert 'packaging' in data


def test_create_packaging_cost(client, mock_db):
    """포장재 원가 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'packaging_name': '선물포장', 'price': 5000
    }

    response = client.post('/api/packaging-cost', json={
        'packaging_name': '선물포장',
        'price': 5000
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'packaging' in data


def test_create_packaging_cost_no_name(client):
    """포장재 원가 생성 - 이름 누락"""
    response = client.post('/api/packaging-cost', json={'price': 5000})
    assert response.status_code == 400


def test_update_packaging_cost(client, mock_db):
    """포장재 원가 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'packaging_name': '보냉백', 'price': 3000
    }

    response = client.put('/api/packaging-cost/1', json={
        'packaging_name': '보냉백',
        'price': 3000
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'packaging' in data
    assert data['packaging']['packaging_name'] == '보냉백'


def test_update_packaging_cost_no_name(client):
    """포장재 원가 수정 - 이름 누락"""
    response = client.put('/api/packaging-cost/1', json={'price': 3000})
    assert response.status_code == 400


def test_update_packaging_cost_not_found(client, mock_db):
    """포장재 원가 수정 - 존재하지 않는 항목"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = None

    response = client.put('/api/packaging-cost/999', json={
        'packaging_name': '없는포장재', 'price': 1000
    })
    assert response.status_code == 404


def test_delete_packaging_cost(client, mock_db):
    """포장재 원가 삭제"""
    response = client.delete('/api/packaging-cost/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True


# ============================================================
# 원가 이상 감지 테스트 (A-2)
# ============================================================
def test_detect_anomaly_high_z_score():
    """Z-score 높은 이상치 감지"""
    from routes.sku import detect_cost_anomaly
    from unittest.mock import MagicMock

    mock_cur = MagicMock()
    # 안정적 가격 이력 (100 ± 소폭)
    mock_cur.fetchall.return_value = [
        {'new_price': 100}, {'new_price': 102}, {'new_price': 98},
        {'new_price': 101}, {'new_price': 99}, {'new_price': 100},
        {'new_price': 101}, {'new_price': 100}, {'new_price': 99}, {'new_price': 100}
    ]
    result = detect_cost_anomaly(mock_cur, 'parts_cost', 1, 200)
    assert result is not None
    assert result['severity'] == 'danger'


def test_detect_anomaly_insufficient_history():
    """이력 부족 시 변동률 기반 감지"""
    from routes.sku import detect_cost_anomaly
    from unittest.mock import MagicMock

    mock_cur = MagicMock()
    mock_cur.fetchall.return_value = [{'new_price': 1000}]
    result = detect_cost_anomaly(mock_cur, 'parts_cost', 1, 1500)
    assert result is not None
    assert result['severity'] == 'warning'


def test_detect_anomaly_normal_change():
    """정상 범위 변동 - 이상 없음"""
    from routes.sku import detect_cost_anomaly
    from unittest.mock import MagicMock

    mock_cur = MagicMock()
    mock_cur.fetchall.return_value = [
        {'new_price': 100}, {'new_price': 105}, {'new_price': 95},
        {'new_price': 110}, {'new_price': 90}
    ]
    result = detect_cost_anomaly(mock_cur, 'parts_cost', 1, 102)
    assert result is None


def test_cost_anomaly_api_list(client, mock_db):
    """이상 감지 목록 API"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'table_name': 'parts_cost', 'item_id': 1, 'item_name': '등심',
         'old_price': 100, 'new_price': 200, 'change_pct': 100.0,
         'z_score': 3.5, 'severity': 'danger', 'acknowledged': False}
    ]

    response = client.get('/api/cost-anomalies')
    assert response.status_code == 200
    data = response.get_json()
    assert 'anomalies' in data


def test_cost_anomaly_acknowledge(client, mock_db):
    """이상 감지 확인 처리"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1, 'acknowledged': True}

    response = client.post('/api/cost-anomalies/1/acknowledge')
    assert response.status_code == 200
