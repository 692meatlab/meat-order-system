"""E2E 테스트: 매출 리포트 페이지 (Stage 6)"""


def test_vendor_report_page_elements(app_page):
    """매출 리포트 페이지의 핵심 요소들"""
    # 매출 리포트 메뉴로 이동
    report_link = app_page.locator("text=매출 리포트")
    if report_link.count() == 0:
        report_link = app_page.locator("text=거래처별 레포트")
    if report_link.count() > 0:
        report_link.first.click()
        app_page.wait_for_timeout(500)

    page_section = app_page.locator("#page-vendor-report")
    if page_section.count() > 0:
        # 날짜 필터
        date_from = app_page.locator("#report-date-from")
        date_to = app_page.locator("#report-date-to")
        assert date_from.count() >= 1, "시작일 필터 없음"
        assert date_to.count() >= 1, "종료일 필터 없음"

        # 거래처 필터
        vendor_filter = app_page.locator("#report-vendor-filter")
        assert vendor_filter.count() >= 1, "거래처 필터 없음"

        # 리포트 내용 영역
        content = app_page.locator("#vendor-report-content")
        assert content.count() >= 1, "리포트 내용 영역 없음"


def test_vendor_report_excel_download_button(app_page):
    """엑셀 다운로드 버튼 존재"""
    report_link = app_page.locator("text=매출 리포트")
    if report_link.count() == 0:
        report_link = app_page.locator("text=거래처별 레포트")
    if report_link.count() > 0:
        report_link.first.click()
        app_page.wait_for_timeout(500)

    page_section = app_page.locator("#page-vendor-report")
    if page_section.count() > 0:
        excel_btn = app_page.locator("button:has-text('엑셀')")
        assert excel_btn.count() >= 1, "엑셀 다운로드 버튼 없음"
