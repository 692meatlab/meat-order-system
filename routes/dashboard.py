"""대시보드 및 통합조회 API + 거래처 성과"""
import logging
from datetime import datetime
from decimal import Decimal
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


# ============================================================
# 거래처별 매출 리포트 API
# ============================================================
@dashboard_bp.route('/api/dashboard/vendor-report')
def get_vendor_report():
    """거래처별 매출 리포트"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    vendor = request.args.get('vendor')

    try:
        with conn.cursor() as cur:
            conditions = ''
            params = []

            if date_from:
                conditions += ' AND o.order_date >= %s'
                params.append(date_from)
            if date_to:
                conditions += ' AND o.order_date <= %s'
                params.append(date_to)
            if vendor:
                conditions += ' AND o.vendor_name = %s'
                params.append(vendor)

            # 거래처별 요약
            cur.execute(f'''
                SELECT o.vendor_name,
                       COUNT(*) as order_count,
                       SUM(o.quantity) as total_qty,
                       SUM(o.unit_price * o.quantity) as total_amount,
                       SUM(CASE WHEN o.shipped THEN 1 ELSE 0 END) as shipped_count,
                       SUM(CASE WHEN o.paid THEN 1 ELSE 0 END) as paid_count
                FROM orders o
                WHERE o.vendor_name IS NOT NULL AND o.vendor_name != ''
                {conditions}
                GROUP BY o.vendor_name
                ORDER BY total_amount DESC NULLS LAST
            ''', params)
            vendor_summary = cur.fetchall()
            # Decimal → float 변환
            for row in vendor_summary:
                if row.get('total_amount') is not None:
                    row['total_amount'] = float(row['total_amount'])

            # 월별 추이
            cur.execute(f'''
                SELECT TO_CHAR(o.order_date, 'YYYY-MM') as month,
                       COUNT(*) as order_count,
                       SUM(o.quantity) as total_qty,
                       SUM(o.unit_price * o.quantity) as total_amount
                FROM orders o
                WHERE o.order_date IS NOT NULL
                {conditions}
                GROUP BY TO_CHAR(o.order_date, 'YYYY-MM')
                ORDER BY month
            ''', params)
            monthly_trend = cur.fetchall()
            for row in monthly_trend:
                if row.get('total_amount') is not None:
                    row['total_amount'] = float(row['total_amount'])

            # SKU별 분석
            cur.execute(f'''
                SELECT o.sku_name,
                       COUNT(*) as order_count,
                       SUM(o.quantity) as total_qty,
                       SUM(o.unit_price * o.quantity) as total_amount
                FROM orders o
                WHERE o.sku_name IS NOT NULL AND o.sku_name != ''
                {conditions}
                GROUP BY o.sku_name
                ORDER BY total_qty DESC
                LIMIT 20
            ''', params)
            sku_breakdown = cur.fetchall()
            for row in sku_breakdown:
                if row.get('total_amount') is not None:
                    row['total_amount'] = float(row['total_amount'])

        return jsonify({
            'vendor_summary': vendor_summary,
            'monthly_trend': monthly_trend,
            'sku_breakdown': sku_breakdown
        })
    except Exception as e:
        logger.error(f'[get_vendor_report] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 거래처 성과 대시보드 API
# ============================================================
def _calculate_speed_score(avg_days):
    """처리속도 점수: 3일이내 100점, 7일 50점, 14일+ 0점"""
    if avg_days is None or avg_days <= 0:
        return 50  # 데이터 없으면 중간값
    if avg_days <= 3:
        return 100
    elif avg_days <= 7:
        return max(0, round(100 - (avg_days - 3) * 12.5))
    elif avg_days <= 14:
        return max(0, round(50 - (avg_days - 7) * 7.14))
    return 0


def _get_performance_grade(score):
    """등급: S(≥90), A(≥75), B(≥60), C(≥40), D(<40)"""
    if score >= 90:
        return 'S'
    elif score >= 75:
        return 'A'
    elif score >= 60:
        return 'B'
    elif score >= 40:
        return 'C'
    return 'D'


@dashboard_bp.route('/api/vendor-performance')
def get_vendor_performance():
    """거래처별 성과 목록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    period = request.args.get('period', 30, type=int)

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT
                    vendor_name,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN shipped = TRUE THEN 1 ELSE 0 END) as shipped_count,
                    SUM(CASE WHEN paid = TRUE THEN 1 ELSE 0 END) as paid_count,
                    SUM(CASE WHEN invoice_issued = TRUE THEN 1 ELSE 0 END) as invoice_count,
                    AVG(CASE WHEN release_date IS NOT NULL AND order_date IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (release_date - order_date)) / 86400
                        ELSE NULL END) as avg_processing_days
                FROM orders
                WHERE vendor_name IS NOT NULL AND vendor_name != ''
                AND created_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY vendor_name
                HAVING COUNT(*) >= 1
                ORDER BY COUNT(*) DESC
            ''' % period)
            vendors = cur.fetchall()

            # 전체 주문 수 (빈도 점수용)
            total_all = sum(int(v['total_orders']) for v in vendors) if vendors else 1

        results = []
        for v in vendors:
            total = int(v['total_orders'])
            shipped_rate = int(v['shipped_count']) / total * 100 if total > 0 else 0
            paid_rate = int(v['paid_count']) / total * 100 if total > 0 else 0
            invoice_rate = int(v['invoice_count']) / total * 100 if total > 0 else 0

            avg_days = float(v['avg_processing_days']) if v.get('avg_processing_days') else None
            speed_score = _calculate_speed_score(avg_days)
            frequency_score = (total / total_all * 100) if total_all > 0 else 0
            frequency_score = min(frequency_score * 10, 100)  # 비율 스케일링

            # 총점 가중 계산
            score = round(
                shipped_rate * 0.30 +
                paid_rate * 0.25 +
                invoice_rate * 0.15 +
                speed_score * 0.20 +
                frequency_score * 0.10
            , 1)

            grade = _get_performance_grade(score)

            results.append({
                'vendor_name': v['vendor_name'],
                'total_orders': total,
                'score': score,
                'grade': grade,
                'metrics': {
                    'shipped_rate': round(shipped_rate, 1),
                    'paid_rate': round(paid_rate, 1),
                    'invoice_rate': round(invoice_rate, 1),
                    'speed_score': speed_score,
                    'frequency_score': round(frequency_score, 1),
                    'avg_processing_days': round(avg_days, 1) if avg_days else None
                }
            })

        results.sort(key=lambda x: -x['score'])

        return jsonify({
            'vendors': results,
            'period': period
        })
    except Exception as e:
        logger.error(f'[get_vendor_performance] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@dashboard_bp.route('/api/vendor-performance/<vendor_name>/detail')
def get_vendor_performance_detail(vendor_name):
    """거래처 성과 상세 (월별 추이)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    period = request.args.get('period', 90, type=int)

    try:
        with conn.cursor() as cur:
            # 월별 추이
            cur.execute('''
                SELECT
                    TO_CHAR(created_at, 'YYYY-MM') as month,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN shipped THEN 1 ELSE 0 END) as shipped_count,
                    SUM(CASE WHEN paid THEN 1 ELSE 0 END) as paid_count,
                    SUM(quantity) as total_qty
                FROM orders
                WHERE vendor_name = %s
                AND created_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM')
                ORDER BY month
            ''' % ('%s', period), (vendor_name,))
            monthly = cur.fetchall()

            # 최근 주문
            cur.execute('''
                SELECT id, sku_name, quantity, order_date, release_date, shipped, paid
                FROM orders
                WHERE vendor_name = %s
                ORDER BY created_at DESC
                LIMIT 10
            ''', (vendor_name,))
            recent_orders = cur.fetchall()

        return jsonify({
            'vendor_name': vendor_name,
            'monthly': monthly,
            'recent_orders': recent_orders
        })
    except Exception as e:
        logger.error(f'[get_vendor_performance_detail] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
