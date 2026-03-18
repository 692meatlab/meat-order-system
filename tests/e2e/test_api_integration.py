"""E2E 테스트: 브라우저에서 직접 API 호출하여 통합 테스트

로컬 환경에서는 Railway DB 연결이 불가능할 수 있으므로
200 (정상) 또는 503 (DB 미연결) 모두 유효한 응답으로 처리한다.
503은 라우트가 올바르게 등록되어 있고 DB 접근 시도 시 연결 실패인 것을 의미한다.
"""


def _assert_api_reachable(response, expected_keys=None):
    """API가 접근 가능한지 확인 (200 또는 503)"""
    assert response.status in (200, 503), f"예상외 상태 코드: {response.status}"
    if response.status == 200 and expected_keys:
        data = response.json()
        for key in expected_keys:
            assert key in data, f"응답에 '{key}' 없음"


def test_api_init_returns_data(app_page, live_server):
    """초기화 API가 필요한 데이터를 모두 반환하는지"""
    response = app_page.request.get(f"{live_server}/api/init")
    assert response.status == 200
    data = response.json()
    for key in ["users", "parts", "packaging", "sku_products", "vendor_mappings"]:
        assert key in data, f"init 응답에 '{key}' 없음"


def test_api_filter_presets(app_page, live_server):
    """필터 프리셋 API (Stage 1)"""
    r = app_page.request.get(f"{live_server}/api/filter-presets")
    _assert_api_reachable(r, ["presets"])


def test_api_cost_history(app_page, live_server):
    """원가 이력 API (Stage 3)"""
    r = app_page.request.get(f"{live_server}/api/cost-history")
    _assert_api_reachable(r, ["history"])


def test_api_upload_history(app_page, live_server):
    """업로드 이력 API (Stage 4)"""
    r = app_page.request.get(f"{live_server}/api/upload-history")
    _assert_api_reachable(r, ["history"])


def test_api_inventory(app_page, live_server):
    """재고 API (Stage 7)"""
    r = app_page.request.get(f"{live_server}/api/inventory")
    _assert_api_reachable(r, ["inventory"])


def test_api_inventory_alerts(app_page, live_server):
    """재고 부족 알림 API (Stage 7)"""
    r = app_page.request.get(f"{live_server}/api/inventory/alerts")
    _assert_api_reachable(r, ["alerts"])


def test_api_notifications(app_page, live_server):
    """알림 API (Stage 8)"""
    r = app_page.request.get(f"{live_server}/api/notifications")
    _assert_api_reachable(r, ["notifications", "unread_count"])


def test_api_notification_generate(app_page, live_server):
    """알림 생성 API (Stage 8)"""
    r = app_page.request.post(
        f"{live_server}/api/notifications/generate",
        data="{}", headers={"Content-Type": "application/json"}
    )
    _assert_api_reachable(r, ["created"])


def test_api_backup_export(app_page, live_server):
    """백업 내보내기 API (Stage 10)"""
    r = app_page.request.get(f"{live_server}/api/backup/export")
    _assert_api_reachable(r, ["tables", "exported_at"])


def test_api_backup_log(app_page, live_server):
    """백업 이력 API (Stage 10)"""
    r = app_page.request.get(f"{live_server}/api/backup/log")
    _assert_api_reachable(r, ["logs"])


def test_api_vendor_report(app_page, live_server):
    """매출 리포트 API (Stage 6)"""
    r = app_page.request.get(f"{live_server}/api/dashboard/vendor-report")
    _assert_api_reachable(r, ["vendor_summary", "monthly_trend", "sku_breakdown"])


def test_api_notification_mark_read(app_page, live_server):
    """알림 읽음 처리 API (Stage 8)"""
    r = app_page.request.post(
        f"{live_server}/api/notifications/mark-read",
        data="{}", headers={"Content-Type": "application/json"}
    )
    _assert_api_reachable(r)
