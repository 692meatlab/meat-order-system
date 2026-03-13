"""시스템 API 테스트"""


def test_health_check(client, mock_db):
    """헬스체크 정상 응답"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert 'database' in data
    assert 'timestamp' in data


def test_health_check_db_status(client, mock_db):
    """헬스체크 - DB 연결 상태 확인"""
    response = client.get('/api/health')
    data = response.get_json()
    # mock_db가 있으므로 connected 상태
    assert data['database'] == 'connected'


def test_index_page(client):
    """메인 페이지 렌더링"""
    response = client.get('/')
    assert response.status_code == 200
