"""E2E 테스트: 알림 시스템 UI (Stage 8)"""


def test_notification_bell_badge(app_page):
    """알림 벨에 배지가 존재 (숫자 또는 숨김)"""
    badge = app_page.locator("#notification-badge")
    assert badge.count() >= 1, "알림 배지 DOM 없음"


def test_notification_panel_toggle(app_page):
    """벨 클릭 시 알림 패널 열고 닫기"""
    panel = app_page.locator("#notification-panel")
    assert not panel.is_visible()

    # 벨 클릭 → 패널 열기
    bell = app_page.locator(".notification-bell")
    bell.click()
    app_page.wait_for_timeout(300)
    assert panel.is_visible(), "벨 클릭 후 알림 패널이 열리지 않음"

    # 외부 클릭 → 패널 닫기
    app_page.locator("body").click(position={"x": 10, "y": 10})
    app_page.wait_for_timeout(300)
    assert not panel.is_visible(), "외부 클릭 후 알림 패널이 닫히지 않음"


def test_notification_panel_has_mark_all_button(app_page):
    """알림 패널에 '모두 읽음' 버튼 존재"""
    bell = app_page.locator(".notification-bell")
    bell.click()
    app_page.wait_for_timeout(300)

    mark_all = app_page.locator("#notification-panel button:has-text('모두 읽음')")
    assert mark_all.count() >= 1, "'모두 읽음' 버튼 없음"

    # 닫기
    app_page.locator("body").click(position={"x": 10, "y": 10})
