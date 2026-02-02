"""
API 테스트 스크립트
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

def test_connection():
    database_url = os.getenv('DATABASE_URL')

    try:
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        cur = conn.cursor()

        # 사용자 조회
        cur.execute('SELECT * FROM users')
        users = cur.fetchall()
        print(f"Users: {users}")

        # 포장재 조회
        cur.execute('SELECT * FROM packaging_cost')
        packaging = cur.fetchall()
        print(f"Packaging: {packaging}")

        cur.close()
        conn.close()
        print("\nDatabase connection OK!")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == '__main__':
    test_connection()
