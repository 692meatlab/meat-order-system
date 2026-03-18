"""업로드 이력 API 테스트"""


def test_get_upload_history(client, mock_db):
    """업로드 이력 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'user_id': 1, 'filename': 'test.xlsx', 'row_count': 10,
         'matched_count': 8, 'unmatched_count': 2, 'vendor_name': '테스트거래처',
         'status': 'completed', 'user_name': '홍길동', 'created_at': '2026-03-18'}
    ]
    res = client.get('/api/upload-history')
    assert res.status_code == 200
    data = res.get_json()
    assert 'history' in data


def test_get_upload_history_with_user_filter(client, mock_db):
    """사용자별 업로드 이력 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []
    res = client.get('/api/upload-history?user_id=1')
    assert res.status_code == 200


def test_create_upload_history(client, mock_db):
    """업로드 이력 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'user_id': 1, 'filename': 'test.xlsx', 'file_size': 1024,
        'row_count': 10, 'matched_count': 8, 'unmatched_count': 2,
        'vendor_name': '테스트거래처', 'status': 'completed',
        'created_at': '2026-03-18T10:00:00'
    }
    res = client.post('/api/upload-history', json={
        'user_id': 1, 'filename': 'test.xlsx', 'file_size': 1024,
        'row_count': 10, 'matched_count': 8, 'unmatched_count': 2,
        'vendor_name': '테스트거래처'
    })
    assert res.status_code == 201


def test_create_upload_history_no_filename(client, mock_db):
    """파일명 없이 업로드 이력 생성 시 400"""
    res = client.post('/api/upload-history', json={'user_id': 1})
    assert res.status_code == 400
