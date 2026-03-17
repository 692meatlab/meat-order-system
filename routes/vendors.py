"""거래처 관련 API"""
import json
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

vendors_bp = Blueprint('vendors', __name__)


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
# 거래처 API
# ============================================================
@vendors_bp.route('/api/vendors', methods=['GET'])
def get_vendors():
    """거래처 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT DISTINCT vendor_name FROM vendor_mappings ORDER BY vendor_name')
            vendors = [row['vendor_name'] for row in cur.fetchall()]
        return jsonify({'vendors': vendors})
    except Exception as e:
        logger.error(f'[get_vendors] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@vendors_bp.route('/api/vendor-mappings', methods=['GET'])
def get_vendor_mappings():
    """거래처 매핑 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    vendor = request.args.get('vendor')

    try:
        with conn.cursor() as cur:
            if vendor:
                cur.execute('''
                    SELECT vm.id, vm.vendor_name, vm.product_code, vm.product_name,
                           vm.sku_product_id, sp.sku_name
                    FROM vendor_mappings vm
                    LEFT JOIN sku_products sp ON vm.sku_product_id = sp.id
                    WHERE vm.vendor_name = %s
                    ORDER BY vm.product_name
                ''', (vendor,))
            else:
                cur.execute('''
                    SELECT vm.id, vm.vendor_name, vm.product_code, vm.product_name,
                           vm.sku_product_id, sp.sku_name
                    FROM vendor_mappings vm
                    LEFT JOIN sku_products sp ON vm.sku_product_id = sp.id
                    ORDER BY vm.vendor_name, vm.product_name
                ''')
            mappings = cur.fetchall()
        return jsonify({'mappings': mappings})
    except Exception as e:
        logger.error(f'[get_vendor_mappings] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@vendors_bp.route('/api/vendor-mappings', methods=['POST'])
@require_api_key
def create_vendor_mapping():
    """거래처 매핑 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    vendor_name = data.get('vendor_name', '').strip()
    product_code = data.get('product_code', '').strip()
    product_name = data.get('product_name', '').strip()
    sku_product_id = data.get('sku_product_id')

    if not vendor_name:
        return jsonify({'error': 'Vendor name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO vendor_mappings (vendor_name, product_code, product_name, sku_product_id)
                VALUES (%s, %s, %s, %s)
                RETURNING id, vendor_name, product_code, product_name, sku_product_id
            ''', (vendor_name, product_code, product_name, sku_product_id))
            mapping = cur.fetchone()
            conn.commit()
        return jsonify({'mapping': mapping}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_vendor_mapping] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@vendors_bp.route('/api/vendor-mappings/<int:mapping_id>', methods=['PUT'])
def update_vendor_mapping(mapping_id):
    """거래처 매핑 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    sku_product_id = data.get('sku_product_id')

    try:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE vendor_mappings SET sku_product_id = %s WHERE id = %s
                RETURNING *
            ''', (sku_product_id, mapping_id))
            mapping = cur.fetchone()
            conn.commit()
        return jsonify({'mapping': mapping})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_vendor_mapping] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@vendors_bp.route('/api/vendor-mappings/<int:mapping_id>', methods=['DELETE'])
def delete_vendor_mapping(mapping_id):
    """거래처 매핑 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM vendor_mappings WHERE id = %s', (mapping_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_vendor_mapping] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 거래처 템플릿 API
# ============================================================
@vendors_bp.route('/api/vendor-templates', methods=['GET'])
def get_vendor_templates():
    """거래처 템플릿 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM vendor_templates ORDER BY vendor_name')
            templates = cur.fetchall()
        return jsonify({'templates': templates})
    except Exception as e:
        logger.error(f'[get_vendor_templates] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@vendors_bp.route('/api/vendor-templates', methods=['POST'])
@require_api_key
def save_vendor_template():
    """거래처 템플릿 저장"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    vendor_name = data.get('vendor_name', '').strip()
    template_json = data.get('template_json', {})

    if not vendor_name:
        return jsonify({'error': 'Vendor name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO vendor_templates (vendor_name, template_json)
                VALUES (%s, %s)
                ON CONFLICT (vendor_name) DO UPDATE SET template_json = %s
                RETURNING *
            ''', (vendor_name, json.dumps(template_json), json.dumps(template_json)))
            template = cur.fetchone()
            conn.commit()
        return jsonify({'template': template}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[save_vendor_template] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 매핑 제안 API
# ============================================================
@vendors_bp.route('/api/vendor-mappings/suggest')
def suggest_mappings():
    """유사 SKU 제안 - 상품명 기반 vendor_mappings 검색"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    query = request.args.get('q', '').strip()
    vendor = request.args.get('vendor', '').strip()

    if not query:
        return jsonify({'suggestions': []})

    try:
        sku_suggestions = []
        with conn.cursor() as cur:
            # 1차: 같은 거래처 내에서 유사 매핑 검색
            params = [f'%{query}%', f'%{query}%']
            sql = '''
                SELECT vm.id, vm.vendor_name, vm.product_code,
                       sp.sku_name, sp.id as sku_product_id
                FROM vendor_mappings vm
                JOIN sku_products sp ON vm.sku_product_id = sp.id
                WHERE (vm.product_code ILIKE %s OR sp.sku_name ILIKE %s)
            '''

            if vendor:
                sql += ' AND vm.vendor_name = %s'
                params.append(vendor)

            sql += ' LIMIT 10'
            cur.execute(sql, params)
            suggestions = cur.fetchall()

            # 2차: SKU 상품명에서 직접 검색 (매핑이 부족한 경우)
            if len(suggestions) < 5:
                cur.execute('''
                    SELECT id as sku_product_id, sku_name
                    FROM sku_products
                    WHERE sku_name ILIKE %s
                    LIMIT 5
                ''', (f'%{query}%',))
                sku_suggestions = cur.fetchall()

        return jsonify({
            'suggestions': suggestions,
            'sku_suggestions': [dict(s) for s in sku_suggestions] if len(suggestions) < 5 else []
        })
    except Exception as e:
        logger.error(f'[suggest_mappings] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
