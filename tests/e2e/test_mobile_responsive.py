"""E2E 테스트: 모바일 반응형 (Stage 2)"""
import pytest


@pytest.fixture()
def mobile_page(page, live_server):
    """모바일 뷰포트로 메인 페이지 로드"""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(live_server)
    page.wait_for_load_state("networkidle")
    page.wait_for_selector(".sidebar", timeout=10000)
    return page


def test_mobile_header_visible(mobile_page):
    """모바일에서 모바일 헤더가 보임"""
    header = mobile_page.locator(".mobile-header")
    assert header.count() >= 1, "모바일 헤더 없음"
    assert header.is_visible(), "모바일 헤더가 보이지 않음"


def test_hamburger_button_exists(mobile_page):
    """햄버거 버튼이 존재"""
    hamburger = mobile_page.locator(".hamburger")
    assert hamburger.count() >= 1, "햄버거 버튼 없음"


def test_hamburger_opens_sidebar(mobile_page):
    """햄버거 버튼 클릭 시 사이드바 열기 (show 클래스 토글)"""
    hamburger = mobile_page.locator(".hamburger")
    if hamburger.count() > 0:
        hamburger.click()
        mobile_page.wait_for_timeout(500)
        sidebar = mobile_page.locator("#sidebar")
        has_show = "show" in (sidebar.get_attribute("class") or "")
        assert has_show, "햄버거 클릭 후 사이드바가 열리지 않음 (show 클래스)"


def test_sidebar_hidden_by_default(mobile_page):
    """모바일에서 사이드바가 기본 숨김 (transform)"""
    sidebar = mobile_page.locator(".sidebar")
    box = sidebar.bounding_box()
    if box:
        # translateX(-100%) 적용 시 x가 음수이거나 화면 밖
        assert box["x"] < 0 or not sidebar.is_visible(), "모바일에서 사이드바가 기본 표시됨"
