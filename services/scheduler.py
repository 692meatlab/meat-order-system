"""백그라운드 스케줄러 - APScheduler 기반 자동화 태스크"""
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger('order-management')

scheduler = BackgroundScheduler()
_app = None


def init_scheduler(app):
    """스케줄러 초기화 및 태스크 등록"""
    global _app
    _app = app

    # 매 30분: 알림 자동 생성
    scheduler.add_job(
        auto_generate_notifications,
        'interval', minutes=30,
        id='notifications',
        name='알림 자동 생성',
        replace_existing=True
    )

    # 매 6시간: 예측 캐시 갱신
    scheduler.add_job(
        refresh_forecast_cache,
        'interval', hours=6,
        id='forecast_cache',
        name='예측 캐시 갱신',
        replace_existing=True
    )

    # 매일 오전 9시: 예측 정확도 기록
    scheduler.add_job(
        log_forecast_accuracy,
        'cron', hour=9,
        id='accuracy_log',
        name='예측 정확도 기록',
        replace_existing=True
    )

    scheduler.start()
    logger.info('백그라운드 스케줄러 시작 (3개 태스크 등록)')


def auto_generate_notifications():
    """미입금(D+7) / 미출고(D+3) / 재고부족 알림 자동 생성"""
    if not _app:
        return

    with _app.app_context():
        from app import get_db
        conn = get_db()
        if not conn:
            logger.warning('[scheduler] 알림 생성 실패: DB 연결 없음')
            return

        try:
            created = 0
            with conn.cursor() as cur:
                # 1. 미입금 주문 (D+7 이상)
                cur.execute('''
                    SELECT id, vendor_name, recipient, sku_name
                    FROM orders
                    WHERE paid = FALSE
                    AND created_at <= NOW() - INTERVAL '7 days'
                    AND id NOT IN (
                        SELECT reference_id FROM notifications
                        WHERE type = 'unpaid' AND reference_type = 'order'
                        AND created_at > NOW() - INTERVAL '1 day'
                    )
                    LIMIT 20
                ''')
                unpaid = cur.fetchall()
                for o in unpaid:
                    cur.execute('''
                        INSERT INTO notifications (type, title, message, reference_type, reference_id)
                        VALUES ('unpaid', %s, %s, 'order', %s)
                    ''', (
                        f'미입금 알림: {o["recipient"]}',
                        f'{o["vendor_name"]} - {o["sku_name"]} (7일 이상 미입금)',
                        o['id']
                    ))
                    created += 1

                # 2. 미출고 주문 (D+3 이상)
                cur.execute('''
                    SELECT id, vendor_name, recipient, sku_name
                    FROM orders
                    WHERE shipped = FALSE
                    AND release_date <= CURRENT_DATE - INTERVAL '3 days'
                    AND id NOT IN (
                        SELECT reference_id FROM notifications
                        WHERE type = 'unshipped' AND reference_type = 'order'
                        AND created_at > NOW() - INTERVAL '1 day'
                    )
                    LIMIT 20
                ''')
                unshipped = cur.fetchall()
                for o in unshipped:
                    cur.execute('''
                        INSERT INTO notifications (type, title, message, reference_type, reference_id)
                        VALUES ('unshipped', %s, %s, 'order', %s)
                    ''', (
                        f'미출고 알림: {o["recipient"]}',
                        f'{o["vendor_name"]} - {o["sku_name"]} (출고일 3일 초과)',
                        o['id']
                    ))
                    created += 1

                # 3. 재고 부족
                cur.execute('''
                    SELECT i.sku_product_id, sp.sku_name, i.current_stock, i.min_stock
                    FROM inventory i
                    JOIN sku_products sp ON i.sku_product_id = sp.id
                    WHERE i.current_stock <= i.min_stock AND i.min_stock > 0
                    AND i.sku_product_id NOT IN (
                        SELECT reference_id FROM notifications
                        WHERE type = 'low_stock' AND reference_type = 'inventory'
                        AND created_at > NOW() - INTERVAL '1 day'
                    )
                    LIMIT 20
                ''')
                low_stock = cur.fetchall()
                for item in low_stock:
                    cur.execute('''
                        INSERT INTO notifications (type, title, message, reference_type, reference_id)
                        VALUES ('low_stock', %s, %s, 'inventory', %s)
                    ''', (
                        f'재고 부족: {item["sku_name"]}',
                        f'현재 {item["current_stock"]}개 (최소 {item["min_stock"]}개)',
                        item['sku_product_id']
                    ))
                    created += 1

                conn.commit()

            if created > 0:
                logger.info(f'[scheduler] 알림 {created}개 자동 생성')
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            logger.error(f'[scheduler] 알림 생성 오류: {e}', exc_info=True)


def refresh_forecast_cache():
    """예측 캐시 갱신 (services.cache 사용)"""
    if not _app:
        return

    with _app.app_context():
        try:
            from services.cache import cache
            cache.invalidate_prefix('forecast')
            logger.info('[scheduler] 예측 캐시 갱신 완료')
        except Exception as e:
            logger.error(f'[scheduler] 예측 캐시 갱신 오류: {e}', exc_info=True)


def log_forecast_accuracy():
    """예측 정확도 기록 - 어제 예측 vs 실제 비교"""
    if not _app:
        return

    with _app.app_context():
        from app import get_db
        conn = get_db()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                # 어제 실제 주문량 집계
                cur.execute('''
                    SELECT sku_name, SUM(quantity) as actual_qty
                    FROM orders
                    WHERE order_date::date = CURRENT_DATE - INTERVAL '1 day'
                    AND sku_name IS NOT NULL
                    GROUP BY sku_name
                ''')
                actuals = {r['sku_name']: int(r['actual_qty']) for r in cur.fetchall()}

                if not actuals:
                    return

                # 어제의 예측값 (간단 추정: 현재 모델로 1일 전 예측)
                from routes.forecast import _forecast_sku
                for sku_name, actual in actuals.items():
                    try:
                        forecast = _forecast_sku(cur, sku_name, days=1)
                        predicted = forecast['daily_forecast'][0] if forecast['daily_forecast'] else 0
                        if actual > 0:
                            error_pct = abs(predicted - actual) / actual * 100
                        else:
                            error_pct = 100 if predicted > 0 else 0

                        cur.execute('''
                            INSERT INTO forecast_accuracy_log
                            (sku_name, forecast_date, predicted_qty, actual_qty, error_pct)
                            VALUES (%s, CURRENT_DATE - INTERVAL '1 day', %s, %s, %s)
                        ''', (sku_name, predicted, actual, error_pct))
                    except Exception:
                        pass

                conn.commit()
                logger.info(f'[scheduler] 예측 정확도 기록 완료 ({len(actuals)} SKU)')
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            logger.error(f'[scheduler] 정확도 기록 오류: {e}', exc_info=True)


def get_scheduler_status():
    """스케줄러 상태 반환"""
    jobs = []
    for job in scheduler.get_jobs():
        next_run = job.next_run_time
        jobs.append({
            'id': job.id,
            'name': job.name,
            'next_run': next_run.isoformat() if next_run else None,
            'trigger': str(job.trigger)
        })
    return {
        'running': scheduler.running,
        'jobs': jobs
    }


def trigger_job(job_id):
    """수동 트리거"""
    job = scheduler.get_job(job_id)
    if not job:
        return False
    job.modify(next_run_time=datetime.now())
    return True
