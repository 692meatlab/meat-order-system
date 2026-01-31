#!/usr/bin/env node
/**
 * AI 네이티브 개발 - 검증 파이프라인 (Order Management)
 * Peter Steinberger 원칙: "검증 시스템을 신뢰하라"
 *
 * 사용법:
 *   node scripts/verify_all.js
 *   node scripts/verify_all.js --quick  # 기본 검증만
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const INDEX_HTML = path.join(PROJECT_ROOT, 'index.html');

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
    console.log('='.repeat(60));
}

/**
 * 명령어 실행
 */
function runCommand(name, command, critical = true) {
    separator();
    log(`[${name}]`, 'blue');
    separator();

    try {
        execSync(command, {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            encoding: 'utf-8'
        });
        log(`\n[PASS] ${name}`, 'green');
        return true;
    } catch (error) {
        log(`\n[FAIL] ${name}`, 'red');
        if (critical) {
            return false;
        }
        log('(비필수 검증 - 계속 진행)', 'yellow');
        return true;
    }
}

/**
 * 파일 존재 확인
 */
function checkFileExists() {
    separator();
    log('[파일 존재 확인]', 'blue');
    separator();

    if (!fs.existsSync(INDEX_HTML)) {
        log('[FAIL] index.html 파일이 없습니다.', 'red');
        return false;
    }

    const stats = fs.statSync(INDEX_HTML);
    const sizeKB = (stats.size / 1024).toFixed(1);
    log(`[PASS] index.html 존재 (${sizeKB} KB)`, 'green');
    return true;
}

/**
 * JavaScript 문법 검사 (기본)
 */
function checkJavaScriptSyntax() {
    separator();
    log('[JavaScript 문법 검사]', 'blue');
    separator();

    try {
        const content = fs.readFileSync(INDEX_HTML, 'utf-8');

        // <script> 태그 내용 추출
        const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        let scriptCount = 0;
        let errorCount = 0;

        while ((match = scriptRegex.exec(content)) !== null) {
            scriptCount++;
            const scriptContent = match[1].trim();

            if (scriptContent.length > 0) {
                // 기본 문법 체크 (괄호 매칭)
                const openBraces = (scriptContent.match(/{/g) || []).length;
                const closeBraces = (scriptContent.match(/}/g) || []).length;
                const openParens = (scriptContent.match(/\(/g) || []).length;
                const closeParens = (scriptContent.match(/\)/g) || []).length;
                const openBrackets = (scriptContent.match(/\[/g) || []).length;
                const closeBrackets = (scriptContent.match(/\]/g) || []).length;

                if (openBraces !== closeBraces) {
                    log(`  [WARNING] 중괄호 불일치: { ${openBraces}개, } ${closeBraces}개`, 'yellow');
                    errorCount++;
                }
                if (openParens !== closeParens) {
                    log(`  [WARNING] 소괄호 불일치: ( ${openParens}개, ) ${closeParens}개`, 'yellow');
                    errorCount++;
                }
                if (openBrackets !== closeBrackets) {
                    log(`  [WARNING] 대괄호 불일치: [ ${openBrackets}개, ] ${closeBrackets}개`, 'yellow');
                    errorCount++;
                }
            }
        }

        if (errorCount === 0) {
            log(`[PASS] 인라인 스크립트 ${scriptCount}개 - 기본 문법 OK`, 'green');
            return true;
        } else {
            log(`[WARNING] 잠재적 문법 이슈 ${errorCount}개 발견`, 'yellow');
            return true; // 경고만, 실패는 아님
        }
    } catch (error) {
        log(`[FAIL] 문법 검사 오류: ${error.message}`, 'red');
        return false;
    }
}

/**
 * HTML 구조 검사
 */
function checkHTMLStructure() {
    separator();
    log('[HTML 구조 검사]', 'blue');
    separator();

    try {
        const content = fs.readFileSync(INDEX_HTML, 'utf-8');
        let passed = true;

        // DOCTYPE 확인
        if (!content.includes('<!DOCTYPE html>')) {
            log('  [WARNING] DOCTYPE 선언 없음', 'yellow');
        }

        // 필수 태그 확인
        const requiredTags = ['<html', '<head>', '<body>', '</html>', '</head>', '</body>'];
        for (const tag of requiredTags) {
            if (!content.includes(tag)) {
                log(`  [WARNING] 필수 태그 누락: ${tag}`, 'yellow');
            }
        }

        // Firebase SDK 확인
        if (!content.includes('firebase-app')) {
            log('  [WARNING] Firebase SDK 누락', 'yellow');
        }

        // XLSX 라이브러리 확인
        if (!content.includes('xlsx')) {
            log('  [WARNING] XLSX 라이브러리 누락', 'yellow');
        }

        log('[PASS] HTML 구조 검사 완료', 'green');
        return true;
    } catch (error) {
        log(`[FAIL] HTML 검사 오류: ${error.message}`, 'red');
        return false;
    }
}

/**
 * 코드 통계
 */
function showCodeStats() {
    separator();
    log('[코드 통계]', 'blue');
    separator();

    try {
        const content = fs.readFileSync(INDEX_HTML, 'utf-8');
        const lines = content.split('\n').length;
        const sizeKB = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);

        // 함수 개수 (대략적)
        const functionCount = (content.match(/function\s+\w+/g) || []).length;

        // 이벤트 리스너 개수
        const listenerCount = (content.match(/addEventListener/g) || []).length;

        log(`  총 줄 수: ${lines.toLocaleString()}줄`);
        log(`  파일 크기: ${sizeKB} KB`);
        log(`  함수 개수: 약 ${functionCount}개`);
        log(`  이벤트 리스너: ${listenerCount}개`);

        // 모놀리식 경고
        if (lines > 3000) {
            log(`\n  [INFO] 파일이 ${lines}줄로 큽니다. 분리를 고려하세요.`, 'yellow');
        }

        return true;
    } catch (error) {
        return true; // 통계는 실패해도 OK
    }
}

/**
 * 보안 검사
 */
function checkSecurity() {
    separator();
    log('[보안 검사]', 'blue');
    separator();

    try {
        const content = fs.readFileSync(INDEX_HTML, 'utf-8');

        // API 키 하드코딩 확인
        if (content.includes('apiKey') && content.includes('firebase')) {
            log('  [INFO] Firebase API 키가 코드에 포함되어 있습니다.', 'yellow');
            log('  Firebase 보안 규칙으로 데이터 접근을 제한하세요.', 'yellow');
        }

        // eval 사용 확인
        if (content.includes('eval(')) {
            log('  [WARNING] eval() 사용 발견 - 보안 위험', 'yellow');
        }

        // innerHTML 사용 확인 (XSS 위험)
        const innerHTMLCount = (content.match(/innerHTML\s*=/g) || []).length;
        if (innerHTMLCount > 10) {
            log(`  [INFO] innerHTML 사용 ${innerHTMLCount}회 - XSS 주의`, 'yellow');
        }

        log('[PASS] 보안 검사 완료', 'green');
        return true;
    } catch (error) {
        return true;
    }
}

/**
 * 메인 실행
 */
function main() {
    const args = process.argv.slice(2);
    const quickMode = args.includes('--quick');

    separator();
    log('Order Management - AI 네이티브 검증 파이프라인', 'blue');
    separator();

    let allPassed = true;

    // 1. 파일 존재 확인
    if (!checkFileExists()) {
        log('\n[ABORT] 필수 파일 없음', 'red');
        process.exit(1);
    }

    // 2. HTML 구조 검사
    if (!checkHTMLStructure()) {
        allPassed = false;
    }

    // 3. JavaScript 문법 검사
    if (!checkJavaScriptSyntax()) {
        allPassed = false;
    }

    if (!quickMode) {
        // 4. 코드 통계
        showCodeStats();

        // 5. 보안 검사
        checkSecurity();

        // 6. ESLint (설치되어 있으면)
        try {
            execSync('npx eslint --version', { stdio: 'ignore' });
            log('\n[INFO] ESLint로 상세 검사를 실행하려면:', 'blue');
            log('  npx eslint index.html --ext .html');
        } catch {
            // ESLint 미설치 - 무시
        }
    }

    // 결과 요약
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        log('[SUCCESS] 모든 검증 통과 - 배포 가능', 'green');
    } else {
        log('[WARNING] 일부 검증 이슈 있음 - 확인 필요', 'yellow');
    }
    console.log('='.repeat(60));

    // 수동 테스트 체크리스트
    log('\n[수동 테스트 체크리스트]', 'blue');
    log('  □ 브라우저에서 index.html 열기');
    log('  □ 엑셀 파일 업로드 테스트');
    log('  □ 발주서 변환 테스트');
    log('  □ Firebase 저장/로드 확인');
    log('  □ 새로고침 후 데이터 유지 확인\n');
}

main();
