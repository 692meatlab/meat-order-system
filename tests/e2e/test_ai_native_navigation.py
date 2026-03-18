"""E2E 테스트: AI-Native 페이지 네비게이션 (A-1~A-7)

사이드바 메뉴 클릭으로 AI-Native 페이지 전환이 정상 작동하는지 확인.
"""


def test_navigate_to_profitability(app_page):
    """수익성 분석 페이지 전환 (A-3)"""
    app_page.locator(".menu-item:has-text('수익성 분석')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#profitability.active").count() >= 1


def test_navigate_to_forecast(app_page):
    """수요 예측 페이지 전환 (A-6)"""
    app_page.locator(".menu-item:has-text('수요 예측')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#forecast.active").count() >= 1


def test_navigate_to_smart_order(app_page):
    """스마트 발주 페이지 전환 (A-7)"""
    app_page.locator(".menu-item:has-text('스마트 발주')").click()
    app_page.wait_for_timeout(500)
    assert app_page.locator("#smart-order.active").count() >= 1
