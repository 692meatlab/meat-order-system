"""알림 시스템 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

notifications_bp = Blueprint('notifications', __name__)


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


@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    """알림 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    unread_only = request.args.get('unread_only', 'false') == 'true'

    try:
        with conn.cursor() as cur:
            if unread_only:
                cur.execute('''
                    SELECT * FROM notifications
                    WHERE is_read = FALSE
                    ORDER BY created_at DESC LIMIT 50
                ''')
            else:
                cur.execute('''
                    SELECT * FROM notifications
                    ORDER BY created_at DESC LIMIT 100
                ''')
            notifications = cur.fetchall()

            # 읽지 않은 알림 수
            cur.execute('SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE')
            unread_count = cur.fetchone()['count']

        return jsonify({'notifications': notifications, 'unread_count': unread_count})
    except Exception as e:
        logger.error(f'[get_notifications] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@notifications_bp.route('/api/notifications/mark-read', methods=['POST'])
@require_api_key
def mark_notifications_read():
    """알림 읽음 처리"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    notification_ids = data.get('ids', [])

    try:
        with conn.cursor() as cur:
            if notification_ids:
                cur.execute('UPDATE notifications SET is_read = TRUE WHERE id = ANY(%s)', (notification_ids,))
            else:
                cur.execute('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE')
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[mark_notifications_read] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@notifications_bp.route('/api/notifications/generate', methods=['POST'])
@require_api_key
def generate_notifications():
    """알림 생성 (클라이언트 폴링 트리거)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        created = []
        with conn.cursor() as cur:
            # 1. 미입금 주문 (D+7 이상)
            cur.execute('''
                SELECT id, vendor_name, recipient, sku_name
                FROM orders
                WHERE paid = FALSE
                AND created_at <= NOW() - INTERVAL '7 days'
                AND id NOT IN (
                    SELECT reference_id FROM notifications
                    WHERE type = 'unpaid' AND reference_type = 'order'
                    AND created_at > NOW() - INTERVAL '1 day'
                )
                LIMIT 20
            ''')
            unpaid = cur.fetchall()
            for o in unpaid:
                cur.execute('''
                    INSERT INTO notifications (type, title, message, reference_type, reference_id)
                    VALUES ('unpaid', %s, %s, 'order', %s) RETURNING id
                ''', (
                    f'미입금 알림: {o["recipient"]}',
                    f'{o["vendor_name"]} - {o["sku_name"]} (7일 이상 미입금)',
                    o['id']
                ))
                created.append(cur.fetchone()['id'])

            # 2. 미출고 주문 (D+3 이상)
            cur.execute('''
                SELECT id, vendor_name, recipient, sku_name
                FROM orders
                WHERE shipped = FALSE
                AND release_date <= CURRENT_DATE - INTERVAL '3 days'
                AND id NOT IN (
                    SELECT reference_id FROM notifications
                    WHERE type = 'unshipped' AND reference_type = 'order'
                    AND created_at > NOW() - INTERVAL '1 day'
                )
                LIMIT 20
            ''')
            unshipped = cur.fetchall()
            for o in unshipped:
                cur.execute('''
                    INSERT INTO notifications (type, title, message, reference_type, reference_id)
                    VALUES ('unshipped', %s, %s, 'order', %s) RETURNING id
                ''', (
                    f'미출고 알림: {o["recipient"]}',
                    f'{o["vendor_name"]} - {o["sku_name"]} (출고일 3일 초과)',
                    o['id']
                ))
                created.append(cur.fetchone()['id'])

            # 3. 재고 부족 (inventory 테이블 존재 시)
            cur.execute('''
                SELECT i.sku_product_id, sp.sku_name, i.current_stock, i.min_stock
                FROM inventory i
                JOIN sku_products sp ON i.sku_product_id = sp.id
                WHERE i.current_stock <= i.min_stock AND i.min_stock > 0
                AND i.sku_product_id NOT IN (
                    SELECT reference_id FROM notifications
                    WHERE type = 'low_stock' AND reference_type = 'inventory'
                    AND created_at > NOW() - INTERVAL '1 day'
                )
                LIMIT 20
            ''')
            low_stock = cur.fetchall()
            for item in low_stock:
                cur.execute('''
                    INSERT INTO notifications (type, title, message, reference_type, reference_id)
                    VALUES ('low_stock', %s, %s, 'inventory', %s) RETURNING id
                ''', (
                    f'재고 부족: {item["sku_name"]}',
                    f'현재 {item["current_stock"]}개 (최소 {item["min_stock"]}개)',
                    item['sku_product_id']
                ))
                created.append(cur.fetchone()['id'])

            conn.commit()

        return jsonify({'created': len(created)})
    except Exception as e:
        conn.rollback()
        logger.error(f'[generate_notifications] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
