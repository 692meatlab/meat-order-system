"""E2E 테스트: 페이지 로딩 및 기본 UI 렌더링"""


def test_main_page_loads(app_page):
    """메인 페이지가 정상 로드되는지 확인"""
    assert app_page.title() != ""
    sidebar = app_page.locator(".sidebar")
    assert sidebar.is_visible()


def test_sidebar_menus_exist(app_page):
    """사이드바 핵심 메뉴 항목들이 존재하는지 확인"""
    sidebar = app_page.locator(".sidebar")
    for menu in ["대시보드", "원가관리", "SKU상품"]:
        assert sidebar.locator(f".menu-item:has-text('{menu}')").count() >= 1, f"'{menu}' 메뉴 없음"


def test_new_sidebar_menus_exist(app_page):
    """Phase 6에서 추가된 사이드바 메뉴들"""
    sidebar = app_page.locator(".sidebar")
    for menu in ["업로드 이력", "백업/복원"]:
        assert sidebar.locator(f".menu-item:has-text('{menu}')").count() >= 1, f"'{menu}' 메뉴 없음"


def test_notification_bell_exists(app_page):
    """알림 벨 아이콘이 존재하는지"""
    bell = app_page.locator(".notification-bell")
    assert bell.count() >= 1, "알림 벨 아이콘 없음"


def test_health_api_from_browser(app_page, live_server):
    """브라우저에서 /api/health 호출"""
    response = app_page.request.get(f"{live_server}/api/health")
    assert response.status == 200
    data = response.json()
    assert data["status"] == "ok"
