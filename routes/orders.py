"""주문 관련 API"""
import re
import json
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
    search = request.args.get('search', '').strip()
    shipped = request.args.get('shipped')
    paid = request.args.get('paid')
    invoice_issued = request.args.get('invoice_issued')
    vendors = request.args.getlist('vendors')
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

            # 텍스트 검색 (수령인, 주소, SKU명)
            if search:
                conditions += ' AND (o.recipient ILIKE %s OR o.address ILIKE %s OR o.sku_name ILIKE %s OR o.memo ILIKE %s)'
                search_pattern = f'%{search}%'
                params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

            # 다중 상태 필터
            if shipped is not None:
                conditions += ' AND o.shipped = %s'
                params.append(shipped == 'true')

            if paid is not None:
                conditions += ' AND o.paid = %s'
                params.append(paid == 'true')

            if invoice_issued is not None:
                conditions += ' AND o.invoice_issued = %s'
                params.append(invoice_issued == 'true')

            # 거래처 다중 선택
            if vendors:
                conditions += ' AND o.vendor_name = ANY(%s)'
                params.append(vendors)

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
            # 변경 이력용: 기존 값 조회
            cur.execute('SELECT * FROM orders WHERE id = %s', (order_id,))
            old_order = cur.fetchone()

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

            # 변경 이력 기록
            if old_order:
                for key, col in field_map.items():
                    if key in data:
                        old_val = str(old_order.get(col, '') or '')
                        new_val = str(data[key] or '')
                        if old_val != new_val:
                            try:
                                cur.execute('''
                                    INSERT INTO order_history (order_id, action, field_name, old_value, new_value)
                                    VALUES (%s, 'update', %s, %s, %s)
                                ''', (order_id, col, old_val, new_val))
                            except Exception:
                                pass  # order_history 테이블이 없어도 주문 수정은 성공

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


def _normalize_recipient(name):
    """수령인 정규화: 공백/직함 제거"""
    name = re.sub(r'\s+', '', name or '')
    name = re.sub(r'(님|씨|사장|대표|과장|부장|실장)$', '', name)
    return name


def _normalize_phone(phone):
    """전화번호 정규화: 숫자만"""
    return re.sub(r'[^0-9]', '', phone or '')


def _normalize_address(addr):
    """주소 정규화: 핵심 키워드"""
    addr = re.sub(r'\s+', '', addr or '')
    addr = addr.replace('특별시', '시').replace('광역시', '시')
    return addr


def _recipient_score(a, b):
    """수령인 유사도 점수"""
    na, nb = _normalize_recipient(a), _normalize_recipient(b)
    if not na or not nb:
        return 0
    if na == nb:
        return 100
    # 한쪽이 포함관계
    if na in nb or nb in na:
        return 60
    # Levenshtein 거리 근사 (간단 버전)
    if len(na) == len(nb):
        diff = sum(1 for x, y in zip(na, nb) if x != y)
        if diff <= 1:
            return 80
    return 0


def _phone_score(a, b):
    """전화번호 유사도 점수"""
    na, nb = _normalize_phone(a), _normalize_phone(b)
    if not na or not nb:
        return 0
    if na == nb:
        return 100
    if len(na) >= 8 and len(nb) >= 8 and na[-8:] == nb[-8:]:
        return 100
    if len(na) >= 4 and len(nb) >= 4 and na[-4:] == nb[-4:]:
        return 50
    return 0


def _address_score(a, b):
    """주소 유사도 점수"""
    na, nb = _normalize_address(a), _normalize_address(b)
    if not na or not nb:
        return 0
    if na == nb:
        return 100
    # Jaccard (토큰 기반)
    tokens_a = set(re.findall(r'[가-힣]+|\d+', na))
    tokens_b = set(re.findall(r'[가-힣]+|\d+', nb))
    if not tokens_a or not tokens_b:
        return 0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    jaccard = len(intersection) / len(union)
    if jaccard >= 0.7:
        return 100
    if jaccard >= 0.5:
        return 60
    return 0


def _sku_score(a, b):
    """SKU 유사도 점수"""
    if not a or not b:
        return 0
    if a == b:
        return 100
    # 토큰 유사도
    tokens_a = set(re.findall(r'[가-힣]+|[a-zA-Z]+|\d+', a))
    tokens_b = set(re.findall(r'[가-힣]+|[a-zA-Z]+|\d+', b))
    if not tokens_a or not tokens_b:
        return 0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return round(len(intersection) / len(union) * 100)


def _composite_duplicate_score(new_order, existing):
    """복합 유사도 점수 (가중치 합산)"""
    r_score = _recipient_score(new_order.get('recipient', ''), existing.get('recipient', ''))
    p_score = _phone_score(new_order.get('phone', ''), existing.get('phone', ''))
    a_score = _address_score(new_order.get('address', ''), existing.get('address', ''))
    s_score = _sku_score(new_order.get('sku_name', ''), existing.get('sku_name', ''))

    total = r_score * 0.35 + p_score * 0.25 + a_score * 0.25 + s_score * 0.15

    return {
        'score': round(total, 1),
        'breakdown': {
            'recipient': r_score,
            'phone': p_score,
            'address': a_score,
            'sku': s_score
        }
    }


@orders_bp.route('/api/orders/check-duplicates', methods=['POST'])
def check_duplicates():
    """스마트 중복 주문 감지 - 복합 유사도 점수"""
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
            # 제외 목록 (테이블 없어도 무시)
            exclusions = set()
            try:
                cur.execute('SELECT order_id_1, order_id_2 FROM duplicate_exclusions')
                for row in cur.fetchall():
                    exclusions.add((row['order_id_1'], row['order_id_2']))
                    exclusions.add((row['order_id_2'], row['order_id_1']))
            except Exception:
                pass  # duplicate_exclusions 테이블 없어도 진행

            for idx, order in enumerate(orders_to_check):
                recipient = order.get('recipient', '')
                if not recipient:
                    continue

                # 후보 검색 (수령인 or 전화번호 유사)
                norm_recipient = _normalize_recipient(recipient)
                norm_phone = _normalize_phone(order.get('phone', ''))

                conditions = []
                params = []
                if norm_recipient:
                    conditions.append("REPLACE(REPLACE(recipient, ' ', ''), '님', '') ILIKE %s")
                    params.append(f'%{norm_recipient}%')
                if norm_phone and len(norm_phone) >= 4:
                    conditions.append("REPLACE(REPLACE(phone, '-', ''), ' ', '') LIKE %s")
                    params.append(f'%{norm_phone[-4:]}%')

                if not conditions:
                    continue

                where = ' OR '.join(conditions)
                cur.execute(f'''
                    SELECT id, vendor_name, sku_name, quantity, recipient, phone,
                           address, order_date, status
                    FROM orders
                    WHERE ({where})
                    AND order_date >= CURRENT_DATE - INTERVAL '14 days'
                    LIMIT 10
                ''', params)

                candidates = cur.fetchall()
                matches = []
                for existing in candidates:
                    result = _composite_duplicate_score(order, existing)
                    if result['score'] >= 60:
                        matches.append({
                            'existing_order': existing,
                            'score': result['score'],
                            'breakdown': result['breakdown']
                        })

                matches.sort(key=lambda x: -x['score'])

                if matches:
                    duplicates.append({
                        'index': idx,
                        'order': order,
                        'matches': matches[:5]
                    })

        return jsonify({'duplicates': duplicates})
    except Exception as e:
        logger.error(f'[check_duplicates] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/duplicate-exclusions', methods=['POST'])
@require_api_key
def create_duplicate_exclusion():
    """중복 제외 등록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    order_id_1 = data.get('order_id_1')
    order_id_2 = data.get('order_id_2')
    reason = data.get('reason', '')

    if not order_id_1 or not order_id_2:
        return jsonify({'error': 'order_id_1, order_id_2는 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO duplicate_exclusions (order_id_1, order_id_2, reason)
                VALUES (%s, %s, %s) RETURNING *
            ''', (order_id_1, order_id_2, reason))
            exclusion = cur.fetchone()
            conn.commit()
        return jsonify({'exclusion': exclusion}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_duplicate_exclusion] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 필터 프리셋 API
# ============================================================
@orders_bp.route('/api/filter-presets', methods=['GET'])
def get_filter_presets():
    """필터 프리셋 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    user_id = request.args.get('user_id', type=int)

    try:
        with conn.cursor() as cur:
            if user_id:
                cur.execute('SELECT * FROM filter_presets WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
            else:
                cur.execute('SELECT * FROM filter_presets ORDER BY created_at DESC')
            presets = cur.fetchall()
        return jsonify({'presets': presets})
    except Exception as e:
        logger.error(f'[get_filter_presets] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/filter-presets', methods=['POST'])
@require_api_key
def create_filter_preset():
    """필터 프리셋 저장"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    user_id = data.get('user_id')
    name = data.get('name', '').strip()
    preset_json = data.get('preset_json', {})

    if not name:
        return jsonify({'error': '프리셋 이름은 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO filter_presets (user_id, name, preset_json)
                VALUES (%s, %s, %s::jsonb) RETURNING *
            ''', (user_id, name, json.dumps(preset_json)))
            preset = cur.fetchone()
            conn.commit()
        return jsonify({'preset': preset}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_filter_preset] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/filter-presets/<int:preset_id>', methods=['DELETE'])
@require_api_key
def delete_filter_preset(preset_id):
    """필터 프리셋 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM filter_presets WHERE id = %s', (preset_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_filter_preset] 오류: {e}', exc_info=True)
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


# ============================================================
# 주문 이력/코멘트 API
# ============================================================
@orders_bp.route('/api/orders/<int:order_id>/history', methods=['GET'])
def get_order_history(order_id):
    """주문 변경 이력 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT * FROM order_history
                WHERE order_id = %s ORDER BY created_at DESC
            ''', (order_id,))
            history = cur.fetchall()
        return jsonify({'history': history})
    except Exception as e:
        logger.error(f'[get_order_history] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/<int:order_id>/comments', methods=['GET'])
def get_order_comments(order_id):
    """주문 코멘트 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT * FROM order_comments
                WHERE order_id = %s ORDER BY created_at DESC
            ''', (order_id,))
            comments = cur.fetchall()
        return jsonify({'comments': comments})
    except Exception as e:
        logger.error(f'[get_order_comments] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@orders_bp.route('/api/orders/<int:order_id>/comments', methods=['POST'])
@require_api_key
def add_order_comment(order_id):
    """주문 코멘트 추가"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    user_name = data.get('user_name', '')
    content = data.get('content', '').strip()

    if not content:
        return jsonify({'error': '코멘트 내용은 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO order_comments (order_id, user_name, content)
                VALUES (%s, %s, %s) RETURNING *
            ''', (order_id, user_name, content))
            comment = cur.fetchone()
            conn.commit()
        return jsonify({'comment': comment}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[add_order_comment] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
