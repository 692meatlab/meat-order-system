"""백업/복원 API 테스트"""
import json


def test_export_backup(client, mock_db):
    """데이터 내보내기"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = []
    res = client.get('/api/backup/export')
    assert res.status_code == 200
    assert 'application/json' in res.content_type
    data = json.loads(res.data)
    assert 'tables' in data
    assert 'exported_at' in data


def test_import_backup_preview(client, mock_db):
    """복원 미리보기 (confirm=false)"""
    backup_data = {
        'tables': {
            'users': [{'id': 1, 'name': '홍길동'}],
            'orders': [{'id': 1, 'vendor_name': '테스트'}]
        }
    }
    res = client.post('/api/backup/import', json=backup_data)
    assert res.status_code == 200
    data = res.get_json()
    assert 'preview' in data
    assert data['preview']['users'] == 1
    assert data['preview']['orders'] == 1


def test_import_backup_invalid(client, mock_db):
    """잘못된 백업 파일"""
    res = client.post('/api/backup/import', json={'invalid': True})
    assert res.status_code == 400


def test_get_backup_log(client, mock_db):
    """백업 이력 조회"""
    _, mock_cursor = mock_db
    mock_cursor.fetchall.return_value = [
        {'id': 1, 'backup_type': 'export', 'table_count': 8,
         'total_rows': 100, 'created_at': '2026-03-18'}
    ]
    res = client.get('/api/backup/log')
    assert res.status_code == 200
    data = res.get_json()
    assert 'logs' in data
