"""백업/복원 API"""
import json
import logging
from datetime import datetime, date
from decimal import Decimal
from flask import Blueprint, jsonify, request, g, Response
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

backup_bp = Blueprint('backup', __name__)


def get_db():
    """DB 연결 가져오기 (app context에서)"""
    return g.get('db')


def require_api_key(f):
    """API 키 인증"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not Config.API_KEY:
            return f(*args, **kwargs)
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        if api_key != Config.API_KEY:
            logger.warning(f'인증 실패: {request.remote_addr} -> {request.path}')
            return jsonify({'error': '인증이 필요합니다'}), 401
        return f(*args, **kwargs)
    return decorated


def json_serializer(obj):
    """JSON 직렬화 헬퍼"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f'Type {type(obj)} not serializable')


BACKUP_TABLES = ['users', 'parts_cost', 'packaging_cost', 'sku_products',
                 'sku_compositions', 'vendor_mappings', 'vendor_templates', 'orders']


@backup_bp.route('/api/backup/export', methods=['GET'])
@require_api_key
def export_backup():
    """전체 데이터 JSON 다운로드"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        backup_data = {'exported_at': datetime.now().isoformat(), 'tables': {}}
        total_rows = 0

        with conn.cursor() as cur:
            for table in BACKUP_TABLES:
                cur.execute(f'SELECT * FROM {table}')
                rows = [dict(row) for row in cur.fetchall()]
                backup_data['tables'][table] = rows
                total_rows += len(rows)

            # 백업 로그 기록
            cur.execute('''
                INSERT INTO backup_log (backup_type, table_count, total_rows)
                VALUES ('export', %s, %s)
            ''', (len(BACKUP_TABLES), total_rows))
            conn.commit()

        json_str = json.dumps(backup_data, default=json_serializer, ensure_ascii=False, indent=2)
        today = datetime.now().strftime('%Y%m%d_%H%M%S')

        return Response(
            json_str,
            mimetype='application/json',
            headers={'Content-Disposition': f'attachment; filename=backup_{today}.json'}
        )
    except Exception as e:
        logger.error(f'[export_backup] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@backup_bp.route('/api/backup/import', methods=['POST'])
@require_api_key
def import_backup():
    """JSON 업로드로 복원"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    if not data or 'tables' not in data:
        return jsonify({'error': '유효한 백업 파일이 아닙니다'}), 400

    confirm = request.args.get('confirm', 'false') == 'true'
    if not confirm:
        # 미리보기만 반환
        summary = {}
        for table, rows in data['tables'].items():
            summary[table] = len(rows)
        return jsonify({'preview': summary, 'message': '복원하려면 ?confirm=true 파라미터를 추가하세요'})

    try:
        total_rows = 0
        with conn.cursor() as cur:
            # 역순으로 삭제 (FK 제약 고려)
            for table in reversed(BACKUP_TABLES):
                if table in data['tables']:
                    cur.execute(f'DELETE FROM {table}')

            # 순서대로 삽입
            for table in BACKUP_TABLES:
                rows = data['tables'].get(table, [])
                for row in rows:
                    if not row:
                        continue
                    columns = list(row.keys())
                    placeholders = ', '.join(['%s'] * len(columns))
                    col_names = ', '.join(columns)
                    values = [row[c] for c in columns]
                    cur.execute(f'INSERT INTO {table} ({col_names}) VALUES ({placeholders})', values)
                    total_rows += 1

            # 시퀀스 리셋
            for table in BACKUP_TABLES:
                cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table}")

            # 백업 로그 기록
            cur.execute('''
                INSERT INTO backup_log (backup_type, table_count, total_rows)
                VALUES ('import', %s, %s)
            ''', (len(data['tables']), total_rows))

            conn.commit()

        logger.info(f'백업 복원 완료: {total_rows}건')
        return jsonify({'success': True, 'total_rows': total_rows})
    except Exception as e:
        conn.rollback()
        logger.error(f'[import_backup] 오류: {e}', exc_info=True)
        return jsonify({'error': f'복원 실패: {str(e)}'}), 500


@backup_bp.route('/api/backup/log', methods=['GET'])
def get_backup_log():
    """백업 이력 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM backup_log ORDER BY created_at DESC LIMIT 50')
            logs = cur.fetchall()
        return jsonify({'logs': logs})
    except Exception as e:
        logger.error(f'[get_backup_log] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
