"""SKU 상품 및 원가 관련 API"""
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

sku_bp = Blueprint('sku', __name__)


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
# 부위별 원가 API
# ============================================================
@sku_bp.route('/api/parts-cost', methods=['GET'])
def get_parts_cost():
    """부위별 원가 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM parts_cost ORDER BY part_name')
            parts = cur.fetchall()
        return jsonify({'parts': parts})
    except Exception as e:
        logger.error(f'[get_parts_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/parts-cost', methods=['POST'])
@require_api_key
def create_parts_cost():
    """부위별 원가 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    part_name = data.get('part_name', '').strip()
    price_per_100g = data.get('price_per_100g', 0)
    cost_type = data.get('cost_type', 'weight')
    grade = data.get('grade', '').strip()

    if not part_name:
        return jsonify({'error': 'Part name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO parts_cost (part_name, price_per_100g, cost_type, grade)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (part_name) DO UPDATE SET price_per_100g = %s, cost_type = %s, grade = %s
                RETURNING *
            ''', (part_name, price_per_100g, cost_type, grade, price_per_100g, cost_type, grade))
            part = cur.fetchone()
            conn.commit()
        return jsonify({'part': part}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_parts_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/parts-cost/<int:part_id>', methods=['PUT'])
@require_api_key
def update_parts_cost(part_id):
    """부위별 원가 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    part_name = data.get('part_name', '').strip()
    price_per_100g = data.get('price_per_100g', 0)
    cost_type = data.get('cost_type', 'weight')
    grade = data.get('grade', '').strip()

    if not part_name:
        return jsonify({'error': 'Part name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE parts_cost SET part_name = %s, price_per_100g = %s, cost_type = %s, grade = %s
                WHERE id = %s RETURNING *
            ''', (part_name, price_per_100g, cost_type, grade, part_id))
            part = cur.fetchone()
            conn.commit()
        if not part:
            return jsonify({'error': '해당 부위를 찾을 수 없습니다'}), 404
        return jsonify({'part': part})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_parts_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/parts-cost/<int:part_id>', methods=['DELETE'])
@require_api_key
def delete_parts_cost(part_id):
    """부위별 원가 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM parts_cost WHERE id = %s', (part_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_parts_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 포장재 원가 API
# ============================================================
@sku_bp.route('/api/packaging-cost', methods=['GET'])
def get_packaging_cost():
    """포장재 원가 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM packaging_cost ORDER BY packaging_name')
            packaging = cur.fetchall()
        return jsonify({'packaging': packaging})
    except Exception as e:
        logger.error(f'[get_packaging_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/packaging-cost', methods=['POST'])
@require_api_key
def create_packaging_cost():
    """포장재 원가 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    packaging_name = data.get('packaging_name', '').strip()
    price = data.get('price', 0)

    if not packaging_name:
        return jsonify({'error': 'Packaging name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO packaging_cost (packaging_name, price)
                VALUES (%s, %s)
                ON CONFLICT (packaging_name) DO UPDATE SET price = %s
                RETURNING *
            ''', (packaging_name, price, price))
            pkg = cur.fetchone()
            conn.commit()
        return jsonify({'packaging': pkg}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_packaging_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/packaging-cost/<int:pkg_id>', methods=['PUT'])
@require_api_key
def update_packaging_cost(pkg_id):
    """포장재 원가 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    packaging_name = data.get('packaging_name', '').strip()
    price = data.get('price', 0)

    if not packaging_name:
        return jsonify({'error': 'Packaging name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE packaging_cost SET packaging_name = %s, price = %s
                WHERE id = %s RETURNING *
            ''', (packaging_name, price, pkg_id))
            pkg = cur.fetchone()
            conn.commit()
        if not pkg:
            return jsonify({'error': '해당 포장재를 찾을 수 없습니다'}), 404
        return jsonify({'packaging': pkg})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_packaging_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/packaging-cost/<int:pkg_id>', methods=['DELETE'])
@require_api_key
def delete_packaging_cost(pkg_id):
    """포장재 원가 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM packaging_cost WHERE id = %s', (pkg_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_packaging_cost] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# SKU 상품 API
# ============================================================
@sku_bp.route('/api/sku-products', methods=['GET'])
def get_sku_products():
    """SKU 상품 목록 조회 (구성품 포함, N+1 최적화)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            # 상품과 구성품을 JOIN으로 한번에 조회 (N+1 -> 1 쿼리)
            cur.execute('''
                SELECT
                    sp.id, sp.sku_name, sp.packaging, sp.selling_price, sp.created_at,
                    sc.id as comp_id, sc.part_name, sc.weight, sc.composition_type
                FROM sku_products sp
                LEFT JOIN sku_compositions sc ON sp.id = sc.sku_product_id
                ORDER BY sp.sku_name, sc.id
            ''')
            rows = cur.fetchall()

            # 결과를 상품별로 그룹화
            products_dict = {}
            for row in rows:
                pid = row['id']
                if pid not in products_dict:
                    products_dict[pid] = {
                        'id': pid,
                        'sku_name': row['sku_name'],
                        'packaging': row['packaging'],
                        'selling_price': row['selling_price'],
                        'created_at': row['created_at'],
                        'compositions': []
                    }
                if row['comp_id']:
                    products_dict[pid]['compositions'].append({
                        'id': row['comp_id'],
                        'part_name': row['part_name'],
                        'weight': row['weight'],
                        'composition_type': row['composition_type']
                    })

            products = list(products_dict.values())

        return jsonify({'products': products})
    except Exception as e:
        logger.error(f'[get_sku_products] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/sku-products', methods=['POST'])
@require_api_key
def create_sku_product():
    """SKU 상품 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    sku_name = data.get('sku_name', '').strip()
    packaging = data.get('packaging', '')
    selling_price = data.get('selling_price', 0)
    compositions = data.get('compositions', [])

    if not sku_name:
        return jsonify({'error': 'SKU name is required'}), 400

    try:
        with conn.cursor() as cur:
            # 상품 생성
            cur.execute('''
                INSERT INTO sku_products (sku_name, packaging, selling_price)
                VALUES (%s, %s, %s)
                RETURNING id, sku_name, packaging, selling_price, created_at
            ''', (sku_name, packaging, selling_price))
            product = cur.fetchone()

            # 구성품 생성
            for comp in compositions:
                cur.execute('''
                    INSERT INTO sku_compositions (sku_product_id, part_name, weight, composition_type)
                    VALUES (%s, %s, %s, %s)
                ''', (product['id'], comp.get('part_name'), comp.get('weight', 0), comp.get('composition_type', 'weight')))

            conn.commit()

            # 구성품 조회
            cur.execute('SELECT * FROM sku_compositions WHERE sku_product_id = %s', (product['id'],))
            product['compositions'] = cur.fetchall()

        return jsonify({'product': product}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_sku_product] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/sku-products/<int:product_id>', methods=['PUT'])
@require_api_key
def update_sku_product(product_id):
    """SKU 상품 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    sku_name = data.get('sku_name', '').strip()
    packaging = data.get('packaging', '')
    selling_price = data.get('selling_price', 0)
    compositions = data.get('compositions', [])

    try:
        with conn.cursor() as cur:
            # 상품 수정
            cur.execute('''
                UPDATE sku_products
                SET sku_name = %s, packaging = %s, selling_price = %s
                WHERE id = %s
                RETURNING id, sku_name, packaging, selling_price, created_at
            ''', (sku_name, packaging, selling_price, product_id))
            product = cur.fetchone()

            if not product:
                return jsonify({'error': 'Product not found'}), 404

            # 기존 구성품 삭제 후 새로 생성
            cur.execute('DELETE FROM sku_compositions WHERE sku_product_id = %s', (product_id,))
            for comp in compositions:
                cur.execute('''
                    INSERT INTO sku_compositions (sku_product_id, part_name, weight, composition_type)
                    VALUES (%s, %s, %s, %s)
                ''', (product_id, comp.get('part_name'), comp.get('weight', 0), comp.get('composition_type', 'weight')))

            conn.commit()

            cur.execute('SELECT * FROM sku_compositions WHERE sku_product_id = %s', (product_id,))
            product['compositions'] = cur.fetchall()

        return jsonify({'product': product})
    except Exception as e:
        conn.rollback()
        logger.error(f'[update_sku_product] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@sku_bp.route('/api/sku-products/<int:product_id>', methods=['DELETE'])
@require_api_key
def delete_sku_product(product_id):
    """SKU 상품 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM sku_products WHERE id = %s', (product_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_sku_product] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
