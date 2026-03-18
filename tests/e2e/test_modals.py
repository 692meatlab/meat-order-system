"""E2E 테스트: 모달 동작"""


def test_cost_history_modal_hidden(app_page):
    """원가 이력 모달이 기본 숨김 (Stage 3)"""
    modal = app_page.locator("#cost-history-modal")
    assert modal.count() >= 1, "원가 이력 모달 없음"
    assert not modal.is_visible()


def test_order_detail_modal_hidden(app_page):
    """주문 상세 모달이 기본 숨김 (Stage 5)"""
    modal = app_page.locator("#order-detail-modal")
    assert modal.count() >= 1, "주문 상세 모달 없음"
    assert not modal.is_visible()


def test_order_detail_modal_tabs(app_page):
    """주문 상세 모달에 탭이 존재"""
    tabs = app_page.locator("#order-detail-modal .tab-btn")
    assert tabs.count() >= 2, "주문 상세 모달에 탭 2개 이상 필요"


def test_inventory_modal_hidden(app_page):
    """재고 조정 모달이 기본 숨김 (Stage 7)"""
    modal = app_page.locator("#inventory-modal")
    assert modal.count() >= 1, "재고 조정 모달 없음"
    assert not modal.is_visible()


def test_cost_management_has_history_buttons(app_page):
    """원가관리 페이지에 이력 버튼이 렌더링 (Stage 3)"""
    app_page.locator(".menu-item:has-text('원가관리')").click()
    app_page.wait_for_timeout(800)

    # 부위 테이블에 데이터가 있으면 이력 버튼 존재
    parts_table = app_page.locator("#parts-table table")
    if parts_table.count() > 0:
        history_btns = app_page.locator("#parts-table button:has-text('이력')")
        assert history_btns.count() > 0, "부위 테이블에 이력 버튼 없음"
