"""
샘플 데이터 삽입 스크립트
기존 Firebase 데이터 구조를 참고하여 PostgreSQL에 삽입
"""
import os
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

load_dotenv()

# 샘플 데이터 정의
USERS = [
    {'name': '김민서', 'role': 'admin'},
    {'name': '박지영', 'role': 'user'},
    {'name': '이준혁', 'role': 'user'},
]

# 부위별 원가 (100g당)
PARTS_COST = {
    '안심': {'price': 8500, 'type': 'weight'},
    '등심': {'price': 7800, 'type': 'weight'},
    '채끝': {'price': 7200, 'type': 'weight'},
    '목심': {'price': 5500, 'type': 'weight'},
    '앞다리': {'price': 4800, 'type': 'weight'},
    '뒷다리': {'price': 4500, 'type': 'weight'},
    '갈비': {'price': 6800, 'type': 'weight'},
    '삼겹살': {'price': 5200, 'type': 'weight'},
    '항정살': {'price': 7000, 'type': 'weight'},
    '가브리살': {'price': 6500, 'type': 'weight'},
    '토시살': {'price': 6200, 'type': 'weight'},
    '차돌박이': {'price': 5800, 'type': 'weight'},
    '양지': {'price': 4200, 'type': 'weight'},
    '사태': {'price': 3800, 'type': 'weight'},
    '우삼겹': {'price': 4500, 'type': 'weight'},
}

# 포장재 비용
PACKAGING_COST = {
    '박스포장': 3000,
    '보냉백': 2000,
    '아이스팩(소)': 500,
    '아이스팩(대)': 1000,
    '스티로폼박스': 4000,
    '진공포장': 1500,
    '선물포장': 5000,
}

# SKU 상품 목록
SKU_PRODUCTS = [
    {
        'sku_name': '한우 등심 세트 1kg',
        'packaging': '선물포장',
        'selling_price': 89000,
        'compositions': [
            {'part': '등심', 'weight': 1000, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 안심 스테이크 500g',
        'packaging': '진공포장',
        'selling_price': 55000,
        'compositions': [
            {'part': '안심', 'weight': 500, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 불고기용 600g',
        'packaging': '박스포장',
        'selling_price': 42000,
        'compositions': [
            {'part': '앞다리', 'weight': 300, 'type': 'weight'},
            {'part': '목심', 'weight': 300, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 갈비 선물세트 2kg',
        'packaging': '선물포장',
        'selling_price': 180000,
        'compositions': [
            {'part': '갈비', 'weight': 2000, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 모둠 구이세트 1.5kg',
        'packaging': '선물포장',
        'selling_price': 120000,
        'compositions': [
            {'part': '등심', 'weight': 500, 'type': 'weight'},
            {'part': '채끝', 'weight': 500, 'type': 'weight'},
            {'part': '안심', 'weight': 500, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 차돌박이 300g',
        'packaging': '진공포장',
        'selling_price': 25000,
        'compositions': [
            {'part': '차돌박이', 'weight': 300, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 양지 국거리 500g',
        'packaging': '박스포장',
        'selling_price': 28000,
        'compositions': [
            {'part': '양지', 'weight': 500, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 사태 수육용 1kg',
        'packaging': '진공포장',
        'selling_price': 48000,
        'compositions': [
            {'part': '사태', 'weight': 1000, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 특선 모둠 3kg',
        'packaging': '스티로폼박스',
        'selling_price': 250000,
        'compositions': [
            {'part': '등심', 'weight': 800, 'type': 'weight'},
            {'part': '안심', 'weight': 600, 'type': 'weight'},
            {'part': '채끝', 'weight': 600, 'type': 'weight'},
            {'part': '갈비', 'weight': 1000, 'type': 'weight'}
        ]
    },
    {
        'sku_name': '한우 항정살 400g',
        'packaging': '진공포장',
        'selling_price': 38000,
        'compositions': [
            {'part': '항정살', 'weight': 400, 'type': 'weight'}
        ]
    },
]

# 거래처 목록
VENDORS = ['정마인푸드', '협신축산', '미트랩', '한우마을', '고기나라']

# 거래처별 상품 매핑 (거래처 상품코드 -> SKU)
VENDOR_MAPPINGS = {
    '정마인푸드': [
        {'product_code': 'JM-001', 'product_name': '등심세트(1kg)', 'sku_index': 0},
        {'product_code': 'JM-002', 'product_name': '안심스테이크', 'sku_index': 1},
        {'product_code': 'JM-003', 'product_name': '불고기셋트', 'sku_index': 2},
    ],
    '협신축산': [
        {'product_code': 'HS-A01', 'product_name': '갈비선물세트', 'sku_index': 3},
        {'product_code': 'HS-A02', 'product_name': '모둠구이1.5', 'sku_index': 4},
        {'product_code': 'HS-A03', 'product_name': '차돌300', 'sku_index': 5},
    ],
    '미트랩': [
        {'product_code': 'ML-100', 'product_name': '양지국거리', 'sku_index': 6},
        {'product_code': 'ML-101', 'product_name': '사태수육', 'sku_index': 7},
    ],
    '한우마을': [
        {'product_code': 'HW-SP1', 'product_name': '특선모둠3kg', 'sku_index': 8},
        {'product_code': 'HW-SP2', 'product_name': '항정살400', 'sku_index': 9},
    ],
    '고기나라': [
        {'product_code': 'GN-01', 'product_name': '등심1kg', 'sku_index': 0},
        {'product_code': 'GN-02', 'product_name': '갈비2kg', 'sku_index': 3},
    ],
}

# 수령인 샘플
RECIPIENTS = [
    ('홍길동', '010-1234-5678', '서울시 강남구 테헤란로 123'),
    ('김철수', '010-2345-6789', '서울시 서초구 서초대로 456'),
    ('이영희', '010-3456-7890', '경기도 성남시 분당구 정자동 789'),
    ('박민수', '010-4567-8901', '인천시 연수구 송도동 101'),
    ('최지현', '010-5678-9012', '부산시 해운대구 우동 202'),
    ('정다은', '010-6789-0123', '대구시 수성구 범어동 303'),
    ('강현우', '010-7890-1234', '광주시 서구 치평동 404'),
    ('윤서연', '010-8901-2345', '대전시 유성구 봉명동 505'),
    ('임재현', '010-9012-3456', '울산시 남구 삼산동 606'),
    ('한미래', '010-0123-4567', '세종시 보람동 707'),
    ('오준영', '010-1111-2222', '경기도 수원시 팔달구 인계동 808'),
    ('조아라', '010-3333-4444', '경기도 용인시 수지구 죽전동 909'),
    ('신동훈', '010-5555-6666', '충북 청주시 흥덕구 복대동 111'),
    ('배수진', '010-7777-8888', '충남 천안시 서북구 쌍용동 222'),
    ('류지원', '010-9999-0000', '전북 전주시 덕진구 금암동 333'),
]


def seed_data():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        return False

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        cur = conn.cursor()

        print("=== 데이터 시딩 시작 ===\n")

        # 1. 기존 데이터 삭제 (역순으로)
        print("1. 기존 데이터 삭제...")
        cur.execute("DELETE FROM orders")
        cur.execute("DELETE FROM vendor_mappings")
        cur.execute("DELETE FROM sku_compositions")
        cur.execute("DELETE FROM sku_products")
        cur.execute("DELETE FROM packaging_cost")
        cur.execute("DELETE FROM parts_cost")
        cur.execute("DELETE FROM users")
        print("   완료!\n")

        # 2. 사용자 삽입
        print("2. 사용자 삽입...")
        user_ids = []
        for user in USERS:
            cur.execute(
                "INSERT INTO users (name, role) VALUES (%s, %s) RETURNING id",
                (user['name'], user['role'])
            )
            user_ids.append(cur.fetchone()[0])
        print(f"   {len(user_ids)}명 삽입 완료!\n")

        # 3. 부위별 원가 삽입
        print("3. 부위별 원가 삽입...")
        for part_name, data in PARTS_COST.items():
            cur.execute(
                "INSERT INTO parts_cost (part_name, price_per_100g, cost_type) VALUES (%s, %s, %s)",
                (part_name, data['price'], data['type'])
            )
        print(f"   {len(PARTS_COST)}개 삽입 완료!\n")

        # 4. 포장재 비용 삽입
        print("4. 포장재 비용 삽입...")
        for pkg_name, price in PACKAGING_COST.items():
            cur.execute(
                "INSERT INTO packaging_cost (packaging_name, price) VALUES (%s, %s)",
                (pkg_name, price)
            )
        print(f"   {len(PACKAGING_COST)}개 삽입 완료!\n")

        # 5. SKU 상품 삽입
        print("5. SKU 상품 삽입...")
        sku_ids = []
        for sku in SKU_PRODUCTS:
            cur.execute(
                """INSERT INTO sku_products (sku_name, packaging, selling_price)
                   VALUES (%s, %s, %s) RETURNING id""",
                (sku['sku_name'], sku['packaging'], sku['selling_price'])
            )
            sku_id = cur.fetchone()[0]
            sku_ids.append(sku_id)

            # 구성품 삽입
            for comp in sku['compositions']:
                cur.execute(
                    """INSERT INTO sku_compositions (sku_product_id, part_name, weight, composition_type)
                       VALUES (%s, %s, %s, %s)""",
                    (sku_id, comp['part'], comp['weight'], comp['type'])
                )
        print(f"   {len(sku_ids)}개 상품 삽입 완료!\n")

        # 6. 거래처별 매핑 삽입
        print("6. 거래처별 매핑 삽입...")
        mapping_count = 0
        for vendor, mappings in VENDOR_MAPPINGS.items():
            for m in mappings:
                cur.execute(
                    """INSERT INTO vendor_mappings (vendor_name, product_code, product_name, sku_product_id)
                       VALUES (%s, %s, %s, %s)""",
                    (vendor, m['product_code'], m['product_name'], sku_ids[m['sku_index']])
                )
                mapping_count += 1
        print(f"   {mapping_count}개 매핑 삽입 완료!\n")

        # 7. 주문 데이터 삽입 (최근 30일간 랜덤 주문)
        print("7. 주문 데이터 삽입...")
        order_count = 0
        today = datetime.now().date()

        for days_ago in range(30):
            order_date = today - timedelta(days=days_ago)
            # 하루에 3~8건의 주문
            num_orders = random.randint(3, 8)

            for _ in range(num_orders):
                user_id = random.choice(user_ids)
                vendor = random.choice(VENDORS)
                sku_idx = random.randint(0, len(SKU_PRODUCTS) - 1)
                sku = SKU_PRODUCTS[sku_idx]
                recipient = random.choice(RECIPIENTS)
                quantity = random.randint(1, 3)

                # 상태 결정 (과거일수록 완료 상태 확률 높음)
                if days_ago > 20:
                    status = 'completed'
                    shipped = True
                    paid = True
                elif days_ago > 10:
                    status = random.choice(['shipped', 'completed'])
                    shipped = True
                    paid = random.choice([True, False])
                elif days_ago > 3:
                    status = random.choice(['pending', 'shipped'])
                    shipped = status == 'shipped'
                    paid = random.choice([True, False]) if shipped else False
                else:
                    status = 'pending'
                    shipped = False
                    paid = False

                release_date = order_date + timedelta(days=random.randint(1, 3))

                cur.execute(
                    """INSERT INTO orders
                       (user_id, order_date, vendor_name, product_name, sku_name,
                        quantity, recipient, phone, address, status, shipped, paid,
                        release_date, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        user_id,
                        order_date,
                        vendor,
                        f"{vendor} 상품",
                        sku['sku_name'],
                        quantity,
                        recipient[0],
                        recipient[1],
                        recipient[2],
                        status,
                        shipped,
                        paid,
                        release_date,
                        datetime.now()
                    )
                )
                order_count += 1

        print(f"   {order_count}개 주문 삽입 완료!\n")

        # 커밋
        conn.commit()

        # 결과 확인
        print("=== 삽입 결과 확인 ===")
        tables = ['users', 'parts_cost', 'packaging_cost', 'sku_products',
                  'sku_compositions', 'vendor_mappings', 'orders']
        for table in tables:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            print(f"  {table}: {count}건")

        cur.close()
        conn.close()

        print("\n=== 데이터 시딩 완료! ===")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        if conn:
            conn.rollback()
        return False


if __name__ == '__main__':
    seed_data()
