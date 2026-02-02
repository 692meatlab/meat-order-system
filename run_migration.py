"""
마이그레이션 실행 스크립트
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def run_migration():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not set")
        return False

    migration_file = Path(__file__).parent / 'migrations' / '001_initial.sql'
    if not migration_file.exists():
        print(f"ERROR: Migration file not found: {migration_file}")
        return False

    sql = migration_file.read_text(encoding='utf-8')

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cur = conn.cursor()

        print("Running migration...")
        cur.execute(sql)

        # 테이블 확인
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cur.fetchall()

        print(f"\nCreated tables ({len(tables)}):")
        for table in tables:
            print(f"  - {table[0]}")

        cur.close()
        conn.close()

        print("\nMigration completed successfully!")
        return True

    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        return False

if __name__ == '__main__':
    run_migration()
