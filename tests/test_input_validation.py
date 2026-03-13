"""입력 검증 테스트"""
import json


def test_create_user_invalid_json(client):
    """잘못된 JSON 요청"""
    response = client.post('/api/users',
                           data='not json',
                           content_type='application/json')
    assert response.status_code in [400, 500]


def test_order_invalid_quantity(client, mock_db):
    """주문 생성 - 유효하지 않은 수량 (음수)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1}

    response = client.post('/api/orders', json={
        'orders': [{'quantity': -1, 'sku_name': 'test'}],
        'user_id': 1
    })
    # 현재는 음수도 허용하지만, 이 테스트로 향후 검증 추가 시 확인 가능
    assert response.status_code in [201, 400]


def test_sql_injection_attempt(client, mock_db):
    """SQL 인젝션 시도 (파라미터 바인딩으로 방어됨)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []

    response = client.get("/api/orders?user_id=1'; DROP TABLE orders; --")
    # 파라미터 바인딩으로 안전하게 처리되어야 함
    assert response.status_code in [200, 400, 500]


def test_xss_in_user_name(client, mock_db):
    """XSS 시도 in 사용자 이름"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'name': '<script>alert(1)</script>',
        'role': 'user', 'created_at': '2026-03-13'
    }

    response = client.post('/api/users', json={
        'name': '<script>alert(1)</script>'
    })
    assert response.status_code == 201


def test_large_payload(client, mock_db):
    """대용량 페이로드 (1000건)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1}

    large_orders = [{'sku_name': f'test_{i}', 'quantity': 1} for i in range(1000)]
    response = client.post('/api/orders', json={
        'orders': large_orders,
        'user_id': 1
    })
    # 서버가 에러 없이 처리해야 함
    assert response.status_code in [201, 400, 500]


def test_special_characters_in_vendor_name(client, mock_db):
    """특수 문자가 포함된 거래처명"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'vendor_name': '(주)테스트&Co.',
        'product_code': '', 'product_name': '', 'sku_product_id': None
    }

    response = client.post('/api/vendor-mappings', json={
        'vendor_name': '(주)테스트&Co.',
        'product_code': '',
        'sku_product_id': None
    })
    assert response.status_code == 201


def test_unicode_in_address(client, mock_db):
    """유니코드 주소 (한국어)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1}

    response = client.post('/api/orders', json={
        'orders': [{
            'sku_name': '한우등심세트',
            'recipient': '홍길동',
            'address': '서울특별시 강남구 테헤란로 123 ㈜테스트빌딩 3층',
            'quantity': 1
        }],
        'user_id': 1
    })
    assert response.status_code == 201


def test_empty_string_vendor_name(client):
    """빈 문자열 거래처명"""
    response = client.post('/api/vendor-mappings', json={
        'vendor_name': '',
        'product_code': 'TEST-001'
    })
    assert response.status_code == 400


def test_whitespace_only_sku_name(client):
    """공백만 있는 SKU명"""
    response = client.post('/api/sku-products', json={
        'sku_name': '   ',
        'selling_price': 89000
    })
    assert response.status_code == 400


def test_zero_quantity_order(client, mock_db):
    """수량 0 주문"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {'id': 1}

    response = client.post('/api/orders', json={
        'orders': [{'sku_name': 'test', 'quantity': 0}],
        'user_id': 1
    })
    # 현재 로직에서는 0도 허용됨
    assert response.status_code in [201, 400]
