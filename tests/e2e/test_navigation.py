"""E2E 테스트: 페이지 네비게이션

showPage() 함수가 page-content 요소에 active 클래스를 토글하는 방식.
DOM ID는 'dashboard', 'cost-management' 등 (prefix 없음).
"""


def test_navigate_to_dashboard(app_page):
    """대시보드 페이지 전환"""
    app_page.locator(".menu-item:has-text('대시보드')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#dashboard.active").count() >= 1


def test_navigate_to_cost_management(app_page):
    """원가관리 페이지 전환"""
    app_page.locator(".menu-item:has-text('원가관리')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#cost-management.active").count() >= 1


def test_navigate_to_sku(app_page):
    """SKU상품 페이지 전환"""
    app_page.locator(".menu-item:has-text('SKU상품')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#sku-management.active").count() >= 1


def test_navigate_to_vendor_mapping(app_page):
    """거래처별 상품관리 페이지 전환"""
    app_page.locator(".menu-item[onclick=\"showPage('vendor-mapping')\"]").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#vendor-mapping.active").count() >= 1


def test_navigate_to_upload_history(app_page):
    """업로드 이력 페이지 전환 (Stage 4)"""
    app_page.locator(".menu-item:has-text('업로드 이력')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#upload-history.active").count() >= 1


def test_navigate_to_backup_restore(app_page):
    """백업/복원 페이지 전환 (Stage 10)"""
    app_page.locator(".menu-item:has-text('백업/복원')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#backup-restore.active").count() >= 1


def test_navigate_to_vendor_report(app_page):
    """매출 리포트 페이지 전환 (Stage 6)"""
    app_page.locator(".menu-item[onclick=\"showPage('vendor-report')\"]").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#vendor-report.active").count() >= 1
