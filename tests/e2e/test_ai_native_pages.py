"""E2E 테스트: AI-Native 페이지 콘텐츠 렌더링 (A-3, A-6, A-7)

각 AI-Native 페이지로 이동한 후 핵심 UI 요소가 렌더링되는지 확인.
"""


def test_profitability_page_elements(app_page):
    """수익성 분석 페이지 핵심 요소 (A-3)"""
    app_page.locator(".menu-item:has-text('수익성 분석')").click()
    app_page.wait_for_timeout(800)

    page = app_page.locator("#profitability")
    assert page.locator("h1:has-text('수익성 분석')").count() >= 1
    assert page.locator("text=SKU별 수익성").count() >= 1


def test_profitability_table_exists(app_page):
    """수익성 분석 테이블 영역 존재 (A-3)"""
    app_page.locator(".menu-item:has-text('수익성 분석')").click()
    app_page.wait_for_timeout(800)

    table_area = app_page.locator("#profitability-table")
    assert table_area.count() >= 1, "수익성 테이블 영역 없음"


def test_forecast_page_elements(app_page):
    """수요 예측 페이지 핵심 요소 (A-6)"""
    app_page.locator(".menu-item:has-text('수요 예측')").click()
    app_page.wait_for_timeout(800)

    page = app_page.locator("#forecast")
    assert page.locator("h1:has-text('수요 예측')").count() >= 1


def test_forecast_period_selector(app_page):
    """수요 예측 기간 선택 존재 (A-6)"""
    app_page.locator(".menu-item:has-text('수요 예측')").click()
    app_page.wait_for_timeout(800)

    page = app_page.locator("#forecast")
    # 기간 선택 버튼 또는 셀렉트 존재
    period_btns = page.locator("button:has-text('7일'), button:has-text('14일'), button:has-text('30일')")
    assert period_btns.count() >= 1 or page.locator("select").count() >= 1, "기간 선택 요소 없음"


def test_smart_order_page_elements(app_page):
    """스마트 발주 페이지 핵심 요소 (A-7)"""
    app_page.locator(".menu-item:has-text('스마트 발주')").click()
    app_page.wait_for_timeout(800)

    page = app_page.locator("#smart-order")
    assert page.locator("h1:has-text('스마트 발주')").count() >= 1


def test_smart_order_has_action_buttons(app_page):
    """스마트 발주 페이지에 액션 버튼 존재 (A-7)"""
    app_page.locator(".menu-item:has-text('스마트 발주')").click()
    app_page.wait_for_timeout(800)

    page = app_page.locator("#smart-order")
    # 발주서 생성 버튼 존재
    assert page.locator("button").count() >= 1, "스마트 발주 페이지에 버튼 없음"
