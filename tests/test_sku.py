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


def test_delete_packaging_cost(client, mock_db):
    """포장재 원가 삭제"""
    response = client.delete('/api/packaging-cost/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
