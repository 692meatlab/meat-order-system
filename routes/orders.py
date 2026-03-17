"""주문 관련 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

orders_bp = Blueprint('orders', __name__)


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


# ============================================================
# 주문 CRUD API
# ============================================================
@orders_bp.route('/api/orders', methods=['GET'])
def get_orders():
    """주문 목록 조회 (페이지네이션 지원)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    page = max(1, request.args.get('page', 1, type=int))
    per_page = min(200, max(1, request.args.get('per_page', 50, type=int)))

    try:
        with conn.cursor() as cur:
            # 동적 WHERE 조건 구성
            conditions = ''
            params = []

            if user_id:
                conditions += ' AND o.user_id = %s'
                params.append(user_id)

            if status:
                conditions += ' AND o.status = %s'
                params.append(status)

            if date_from:
                conditions += ' AND o.release_date >= %s'
                params.append(date_from)

            if date_to:
                conditions += ' AND o.release_date <= %s'
                params.append(date_to)

            # COUNT 쿼리
            count_query = 'SELECT COUNT(*) as count FROM orders o WHERE 1=1' + conditions
            cur.execute(count_query, params)
            total = cur.fetchone()['count']

            # 데이터 쿼리 (OFFSET/LIMIT)
            data_query = '''
                SELECT o.*, u.name as user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE 1=1
            ''' + conditions
            data_query += ' ORDER BY o.release_date DESC, o.created_at DESC LIMIT %s OFFSET %s'
            data_params = params + [per_page, (page - 1) * per_page]

            cur.execute(data_query, data_params)
            orders = cur.fetchall()

        total_pages = (total + per_page - 1) // per_page if total > 0 else 1

        return jsonify({
            'orders': orders,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages
        })
    except Exception as e:
        logger.error(f'[get_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders', methods=['POST'])
@require_api_key
def create_orders():
    """주문 생성 (bulk)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    orders = data.get('orders', [])
    user_id = data.get('user_id')

    if not orders:
        return jsonify({'error': 'Orders are required'}), 400

    try:
        with conn.cursor() as cur:
            created = []
            for order in orders:
                cur.execute('''
                    INSERT INTO orders (
                        user_id, order_date, vendor_name, product_name, sku_name,
                        quantity, recipient, phone, address, memo, status, release_date,
                        delivery_no, product_code, unit_price, note, source_file,
                        invoice_no, sender_name, sender_phone, sender_addr, order_no,
                        shipped, paid, invoice_issued
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                              %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    user_id,
                    order.get('order_date'),
                    order.get('vendor_name'),
                    order.get('product_name'),
                    order.get('sku_name'),
                    order.get('quantity', 1),
                    order.get('recipient'),
                    order.get('phone'),
                    order.get('address'),
                    order.get('memo'),
                    order.get('status', 'registered'),
                    order.get('release_date'),
                    order.get('delivery_no'),
                    order.get('product_code'),
                    order.get('unit_price', 0),
                    order.get('note'),
                    order.get('source_file'),
                    order.get('invoice_no'),
                    order.get('sender_name'),
                    order.get('sender_phone'),
                    order.get('sender_addr'),
                    order.get('order_no'),
                    order.get('shipped', False),
                    order.get('paid', False),
                    order.get('invoice_issued', False)
                ))
                created.append(cur.fetchone()['id'])
            conn.commit()
        logger.info(f'주문 {len(created)}건 생성 완료 (user_id={user_id})')
        return jsonify({'created_ids': created, 'count': len(created)}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/<int:order_id>', methods=['PUT'])
@require_api_key
def update_order(order_id):
    """주문 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()

    try:
        with conn.cursor() as cur:
            # 업데이트할 필드 동적 생성
            updates = []
            params = []

            field_map = {
                'vendor_name': 'vendor_name',
                'product_name': 'product_name',
                'sku_name': 'sku_name',
                'quantity': 'quantity',
                'recipient': 'recipient',
                'phone': 'phone',
                'address': 'address',
                'memo': 'memo',
                'status': 'status',
                'shipped': 'shipped',
                'paid': 'paid',
                'invoice_issued': 'invoice_issued',
                'invoice_no': 'invoice_no',
                'release_date': 'release_date',
                'delivery_no': 'delivery_no',
                'product_code': 'product_code',
                'unit_price': 'unit_price',
                'note': 'note',
                'source_file': 'source_file',
                'sender_name': 'sender_name',
                'sender_phone': 'sender_phone',
                'sender_addr': 'sender_addr',
                'order_no': 'order_no'
            }

            for key, col in field_map.items():
                if key in data:
                    updates.append(f'{col} = %s')
                    params.append(data[key])

            if not updates:
                return jsonify({'error': 'No fields to update'}), 400

            params.append(order_id)
            cur.execute(f'''
                UPDATE orders SET {', '.join(updates)} WHERE id = %s RETURNING *
            ''', params)
            order = cur.fetchone()
            conn.commit()
        return jsonify({'order': order})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_order] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/bulk-update', methods=['POST'])
@require_api_key
def bulk_update_orders():
    """주문 일괄 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    order_ids = data.get('order_ids', [])
    updates = data.get('updates', {})

    if not order_ids:
        return jsonify({'error': 'Order IDs are required'}), 400

    allowed_fields = ['status', 'shipped', 'paid', 'invoice_issued', 'memo', 'release_date', 'invoice_no', 'unit_price', 'note']

    try:
        with conn.cursor() as cur:
            set_clauses = []
            params = []

            for key, value in updates.items():
                if key in allowed_fields:
                    set_clauses.append(f'{key} = %s')
                    params.append(value)

            if set_clauses:
                query = f"UPDATE orders SET {', '.join(set_clauses)} WHERE id = ANY(%s)"
                params.append(order_ids)
                cur.execute(query, params)

            conn.commit()
        logger.info(f'주문 {len(order_ids)}건 일괄 수정')
        return jsonify({'updated': len(order_ids)})
    except Exception as e:
        conn.rollback()
        logger.error(f'[bulk_update_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@require_api_key
def delete_order(order_id):
    """주문 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM orders WHERE id = %s', (order_id,))
            conn.commit()
        logger.info(f'주문 삭제: id={order_id}')
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_order] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/bulk-delete', methods=['POST'])
@require_api_key
def bulk_delete_orders():
    """주문 일괄 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    order_ids = data.get('order_ids', [])

    if not order_ids:
        return jsonify({'error': 'Order IDs are required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM orders WHERE id = ANY(%s)', (order_ids,))
            conn.commit()
        logger.info(f'주문 {len(order_ids)}건 일괄 삭제')
        return jsonify({'deleted': len(order_ids)})
    except Exception as e:
        conn.rollback()
        logger.error(f'[bulk_delete_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 통계 및 분석 API
# ============================================================
@orders_bp.route('/api/orders/stats')
def order_stats():
    """주문 통계 집계 - 거래처별, 월별, SKU별"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            # 거래처별 집계
            cur.execute('''
                SELECT vendor_name, COUNT(*) as count,
                       SUM(quantity) as total_qty,
                       SUM(CASE WHEN shipped = true THEN 1 ELSE 0 END) as shipped_count,
                       SUM(CASE WHEN paid = true THEN 1 ELSE 0 END) as paid_count
                FROM orders
                WHERE vendor_name IS NOT NULL
                GROUP BY vendor_name
                ORDER BY count DESC
            ''')
            by_vendor = cur.fetchall()

            # 월별 집계 (최근 6개월)
            cur.execute('''
                SELECT TO_CHAR(order_date, 'YYYY-MM') as month,
                       COUNT(*) as count,
                       SUM(quantity) as total_qty
                FROM orders
                WHERE order_date >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY TO_CHAR(order_date, 'YYYY-MM')
                ORDER BY month
            ''')
            by_month = cur.fetchall()

            # SKU별 집계
            cur.execute('''
                SELECT sku_name, COUNT(*) as count,
                       SUM(quantity) as total_qty
                FROM orders
                WHERE sku_name IS NOT NULL AND sku_name != ''
                GROUP BY sku_name
                ORDER BY total_qty DESC
                LIMIT 20
            ''')
            by_sku = cur.fetchall()

            # 전체 요약
            cur.execute('''
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN shipped = true THEN 1 ELSE 0 END) as shipped,
                       SUM(CASE WHEN paid = true THEN 1 ELSE 0 END) as paid,
                       SUM(CASE WHEN invoice_issued = true THEN 1 ELSE 0 END) as invoice_issued,
                       SUM(quantity) as total_qty
                FROM orders
            ''')
            summary = cur.fetchone()

        return jsonify({
            'by_vendor': by_vendor,
            'by_month': by_month,
            'by_sku': by_sku,
            'summary': summary
        })
    except Exception as e:
        logger.error(f'[order_stats] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/check-duplicates', methods=['POST'])
def check_duplicates():
    """중복 주문 감지 - 등록 전 중복 후보 반환"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    orders_to_check = data.get('orders', [])

    if not orders_to_check:
        return jsonify({'duplicates': []})

    try:
        duplicates = []
        with conn.cursor() as cur:
            for idx, order in enumerate(orders_to_check):
                recipient = order.get('recipient', '')
                sku_name = order.get('sku_name', '')

                if not recipient or not sku_name:
                    continue

                cur.execute('''
                    SELECT id, vendor_name, sku_name, quantity, recipient, address,
                           order_date, status
                    FROM orders
                    WHERE recipient = %s AND sku_name = %s
                    AND order_date >= CURRENT_DATE - INTERVAL '7 days'
                    LIMIT 5
                ''', (recipient, sku_name))

                matches = cur.fetchall()
                if matches:
                    duplicates.append({
                        'index': idx,
                        'order': order,
                        'existing': matches
                    })

        return jsonify({'duplicates': duplicates})
    except Exception as e:
        logger.error(f'[check_duplicates] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/anomaly-stats')
def anomaly_stats():
    """이상치 감지용 통계 - 거래처+SKU별 평균 수량/단가"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT vendor_name, sku_name,
                       AVG(quantity) as avg_qty,
                       STDDEV(quantity) as stddev_qty,
                       AVG(unit_price) as avg_price,
                       STDDEV(unit_price) as stddev_price,
                       COUNT(*) as sample_count
                FROM orders
                WHERE vendor_name IS NOT NULL AND sku_name IS NOT NULL
                AND sku_name != ''
                GROUP BY vendor_name, sku_name
                HAVING COUNT(*) >= 3
            ''')
            stats = cur.fetchall()

            # float 변환 (Decimal 호환)
            for s in stats:
                for key in ['avg_qty', 'stddev_qty', 'avg_price', 'stddev_price']:
                    if s[key] is not None:
                        s[key] = float(s[key])
                    else:
                        s[key] = 0

        return jsonify({'stats': stats})
    except Exception as e:
        logger.error(f'[anomaly_stats] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
