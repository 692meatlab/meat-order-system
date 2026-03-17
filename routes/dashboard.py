"""대시보드 및 통합조회 API"""
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request, g

logger = logging.getLogger('order-management')

dashboard_bp = Blueprint('dashboard', __name__)


def get_db():
    """DB 연결 가져오기 (app context에서)"""
    return g.get('db')


# ============================================================
# 대시보드/통계 API
# ============================================================
@dashboard_bp.route('/api/dashboard/stats')
def get_dashboard_stats():
    """대시보드 통계 (단일 쿼리 최적화)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            # 모든 통계를 단일 쿼리로 조회 (6개 쿼리 -> 1개)
            cur.execute('''
                SELECT
                    (SELECT COUNT(*) FROM orders) as total_orders,
                    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
                    (SELECT COUNT(*) FROM orders WHERE shipped = FALSE) as pending_shipments,
                    (SELECT COUNT(*) FROM orders WHERE paid = FALSE) as unpaid_orders,
                    (SELECT COUNT(*) FROM users) as user_count,
                    (SELECT COUNT(*) FROM sku_products) as sku_count
            ''')
            stats = cur.fetchone()

        return jsonify({
            'total_orders': stats['total_orders'],
            'today_orders': stats['today_orders'],
            'pending_shipments': stats['pending_shipments'],
            'unpaid_orders': stats['unpaid_orders'],
            'user_count': stats['user_count'],
            'sku_count': stats['sku_count']
        })
    except Exception as e:
        logger.error(f'[get_dashboard_stats] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@dashboard_bp.route('/api/dashboard/calendar')
def get_calendar_data():
    """달력용 주문 데이터 (개별 주문 포함)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    year = request.args.get('year', type=int, default=datetime.now().year)
    month = request.args.get('month', type=int, default=datetime.now().month)

    try:
        with conn.cursor() as cur:
            # 해당 월의 모든 주문 가져오기 (SKU 이름, 수량, 배송상태 포함)
            cur.execute('''
                SELECT id, release_date, sku_name, quantity, shipped
                FROM orders
                WHERE EXTRACT(YEAR FROM release_date) = %s
                  AND EXTRACT(MONTH FROM release_date) = %s
                ORDER BY release_date, id
            ''', (year, month))
            orders = cur.fetchall()

        # 날짜별로 그룹핑
        result = {}
        for row in orders:
            if row['release_date']:
                date_str = row['release_date'].strftime('%Y-%m-%d')
                if date_str not in result:
                    result[date_str] = {
                        'order_count': 0,
                        'total_qty': 0,
                        'orders': []
                    }
                result[date_str]['order_count'] += 1
                result[date_str]['total_qty'] += row['quantity'] or 0
                result[date_str]['orders'].append({
                    'id': row['id'],
                    'skuName': row['sku_name'],
                    'quantity': row['quantity'],
                    'shipped': row['shipped'] or False
                })

        return jsonify({'calendar': result, 'year': year, 'month': month})
    except Exception as e:
        logger.error(f'[get_calendar_data] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@dashboard_bp.route('/api/dashboard/range-orders')
def get_range_orders():
    """기간별 발주량 계산"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    start_date = request.args.get('start')
    end_date = request.args.get('end')

    if not start_date or not end_date:
        return jsonify({'error': 'Start and end dates are required'}), 400

    try:
        with conn.cursor() as cur:
            # 기간 내 SKU별 수량 집계
            cur.execute('''
                SELECT sku_name, SUM(quantity) as total_qty, COUNT(*) as order_count
                FROM orders
                WHERE release_date BETWEEN %s AND %s
                GROUP BY sku_name
                ORDER BY total_qty DESC
            ''', (start_date, end_date))
            sku_summary = cur.fetchall()

            # 기간 내 일자별 집계
            cur.execute('''
                SELECT release_date, COUNT(*) as order_count, SUM(quantity) as total_qty
                FROM orders
                WHERE release_date BETWEEN %s AND %s
                GROUP BY release_date
                ORDER BY release_date
            ''', (start_date, end_date))
            daily_summary = cur.fetchall()

        return jsonify({
            'sku_summary': sku_summary,
            'daily_summary': daily_summary
        })
    except Exception as e:
        logger.error(f'[get_range_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 통합조회 API
# ============================================================
@dashboard_bp.route('/api/integrated-orders')
def get_integrated_orders():
    """통합 주문 조회 (모든 사용자)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status')
    shipped = request.args.get('shipped')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    limit = request.args.get('limit', type=int, default=500)

    try:
        with conn.cursor() as cur:
            query = '''
                SELECT o.*, u.name as user_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE 1=1
            '''
            params = []

            if user_id:
                query += ' AND o.user_id = %s'
                params.append(user_id)

            if status:
                query += ' AND o.status = %s'
                params.append(status)

            if shipped is not None:
                query += ' AND o.shipped = %s'
                params.append(shipped == 'true')

            if date_from:
                query += ' AND o.release_date >= %s'
                params.append(date_from)

            if date_to:
                query += ' AND o.release_date <= %s'
                params.append(date_to)

            query += ' ORDER BY o.release_date DESC, o.created_at DESC LIMIT %s'
            params.append(limit)

            cur.execute(query, params)
            orders = cur.fetchall()

            # 통계
            cur.execute('''
                SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE shipped = TRUE) as shipped_count,
                    COUNT(*) FILTER (WHERE paid = TRUE) as paid_count,
                    COUNT(*) FILTER (WHERE invoice_issued = TRUE) as invoice_count
                FROM orders
            ''')
            stats = cur.fetchone()

        return jsonify({'orders': orders, 'stats': stats})
    except Exception as e:
        logger.error(f'[get_integrated_orders] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
