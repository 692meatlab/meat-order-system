"""퍼지 SKU 매칭 API - 토큰 유사도 기반 자동 매칭"""
import re
import logging
from flask import Blueprint, jsonify, request, g
from config import Config
from functools import wraps

logger = logging.getLogger('order-management')

fuzzy_match_bp = Blueprint('fuzzy_match', __name__)


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
            return jsonify({'error': '인증이 필요합니다'}), 401
        return f(*args, **kwargs)
    return decorated


# ============================================================
# 텍스트 정규화 및 유사도 함수
# ============================================================
def normalize_text(text):
    """공백/특수문자 제거, 소문자화, 단위 통일"""
    if not text:
        return ''
    text = re.sub(r'[^\w가-힣a-zA-Z0-9]', '', str(text)).lower()
    text = text.replace('킬로그램', 'kg')
    text = text.replace('킬로', 'kg').replace('그램', 'g')
    return text


def tokenize(text):
    """토큰 분리: 한글+영문+숫자"""
    if not text:
        return []
    return re.findall(r'[가-힣]+|[a-zA-Z]+|\d+', str(text))


def token_similarity(tokens_a, tokens_b):
    """Jaccard 유사도"""
    set_a, set_b = set(tokens_a), set(tokens_b)
    if not set_a or not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union)


def _match_pipeline(cur, vendor_name, product_name):
    """4단계 매칭 파이프라인"""
    normalized = normalize_text(product_name)
    tokens = tokenize(product_name)

    # 1단계: 정확 매칭 (vendor_mappings)
    cur.execute('''
        SELECT vm.sku_product_id, sp.sku_name, vm.product_name
        FROM vendor_mappings vm
        JOIN sku_products sp ON vm.sku_product_id = sp.id
        WHERE vm.vendor_name = %s AND vm.product_name = %s
    ''', (vendor_name, product_name))
    exact = cur.fetchone()
    if exact:
        return {
            'matched_sku': exact['sku_name'],
            'sku_id': exact['sku_product_id'],
            'confidence': 1.0,
            'match_stage': 'exact',
            'candidates': [{'sku_name': exact['sku_name'], 'score': 1.0}]
        }

    # 2단계: 별칭 매칭
    cur.execute('''
        SELECT ma.sku_product_id, sp.sku_name, ma.alias_name
        FROM matching_aliases ma
        JOIN sku_products sp ON ma.sku_product_id = sp.id
    ''')
    aliases = cur.fetchall()
    for alias in aliases:
        if normalize_text(alias['alias_name']) == normalized:
            return {
                'matched_sku': alias['sku_name'],
                'sku_id': alias['sku_product_id'],
                'confidence': 0.95,
                'match_stage': 'alias',
                'candidates': [{'sku_name': alias['sku_name'], 'score': 0.95}]
            }

    # 3단계: 토큰 매칭 (모든 SKU와 비교)
    cur.execute('SELECT id, sku_name FROM sku_products')
    all_skus = cur.fetchall()

    candidates = []
    for sku in all_skus:
        sku_tokens = tokenize(sku['sku_name'])
        score = token_similarity(tokens, sku_tokens)
        if score >= 0.3:
            candidates.append({
                'sku_name': sku['sku_name'],
                'sku_id': sku['id'],
                'score': round(score, 3)
            })

    candidates.sort(key=lambda x: x['score'], reverse=True)

    if candidates and candidates[0]['score'] >= 0.6:
        best = candidates[0]
        return {
            'matched_sku': best['sku_name'],
            'sku_id': best['sku_id'],
            'confidence': round(best['score'], 3),
            'match_stage': 'token',
            'candidates': [{'sku_name': c['sku_name'], 'score': c['score']} for c in candidates[:5]]
        }

    # 4단계: trigram 매칭 (DB similarity) - pg_trgm이 없으면 스킵
    try:
        cur.execute('''
            SELECT id, sku_name, similarity(sku_name, %s) as sim
            FROM sku_products
            WHERE similarity(sku_name, %s) >= 0.3
            ORDER BY sim DESC
            LIMIT 5
        ''', (product_name, product_name))
        trgm_results = cur.fetchall()
        if trgm_results:
            best = trgm_results[0]
            trgm_candidates = [{'sku_name': r['sku_name'], 'score': round(float(r['sim']), 3)} for r in trgm_results]
            # 토큰 후보와 병합
            all_candidates = {c['sku_name']: c['score'] for c in candidates[:5]}
            for tc in trgm_candidates:
                if tc['sku_name'] not in all_candidates or tc['score'] > all_candidates[tc['sku_name']]:
                    all_candidates[tc['sku_name']] = tc['score']
            merged = sorted([{'sku_name': k, 'score': v} for k, v in all_candidates.items()],
                          key=lambda x: x['score'], reverse=True)[:5]
            return {
                'matched_sku': best['sku_name'],
                'sku_id': best['id'],
                'confidence': round(float(best['sim']), 3),
                'match_stage': 'trigram',
                'candidates': merged
            }
    except Exception:
        pass  # pg_trgm 미설치 시 스킵

    # 매칭 실패 - 후보만 반환
    return {
        'matched_sku': None,
        'sku_id': None,
        'confidence': 0,
        'match_stage': 'none',
        'candidates': [{'sku_name': c['sku_name'], 'score': c['score']} for c in candidates[:5]]
    }


# ============================================================
# API 엔드포인트
# ============================================================
@fuzzy_match_bp.route('/api/fuzzy-match', methods=['POST'])
def fuzzy_match():
    """상품명 배열 → 매칭 결과 (confidence 포함)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    items = data.get('items', [])
    vendor_name = data.get('vendor_name', '')

    if not items:
        return jsonify({'results': []})

    try:
        results = []
        with conn.cursor() as cur:
            for item in items:
                product_name = item.get('product_name', '') if isinstance(item, dict) else str(item)
                result = _match_pipeline(cur, vendor_name, product_name)
                result['original'] = product_name
                results.append(result)

        return jsonify({'results': results})
    except Exception as e:
        logger.error(f'[fuzzy_match] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@fuzzy_match_bp.route('/api/matching-aliases', methods=['GET'])
def get_matching_aliases():
    """별칭 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT ma.*, sp.sku_name
                FROM matching_aliases ma
                JOIN sku_products sp ON ma.sku_product_id = sp.id
                ORDER BY sp.sku_name, ma.alias_name
            ''')
            aliases = cur.fetchall()
        return jsonify({'aliases': aliases})
    except Exception as e:
        logger.error(f'[get_matching_aliases] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@fuzzy_match_bp.route('/api/matching-aliases', methods=['POST'])
@require_api_key
def create_matching_alias():
    """별칭 등록"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    data = request.get_json()
    sku_product_id = data.get('sku_product_id')
    alias_name = data.get('alias_name', '').strip()

    if not sku_product_id or not alias_name:
        return jsonify({'error': 'sku_product_id와 alias_name은 필수입니다'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO matching_aliases (sku_product_id, alias_name)
                VALUES (%s, %s) RETURNING *
            ''', (sku_product_id, alias_name))
            alias = cur.fetchone()
            conn.commit()
        return jsonify({'alias': alias}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f'[create_matching_alias] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


@fuzzy_match_bp.route('/api/matching-aliases/<int:alias_id>', methods=['DELETE'])
@require_api_key
def delete_matching_alias(alias_id):
    """별칭 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM matching_aliases WHERE id = %s', (alias_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'[delete_matching_alias] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500
