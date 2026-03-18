"""E2E 테스트: AI-Native 모달 (A-2, A-3, A-5)

AI-Native 관련 모달이 DOM에 존재하고 기본 숨김 상태인지 확인.
"""


def test_profitability_detail_modal_hidden(app_page):
    """수익성 상세 모달이 기본 숨김 (A-3)"""
    modal = app_page.locator("#profitability-detail-modal")
    assert modal.count() >= 1, "수익성 상세 모달 없음"
    assert not modal.is_visible()


def test_cost_anomaly_modal_hidden(app_page):
    """원가 이상 모달이 기본 숨김 (A-2)"""
    modal = app_page.locator("#cost-anomaly-modal")
    assert modal.count() >= 1, "원가 이상 모달 없음"
    assert not modal.is_visible()


def test_duplicate_modal_hidden(app_page):
    """중복 감지 모달이 기본 숨김 (A-5)"""
    modal = app_page.locator("#duplicate-modal")
    assert modal.count() >= 1, "중복 감지 모달 없음"
    assert not modal.is_visible()
