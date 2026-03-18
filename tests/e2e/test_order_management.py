"""E2E 테스트: 전체주문관리 기능

전체주문관리는 사용자별 페이지(showUserPage)이므로 사용자 선택이 필요하다.
사용자가 없는 환경에서는 검색바/필터가 order-management 섹션 내에 존재하는지만 확인.
"""


def test_search_bar_exists_in_dom(app_page):
    """검색바가 DOM에 존재 (Stage 1)"""
    search = app_page.locator("#order-search")
    assert search.count() >= 1, "검색바 없음"


def test_filter_chips_exist_in_dom(app_page):
    """필터 칩이 DOM에 존재 (Stage 1)"""
    chips = app_page.locator(".filter-chip")
    assert chips.count() >= 1, "필터 칩 없음"


def test_filter_chip_toggle(app_page):
    """필터 칩 클릭 시 active 토글 (Stage 1) - JS evaluate로 테스트"""
    # 필터 칩은 order-management 페이지 안에 있어서 기본적으로 숨겨져 있음
    # JS로 직접 toggleFilterChip 함수를 호출하여 테스트
    result = app_page.evaluate("""() => {
        const chip = document.querySelector('.filter-chip');
        if (!chip) return 'no_chip';
        const wasBefore = chip.classList.contains('active');
        chip.click();
        const isAfter = chip.classList.contains('active');
        // 원복
        chip.click();
        return wasBefore !== isAfter ? 'toggled' : 'not_toggled';
    }""")
    assert result in ('toggled', 'no_chip'), f"필터 칩 토글 실패: {result}"


def test_vendor_filter_dropdown_in_dom(app_page):
    """거래처 필터 드롭다운이 DOM에 존재 (Stage 1)"""
    vendor_filter = app_page.locator("#order-vendor-filter")
    assert vendor_filter.count() >= 1, "거래처 필터 드롭다운 없음"


def test_order_table_in_dom(app_page):
    """주문 테이블 영역이 DOM에 존재"""
    table = app_page.locator("#order-table")
    assert table.count() >= 1, "주문 테이블 영역 없음"
