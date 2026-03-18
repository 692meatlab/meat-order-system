"""알림 시스템 API 테스트"""


def test_get_notifications(client, mock_db):
    """알림 목록 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'type': 'unpaid', 'title': '미입금 알림', 'message': '테스트',
         'is_read': False, 'created_at': '2026-03-18'}
    ]
    mock_cursor.fetchone.return_value = {'count': 1}
    res = client.get('/api/notifications')
    assert res.status_code == 200
    data = res.get_json()
    assert 'notifications' in data
    assert 'unread_count' in data


def test_get_unread_notifications(client, mock_db):
    """읽지 않은 알림만 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []
    mock_cursor.fetchone.return_value = {'count': 0}
    res = client.get('/api/notifications?unread_only=true')
    assert res.status_code == 200


def test_mark_notifications_read(client, mock_db):
    """알림 읽음 처리"""
    res = client.post('/api/notifications/mark-read', json={
        'ids': [1, 2, 3]
    })
    assert res.status_code == 200


def test_mark_all_notifications_read(client, mock_db):
    """전체 알림 읽음 처리"""
    res = client.post('/api/notifications/mark-read', json={})
    assert res.status_code == 200


def test_generate_notifications(client, mock_db):
    """알림 생성 (폴링 트리거)"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []
    mock_cursor.fetchone.return_value = {'id': 1}
    res = client.post('/api/notifications/generate', json={})
    assert res.status_code == 200
    data = res.get_json()
    assert 'created' in data


def test_generate_notifications_with_unpaid(client, mock_db):
    """미입금 주문 알림 생성"""
    _, mock_cursor = mock_db
    # 첫 fetchall은 미입금 주문, 나머지는 빈 배열
    mock_cursor.fetchall.side_effect = [
        [{'id': 1, 'vendor_name': '테스트', 'recipient': '홍길동', 'sku_name': '등심세트'}],
        [],  # unshipped
        []   # low_stock
    ]
    mock_cursor.fetchone.return_value = {'id': 1}
    res = client.post('/api/notifications/generate', json={})
    assert res.status_code == 200
