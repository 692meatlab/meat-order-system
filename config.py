import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(32).hex())
    DATABASE_URL = os.getenv('DATABASE_URL')
    API_KEY = os.getenv('API_KEY', '')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    DB_POOL_MIN = int(os.getenv('DB_POOL_MIN', '2'))
    DB_POOL_MAX = int(os.getenv('DB_POOL_MAX', '10'))

    @staticmethod
    def validate():
        if not Config.DATABASE_URL:
            raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다")
