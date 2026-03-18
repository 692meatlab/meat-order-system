"""Playwright E2E 테스트 공통 fixture

Flask 앱을 별도 스레드에서 기동하고, Playwright 브라우저로 접속하여 실제 UI 테스트를 수행한다.
실제 Railway PostgreSQL DB에 연결하므로 테스트 데이터에 주의해야 한다.
"""
import threading
import time
import pytest
from app import app as flask_app


@pytest.fixture(scope="session")
def live_server():
    """Flask 앱을 백그라운드 스레드에서 실행"""
    flask_app.config["TESTING"] = True
    port = 5099
    server = threading.Thread(
        target=lambda: flask_app.run(host="127.0.0.1", port=port, use_reloader=False),
        daemon=True,
    )
    server.start()
    # 서버가 뜰 때까지 대기
    import urllib.request
    for _ in range(30):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health")
            break
        except Exception:
            time.sleep(0.3)
    yield f"http://127.0.0.1:{port}"


@pytest.fixture(scope="session")
def browser_context_args():
    """Playwright 브라우저 컨텍스트 설정"""
    return {
        "viewport": {"width": 1280, "height": 800},
        "locale": "ko-KR",
    }


@pytest.fixture()
def app_page(page, live_server):
    """메인 페이지로 이동한 page fixture"""
    page.goto(live_server)
    # initializeApp이 완료될 때까지 대기
    page.wait_for_load_state("networkidle")
    # 사이드바가 로드될 때까지
    page.wait_for_selector(".sidebar", timeout=10000)
    return page
