"""스마트 발주 API - 수요 예측 + 재고 → 발주 추천"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request, g

logger = logging.getLogger('order-management')

smart_order_bp = Blueprint('smart_order', __name__)


def get_db():
    """DB 연결 가져오기 (app context에서)"""
    return g.get('db')


def _get_sku_forecast(cur, sku_name, days=7):
    """내부용 SKU 예측 (forecast.py 로직 재사용)"""
    from routes.forecast import _forecast_sku
    return _forecast_sku(cur, sku_name, days)


def _calculate_urgency(current_stock, min_stock, daily_avg):
    """긴급도 산출"""
    if current_stock <= 0:
        return 'critical'
    if min_stock and current_stock < min_stock:
        return 'critical'
    if daily_avg > 0:
        days_until_stockout = current_stock / daily_avg
        if days_until_stockout <= 3:
            return 'high'
        elif days_until_stockout <= 7:
            return 'medium'
    return 'low'


# ============================================================
# API 엔드포인트
# ============================================================
@smart_order_bp.route('/api/smart-order/recommendations')
def get_recommendations():
    """발주 추천 목록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    days = request.args.get('days', 7, type=int)
    days = min(max(days, 1), 30)

    try:
        with conn.cursor() as cur:
            # 1. SKU별 재고 조회
            cur.execute('''
                SELECT i.sku_product_id, sp.sku_name, i.current_stock, i.min_stock
                FROM inventory i
                JOIN sku_products sp ON i.sku_product_id = sp.id
                ORDER BY sp.sku_name
            ''')
            inventory_rows = cur.fetchall()

            # 재고가 없는 SKU도 포함 (활성 주문 있는 SKU)
            cur.execute('''
                SELECT DISTINCT sku_name FROM orders
                WHERE sku_name IS NOT NULL AND sku_name != ''
                AND order_date >= CURRENT_DATE - INTERVAL '90 days'
            ''')
            active_skus = {r['sku_name'] for r in cur.fetchall()}

            inv_map = {}
            for row in inventory_rows:
                inv_map[row['sku_name']] = {
                    'current_stock': int(row['current_stock']) if row['current_stock'] else 0,
                    'min_stock': int(row['min_stock']) if row['min_stock'] else 0
                }

            recommendations = []
            for sku_name in active_skus:
                inv = inv_map.get(sku_name, {'current_stock': 0, 'min_stock': 0})
                current_stock = inv['current_stock']
                min_stock = inv['min_stock']

                # 예측
                forecast = _get_sku_forecast(cur, sku_name, days)
                predicted_demand = forecast['total_predicted']

                # 필요량 = max(0, 예측수요 - 현재재고 + 안전재고)
                recommended_qty = max(0, round(predicted_demand - current_stock + min_stock))

                # 일 평균
                daily_avg = predicted_demand / days if days > 0 else 0
                days_until_stockout = round(current_stock / daily_avg, 1) if daily_avg > 0 else 999

                urgency = _calculate_urgency(current_stock, min_stock, daily_avg)

                if recommended_qty > 0 or urgency in ('critical', 'high'):
                    recommendations.append({
                        'sku_name': sku_name,
                        'current_stock': current_stock,
                        'min_stock': min_stock,
                        'predicted_demand': round(predicted_demand, 1),
                        'recommended_qty': recommended_qty,
                        'urgency': urgency,
                        'days_until_stockout': min(days_until_stockout, 999),
                        'trend': forecast.get('trend', 'stable')
                    })

            # 긴급도 순 정렬
            urgency_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
            recommendations.sort(key=lambda x: (urgency_order.get(x['urgency'], 4), -x['recommended_qty']))

            # 요약
            summary = {
                'total_items': len(recommendations),
                'critical_count': sum(1 for r in recommendations if r['urgency'] == 'critical'),
                'high_count': sum(1 for r in recommendations if r['urgency'] == 'high'),
                'total_recommended_qty': sum(r['recommended_qty'] for r in recommendations)
            }

        return jsonify({
            'recommendations': recommendations,
            'summary': summary,
            'forecast_days': days,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f'[get_recommendations] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@smart_order_bp.route('/api/smart-order/generate', methods=['POST'])
def generate_order():
    """발주서 데이터 생성 (거래처별 그룹핑)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    items = data.get('items', [])

    if not items:
        return jsonify({'error': '발주 항목이 없습니다'}), 400

    try:
        with conn.cursor() as cur:
            # SKU → 거래처 매핑 조회
            cur.execute('''
                SELECT DISTINCT vm.vendor_name, sp.sku_name
                FROM vendor_mappings vm
                JOIN sku_products sp ON vm.sku_product_id = sp.id
            ''')
            sku_vendor_map = {}
            for row in cur.fetchall():
                if row['sku_name'] not in sku_vendor_map:
                    sku_vendor_map[row['sku_name']] = []
                sku_vendor_map[row['sku_name']].append(row['vendor_name'])

        # 거래처별 그룹핑
        vendor_groups = {}
        unassigned = []
        for item in items:
            sku_name = item.get('sku_name', '')
            qty = item.get('quantity', 0)
            vendors = sku_vendor_map.get(sku_name, [])

            if vendors:
                vendor = vendors[0]  # 첫 번째 거래처 사용
                if vendor not in vendor_groups:
                    vendor_groups[vendor] = []
                vendor_groups[vendor].append({
                    'sku_name': sku_name,
                    'quantity': qty
                })
            else:
                unassigned.append({
                    'sku_name': sku_name,
                    'quantity': qty
                })

        return jsonify({
            'vendor_groups': vendor_groups,
            'unassigned': unassigned,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f'[generate_order] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
