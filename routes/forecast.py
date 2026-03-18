"""수요 예측 API - 가중 이동 평균 + 요일/시즌 보정"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request, g

logger = logging.getLogger('order-management')

forecast_bp = Blueprint('forecast', __name__)


def get_db():
    """DB 연결 가져오기 (app context에서)"""
    return g.get('db')


# ============================================================
# 예측 알고리즘
# ============================================================
def weighted_moving_average(daily_data, window=14):
    """최근 데이터에 높은 가중치 부여"""
    if not daily_data:
        return 0
    data = daily_data[-window:]
    weights = list(range(1, len(data) + 1))
    return sum(w * v for w, v in zip(weights, data)) / sum(weights)


def dow_factor(cur, sku_name, target_dow):
    """요일별 주문 비율 (0=일 ~ 6=토, PostgreSQL DOW)"""
    cur.execute('''
        SELECT EXTRACT(DOW FROM order_date::date) as dow, COUNT(*) as cnt
        FROM orders WHERE sku_name = %s AND order_date IS NOT NULL
        GROUP BY dow
    ''', (sku_name,))
    rows = cur.fetchall()
    total = sum(int(r['cnt']) for r in rows)
    if total == 0:
        return 1.0
    avg = total / 7
    dow_count = next((int(r['cnt']) for r in rows if int(r['dow']) == target_dow), avg)
    return dow_count / max(avg, 1)


def season_boost(target_date):
    """시즌 보정 (연말, 명절 기간)"""
    month = target_date.month
    day = target_date.day

    # 연말 (12월)
    if month == 12 and day >= 15:
        return 1.5
    # 설날 전후 (1~2월, 간단 추정)
    if month == 1 and day >= 15:
        return 1.4
    if month == 2 and day <= 15:
        return 1.3
    # 추석 전후 (9월, 간단 추정)
    if month == 9:
        return 1.4
    return 1.0


def _forecast_sku(cur, sku_name, days=7):
    """개별 SKU 예측"""
    # 최근 90일 일별 주문량
    cur.execute('''
        SELECT order_date::date as odate, SUM(quantity) as qty
        FROM orders
        WHERE sku_name = %s AND order_date >= CURRENT_DATE - INTERVAL '90 days'
        AND order_date IS NOT NULL
        GROUP BY order_date::date
        ORDER BY odate
    ''', (sku_name,))
    rows = cur.fetchall()

    if not rows:
        return {
            'sku_name': sku_name,
            'daily_forecast': [0] * days,
            'total_predicted': 0,
            'confidence_low': 0,
            'confidence_high': 0,
            'trend': 'stable'
        }

    # 날짜 → 수량 맵
    date_qty = {}
    for r in rows:
        d = r['odate']
        q = int(r['qty']) if r['qty'] else 0
        date_qty[d] = q

    # 연속 일별 데이터 (빈 날짜는 0)
    if rows:
        min_date = min(date_qty.keys())
        max_date = max(date_qty.keys())
        current = min_date
        daily_data = []
        while current <= max_date:
            daily_data.append(date_qty.get(current, 0))
            current += timedelta(days=1)
    else:
        daily_data = [0]

    base = weighted_moving_average(daily_data)

    # 일별 예측
    daily_forecast = []
    today = datetime.now().date()
    for i in range(1, days + 1):
        target = today + timedelta(days=i)
        target_dow = target.weekday()  # 0=월 ~ 6=일
        # PostgreSQL DOW: 0=일, 1=월 ... 6=토
        pg_dow = (target_dow + 1) % 7
        dow_f = dow_factor(cur, sku_name, pg_dow)
        season_f = season_boost(target)
        predicted = max(0, round(base * dow_f * season_f, 1))
        daily_forecast.append(predicted)

    total_predicted = round(sum(daily_forecast), 1)

    # 신뢰 구간 (±30%)
    confidence_low = round(total_predicted * 0.7, 1)
    confidence_high = round(total_predicted * 1.3, 1)

    # 추세 판단
    if len(daily_data) >= 14:
        first_half = sum(daily_data[-14:-7]) if len(daily_data) >= 14 else 0
        second_half = sum(daily_data[-7:])
        if second_half > first_half * 1.15:
            trend = 'up'
        elif second_half < first_half * 0.85:
            trend = 'down'
        else:
            trend = 'stable'
    else:
        trend = 'stable'

    return {
        'sku_name': sku_name,
        'daily_forecast': daily_forecast,
        'total_predicted': total_predicted,
        'confidence_low': confidence_low,
        'confidence_high': confidence_high,
        'trend': trend
    }


# ============================================================
# API 엔드포인트
# ============================================================
@forecast_bp.route('/api/forecast')
def get_forecast():
    """SKU별 예측 결과"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    days = request.args.get('days', 7, type=int)
    days = min(max(days, 1), 30)

    try:
        with conn.cursor() as cur:
            # 활성 SKU 목록 (최근 90일 주문 있는 SKU)
            cur.execute('''
                SELECT DISTINCT sku_name FROM orders
                WHERE sku_name IS NOT NULL AND sku_name != ''
                AND order_date >= CURRENT_DATE - INTERVAL '90 days'
                ORDER BY sku_name
            ''')
            skus = [r['sku_name'] for r in cur.fetchall()]

            forecasts = []
            for sku_name in skus:
                forecast = _forecast_sku(cur, sku_name, days)
                forecasts.append(forecast)

        return jsonify({
            'forecasts': forecasts,
            'days': days,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f'[get_forecast] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@forecast_bp.route('/api/forecast/parts')
def get_forecast_parts():
    """부위별 소요량 예측 (구성품 연동)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    days = request.args.get('days', 7, type=int)
    days = min(max(days, 1), 30)

    try:
        with conn.cursor() as cur:
            # SKU별 예측
            cur.execute('''
                SELECT DISTINCT sku_name FROM orders
                WHERE sku_name IS NOT NULL AND sku_name != ''
                AND order_date >= CURRENT_DATE - INTERVAL '90 days'
            ''')
            skus = [r['sku_name'] for r in cur.fetchall()]

            parts_needed = {}
            for sku_name in skus:
                forecast = _forecast_sku(cur, sku_name, days)
                total_qty = forecast['total_predicted']
                if total_qty <= 0:
                    continue

                # SKU → 구성품
                cur.execute('''
                    SELECT sc.part_name, sc.weight
                    FROM sku_compositions sc
                    JOIN sku_products sp ON sc.sku_product_id = sp.id
                    WHERE sp.sku_name = %s
                ''', (sku_name,))
                compositions = cur.fetchall()

                for comp in compositions:
                    part = comp['part_name']
                    weight_g = float(comp['weight']) if comp['weight'] else 0
                    needed_g = weight_g * total_qty
                    needed_kg = round(needed_g / 1000, 2)

                    if part not in parts_needed:
                        parts_needed[part] = 0
                    parts_needed[part] += needed_kg

            parts_list = [{'part_name': k, 'weight_needed_kg': round(v, 2)}
                         for k, v in sorted(parts_needed.items(), key=lambda x: -x[1])]

        return jsonify({
            'parts': parts_list,
            'days': days,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f'[get_forecast_parts] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@forecast_bp.route('/api/forecast/accuracy')
def get_forecast_accuracy():
    """예측 정확도 (최근 30일 MAPE)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT sku_name, AVG(ABS(error_pct)) as mape
                FROM forecast_accuracy_log
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY sku_name
                ORDER BY mape
            ''')
            accuracy = cur.fetchall()

            for row in accuracy:
                if row.get('mape') is not None:
                    row['mape'] = round(float(row['mape']), 2)

            overall_mape = 0
            if accuracy:
                overall_mape = round(sum(r['mape'] for r in accuracy) / len(accuracy), 2)

        return jsonify({
            'accuracy': accuracy,
            'overall_mape': overall_mape
        })
    except Exception as e:
        logger.error(f'[get_forecast_accuracy] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
