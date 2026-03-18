"""재고 관리 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

inventory_bp = Blueprint('inventory', __name__)


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


@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    """전체 재고 목록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT i.*, sp.sku_name
                FROM inventory i
                JOIN sku_products sp ON i.sku_product_id = sp.id
                ORDER BY sp.sku_name
            ''')
            inventory = cur.fetchall()
        return jsonify({'inventory': inventory})
    except Exception as e:
        logger.error(f'[get_inventory] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@inventory_bp.route('/api/inventory/<int:sku_product_id>', methods=['PUT'])
@require_api_key
def update_inventory(sku_product_id):
    """재고/최소재고 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    current_stock = data.get('current_stock')
    min_stock = data.get('min_stock')

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO inventory (sku_product_id, current_stock, min_stock, updated_at)
                VALUES (%s, %s, %s, NOW())
                ON CONFLICT (sku_product_id) DO UPDATE SET
                    current_stock = COALESCE(%s, inventory.current_stock),
                    min_stock = COALESCE(%s, inventory.min_stock),
                    updated_at = NOW()
                RETURNING *
            ''', (sku_product_id,
                  current_stock if current_stock is not None else 0,
                  min_stock if min_stock is not None else 0,
                  current_stock, min_stock))
            inv = cur.fetchone()
            conn.commit()
        return jsonify({'inventory': inv})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_inventory] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@inventory_bp.route('/api/inventory/adjust', methods=['POST'])
@require_api_key
def adjust_inventory():
    """재고 수동 조정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    sku_product_id = data.get('sku_product_id')
    change_qty = data.get('change_qty', 0)
    change_type = data.get('change_type', 'manual')
    note = data.get('note', '')

    if not sku_product_id or change_qty == 0:
        return jsonify({'error': 'sku_product_id와 change_qty는 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            # 현재 재고 조회 (없으면 생성)
            cur.execute('''
                INSERT INTO inventory (sku_product_id, current_stock, min_stock)
                VALUES (%s, 0, 0)
                ON CONFLICT (sku_product_id) DO NOTHING
            ''', (sku_product_id,))

            cur.execute('SELECT current_stock FROM inventory WHERE sku_product_id = %s', (sku_product_id,))
            row = cur.fetchone()
            before_stock = row['current_stock'] if row else 0
            after_stock = before_stock + change_qty

            # 재고 업데이트
            cur.execute('''
                UPDATE inventory SET current_stock = %s, updated_at = NOW()
                WHERE sku_product_id = %s
            ''', (after_stock, sku_product_id))

            # 이력 기록
            cur.execute('''
                INSERT INTO inventory_log (sku_product_id, change_type, change_qty,
                    before_stock, after_stock, note)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (sku_product_id, change_type, change_qty, before_stock, after_stock, note))

            conn.commit()

        return jsonify({'before_stock': before_stock, 'after_stock': after_stock})
    except Exception as e:
        conn.rollback()
        logger.error(f'[adjust_inventory] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@inventory_bp.route('/api/inventory/alerts', methods=['GET'])
def get_inventory_alerts():
    """최소 재고 이하 SKU 알림"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT i.*, sp.sku_name
                FROM inventory i
                JOIN sku_products sp ON i.sku_product_id = sp.id
                WHERE i.current_stock <= i.min_stock AND i.min_stock > 0
                ORDER BY (i.current_stock - i.min_stock) ASC
            ''')
            alerts = cur.fetchall()
        return jsonify({'alerts': alerts})
    except Exception as e:
        logger.error(f'[get_inventory_alerts] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
