"""사용자 관련 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

users_bp = Blueprint('users', __name__)


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


@users_bp.route('/api/users', methods=['GET'])
def get_users():
    """사용자 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, role, created_at FROM users ORDER BY name')
            users = cur.fetchall()
        return jsonify({'users': users})
    except Exception as e:
        logger.error(f'[get_users] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@users_bp.route('/api/users', methods=['POST'])
@require_api_key
def create_user():
    """사용자 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    name = data.get('name', '').strip()
    role = data.get('role', 'user')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO users (name, role) VALUES (%s, %s) RETURNING id, name, role, created_at',
                (name, role)
            )
            user = cur.fetchone()
            conn.commit()
        return jsonify({'user': user}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_user] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@users_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_api_key
def delete_user(user_id):
    """사용자 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_user] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
