"""사용자 API 테스트"""


def test_get_users(client, mock_db):
    """사용자 목록 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'name': '홍길동', 'role': 'user', 'created_at': '2026-03-13'}
    ]

    response = client.get('/api/users')
    assert response.status_code == 200
    data = response.get_json()
    assert 'users' in data


def test_create_user(client, mock_db, sample_user):
    """사용자 생성"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 1, 'name': '홍길동', 'role': 'user', 'created_at': '2026-03-13'
    }

    response = client.post('/api/users', json=sample_user)
    assert response.status_code == 201
    data = response.get_json()
    assert 'user' in data


def test_create_user_with_role(client, mock_db):
    """사용자 생성 - 역할 지정"""
    _, mock_cursor = mock_db
    mock_cursor.fetchone.return_value = {
        'id': 2, 'name': '관리자', 'role': 'admin', 'created_at': '2026-03-13'
    }

    response = client.post('/api/users', json={'name': '관리자', 'role': 'admin'})
    assert response.status_code == 201
    data = response.get_json()
    assert 'user' in data


def test_create_user_no_name(client):
    """사용자 생성 - 이름 누락"""
    response = client.post('/api/users', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_create_user_empty_name(client):
    """사용자 생성 - 빈 이름 (공백만)"""
    response = client.post('/api/users', json={'name': '   '})
    assert response.status_code == 400


def test_delete_user(client, mock_db):
    """사용자 삭제"""
    response = client.delete('/api/users/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
