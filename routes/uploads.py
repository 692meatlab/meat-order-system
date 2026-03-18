"""엑셀 업로드 이력 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

uploads_bp = Blueprint('uploads', __name__)


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


@uploads_bp.route('/api/upload-history', methods=['GET'])
def get_upload_history():
    """업로드 이력 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    user_id = request.args.get('user_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    try:
        with conn.cursor() as cur:
            query = '''
                SELECT uh.*, u.name as user_name
                FROM upload_history uh
                LEFT JOIN users u ON uh.user_id = u.id
                WHERE 1=1
            '''
            params = []

            if user_id:
                query += ' AND uh.user_id = %s'
                params.append(user_id)

            if date_from:
                query += ' AND uh.created_at >= %s'
                params.append(date_from)

            if date_to:
                query += " AND uh.created_at < %s::date + interval '1 day'"
                params.append(date_to)

            query += ' ORDER BY uh.created_at DESC LIMIT 100'

            cur.execute(query, params)
            history = cur.fetchall()

        return jsonify({'history': history})
    except Exception as e:
        logger.error(f'[get_upload_history] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@uploads_bp.route('/api/upload-history', methods=['POST'])
@require_api_key
def create_upload_history():
    """업로드 이력 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    user_id = data.get('user_id')
    filename = data.get('filename', '')
    file_size = data.get('file_size', 0)
    row_count = data.get('row_count', 0)
    matched_count = data.get('matched_count', 0)
    unmatched_count = data.get('unmatched_count', 0)
    vendor_name = data.get('vendor_name', '')
    status = data.get('status', 'completed')

    if not filename:
        return jsonify({'error': '파일명은 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO upload_history (user_id, filename, file_size, row_count,
                    matched_count, unmatched_count, vendor_name, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *
            ''', (user_id, filename, file_size, row_count, matched_count,
                  unmatched_count, vendor_name, status))
            record = cur.fetchone()
            conn.commit()
        return jsonify({'history': record}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_upload_history] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
