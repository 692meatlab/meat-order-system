"""거래처 API 테스트"""


def test_get_vendors(client, mock_db):
    """거래처 목록 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'vendor_name': '거래처A'},
        {'vendor_name': '거래처B'},
    ]

    response = client.get('/api/vendors')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vendors' in data
    assert len(data['vendors']) == 2


def test_get_vendor_mappings(client, mock_db):
    """거래처 매핑 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/vendor-mappings')
    assert response.status_code == 200
    data = response.get_json()
    assert 'mappings' in data


def test_get_vendor_mappings_filtered(client, mock_db):
    """거래처 매핑 필터링 (vendor 파라미터)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {
            'id': 1, 'vendor_name': '테스트거래처', 'product_code': 'TEST-001',
            'product_name': '테스트상품', 'sku_product_id': 1, 'sku_name': '등심세트'
        }
    ]

    response = client.get('/api/vendor-mappings?vendor=테스트거래처')
    assert response.status_code == 200
    data = response.get_json()
    assert 'mappings' in data


def test_create_vendor_mapping(client, mock_db):
    """거래처 매핑 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'vendor_name': '테스트거래처', 'product_code': 'TEST-001',
        'product_name': '테스트상품', 'sku_product_id': 1
    }

    response = client.post('/api/vendor-mappings', json={
        'vendor_name': '테스트거래처',
        'product_code': 'TEST-001',
        'product_name': '테스트상품',
        'sku_product_id': 1
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'mapping' in data


def test_create_vendor_mapping_no_vendor(client):
    """거래처 매핑 생성 - 거래처명 누락"""
    response = client.post('/api/vendor-mappings', json={
        'product_code': 'TEST-001',
        'sku_product_id': 1
    })
    assert response.status_code == 400


def test_update_vendor_mapping(client, mock_db):
    """거래처 매핑 수정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'vendor_name': '테스트거래처', 'product_code': 'TEST-001',
        'product_name': '테스트상품', 'sku_product_id': 2
    }

    response = client.put('/api/vendor-mappings/1', json={'sku_product_id': 2})
    assert response.status_code == 200
    data = response.get_json()
    assert 'mapping' in data


def test_delete_vendor_mapping(client, mock_db):
    """거래처 매핑 삭제"""
    response = client.delete('/api/vendor-mappings/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True


def test_get_vendor_templates(client, mock_db):
    """거래처 템플릿 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.get('/api/vendor-templates')
    assert response.status_code == 200
    data = response.get_json()
    assert 'templates' in data


def test_save_vendor_template(client, mock_db):
    """거래처 템플릿 저장"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'vendor_name': '테스트거래처',
        'template_json': '{"col1": "orderNo", "col2": "quantity"}'
    }

    response = client.post('/api/vendor-templates', json={
        'vendor_name': '테스트거래처',
        'template_json': {'col1': 'orderNo', 'col2': 'quantity'}
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'template' in data


def test_save_vendor_template_no_vendor(client):
    """거래처 템플릿 저장 - 거래처명 누락"""
    response = client.post('/api/vendor-templates', json={
        'template_json': {'col1': 'orderNo'}
    })
    assert response.status_code == 400


def test_suggest_mappings(client, mock_db):
    """매핑 제안"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.side_effect = [
        [
            {'id': 1, 'vendor_name': '거래처A', 'product_code': '등심001',
             'sku_name': '등심세트', 'sku_product_id': 1}
        ],
        [],  # sku_suggestions (첫 결과가 5개 미만이면 호출됨)
    ]

    response = client.get('/api/vendor-mappings/suggest?q=등심')
    assert response.status_code == 200
    data = response.get_json()
    assert 'suggestions' in data


def test_suggest_mappings_with_vendor(client, mock_db):
    """매핑 제안 - 거래처 지정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.side_effect = [
        [],
        [{'sku_product_id': 1, 'sku_name': '등심세트'}],
    ]

    response = client.get('/api/vendor-mappings/suggest?q=등심&vendor=거래처A')
    assert response.status_code == 200
    data = response.get_json()
    assert 'suggestions' in data
    assert 'sku_suggestions' in data


def test_suggest_mappings_no_query(client):
    """매핑 제안 - 쿼리 없음"""
    response = client.get('/api/vendor-mappings/suggest')
    assert response.status_code == 200
    data = response.get_json()
    assert data['suggestions'] == []
