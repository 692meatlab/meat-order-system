"""수익성 분석 API - SKU별 원가/마진 계산"""
import logging
from decimal import Decimal
from flask import Blueprint, jsonify, request, g
from datetime import datetime

logger = logging.getLogger('order-management')

profitability_bp = Blueprint('profitability', __name__)


def get_db():
    """DB 연결 가져오기 (app context에서)"""
    return g.get('db')


def calculate_sku_cost(cur, sku_id):
    """SKU 원가 = Σ(구성품 중량 × 부위 단가/kg) + 포장재 단가"""
    # 1. 구성품 조회
    cur.execute('''
        SELECT sc.part_name, sc.weight, pc.price_per_100g, pc.grade
        FROM sku_compositions sc
        LEFT JOIN parts_cost pc ON sc.part_name = pc.part_name
        WHERE sc.sku_product_id = %s
    ''', (sku_id,))
    compositions = cur.fetchall()

    parts_total = 0
    details = []
    for comp in compositions:
        price = comp.get('price_per_100g') or 0
        weight = comp.get('weight') or 0
        if isinstance(price, Decimal):
            price = float(price)
        if isinstance(weight, Decimal):
            weight = float(weight)
        # weight는 g, price는 100g당 → unit_cost = price * weight / 100
        unit_cost = price * weight / 100
        parts_total += unit_cost
        details.append({
            'part_name': comp['part_name'],
            'weight': weight,
            'unit_price': price,
            'grade': comp.get('grade'),
            'cost': round(unit_cost)
        })

    # 2. 포장재 조회
    cur.execute('SELECT packaging FROM sku_products WHERE id = %s', (sku_id,))
    sku = cur.fetchone()
    packaging_cost = 0
    packaging_name = None
    if sku and sku.get('packaging'):
        packaging_name = sku['packaging']
        cur.execute('SELECT price FROM packaging_cost WHERE packaging_name = %s', (packaging_name,))
        pkg = cur.fetchone()
        if pkg:
            packaging_cost = float(pkg['price']) if isinstance(pkg['price'], Decimal) else (pkg['price'] or 0)

    total_cost = round(parts_total + packaging_cost)
    return {
        'parts_cost': round(parts_total),
        'packaging_cost': round(packaging_cost),
        'packaging_name': packaging_name,
        'total_cost': total_cost,
        'details': details
    }


def get_margin_grade(margin_rate):
    """마진율 등급 분류"""
    if margin_rate > 0.4:
        return 'A'
    elif margin_rate > 0.25:
        return 'B'
    elif margin_rate > 0.1:
        return 'C'
    else:
        return 'D'


def get_suggestions(cost_data, margin_rate, total_cost):
    """개선 제안 생성"""
    suggestions = []
    if margin_rate < 0.1:
        suggestions.append('판매가 인상 또는 구성품 변경 검토 필요')
    for detail in cost_data.get('details', []):
        if total_cost > 0 and detail['cost'] > total_cost * 0.5:
            suggestions.append(f"{detail['part_name']}이(가) 원가의 50% 이상 차지 - 대체 부위 검토")
    if total_cost > 0 and cost_data['packaging_cost'] > total_cost * 0.15:
        suggestions.append('포장재 비용 비중 15% 초과 - 포장 최적화 검토')
    return suggestions


# ============================================================
# API 엔드포인트
# ============================================================
@profitability_bp.route('/api/profitability')
def get_profitability():
    """전체 SKU 수익성 목록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, sku_name, selling_price, packaging FROM sku_products ORDER BY sku_name')
            products = cur.fetchall()

            results = []
            for p in products:
                selling_price = float(p['selling_price']) if p.get('selling_price') else 0
                cost_data = calculate_sku_cost(cur, p['id'])
                total_cost = cost_data['total_cost']
                margin = round(selling_price - total_cost)
                margin_rate = margin / selling_price if selling_price > 0 else 0
                grade = get_margin_grade(margin_rate)

                results.append({
                    'sku_id': p['id'],
                    'sku_name': p['sku_name'],
                    'selling_price': selling_price,
                    'total_cost': total_cost,
                    'parts_cost': cost_data['parts_cost'],
                    'packaging_cost': cost_data['packaging_cost'],
                    'margin': margin,
                    'margin_rate': round(margin_rate, 4),
                    'grade': grade
                })

            # 요약 통계
            if results:
                avg_margin = sum(r['margin_rate'] for r in results) / len(results)
                best = max(results, key=lambda x: x['margin_rate'])
                worst = min(results, key=lambda x: x['margin_rate'])
                needs_improvement = sum(1 for r in results if r['grade'] in ('C', 'D'))
            else:
                avg_margin = 0
                best = worst = None
                needs_improvement = 0

        return jsonify({
            'products': results,
            'summary': {
                'avg_margin_rate': round(avg_margin, 4),
                'best_sku': best['sku_name'] if best else None,
                'worst_sku': worst['sku_name'] if worst else None,
                'needs_improvement': needs_improvement,
                'total_products': len(results)
            }
        })
    except Exception as e:
        logger.error(f'[get_profitability] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@profitability_bp.route('/api/profitability/<int:sku_id>')
def get_profitability_detail(sku_id):
    """개별 SKU 원가 상세"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, sku_name, selling_price, packaging FROM sku_products WHERE id = %s', (sku_id,))
            product = cur.fetchone()
            if not product:
                return jsonify({'error': 'SKU를 찾을 수 없습니다'}), 404

            selling_price = float(product['selling_price']) if product.get('selling_price') else 0
            cost_data = calculate_sku_cost(cur, sku_id)
            total_cost = cost_data['total_cost']
            margin = round(selling_price - total_cost)
            margin_rate = margin / selling_price if selling_price > 0 else 0
            grade = get_margin_grade(margin_rate)
            suggestions = get_suggestions(cost_data, margin_rate, total_cost)

        return jsonify({
            'sku_name': product['sku_name'],
            'selling_price': selling_price,
            'total_cost': total_cost,
            'parts_cost': cost_data['parts_cost'],
            'packaging_cost': cost_data['packaging_cost'],
            'packaging_name': cost_data['packaging_name'],
            'margin': margin,
            'margin_rate': round(margin_rate, 4),
            'grade': grade,
            'details': cost_data['details'],
            'suggestions': suggestions
        })
    except Exception as e:
        logger.error(f'[get_profitability_detail] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@profitability_bp.route('/api/profitability/trends')
def get_profitability_trends():
    """월별 마진 추이"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    months = request.args.get('months', 6, type=int)

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT TO_CHAR(o.order_date, 'YYYY-MM') as month,
                       SUM(o.unit_price * o.quantity) as total_revenue,
                       SUM(o.quantity) as total_qty,
                       COUNT(*) as order_count
                FROM orders o
                WHERE o.order_date >= CURRENT_DATE - INTERVAL '%s months'
                AND o.order_date IS NOT NULL
                GROUP BY TO_CHAR(o.order_date, 'YYYY-MM')
                ORDER BY month
            ''' % months)
            trends = cur.fetchall()

            for row in trends:
                if row.get('total_revenue') is not None:
                    row['total_revenue'] = float(row['total_revenue'])

        return jsonify({'trends': trends})
    except Exception as e:
        logger.error(f'[get_profitability_trends] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
