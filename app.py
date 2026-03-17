"""
Order Management - Flask 메인 앱
발주서 변환 및 송장 등록 시스템
"""
import os
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, render_template, jsonify, request, g, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row
import json
from config import Config

load_dotenv()

# ============================================================
# Logging 설정
# ============================================================
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL, logging.INFO),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('order-management')

# ============================================================
# App 초기화
# ============================================================
app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
CORS(app, origins=Config.CORS_ORIGINS.split(',') if Config.CORS_ORIGINS != '*' else '*')


# ============================================================
# 인증 미들웨어
# ============================================================
def require_api_key(f):
    """API 키 인증 데코레이터 (환경변수 API_KEY가 설정된 경우에만 활성화)"""
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
# 입력 검증 유틸리티
# ============================================================
def validate_required(data, fields):
    """필수 필드 검증"""
    if not data:
        return jsonify({'error': '요청 데이터가 없습니다'}), 400
    missing = [f for f in fields if not data.get(f)]
    if missing:
        return jsonify({'error': f'필수 필드 누락: {", ".join(missing)}'}), 400
    return None


def safe_int(value, default=0):
    """안전한 정수 변환"""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# ============================================================
# Database Connection (psycopg3)
# ============================================================
def get_db():
    """DB 연결 가져오기"""
    if 'db' not in g:
        try:
            g.db = psycopg.connect(Config.DATABASE_URL, row_factory=dict_row)
        except Exception as e:
            logger.error(f'DB 연결 실패: {e}')
            return None
    return g.get('db')


def close_db(e=None):
    """DB 연결 닫기"""
    db = g.pop('db', None)
    if db is not None:
        db.close()


app.teardown_appcontext(close_db)


# ============================================================
# Blueprint 등록
# ============================================================
from routes.users import users_bp
from routes.sku import sku_bp
from routes.vendors import vendors_bp
from routes.orders import orders_bp
from routes.dashboard import dashboard_bp

app.register_blueprint(users_bp)
app.register_blueprint(sku_bp)
app.register_blueprint(vendors_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(dashboard_bp)


# ============================================================
# 메인 페이지 (서버 사이드 렌더링으로 초기 데이터 포함)
# ============================================================
@app.route('/')
def index():
    """메인 페이지 - 초기 데이터를 HTML에 포함하여 전송"""
    conn = get_db()
    init_data = {'users': [], 'parts': [], 'packaging': [], 'sku_products': [], 'vendor_mappings': [], 'calendar': {}}

    if conn:
        try:
            year = datetime.now().year
            month = datetime.now().month

            with conn.cursor() as cur:
                # 사용자 (dict 변환으로 JSON 직렬화 보장)
                cur.execute('SELECT id, name, role FROM users ORDER BY name')
                init_data['users'] = [dict(row) for row in cur.fetchall()]

                # 부위별 원가
                cur.execute('SELECT id, part_name, price_per_100g, cost_type FROM parts_cost ORDER BY part_name')
                init_data['parts'] = [dict(row) for row in cur.fetchall()]

                # 포장재
                cur.execute('SELECT id, packaging_name, price FROM packaging_cost ORDER BY packaging_name')
                init_data['packaging'] = [dict(row) for row in cur.fetchall()]

                # SKU + 구성품
                cur.execute('''
                    SELECT sp.id, sp.sku_name, sp.packaging, sp.selling_price,
                           sc.id as comp_id, sc.part_name, sc.weight, sc.composition_type
                    FROM sku_products sp
                    LEFT JOIN sku_compositions sc ON sp.id = sc.sku_product_id
                    ORDER BY sp.sku_name, sc.id
                ''')
                sku_rows = cur.fetchall()

                products_dict = {}
                for row in sku_rows:
                    pid = row['id']
                    if pid not in products_dict:
                        products_dict[pid] = {
                            'id': pid, 'sku_name': row['sku_name'],
                            'packaging': row['packaging'], 'selling_price': row['selling_price'],
                            'compositions': []
                        }
                    if row['comp_id']:
                        products_dict[pid]['compositions'].append({
                            'id': row['comp_id'], 'part_name': row['part_name'],
                            'weight': row['weight'], 'composition_type': row['composition_type']
                        })
                init_data['sku_products'] = list(products_dict.values())

                # 거래처 매핑
                cur.execute('''
                    SELECT vm.id, vm.vendor_name, vm.product_code, vm.product_name,
                           vm.sku_product_id, sp.sku_name
                    FROM vendor_mappings vm
                    LEFT JOIN sku_products sp ON vm.sku_product_id = sp.id
                    ORDER BY vm.vendor_name, vm.product_name
                ''')
                init_data['vendor_mappings'] = [dict(row) for row in cur.fetchall()]

                # 달력 (개별 주문 포함)
                cur.execute('''
                    SELECT id, release_date, sku_name, quantity, shipped
                    FROM orders
                    WHERE EXTRACT(YEAR FROM release_date) = %s AND EXTRACT(MONTH FROM release_date) = %s
                    ORDER BY release_date, id
                ''', (year, month))
                calendar = {}
                for row in cur.fetchall():
                    if row['release_date']:
                        date_str = row['release_date'].strftime('%Y-%m-%d')
                        if date_str not in calendar:
                            calendar[date_str] = {'order_count': 0, 'total_qty': 0, 'orders': []}
                        calendar[date_str]['order_count'] += 1
                        calendar[date_str]['total_qty'] += row['quantity'] or 0
                        calendar[date_str]['orders'].append({
                            'id': row['id'],
                            'skuName': row['sku_name'],
                            'quantity': row['quantity'],
                            'shipped': row['shipped'] or False
                        })
                init_data['calendar'] = calendar
                init_data['year'] = year
                init_data['month'] = month

        except Exception as e:
            logger.error(f'[index] 초기 데이터 로드 오류: {e}', exc_info=True)

    response = make_response(render_template('index.html'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


# ============================================================
# 초기 로드 통합 API (성능 최적화 - 1회 호출로 모든 데이터)
# ============================================================
@app.route('/api/init')
def get_init_data():
    """초기 로드에 필요한 모든 데이터를 한 번에 반환"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'DB 연결에 실패했습니다'}), 503

    year = request.args.get('year', type=int, default=datetime.now().year)
    month = request.args.get('month', type=int, default=datetime.now().month)

    try:
        with conn.cursor() as cur:
            # 1. 사용자 목록
            cur.execute('SELECT id, name, role FROM users ORDER BY name')
            users = cur.fetchall()

            # 2. 부위별 원가
            cur.execute('SELECT id, part_name, price_per_100g, cost_type FROM parts_cost ORDER BY part_name')
            parts = cur.fetchall()

            # 3. 포장재 원가
            cur.execute('SELECT id, packaging_name, price FROM packaging_cost ORDER BY packaging_name')
            packaging = cur.fetchall()

            # 4. SKU 상품 + 구성품 (JOIN)
            cur.execute('''
                SELECT
                    sp.id, sp.sku_name, sp.packaging, sp.selling_price,
                    sc.id as comp_id, sc.part_name, sc.weight, sc.composition_type
                FROM sku_products sp
                LEFT JOIN sku_compositions sc ON sp.id = sc.sku_product_id
                ORDER BY sp.sku_name, sc.id
            ''')
            sku_rows = cur.fetchall()

            # SKU 그룹화
            products_dict = {}
            for row in sku_rows:
                pid = row['id']
                if pid not in products_dict:
                    products_dict[pid] = {
                        'id': pid,
                        'sku_name': row['sku_name'],
                        'packaging': row['packaging'],
                        'selling_price': row['selling_price'],
                        'compositions': []
                    }
                if row['comp_id']:
                    products_dict[pid]['compositions'].append({
                        'id': row['comp_id'],
                        'part_name': row['part_name'],
                        'weight': row['weight'],
                        'composition_type': row['composition_type']
                    })
            sku_products = list(products_dict.values())

            # 5. 거래처 매핑
            cur.execute('''
                SELECT vm.id, vm.vendor_name, vm.product_code, vm.product_name,
                       vm.sku_product_id, sp.sku_name
                FROM vendor_mappings vm
                LEFT JOIN sku_products sp ON vm.sku_product_id = sp.id
                ORDER BY vm.vendor_name, vm.product_name
            ''')
            mappings = cur.fetchall()

            # 6. 달력 데이터 (개별 주문 포함)
            cur.execute('''
                SELECT id, release_date, sku_name, quantity, shipped
                FROM orders
                WHERE EXTRACT(YEAR FROM release_date) = %s
                  AND EXTRACT(MONTH FROM release_date) = %s
                ORDER BY release_date, id
            ''', (year, month))
            calendar_rows = cur.fetchall()

            calendar = {}
            for row in calendar_rows:
                if row['release_date']:
                    date_str = row['release_date'].strftime('%Y-%m-%d')
                    if date_str not in calendar:
                        calendar[date_str] = {'order_count': 0, 'total_qty': 0, 'orders': []}
                    calendar[date_str]['order_count'] += 1
                    calendar[date_str]['total_qty'] += row['quantity'] or 0
                    calendar[date_str]['orders'].append({
                        'id': row['id'],
                        'skuName': row['sku_name'],
                        'quantity': row['quantity'],
                        'shipped': row['shipped'] or False
                    })

        return jsonify({
            'users': users,
            'parts': parts,
            'packaging': packaging,
            'sku_products': sku_products,
            'vendor_mappings': mappings,
            'calendar': calendar,
            'year': year,
            'month': month
        })
    except Exception as e:
        logger.error(f'[get_init_data] 오류: {e}', exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다'}), 500


# ============================================================
# 시스템 API
# ============================================================
@app.route('/api/health')
def health_check():
    """헬스체크"""
    conn = get_db()
    db_status = 'connected' if conn else 'disconnected'

    return jsonify({
        'status': 'ok',
        'database': db_status,
        'timestamp': datetime.now().isoformat()
    })


# ============================================================
# 실행
# ============================================================
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
