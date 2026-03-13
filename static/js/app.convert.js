// ==================== app.convert.js ====================
// 발주서 변환 워크플로우: 파일 업로드, 변환, 헤더 감지, 컬럼 매핑, SKU 매칭

        // ==================== 파일 업로드 ====================
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        if (uploadArea) {
            uploadArea.onclick = () => fileInput.click();
            uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); };
            uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
            uploadArea.ondrop = (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
            };
        }

        if (fileInput) {
            fileInput.onchange = () => handleFiles(fileInput.files);
        }

        function handleFiles(files) {
            if (files.length === 0) return;
            workbooks = [];
            const names = [];
            let loadedCount = 0;

            Array.from(files).forEach(file => {
                names.push(file.name);
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const wb = XLSX.read(e.target.result, { type: 'array' });
                        workbooks.push({ workbook: wb, fileName: file.name });
                    } catch (err) {
                        console.error('파일 읽기 오류:', file.name, err);
                    }
                    loadedCount++;
                    if (loadedCount === files.length) {
                        document.getElementById('file-info').textContent = `선택됨: ${names.join(', ')}`;
                        document.getElementById('file-info').classList.add('show');
                        document.getElementById('btn-convert').disabled = false;
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        // ==================== 변환 실행 ====================
        function convertOrders() {
            if (workbooks.length === 0) {
                showToast('먼저 파일을 업로드해주세요.', 'error');
                return;
            }

            const selectedVendor = document.getElementById('vendor-name').value.trim();
            if (!selectedVendor) {
                showToast('발주처를 선택해주세요.', 'error');
                return;
            }

            showLoading();

            try {
                convertedData = [];

                for (const { workbook, fileName } of workbooks) {
                    for (const sheetName of workbook.SheetNames) {
                        const sheet = workbook.Sheets[sheetName];
                        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                        const headerInfo = findHeaderRow(rawData);
                        if (!headerInfo) continue;

                        const { headerRowIdx, columns } = headerInfo;
                        const mapping = autoMapColumns(columns);

                        const dataRows = rawData.slice(headerRowIdx + 1).filter(row =>
                            row && row.some(cell => cell !== undefined && cell !== null && cell !== '')
                        );

                        for (const row of dataRows) {
                            const item = convertRow(row, mapping, selectedVendor, fileName);
                            if (item) {
                                const matchedSku = findMatchingSku(item.vendor, item.productCode);
                                if (matchedSku) {
                                    item.skuName = matchedSku.sku_name || matchedSku.skuName;
                                    item._skuMatched = true;
                                    item._skuProductId = matchedSku.id || matchedSku.sku_product_id;
                                } else {
                                    item.skuName = item.productName;
                                    item._skuMatched = false;
                                }
                                convertedData.push(item);
                            }
                        }
                    }
                }

                if (convertedData.length === 0) {
                    showToast('변환할 데이터를 찾지 못했습니다. 엑셀 파일 형식을 확인해주세요.', 'error');
                    hideLoading();
                    return;
                }

                renderConvertResult();
                showToast(`${workbooks.length}개 파일에서 ${convertedData.length}건의 데이터를 변환했습니다.`, 'success');

                // 파일 입력 초기화
                workbooks = [];
                fileInput.value = '';
                document.getElementById('file-info').textContent = '';
                document.getElementById('file-info').classList.remove('show');
                document.getElementById('btn-convert').disabled = true;
            } catch (err) {
                showToast('변환 중 오류: ' + err.message, 'error');
                console.error(err);
            }

            hideLoading();
        }

        // ==================== 헤더/컬럼 감지 ====================
        function findHeaderRow(data) {
            const keywords = [
                '수령인', '수취인', '받는분', '받는사람', '수령자', '성명', '이름', '고객명',
                '연락처', '휴대폰', '핸드폰', '전화', '폰번호', 'hp', 'tel', '전화번호',
                '주소', '배송지', '배송주소', '도로명',
                '상품', '품명', '품목', '물품', '제품', '아이템', 'product',
                '주문', '오더', 'order', '번호',
                '수량', '개수', 'qty', 'quantity',
                '발송인', '보내는', '송하인',
                '배송', '택배', '송장', '운송장', '메모', '요청', '비고'
            ];

            for (let i = 0; i < Math.min(20, data.length); i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;

                let matchCount = 0;
                const columns = [];

                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    if (cell !== undefined && cell !== null && cell !== '') {
                        const cellStr = String(cell).replace(/[\s\n*]/g, '').toLowerCase();
                        columns.push({ index: j, name: String(cell).trim(), normalized: cellStr });

                        for (const keyword of keywords) {
                            if (cellStr.includes(keyword.toLowerCase())) {
                                matchCount++;
                                break;
                            }
                        }
                    }
                }

                if (matchCount >= 2) {
                    return { headerRowIdx: i, columns };
                }
            }
            return null;
        }

        function isExcluded(colName, targetKey) {
            const excludes = MAPPING_EXCLUDES[targetKey];
            if (!excludes) return false;
            for (const exclude of excludes) {
                if (colName.includes(exclude.toLowerCase())) return true;
            }
            return false;
        }

        function autoMapColumns(columns) {
            const mapping = {};
            const usedColumns = new Set();

            // Pass 1: 정확한 매칭
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized === keywordLower && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // Pass 2: startsWith 매칭
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                if (mapping[targetKey] !== undefined) continue;
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized.startsWith(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // Pass 3: includes 매칭 (3글자 이상 키워드만)
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                if (mapping[targetKey] !== undefined) continue;
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    if (keywordLower.length <= 2) continue;
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized.includes(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // 주소 컬럼 특별 처리
            const addressColumns = columns.filter(col =>
                !usedColumns.has(col.index) &&
                (col.normalized.includes('주소') || col.normalized.includes('address')) &&
                !isExcluded(col.normalized, 'receiverAddr')
            );

            if (mapping['receiverAddr'] === undefined && addressColumns.length === 1) {
                mapping['receiverAddr'] = addressColumns[0].index;
                usedColumns.add(addressColumns[0].index);
            } else if (mapping['receiverAddr'] === undefined && addressColumns.length > 1) {
                const mainAddr = addressColumns.find(col => !col.normalized.includes('상세'));
                if (mainAddr) {
                    mapping['receiverAddr'] = mainAddr.index;
                    usedColumns.add(mainAddr.index);
                }
            }

            // 상세주소 컬럼
            if (mapping['receiverAddrDetail'] === undefined) {
                for (const col of columns) {
                    if (usedColumns.has(col.index)) continue;
                    if (col.normalized.includes('상세주소') || col.normalized.includes('상세') ||
                        col.normalized === '주소2' || col.normalized === 'address2') {
                        mapping['receiverAddrDetail'] = col.index;
                        usedColumns.add(col.index);
                        break;
                    }
                }
            }

            // 수령인 옆 연락처 추론
            if (mapping['receiverName'] !== undefined && mapping['receiverPhone'] === undefined) {
                const receiverIdx = mapping['receiverName'];
                for (const col of columns) {
                    if (col.index === receiverIdx + 1 && !usedColumns.has(col.index)) {
                        const name = col.normalized;
                        if (name.includes('휴대') || name.includes('전화') || name.includes('연락') || name.includes('폰')) {
                            mapping['receiverPhone'] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                }
            }

            // 상품명 폴백
            if (mapping['productName'] === undefined) {
                const giftSetPatterns = ['세트', '호', '선물', '패키지', '구성', '모듬', '종합', '특선', '명품', '프리미엄'];
                for (const col of columns) {
                    if (usedColumns.has(col.index)) continue;
                    for (const pattern of giftSetPatterns) {
                        if (col.name.includes(pattern)) {
                            mapping['productName'] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping['productName'] !== undefined) break;
                }
            }

            return mapping;
        }

        // ==================== 행 변환 ====================
        function convertRow(row, mapping, vendorValue, fileName) {
            const item = { _selected: true, _id: generateId() };

            for (const target of RESULT_COLUMNS) {
                if (mapping[target.key] !== undefined) {
                    let value = row[mapping[target.key]];
                    if (value !== undefined && value !== null) {
                        value = String(value).trim();
                        if (target.key.includes('Phone')) value = formatPhone(value);
                        if (target.key === 'releaseDate') value = formatDateValue(value);
                    }
                    item[target.key] = value || '';
                } else {
                    item[target.key] = '';
                }
            }

            // 상세주소 병합
            if (mapping['receiverAddrDetail'] !== undefined) {
                let detail = row[mapping['receiverAddrDetail']];
                if (detail !== undefined && detail !== null) {
                    detail = String(detail).trim();
                    if (detail && item.receiverAddr) {
                        item.receiverAddr = item.receiverAddr + ' ' + detail;
                    } else if (detail && !item.receiverAddr) {
                        item.receiverAddr = detail;
                    }
                }
            }

            // 주문자 → 발송인 폴백
            if (!item.senderName && mapping['ordererName'] !== undefined) {
                let orderer = row[mapping['ordererName']];
                if (orderer !== undefined && orderer !== null) {
                    item.senderName = String(orderer).trim();
                }
            }

            if (!item.vendor) item.vendor = vendorValue;
            item.sourceFile = fileName;

            if (item.receiverName || item.productName || item.receiverAddr) {
                return item;
            }
            return null;
        }

        function findMatchingSku(vendor, productCode) {
            if (!vendor || !productCode) return null;
            const productCodeClean = String(productCode).trim();
            // Flask vendorMappings: flat array [{ vendor_name, product_code, product_name, sku_product_id, sku_name }]
            const mapping = vendorMappings.find(m =>
                m.vendor_name === vendor && String(m.product_code || '').trim() === productCodeClean
            );
            if (mapping && mapping.sku_product_id) {
                const sku = skuProducts.find(p => p.id === mapping.sku_product_id);
                return sku || { id: mapping.sku_product_id, sku_name: mapping.sku_name };
            }
            return null;
        }

        // ==================== 변환결과 렌더링 ====================
        function renderConvertResult() {
            const resultCard = document.getElementById('convert-result');
            if (!resultCard) return;

            if (convertedData.length === 0) {
                resultCard.style.display = 'none';
                return;
            }

            resultCard.style.display = 'block';

            const matchedCount = convertedData.filter(item => item._skuMatched).length;
            const unmatchedCount = convertedData.length - matchedCount;
            const selectedCount = convertedData.filter(item => item._selected).length;

            document.getElementById('convert-result-summary').innerHTML =
                `전체 ${convertedData.length}건 | 선택 ${selectedCount}건 | ` +
                `<span style="color: #27ae60;">매칭 ${matchedCount}</span> | ` +
                `<span style="color: ${unmatchedCount > 0 ? '#e74c3c' : '#666'};">미매칭 ${unmatchedCount}</span>`;

            const tableContainer = document.getElementById('convert-result-table');
            tableContainer.innerHTML = buildConvertTable(convertedData, RESULT_COLUMNS, 'result');
        }

        function buildConvertTable(data, columns, tableType) {
            let html = '<table><thead><tr>';
            html += '<th><input type="checkbox" onchange="toggleAllRows(\'' + tableType + '\', this.checked)" checked></th>';
            html += '<th>#</th>';
            columns.forEach(c => { html += `<th>${escapeHtml(c.name)}</th>`; });
            html += '</tr></thead><tbody>';

            data.forEach((item, idx) => {
                html += '<tr>';
                html += `<td><input type="checkbox" ${item._selected ? 'checked' : ''} onchange="handleRowToggle('${tableType}', ${idx})"></td>`;
                html += `<td>${idx + 1}</td>`;

                columns.forEach(col => {
                    const value = escapeHtml(item[col.key] || '');
                    if (col.key === 'skuName') {
                        if (!item._skuMatched) {
                            html += `<td style="min-width:150px;"><span style="background:#fff3cd;color:#856404;padding:2px 6px;border-radius:4px;font-size:11px;">미매칭</span>`;
                            html += `<div style="font-size:11px;color:#666;margin-top:2px;">${escapeHtml(item.productName || '')}</div></td>`;
                        } else {
                            html += `<td style="min-width:150px;"><span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:4px;font-size:11px;">매칭</span> ${value}`;
                            html += `<div style="font-size:11px;color:#888;margin-top:2px;">${escapeHtml(item.productName || '')}</div></td>`;
                        }
                    } else if (col.key === 'vendor') {
                        html += `<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">${value || '-'}</span></td>`;
                    } else {
                        html += `<td><input type="text" value="${value}" style="min-width:${col.width};border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleCellChange('${tableType}', ${idx}, '${col.key}', this.value)"></td>`;
                    }
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        // ==================== 행 토글/셀 변경 ====================
        function toggleAllRows(tableType, checked) {
            const data = tableType === 'result' ? convertedData : confirmedData;
            data.forEach(item => { item._selected = checked; });
            if (tableType === 'result') renderConvertResult();
            else renderConfirmed();
        }

        function handleRowToggle(tableType, idx) {
            if (tableType === 'result') {
                convertedData[idx]._selected = !convertedData[idx]._selected;
                renderConvertResult();
            } else if (tableType === 'confirmed') {
                confirmedData[idx]._selected = !confirmedData[idx]._selected;
                renderConfirmed();
            }
        }

        function handleCellChange(tableType, idx, key, value) {
            if (tableType === 'result') {
                convertedData[idx][key] = value;
            } else if (tableType === 'confirmed') {
                confirmedData[idx][key] = value;
            }
        }

        // ==================== 변환확정 ====================
        function confirmConvertedData() {
            const selectedItems = convertedData.filter(item => item._selected);
            if (selectedItems.length === 0) {
                showToast('변환확정할 항목을 선택해주세요.', 'error');
                return;
            }

            const requiredFields = [
                { key: 'productName', name: '상품명' },
                { key: 'quantity', name: '수량' },
                { key: 'receiverName', name: '수령인' },
                { key: 'receiverPhone', name: '수령인연락처' },
                { key: 'receiverAddr', name: '수령인주소' }
            ];

            const missingItems = [];
            selectedItems.forEach((item, idx) => {
                const missingFields = [];
                requiredFields.forEach(field => {
                    const value = item[field.key];
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        missingFields.push(field.name);
                    }
                });
                if (missingFields.length > 0) {
                    missingItems.push({ index: idx + 1, fields: missingFields });
                }
            });

            if (missingItems.length > 0) {
                const errorMsg = missingItems.slice(0, 5).map(item =>
                    `${item.index}번째 항목: ${item.fields.join(', ')} 누락`
                ).join('\n');
                const moreMsg = missingItems.length > 5 ? `\n...외 ${missingItems.length - 5}건` : '';
                alert(`필수값이 누락된 항목이 있습니다.\n\n${errorMsg}${moreMsg}\n\n상품명, 수량, 수령인, 수령인연락처, 수령인주소는 필수입니다.`);
                return;
            }

            const today = new Date();
            const convertedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            selectedItems.forEach(item => {
                const newItem = { ...item, _selected: true, _id: generateId(), convertedDate };
                if (!newItem.productCode && newItem.productName) {
                    newItem.productCode = newItem.productName;
                }
                const matchedSku = findMatchingSku(newItem.vendor, newItem.productCode);
                if (matchedSku) {
                    newItem.skuName = matchedSku.sku_name || matchedSku.skuName;
                    newItem._skuMatched = true;
                    newItem._skuProductId = matchedSku.id || matchedSku.sku_product_id;
                } else {
                    newItem.skuName = newItem.productName;
                    newItem._skuMatched = false;
                }
                confirmedData.push(newItem);
            });

            convertedData = convertedData.filter(item => !item._selected);
            renderConvertResult();
            showToast(`${selectedItems.length}건이 변환확정 목록에 추가되었습니다.`, 'success');

            setTimeout(() => {
                showUserPage('confirmed', currentUser, currentUserId);
            }, 500);
        }
