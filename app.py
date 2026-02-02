"""
Order Management - Flask 메인 앱
발주서 변환 및 송장 등록 시스템
"""
import os
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request, g, make_response
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row
import json

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')


# ============================================================
# Database Connection (psycopg3)
# ============================================================
def get_db():
    """DB 연결 가져오기"""
    if 'db' not in g:
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            g.db = psycopg.connect(database_url, row_factory=dict_row)
    return g.get('db')


def close_db(e=None):
    """DB 연결 닫기"""
    db = g.pop('db', None)
    if db is not None:
        db.close()


app.teardown_appcontext(close_db)


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
            print(f"Init data error: {e}")

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
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


# ============================================================
# 대시보드/통계 API
# ============================================================
@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    """대시보드 통계 (단일 쿼리 최적화)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            # 모든 통계를 단일 쿼리로 조회 (6개 쿼리 → 1개)
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
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard/calendar')
def get_calendar_data():
    """달력용 주문 데이터 (개별 주문 포함)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard/range-orders')
def get_range_orders():
    """기간별 발주량 계산"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


# ============================================================
# 통합조회 API
# ============================================================
@app.route('/api/integrated-orders')
def get_integrated_orders():
    """통합 주문 조회 (모든 사용자)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


# ============================================================
# 사용자 API
# ============================================================
@app.route('/api/users', methods=['GET'])
def get_users():
    """사용자 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, role, created_at FROM users ORDER BY name')
            users = cur.fetchall()
        return jsonify({'users': users})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users', methods=['POST'])
def create_user():
    """사용자 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    data = request.get_json()
    name = data.get('name', '').strip()
    role = data.get('role', 'user')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO users (name, role) VALUES (%s, %s) RETURNING id, name, role, created_at',
                (name, role)
            )
            user = cur.fetchone()
            conn.commit()
        return jsonify({'user': user}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """사용자 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# 부위별 원가 API
# ============================================================
@app.route('/api/parts-cost', methods=['GET'])
def get_parts_cost():
    """부위별 원가 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM parts_cost ORDER BY part_name')
            parts = cur.fetchall()
        return jsonify({'parts': parts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/parts-cost', methods=['POST'])
def create_parts_cost():
    """부위별 원가 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    data = request.get_json()
    part_name = data.get('part_name', '').strip()
    price_per_100g = data.get('price_per_100g', 0)
    cost_type = data.get('cost_type', 'weight')

    if not part_name:
        return jsonify({'error': 'Part name is required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO parts_cost (part_name, price_per_100g, cost_type)
                VALUES (%s, %s, %s)
                ON CONFLICT (part_name) DO UPDATE SET price_per_100g = %s, cost_type = %s
                RETURNING *
            ''', (part_name, price_per_100g, cost_type, price_per_100g, cost_type))
            part = cur.fetchone()
            conn.commit()
        return jsonify({'part': part}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/parts-cost/<int:part_id>', methods=['DELETE'])
def delete_parts_cost(part_id):
    """부위별 원가 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM parts_cost WHERE id = %s', (part_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# 포장재 원가 API
# ============================================================
@app.route('/api/packaging-cost', methods=['GET'])
def get_packaging_cost():
    """포장재 원가 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM packaging_cost ORDER BY packaging_name')
            packaging = cur.fetchall()
        return jsonify({'packaging': packaging})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/packaging-cost', methods=['POST'])
def create_packaging_cost():
    """포장재 원가 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/packaging-cost/<int:pkg_id>', methods=['DELETE'])
def delete_packaging_cost(pkg_id):
    """포장재 원가 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM packaging_cost WHERE id = %s', (pkg_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# SKU 상품 API
# ============================================================
@app.route('/api/sku-products', methods=['GET'])
def get_sku_products():
    """SKU 상품 목록 조회 (구성품 포함, N+1 최적화)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            # 상품과 구성품을 JOIN으로 한번에 조회 (N+1 → 1 쿼리)
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
        return jsonify({'error': str(e)}), 500


@app.route('/api/sku-products', methods=['POST'])
def create_sku_product():
    """SKU 상품 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/sku-products/<int:product_id>', methods=['PUT'])
def update_sku_product(product_id):
    """SKU 상품 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/sku-products/<int:product_id>', methods=['DELETE'])
def delete_sku_product(product_id):
    """SKU 상품 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM sku_products WHERE id = %s', (product_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# 거래처 API
# ============================================================
@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    """거래처 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT DISTINCT vendor_name FROM vendor_mappings ORDER BY vendor_name')
            vendors = [row['vendor_name'] for row in cur.fetchall()]
        return jsonify({'vendors': vendors})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/vendor-mappings', methods=['GET'])
def get_vendor_mappings():
    """거래처 매핑 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/vendor-mappings', methods=['POST'])
def create_vendor_mapping():
    """거래처 매핑 생성"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/vendor-mappings/<int:mapping_id>', methods=['PUT'])
def update_vendor_mapping(mapping_id):
    """거래처 매핑 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/vendor-mappings/<int:mapping_id>', methods=['DELETE'])
def delete_vendor_mapping(mapping_id):
    """거래처 매핑 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM vendor_mappings WHERE id = %s', (mapping_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================
# 거래처 템플릿 API
# ============================================================
@app.route('/api/vendor-templates', methods=['GET'])
def get_vendor_templates():
    """거래처 템플릿 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM vendor_templates ORDER BY vendor_name')
            templates = cur.fetchall()
        return jsonify({'templates': templates})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/vendor-templates', methods=['POST'])
def save_vendor_template():
    """거래처 템플릿 저장"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
        return jsonify({'error': str(e)}), 500


# ============================================================
# 주문 API
# ============================================================
@app.route('/api/orders', methods=['GET'])
def get_orders():
    """주문 목록 조회"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status')
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

            query += ' ORDER BY o.created_at DESC LIMIT %s'
            params.append(limit)

            cur.execute(query, params)
            orders = cur.fetchall()
        return jsonify({'orders': orders})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders', methods=['POST'])
def create_orders():
    """주문 생성 (bulk)"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

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
                        quantity, recipient, phone, address, memo, status, release_date
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                    order.get('status', 'pending'),
                    order.get('release_date')
                ))
                created.append(cur.fetchone()['id'])
            conn.commit()
        return jsonify({'created_ids': created, 'count': len(created)}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """주문 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    data = request.get_json()

    try:
        with conn.cursor() as cur:
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
                'release_date': 'release_date'
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
            conn.commit()
        return jsonify({'order': order})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/bulk-update', methods=['POST'])
def bulk_update_orders():
    """주문 일괄 수정"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    data = request.get_json()
    order_ids = data.get('order_ids', [])
    updates = data.get('updates', {})

    if not order_ids:
        return jsonify({'error': 'Order IDs are required'}), 400

    allowed_fields = ['status', 'shipped', 'paid', 'invoice_issued', 'memo', 'release_date']

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
        return jsonify({'updated': len(order_ids)})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """주문 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM orders WHERE id = %s', (order_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/bulk-delete', methods=['POST'])
def bulk_delete_orders():
    """주문 일괄 삭제"""
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    data = request.get_json()
    order_ids = data.get('order_ids', [])

    if not order_ids:
        return jsonify({'error': 'Order IDs are required'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM orders WHERE id = ANY(%s)', (order_ids,))
            conn.commit()
        return jsonify({'deleted': len(order_ids)})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500


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
