"""수요 예측 API - Holt 이중 지수평활법 + 요일/시즌 보정"""
import logging
import math
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
    """최근 데이터에 높은 가중치 부여 (폴백용)"""
    if not daily_data:
        return 0
    data = daily_data[-window:]
    weights = list(range(1, len(data) + 1))
    return sum(w * v for w, v in zip(weights, data)) / sum(weights)


def holt_exponential_smoothing(daily_data, alpha=0.3, beta=0.1, forecast_days=7):
    """Holt의 이중 지수평활법 - 레벨 + 트렌드 반영

    Args:
        daily_data: 일별 수량 리스트
        alpha: 레벨 평활 계수 (0~1, 높을수록 최근 데이터 중시)
        beta: 트렌드 평활 계수 (0~1, 높을수록 최근 추세 중시)
        forecast_days: 예측할 일수

    Returns:
        (forecasts, level, trend, residuals)
    """
    if not daily_data:
        return [0] * forecast_days, 0, 0, []

    if len(daily_data) < 2:
        val = daily_data[0]
        return [val] * forecast_days, val, 0, []

    # 초기값
    level = daily_data[0]
    trend = daily_data[1] - daily_data[0]

    # 잔차(오차) 수집 (신뢰구간 계산용)
    residuals = []

    for val in daily_data[1:]:
        predicted = level + trend
        residuals.append(val - predicted)
        new_level = alpha * val + (1 - alpha) * (level + trend)
        new_trend = beta * (new_level - level) + (1 - beta) * trend
        level, trend = new_level, new_trend

    # 미래 예측
    forecasts = []
    for i in range(1, forecast_days + 1):
        forecasts.append(max(0, round(level + i * trend, 1)))

    return forecasts, level, trend, residuals


def calculate_confidence_interval(residuals, forecasts, confidence=1.96):
    """예측 오차 분산 기반 신뢰구간 (±1.96σ = 95%)

    Args:
        residuals: 과거 예측 오차 리스트
        forecasts: 미래 예측값 리스트
        confidence: Z-score (1.96 = 95%, 1.645 = 90%)

    Returns:
        (confidence_low, confidence_high) - 전체 기간 합계의 신뢰구간
    """
    if not residuals or len(residuals) < 3:
        # 데이터 부족 시 ±30% 폴백
        total = sum(forecasts)
        return round(total * 0.7, 1), round(total * 1.3, 1)

    # 잔차의 표준편차
    mean_residual = sum(residuals) / len(residuals)
    variance = sum((r - mean_residual) ** 2 for r in residuals) / (len(residuals) - 1)
    std_dev = math.sqrt(variance) if variance > 0 else 0

    total = sum(forecasts)
    n_days = len(forecasts)

    # 합산 예측의 표준편차 (독립 가정: σ_total = σ × √n)
    total_std = std_dev * math.sqrt(n_days)
    margin = confidence * total_std

    return round(max(0, total - margin), 1), round(total + margin, 1)


def _preload_dow_factors(cur, sku_names):
    """모든 SKU의 요일별 주문 팩터를 한번에 로드 (N+1 제거)

    기존: SKU N개 × 요일 7개 = 7N 쿼리
    개선: 단일 쿼리 1개 → Python에서 계산
    """
    if not sku_names:
        return {}

    cur.execute('''
        SELECT sku_name, EXTRACT(DOW FROM order_date::date) as dow, COUNT(*) as cnt
        FROM orders
        WHERE sku_name = ANY(%s) AND order_date IS NOT NULL
        GROUP BY sku_name, EXTRACT(DOW FROM order_date::date)
    ''', (list(sku_names),))
    rows = cur.fetchall()

    # {sku_name: {dow: count}} 구조
    sku_dow_counts = {}
    for r in rows:
        sku = r['sku_name']
        dow = int(r['dow'])
        cnt = int(r['cnt'])
        if sku not in sku_dow_counts:
            sku_dow_counts[sku] = {}
        sku_dow_counts[sku][dow] = cnt

    # {sku_name: {dow: factor}} 변환
    dow_factors = {}
    for sku, dow_counts in sku_dow_counts.items():
        total = sum(dow_counts.values())
        avg = total / 7
        factors = {}
        for dow in range(7):
            count = dow_counts.get(dow, avg)
            factors[dow] = count / max(avg, 1)
        dow_factors[sku] = factors

    return dow_factors


def dow_factor(cur, sku_name, target_dow):
    """요일별 주문 비율 (0=일 ~ 6=토, PostgreSQL DOW) - 단일 SKU용"""
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


def _forecast_sku(cur, sku_name, days=7, preloaded_dow=None):
    """개별 SKU 예측 (Holt 이중 지수평활법)

    Args:
        cur: DB cursor
        sku_name: SKU 이름
        days: 예측 일수
        preloaded_dow: 사전 로드된 DOW 팩터 (N+1 최적화용)
    """
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
            'trend': 'stable',
            'algorithm': 'holt'
        }

    # 날짜 → 수량 맵
    date_qty = {}
    for r in rows:
        d = r['odate']
        q = int(r['qty']) if r['qty'] else 0
        date_qty[d] = q

    # 연속 일별 데이터 (빈 날짜는 0)
    min_date = min(date_qty.keys())
    max_date = max(date_qty.keys())
    current = min_date
    daily_data = []
    while current <= max_date:
        daily_data.append(date_qty.get(current, 0))
        current += timedelta(days=1)

    if not daily_data:
        daily_data = [0]

    # Holt 이중 지수평활법으로 기본 예측
    holt_forecasts, level, trend_val, residuals = holt_exponential_smoothing(
        daily_data, alpha=0.3, beta=0.1, forecast_days=days
    )

    # 요일/시즌 보정 적용
    daily_forecast = []
    today = datetime.now().date()
    for i in range(days):
        target = today + timedelta(days=i + 1)
        target_dow = target.weekday()  # 0=월 ~ 6=일
        # PostgreSQL DOW: 0=일, 1=월 ... 6=토
        pg_dow = (target_dow + 1) % 7

        if preloaded_dow and sku_name in preloaded_dow:
            dow_f = preloaded_dow[sku_name].get(pg_dow, 1.0)
        else:
            dow_f = dow_factor(cur, sku_name, pg_dow)

        season_f = season_boost(target)
        predicted = max(0, round(holt_forecasts[i] * dow_f * season_f, 1))
        daily_forecast.append(predicted)

    total_predicted = round(sum(daily_forecast), 1)

    # 데이터 기반 신뢰구간
    confidence_low, confidence_high = calculate_confidence_interval(residuals, daily_forecast)

    # 추세 판단
    if len(daily_data) >= 14:
        first_half = sum(daily_data[-14:-7])
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
        'trend': trend,
        'algorithm': 'holt'
    }


# ============================================================
# API 엔드포인트
# ============================================================
@forecast_bp.route('/api/forecast')
def get_forecast():
    """SKU별 예측 결과 (배치 DOW 프리로드로 N+1 제거)"""
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

            # DOW 팩터 배치 프리로드 (210+ 쿼리 → 1 쿼리)
            preloaded_dow = _preload_dow_factors(cur, skus)

            forecasts = []
            for sku_name in skus:
                forecast = _forecast_sku(cur, sku_name, days, preloaded_dow)
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

            # DOW 팩터 배치 프리로드
            preloaded_dow = _preload_dow_factors(cur, skus)

            parts_needed = {}
            for sku_name in skus:
                forecast = _forecast_sku(cur, sku_name, days, preloaded_dow)
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
