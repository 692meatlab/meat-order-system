"""E2E 테스트: AI-Native API 통합 테스트 (A-1~A-7)

브라우저에서 직접 AI-Native API를 호출하여 라우트 등록 및 응답 형식을 확인.
200 (정상) 또는 503 (DB 미연결) 모두 유효한 응답으로 처리.
"""
import json


def _assert_api_reachable(response, expected_keys=None):
    """API가 접근 가능한지 확인 (200 또는 503)"""
    assert response.status in (200, 503), f"예상외 상태 코드: {response.status}"
    if response.status == 200 and expected_keys:
        data = response.json()
        for key in expected_keys:
            assert key in data, f"응답에 '{key}' 없음"


# ============================================================
# A-1: 퍼지 SKU 매칭
# ============================================================
def test_api_fuzzy_match(app_page, live_server):
    """퍼지 매칭 API (A-1)"""
    r = app_page.request.post(
        f"{live_server}/api/fuzzy-match",
        data=json.dumps({"items": ["한우등심세트 1kg"]}),
        headers={"Content-Type": "application/json"}
    )
    _assert_api_reachable(r, ["results"])


def test_api_fuzzy_match_empty(app_page, live_server):
    """퍼지 매칭 빈 요청 (A-1)"""
    r = app_page.request.post(
        f"{live_server}/api/fuzzy-match",
        data=json.dumps({"items": []}),
        headers={"Content-Type": "application/json"}
    )
    _assert_api_reachable(r, ["results"])


def test_api_matching_aliases(app_page, live_server):
    """별칭 목록 API (A-1)"""
    r = app_page.request.get(f"{live_server}/api/matching-aliases")
    _assert_api_reachable(r, ["aliases"])


# ============================================================
# A-2: 원가 이상 감지
# ============================================================
def test_api_cost_anomalies(app_page, live_server):
    """원가 이상 감지 목록 API (A-2)"""
    r = app_page.request.get(f"{live_server}/api/cost-anomalies")
    _assert_api_reachable(r, ["anomalies"])


# ============================================================
# A-3: 수익성 분석
# ============================================================
def test_api_profitability_list(app_page, live_server):
    """수익성 분석 목록 API (A-3)"""
    r = app_page.request.get(f"{live_server}/api/profitability")
    _assert_api_reachable(r, ["items"])


def test_api_profitability_trends(app_page, live_server):
    """수익성 추이 API (A-3)"""
    r = app_page.request.get(f"{live_server}/api/profitability/trends?months=3")
    _assert_api_reachable(r, ["trends"])


# ============================================================
# A-4: 거래처 성과
# ============================================================
def test_api_vendor_performance(app_page, live_server):
    """거래처 성과 API (A-4)"""
    r = app_page.request.get(f"{live_server}/api/vendor-performance?period=30")
    _assert_api_reachable(r, ["vendors"])


# ============================================================
# A-5: 스마트 중복 감지
# ============================================================
def test_api_check_duplicates(app_page, live_server):
    """중복 감지 API (A-5)"""
    r = app_page.request.post(
        f"{live_server}/api/orders/check-duplicates",
        data=json.dumps({
            "orders": [{"recipient": "테스트", "sku_name": "한우등심세트"}]
        }),
        headers={"Content-Type": "application/json"}
    )
    _assert_api_reachable(r, ["duplicates"])


# ============================================================
# A-6: 수요 예측
# ============================================================
def test_api_forecast(app_page, live_server):
    """수요 예측 API (A-6)"""
    r = app_page.request.get(f"{live_server}/api/forecast?days=7")
    _assert_api_reachable(r, ["forecasts"])


def test_api_forecast_parts(app_page, live_server):
    """부위별 소요량 예측 API (A-6)"""
    r = app_page.request.get(f"{live_server}/api/forecast/parts?days=7")
    _assert_api_reachable(r, ["parts"])


def test_api_forecast_accuracy(app_page, live_server):
    """예측 정확도 API (A-6)"""
    r = app_page.request.get(f"{live_server}/api/forecast/accuracy")
    _assert_api_reachable(r, ["accuracy"])


# ============================================================
# A-7: 스마트 발주
# ============================================================
def test_api_smart_order_recommendations(app_page, live_server):
    """발주 추천 API (A-7)"""
    r = app_page.request.get(f"{live_server}/api/smart-order/recommendations?days=7")
    _assert_api_reachable(r, ["recommendations"])


def test_api_smart_order_generate(app_page, live_server):
    """발주서 생성 API - 빈 요청 400 (A-7)"""
    r = app_page.request.post(
        f"{live_server}/api/smart-order/generate",
        data=json.dumps({"items": []}),
        headers={"Content-Type": "application/json"}
    )
    assert r.status in (400, 503), f"빈 발주 요청은 400 또는 503 예상, 실제: {r.status}"
