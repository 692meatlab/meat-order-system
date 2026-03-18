"""E2E 테스트: 백업/복원 페이지 (Stage 10)"""


def test_backup_page_elements(app_page):
    """백업/복원 페이지의 핵심 요소들"""
    app_page.locator(".menu-item:has-text('백업/복원')").click()
    app_page.wait_for_timeout(500)

    # 내보내기 버튼 (실제 텍스트: "내보내기 (JSON)")
    export_btn = app_page.locator("button:has-text('내보내기')")
    assert export_btn.count() >= 1, "내보내기 버튼 없음"

    # 파일 업로드 input
    file_input = app_page.locator("#backup-file-input")
    assert file_input.count() >= 1, "백업 파일 input 없음"

    # 가져오기 버튼
    import_btn = app_page.locator("button:has-text('가져오기')")
    assert import_btn.count() >= 1, "가져오기 버튼 없음"


def test_backup_log_table(app_page):
    """백업 이력 테이블 영역 존재"""
    app_page.locator(".menu-item:has-text('백업/복원')").click()
    app_page.wait_for_timeout(800)

    log_table = app_page.locator("#backup-log-table")
    assert log_table.count() >= 1, "백업 이력 테이블 영역 없음"
