"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// ==================== 전역 변수 ====================
var currentUser = null;
var userList = [];
var allUsersData = {};
var skuProducts = [];
var partsData = {};
var packagingData = {};
var vendorMappings = [];
var calendarData = {};
var currentYear = new Date().getFullYear();
var currentMonth = new Date().getMonth();
var selectedDate = null;
var editingSkuId = null;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});
function initializeApp() {
  return _initializeApp.apply(this, arguments);
} // ==================== API 호출 ====================
function _initializeApp() {
  _initializeApp = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var response, data, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return fetch('/api/init');
        case 1:
          response = _context.v;
          _context.n = 2;
          return response.json();
        case 2:
          data = _context.v;
          if (!(!data || data.error)) {
            _context.n = 3;
            break;
          }
          updateConnectionStatus(false);
          return _context.a(2);
        case 3:
          updateConnectionStatus(true);

          // 데이터 저장
          userList = data.users || [];
          if (userList.length > 0 && !currentUser) {
            currentUser = userList[0].name;
          }
          partsData = {};
          (data.parts || []).forEach(function (p) {
            partsData[p.part_name] = {
              price: p.price_per_100g,
              type: p.cost_type
            };
          });
          packagingData = {};
          (data.packaging || []).forEach(function (p) {
            packagingData[p.packaging_name] = p.price;
          });
          skuProducts = data.sku_products || [];
          vendorMappings = data.vendor_mappings || [];
          calendarData = data.calendar || {};
          currentYear = data.year || new Date().getFullYear();
          currentMonth = (data.month || new Date().getMonth() + 1) - 1;

          // UI 렌더링
          renderUserMenus();
          renderCalendarWithData(calendarData);
          renderPartsTable();
          renderPackagingTable();
          renderSkuTable();
          renderVendorMappingTable();
          updateVendorSelect();
          updateVendorFilterSelect();
          updateIntegratedUserFilter();
          updatePackagingSelect();
          updateSkuSelect();
          _context.n = 5;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          console.error('Initialize error:', _t);
          updateConnectionStatus(false);
        case 5:
          return _context.a(2);
      }
    }, _callee, null, [[0, 4]]);
  }));
  return _initializeApp.apply(this, arguments);
}
function loadUsers() {
  return _loadUsers.apply(this, arguments);
}
function _loadUsers() {
  _loadUsers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var res, data;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.n = 1;
          return fetch('/api/users');
        case 1:
          res = _context2.v;
          _context2.n = 2;
          return res.json();
        case 2:
          data = _context2.v;
          userList = data.users || [];
          if (userList.length > 0 && !currentUser) {
            currentUser = userList[0].name;
          }
          updateIntegratedUserFilter();
        case 3:
          return _context2.a(2);
      }
    }, _callee2);
  }));
  return _loadUsers.apply(this, arguments);
}
function loadPartsData() {
  return _loadPartsData.apply(this, arguments);
}
function _loadPartsData() {
  _loadPartsData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var res, data;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return fetch('/api/parts-cost');
        case 1:
          res = _context3.v;
          _context3.n = 2;
          return res.json();
        case 2:
          data = _context3.v;
          partsData = {};
          (data.parts || []).forEach(function (p) {
            partsData[p.part_name] = {
              price: p.price_per_100g,
              type: p.cost_type
            };
          });
          renderPartsTable();
        case 3:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return _loadPartsData.apply(this, arguments);
}
function loadPackagingData() {
  return _loadPackagingData.apply(this, arguments);
}
function _loadPackagingData() {
  _loadPackagingData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var res, data;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return fetch('/api/packaging-cost');
        case 1:
          res = _context4.v;
          _context4.n = 2;
          return res.json();
        case 2:
          data = _context4.v;
          packagingData = {};
          (data.packaging || []).forEach(function (p) {
            packagingData[p.packaging_name] = p.price;
          });
          renderPackagingTable();
          updatePackagingSelect();
        case 3:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return _loadPackagingData.apply(this, arguments);
}
function loadSkuProducts() {
  return _loadSkuProducts.apply(this, arguments);
}
function _loadSkuProducts() {
  _loadSkuProducts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var res, data;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _context5.n = 1;
          return fetch('/api/sku-products');
        case 1:
          res = _context5.v;
          _context5.n = 2;
          return res.json();
        case 2:
          data = _context5.v;
          skuProducts = data.products || [];
          renderSkuTable();
          updateSkuSelect();
        case 3:
          return _context5.a(2);
      }
    }, _callee5);
  }));
  return _loadSkuProducts.apply(this, arguments);
}
function loadVendorMappingsAll() {
  return _loadVendorMappingsAll.apply(this, arguments);
}
function _loadVendorMappingsAll() {
  _loadVendorMappingsAll = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var res, data;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          _context6.n = 1;
          return fetch('/api/vendor-mappings');
        case 1:
          res = _context6.v;
          _context6.n = 2;
          return res.json();
        case 2:
          data = _context6.v;
          vendorMappings = data.mappings || [];
          renderVendorMappingTable();
          updateVendorFilterSelect();
        case 3:
          return _context6.a(2);
      }
    }, _callee6);
  }));
  return _loadVendorMappingsAll.apply(this, arguments);
}
function loadCalendarData() {
  return _loadCalendarData.apply(this, arguments);
}
function _loadCalendarData() {
  _loadCalendarData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var res, data;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          _context7.n = 1;
          return fetch("/api/dashboard/calendar?year=".concat(currentYear, "&month=").concat(currentMonth + 1));
        case 1:
          res = _context7.v;
          _context7.n = 2;
          return res.json();
        case 2:
          data = _context7.v;
          return _context7.a(2, data.calendar || {});
      }
    }, _callee7);
  }));
  return _loadCalendarData.apply(this, arguments);
}
function loadIntegratedOrders() {
  return _loadIntegratedOrders.apply(this, arguments);
} // ==================== 렌더링 ====================
function _loadIntegratedOrders() {
  _loadIntegratedOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    var userId, dateFrom, dateTo, status, url, res, data;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          showLoading();
          userId = document.getElementById('integrated-user-filter').value;
          dateFrom = document.getElementById('integrated-date-from').value;
          dateTo = document.getElementById('integrated-date-to').value;
          status = document.getElementById('integrated-status-filter').value;
          url = '/api/integrated-orders?limit=500';
          if (userId) url += "&user_id=".concat(userId);
          if (dateFrom) url += "&date_from=".concat(dateFrom);
          if (dateTo) url += "&date_to=".concat(dateTo);
          if (status === 'pending') url += '&shipped=false';
          if (status === 'shipped') url += '&shipped=true';
          _context8.n = 1;
          return fetch(url);
        case 1:
          res = _context8.v;
          _context8.n = 2;
          return res.json();
        case 2:
          data = _context8.v;
          renderIntegratedOrders(data.orders || [], data.stats || {});
          hideLoading();
        case 3:
          return _context8.a(2);
      }
    }, _callee8);
  }));
  return _loadIntegratedOrders.apply(this, arguments);
}
function renderUserMenus() {
  var container = document.getElementById('user-menus');
  if (!container) return;
  container.innerHTML = userList.map(function (user) {
    return "\n                <div class=\"user-dropdown\">\n                    <div class=\"user-dropdown-header ".concat(currentUser === user.name ? 'active' : '', "\"\n                         onclick=\"toggleUserMenu('").concat(user.name, "')\">\n                        <span class=\"user-name\">\n                            <span class=\"icon\">\uD83D\uDC64</span> ").concat(escapeHtml(user.name), "\n                        </span>\n                        <span class=\"arrow\">\u25BC</span>\n                    </div>\n                    <div class=\"user-dropdown-menu\" id=\"user-menu-").concat(user.id, "\">\n                        <div class=\"menu-item\" onclick=\"showUserPage('convert', '").concat(user.name, "', ").concat(user.id, ")\">\n                            <span class=\"icon\">\uD83D\uDCE5</span> \uBC1C\uC8FC\uC11C \uBCC0\uD658\n                        </div>\n                        <div class=\"menu-item\" onclick=\"showUserPage('confirmed', '").concat(user.name, "', ").concat(user.id, ")\">\n                            <span class=\"icon\">\u2705</span> \uBCC0\uD658\uD655\uC815\n                            <span class=\"badge\" id=\"badge-confirmed-").concat(user.id, "\" style=\"display:none;\">0</span>\n                        </div>\n                        <div class=\"menu-item\" onclick=\"showUserPage('order-management', '").concat(user.name, "', ").concat(user.id, ")\">\n                            <span class=\"icon\">\uD83D\uDCCB</span> \uC804\uCCB4\uC8FC\uBB38\uAD00\uB9AC\n                            <span class=\"badge\" id=\"badge-order-").concat(user.id, "\" style=\"display:none;\">0</span>\n                        </div>\n                    </div>\n                </div>\n            ");
  }).join('');
}
function toggleUserMenu(userName) {
  currentUser = userName;
  var user = userList.find(function (u) {
    return u.name === userName;
  });
  if (!user) return;

  // 모든 드롭다운 닫기
  document.querySelectorAll('.user-dropdown-header').forEach(function (el) {
    el.classList.remove('expanded', 'active');
  });
  document.querySelectorAll('.user-dropdown-menu').forEach(function (el) {
    el.classList.remove('show');
  });

  // 선택한 드롭다운 열기
  var header = document.querySelector(".user-dropdown-header[onclick=\"toggleUserMenu('".concat(userName, "')\"]"));
  var menu = document.getElementById("user-menu-".concat(user.id));
  if (header && menu) {
    header.classList.add('expanded', 'active');
    menu.classList.add('show');
  }
}

// 이미 로드된 데이터로 달력 렌더링 (초기 로드용)
function renderCalendarWithData(data) {
  calendarData = data;
  renderCalendarInternal(data);
}

// 월 변경 시 새로 데이터 로드
function renderCalendar() {
  return _renderCalendar.apply(this, arguments);
} // 실제 달력 렌더링
function _renderCalendar() {
  _renderCalendar = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var data;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          showLoading();
          _context9.n = 1;
          return loadCalendarData();
        case 1:
          data = _context9.v;
          calendarData = data;
          renderCalendarInternal(data);
          hideLoading();
        case 2:
          return _context9.a(2);
      }
    }, _callee9);
  }));
  return _renderCalendar.apply(this, arguments);
}
function renderCalendarInternal(data) {
  var firstDay = new Date(currentYear, currentMonth, 1);
  var lastDay = new Date(currentYear, currentMonth + 1, 0);
  var prevLastDay = new Date(currentYear, currentMonth, 0);
  var firstDayOfWeek = firstDay.getDay();
  var lastDate = lastDay.getDate();
  var prevLastDate = prevLastDay.getDate();
  document.getElementById('calendar-title').textContent = currentYear + '년 ' + (currentMonth + 1) + '월';
  var grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  // 요일 헤더
  var days = ['일', '월', '화', '수', '목', '금', '토'];
  days.forEach(function (day, index) {
    var header = document.createElement('div');
    header.className = 'calendar-day-header';
    if (index === 0) header.classList.add('sunday');
    if (index === 6) header.classList.add('saturday');
    header.textContent = day;
    grid.appendChild(header);
  });

  // 이전 달
  for (var i = firstDayOfWeek - 1; i >= 0; i--) {
    var day = prevLastDate - i;
    var cell = createDayCell(currentYear, currentMonth - 1, day, true, data);
    grid.appendChild(cell);
  }

  // 현재 달
  for (var _day = 1; _day <= lastDate; _day++) {
    var _cell = createDayCell(currentYear, currentMonth, _day, false, data);
    grid.appendChild(_cell);
  }

  // 다음 달
  var totalCells = grid.children.length - 7;
  var remainingCells = 42 - totalCells;
  for (var _day2 = 1; _day2 <= remainingCells; _day2++) {
    var _cell2 = createDayCell(currentYear, currentMonth + 1, _day2, true, data);
    grid.appendChild(_cell2);
  }
}
function createDayCell(year, month, day, isOtherMonth, calendarData) {
  var cell = document.createElement('div');
  cell.className = 'calendar-day';
  var date = new Date(year, month, day);
  var dateKey = formatDateKey(date);
  var dayOfWeek = date.getDay();
  if (isOtherMonth) cell.classList.add('other-month');
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');
  var today = new Date();
  if (date.toDateString() === today.toDateString()) {
    cell.classList.add('today');
  }
  var numberDiv = document.createElement('div');
  numberDiv.className = 'calendar-day-number';
  numberDiv.textContent = day;
  cell.appendChild(numberDiv);
  var ordersDiv = document.createElement('div');
  ordersDiv.className = 'calendar-day-orders';
  var dayData = calendarData[dateKey];
  if (dayData && dayData.order_count > 0) {
    var allOrders = dayData.orders || [];
    var totalQty = dayData.total_qty || 0;
    var shippedCount = allOrders.filter(function(o) { return o.shipped; }).length;

    if (allOrders.length <= 2) {
      // 2건 이하: 개별 SKU 이름과 수량 표시
      allOrders.forEach(function(order) {
        var item = document.createElement('div');
        item.className = 'calendar-order-item';
        item.classList.add(order.shipped ? 'shipped' : 'pending');
        item.textContent = order.skuName + ' x' + order.quantity;
        ordersDiv.appendChild(item);
      });
    } else {
      // 3건 이상: 요약 표시
      var statusText = shippedCount === allOrders.length ? ' \u2713' : ' (' + shippedCount + '/' + allOrders.length + '\uCD9C\uACE0)';
      ordersDiv.innerHTML = '<span class="calendar-order-count">' + allOrders.length + '\uAC74 (' + totalQty + '\uAC1C)' + statusText + '</span>';
    }
  }
  cell.appendChild(ordersDiv);
  cell.onclick = function () {
    return openDayModal(dateKey);
  };
  return cell;
}
function formatDateKey(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
function renderPartsTable() {
  var container = document.getElementById('parts-table');
  if (!container) return;
  var parts = Object.entries(partsData);
  if (parts.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 부위가 없습니다.</p>';
    return;
  }
  container.innerHTML = "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>\uBD80\uC704\uBA85</th>\n                            <th>100g\uB2F9 \uC6D0\uAC00</th>\n                            <th>\uD0C0\uC785</th>\n                            <th>\uC791\uC5C5</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(parts.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      name = _ref2[0],
      data = _ref2[1];
    return "\n                            <tr>\n                                <td>".concat(escapeHtml(name), "</td>\n                                <td>").concat((data.price || 0).toLocaleString(), "\uC6D0</td>\n                                <td>").concat(data.type === 'unit' ? '개수' : '중량', "</td>\n                                <td>\n                                    <button class=\"btn btn-danger btn-small\" onclick=\"deletePart('").concat(escapeHtml(name), "')\">\uC0AD\uC81C</button>\n                                </td>\n                            </tr>\n                        ");
  }).join(''), "\n                    </tbody>\n                </table>\n            ");
}
function renderPackagingTable() {
  var container = document.getElementById('packaging-table');
  if (!container) return;
  var pkgs = Object.entries(packagingData);
  if (pkgs.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 포장재가 없습니다.</p>';
    return;
  }
  container.innerHTML = "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>\uD3EC\uC7A5\uC7AC\uBA85</th>\n                            <th>\uAC00\uACA9</th>\n                            <th>\uC791\uC5C5</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(pkgs.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      name = _ref4[0],
      price = _ref4[1];
    return "\n                            <tr>\n                                <td>".concat(escapeHtml(name), "</td>\n                                <td>").concat(price.toLocaleString(), "\uC6D0</td>\n                                <td>\n                                    <button class=\"btn btn-danger btn-small\" onclick=\"deletePackaging('").concat(escapeHtml(name), "')\">\uC0AD\uC81C</button>\n                                </td>\n                            </tr>\n                        ");
  }).join(''), "\n                    </tbody>\n                </table>\n            ");
}
function renderSkuTable() {
  var container = document.getElementById('sku-table');
  if (!container) return;
  if (skuProducts.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 SKU 상품이 없습니다.</p>';
    return;
  }
  container.innerHTML = "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>\uC0C1\uD488\uBA85</th>\n                            <th>\uD3EC\uC7A5\uC7AC</th>\n                            <th>\uD310\uB9E4\uAC00\uACA9</th>\n                            <th>\uAD6C\uC131\uD488</th>\n                            <th>\uC791\uC5C5</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(skuProducts.map(function (sku) {
    var compText = (sku.compositions || []).map(function (c) {
      return c.part_name + ' ' + c.weight + 'g';
    }).join(', ') || '-';
    return "\n                                <tr>\n                                    <td>".concat(escapeHtml(sku.sku_name), "</td>\n                                    <td>").concat(escapeHtml(sku.packaging || '-'), "</td>\n                                    <td>").concat((sku.selling_price || 0).toLocaleString(), "\uC6D0</td>\n                                    <td style=\"max-width: 300px; overflow: hidden; text-overflow: ellipsis;\">").concat(escapeHtml(compText), "</td>\n                                    <td>\n                                        <button class=\"btn btn-primary btn-small\" onclick=\"editSku(").concat(sku.id, ")\">\uC218\uC815</button>\n                                        <button class=\"btn btn-danger btn-small\" onclick=\"deleteSku(").concat(sku.id, ")\">\uC0AD\uC81C</button>\n                                    </td>\n                                </tr>\n                            ");
  }).join(''), "\n                    </tbody>\n                </table>\n            ");
}
function renderVendorMappingTable() {
  var _document$getElementB;
  var container = document.getElementById('vendor-mapping-table');
  if (!container) return;
  var vendor = ((_document$getElementB = document.getElementById('vendor-filter')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || '';
  var filtered = vendor ? vendorMappings.filter(function (m) {
    return m.vendor_name === vendor;
  }) : vendorMappings;
  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 매핑이 없습니다.</p>';
    return;
  }
  container.innerHTML = "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>\uAC70\uB798\uCC98</th>\n                            <th>\uC0C1\uD488\uCF54\uB4DC</th>\n                            <th>\uAC70\uB798\uCC98 \uC0C1\uD488\uBA85</th>\n                            <th>\uB9E4\uCE6D SKU</th>\n                            <th>\uC791\uC5C5</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(filtered.map(function (m) {
    return "\n                            <tr>\n                                <td>".concat(escapeHtml(m.vendor_name), "</td>\n                                <td>").concat(escapeHtml(m.product_code || '-'), "</td>\n                                <td>").concat(escapeHtml(m.product_name || '-'), "</td>\n                                <td>").concat(escapeHtml(m.sku_name || '미매칭'), "</td>\n                                <td>\n                                    <button class=\"btn btn-danger btn-small\" onclick=\"deleteMapping(").concat(m.id, ")\">\uC0AD\uC81C</button>\n                                </td>\n                            </tr>\n                        ");
  }).join(''), "\n                    </tbody>\n                </table>\n            ");
}
function renderIntegratedOrders(orders, stats) {
  var summaryEl = document.getElementById('integrated-summary');
  var tableEl = document.getElementById('integrated-table');
  summaryEl.innerHTML = "\n                <div class=\"summary-item\"><span class=\"label\">\uC804\uCCB4:</span><span class=\"value\">".concat(stats.total || 0, "\uAC74</span></div>\n                <div class=\"summary-item\"><span class=\"label\">\uCD9C\uACE0\uC644\uB8CC:</span><span class=\"value\">").concat(stats.shipped_count || 0, "\uAC74</span></div>\n                <div class=\"summary-item\"><span class=\"label\">\uC785\uAE08\uC644\uB8CC:</span><span class=\"value\">").concat(stats.paid_count || 0, "\uAC74</span></div>\n            ");
  if (orders.length === 0) {
    tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">조회된 주문이 없습니다.</p>';
    return;
  }
  tableEl.innerHTML = "\n                <table>\n                    <thead>\n                        <tr>\n                            <th>\uCD9C\uACE0\uC77C</th>\n                            <th>\uB2F4\uB2F9\uC790</th>\n                            <th>\uAC70\uB798\uCC98</th>\n                            <th>SKU</th>\n                            <th>\uC218\uB7C9</th>\n                            <th>\uC218\uB839\uC778</th>\n                            <th>\uCD9C\uACE0</th>\n                            <th>\uC785\uAE08</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(orders.map(function (o) {
    return "\n                            <tr>\n                                <td>".concat(o.release_date ? new Date(o.release_date).toLocaleDateString('ko-KR') : '-', "</td>\n                                <td>").concat(escapeHtml(o.user_name || '-'), "</td>\n                                <td>").concat(escapeHtml(o.vendor_name || '-'), "</td>\n                                <td>").concat(escapeHtml(o.sku_name || '-'), "</td>\n                                <td>").concat(o.quantity, "</td>\n                                <td>").concat(escapeHtml(o.recipient || '-'), "</td>\n                                <td><span class=\"status-badge ").concat(o.shipped ? 'shipped' : 'not-shipped', "\">").concat(o.shipped ? '출고' : '미출고', "</span></td>\n                                <td><span class=\"status-badge ").concat(o.paid ? 'paid' : 'not-paid', "\">").concat(o.paid ? '입금' : '미입금', "</span></td>\n                            </tr>\n                        ");
  }).join(''), "\n                    </tbody>\n                </table>\n            ");
}

// ==================== 기간별 발주량 계산 ====================
function calculateRangeOrder() {
  return _calculateRangeOrder.apply(this, arguments);
} // ==================== 페이지 네비게이션 ====================
function _calculateRangeOrder() {
  _calculateRangeOrder = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var startStr, endStr, res, data, skuSummary, html, partTotals;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          startStr = document.getElementById('range-start').value;
          endStr = document.getElementById('range-end').value;
          if (!(!startStr || !endStr)) {
            _context0.n = 1;
            break;
          }
          showToast('시작일과 종료일을 선택해주세요.', 'error');
          return _context0.a(2);
        case 1:
          showLoading();
          _context0.n = 2;
          return fetch("/api/dashboard/range-orders?start=".concat(startStr, "&end=").concat(endStr));
        case 2:
          res = _context0.v;
          _context0.n = 3;
          return res.json();
        case 3:
          data = _context0.v;
          hideLoading();
          skuSummary = data.sku_summary || [];
          if (!(skuSummary.length === 0)) {
            _context0.n = 4;
            break;
          }
          document.getElementById('range-result').innerHTML = '<div class="status show info">선택한 기간에 등록된 배송이 없습니다.</div>';
          return _context0.a(2);
        case 4:
          html = '<div class="result-box"><h3>발주량 계산 결과</h3>'; // 주문 목록
          html += '<h4>주문 목록</h4>';
          html += "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">\n                <thead>\n                    <tr style=\"background: #f5f5f5;\">\n                        <th style=\"padding: 8px; border: 1px solid #ddd;\">SKU</th>\n                        <th style=\"padding: 8px; border: 1px solid #ddd; text-align: center;\">\uC8FC\uBB38\uAC74\uC218</th>\n                        <th style=\"padding: 8px; border: 1px solid #ddd; text-align: center;\">\uCD1D\uC218\uB7C9</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    ".concat(skuSummary.map(function (item) {
            return "\n                        <tr>\n                            <td style=\"padding: 8px; border: 1px solid #ddd;\">".concat(escapeHtml(item.sku_name || '-'), "</td>\n                            <td style=\"padding: 8px; border: 1px solid #ddd; text-align: center;\">").concat(item.order_count, "\uAC74</td>\n                            <td style=\"padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 600;\">").concat(item.total_qty, "\uAC1C</td>\n                        </tr>\n                    ");
          }).join(''), "\n                </tbody>\n            </table>");

          // 부위별 집계 (SKU 구성품 기반)
          partTotals = {};
          skuSummary.forEach(function (item) {
            var sku = skuProducts.find(function (s) {
              return s.sku_name === item.sku_name;
            });
            if (sku && sku.compositions) {
              sku.compositions.forEach(function (comp) {
                var key = comp.part_name;
                if (!partTotals[key]) {
                  partTotals[key] = {
                    weight: 0,
                    packs: 0
                  };
                }
                partTotals[key].weight += comp.weight * item.total_qty;
                partTotals[key].packs += item.total_qty;
              });
            }
          });
          if (Object.keys(partTotals).length > 0) {
            html += '<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px;">';

            // 패킹 수량
            html += '<div style="flex: 1; min-width: 200px;">';
            html += '<h4>패킹 수량</h4>';
            html += "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">\n                    <thead>\n                        <tr style=\"background: #f5f5f5;\">\n                            <th style=\"padding: 6px; border: 1px solid #ddd;\">\uD488\uBAA9</th>\n                            <th style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">\uC218\uB7C9</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(Object.entries(partTotals).map(function (_ref5) {
              var _ref6 = _slicedToArray(_ref5, 2),
                part = _ref6[0],
                data = _ref6[1];
              return "\n                            <tr>\n                                <td style=\"padding: 6px; border: 1px solid #ddd;\">".concat(escapeHtml(part), "</td>\n                                <td style=\"padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;\">").concat(data.packs, "\uD329</td>\n                            </tr>\n                        ");
            }).join(''), "\n                    </tbody>\n                </table></div>");

            // 총 중량
            html += '<div style="flex: 1; min-width: 200px;">';
            html += '<h4>총 중량</h4>';
            html += "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">\n                    <thead>\n                        <tr style=\"background: #f5f5f5;\">\n                            <th style=\"padding: 6px; border: 1px solid #ddd;\">\uD488\uBAA9</th>\n                            <th style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">kg</th>\n                            <th style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">g</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        ".concat(Object.entries(partTotals).map(function (_ref7) {
              var _ref8 = _slicedToArray(_ref7, 2),
                part = _ref8[0],
                data = _ref8[1];
              return "\n                            <tr>\n                                <td style=\"padding: 6px; border: 1px solid #ddd;\">".concat(escapeHtml(part), "</td>\n                                <td style=\"padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;\">").concat((data.weight / 1000).toFixed(2), "</td>\n                                <td style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">").concat(data.weight.toLocaleString(), "</td>\n                            </tr>\n                        ");
            }).join(''), "\n                    </tbody>\n                </table></div>");
            html += '</div>';
          }
          html += '</div>';
          document.getElementById('range-result').innerHTML = html;
        case 5:
          return _context0.a(2);
      }
    }, _callee0);
  }));
  return _calculateRangeOrder.apply(this, arguments);
}
function showPage(pageId) {
  var _document$getElementB2, _document$querySelect;
  document.querySelectorAll('.page-content').forEach(function (el) {
    return el.classList.remove('active');
  });
  document.querySelectorAll('.menu-item').forEach(function (el) {
    return el.classList.remove('active');
  });
  (_document$getElementB2 = document.getElementById(pageId)) === null || _document$getElementB2 === void 0 || _document$getElementB2.classList.add('active');
  (_document$querySelect = document.querySelector(".menu-item[onclick=\"showPage('".concat(pageId, "')\"]"))) === null || _document$querySelect === void 0 || _document$querySelect.classList.add('active');

  // 페이지별 데이터 로드
  if (pageId === 'integrated-view') loadIntegratedOrders();
  if (pageId === 'vendor-mapping') loadVendorMappings();
}
function showUserPage(pageId, userName, userId) {
  var _document$getElementB3;
  currentUser = userName;
  document.querySelectorAll('.page-content').forEach(function (el) {
    return el.classList.remove('active');
  });
  (_document$getElementB3 = document.getElementById(pageId)) === null || _document$getElementB3 === void 0 || _document$getElementB3.classList.add('active');

  // 사용자 정보 표시
  if (pageId === 'convert') {
    document.getElementById('convert-user-info').textContent = userName + '님의 발주서 변환';
  } else if (pageId === 'confirmed') {
    document.getElementById('confirmed-user-info').textContent = userName + '님의 변환확정 목록';
    loadUserConfirmed(userId);
  } else if (pageId === 'order-management') {
    document.getElementById('order-user-info').textContent = userName + '님의 전체주문관리';
    loadUserOrders(userId);
  }
}
function loadUserConfirmed(_x) {
  return _loadUserConfirmed.apply(this, arguments);
}
function _loadUserConfirmed() {
  _loadUserConfirmed = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(userId) {
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          return _context1.a(2);
      }
    }, _callee1);
  }));
  return _loadUserConfirmed.apply(this, arguments);
}
function loadUserOrders(_x2) {
  return _loadUserOrders.apply(this, arguments);
} // ==================== 모달 ====================
function _loadUserOrders() {
  _loadUserOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(userId) {
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          return _context10.a(2);
      }
    }, _callee10);
  }));
  return _loadUserOrders.apply(this, arguments);
}
function openDayModal(dateKey) {
  selectedDate = dateKey;
  var _dateKey$split = dateKey.split('-'),
    _dateKey$split2 = _slicedToArray(_dateKey$split, 3),
    year = _dateKey$split2[0],
    month = _dateKey$split2[1],
    day = _dateKey$split2[2];
  document.getElementById('day-modal-title').textContent = year + '년 ' + parseInt(month) + '월 ' + parseInt(day) + '일';
  document.getElementById('day-orders-list').innerHTML = '<p style="color: #888;">주문 정보를 불러오는 중...</p>';
  document.getElementById('day-calculation-result').innerHTML = '';
  document.getElementById('day-modal').classList.add('show');
  loadDayOrders(dateKey);
}
function loadDayOrders(_x3) {
  return _loadDayOrders.apply(this, arguments);
}
function _loadDayOrders() {
  _loadDayOrders = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(dateKey) {
    var res, data, orders, container;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.n) {
        case 0:
          _context11.n = 1;
          return fetch("/api/integrated-orders?date_from=".concat(dateKey, "&date_to=").concat(dateKey, "&shipped=false"));
        case 1:
          res = _context11.v;
          _context11.n = 2;
          return res.json();
        case 2:
          data = _context11.v;
          orders = data.orders || [];
          container = document.getElementById('day-orders-list');
          if (!(orders.length === 0)) {
            _context11.n = 3;
            break;
          }
          container.innerHTML = '<p style="color: #888; text-align: center;">등록된 배송이 없습니다.</p>';
          return _context11.a(2);
        case 3:
          container.innerHTML = orders.map(function (o) {
            return "\n                <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ".concat(o.shipped ? '#e8f5e9' : '#fff3e0', "; border-radius: 8px; margin-bottom: 8px;\">\n                    <div>\n                        <div style=\"font-weight: 600;\">").concat(escapeHtml(o.vendor_name || ''), " - ").concat(escapeHtml(o.recipient || ''), "</div>\n                        <div style=\"color: #666; font-size: 13px;\">").concat(escapeHtml(o.sku_name || ''), "</div>\n                    </div>\n                    <div style=\"font-weight: 700; font-size: 18px;\">").concat(o.quantity, "</div>\n                    <span class=\"status-badge ").concat(o.shipped ? 'shipped' : 'not-shipped', "\">").concat(o.shipped ? '출고완료' : '미출고', "</span>\n                </div>\n            ");
          }).join('');
        case 4:
          return _context11.a(2);
      }
    }, _callee11);
  }));
  return _loadDayOrders.apply(this, arguments);
}
function closeDayModal() {
  document.getElementById('day-modal').classList.remove('show');
  selectedDate = null;
}
function calculateDayOrder() {
  return _calculateDayOrder.apply(this, arguments);
}
function _calculateDayOrder() {
  _calculateDayOrder = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.n) {
        case 0:
          if (selectedDate) {
            _context12.n = 1;
            break;
          }
          return _context12.a(2);
        case 1:
          _context12.n = 2;
          return calculateRangeOrderInternal(selectedDate, selectedDate, 'day-calculation-result');
        case 2:
          return _context12.a(2);
      }
    }, _callee12);
  }));
  return _calculateDayOrder.apply(this, arguments);
}
function calculateRangeOrderInternal(_x4, _x5, _x6) {
  return _calculateRangeOrderInternal.apply(this, arguments);
}
function _calculateRangeOrderInternal() {
  _calculateRangeOrderInternal = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(start, end, targetId) {
    var res, data, skuSummary, partTotals, html;
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.n) {
        case 0:
          _context13.n = 1;
          return fetch("/api/dashboard/range-orders?start=".concat(start, "&end=").concat(end));
        case 1:
          res = _context13.v;
          _context13.n = 2;
          return res.json();
        case 2:
          data = _context13.v;
          skuSummary = data.sku_summary || [];
          if (!(skuSummary.length === 0)) {
            _context13.n = 3;
            break;
          }
          document.getElementById(targetId).innerHTML = '<div class="status show info">주문이 없습니다.</div>';
          return _context13.a(2);
        case 3:
          // 부위별 집계
          partTotals = {};
          skuSummary.forEach(function (item) {
            var sku = skuProducts.find(function (s) {
              return s.sku_name === item.sku_name;
            });
            if (sku && sku.compositions) {
              sku.compositions.forEach(function (comp) {
                var key = comp.part_name;
                if (!partTotals[key]) partTotals[key] = {
                  weight: 0,
                  packs: 0
                };
                partTotals[key].weight += comp.weight * item.total_qty;
                partTotals[key].packs += item.total_qty;
              });
            }
          });
          html = '<div class="result-box" style="margin-top: 16px;"><h4>발주량 계산 결과</h4>';
          html += "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;\">\n                <thead><tr style=\"background: #f5f5f5;\">\n                    <th style=\"padding: 6px; border: 1px solid #ddd;\">\uD488\uBAA9</th>\n                    <th style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">\uC218\uB7C9</th>\n                    <th style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">\uCD1D\uC911\uB7C9</th>\n                </tr></thead>\n                <tbody>\n                    ".concat(Object.entries(partTotals).map(function (_ref9) {
            var _ref0 = _slicedToArray(_ref9, 2),
              part = _ref0[0],
              data = _ref0[1];
            return "\n                        <tr>\n                            <td style=\"padding: 6px; border: 1px solid #ddd;\">".concat(escapeHtml(part), "</td>\n                            <td style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">").concat(data.packs, "\uD329</td>\n                            <td style=\"padding: 6px; border: 1px solid #ddd; text-align: center;\">").concat((data.weight / 1000).toFixed(2), "kg</td>\n                        </tr>\n                    ");
          }).join(''), "\n                </tbody>\n            </table></div>");
          document.getElementById(targetId).innerHTML = html;
        case 4:
          return _context13.a(2);
      }
    }, _callee13);
  }));
  return _calculateRangeOrderInternal.apply(this, arguments);
}
function openAddUserModal() {
  document.getElementById('new-user-name').value = '';
  document.getElementById('user-modal').classList.add('show');
}
function closeUserModal() {
  document.getElementById('user-modal').classList.remove('show');
}
function addUser() {
  return _addUser.apply(this, arguments);
}
function _addUser() {
  _addUser = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
    var name, _t2;
    return _regenerator().w(function (_context14) {
      while (1) switch (_context14.p = _context14.n) {
        case 0:
          name = document.getElementById('new-user-name').value.trim();
          if (name) {
            _context14.n = 1;
            break;
          }
          showToast('사용자 이름을 입력하세요.', 'error');
          return _context14.a(2);
        case 1:
          showLoading();
          _context14.p = 2;
          _context14.n = 3;
          return fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: name,
              role: 'user'
            })
          });
        case 3:
          _context14.n = 4;
          return loadUsers();
        case 4:
          renderUserMenus();
          closeUserModal();
          showToast('사용자가 추가되었습니다.', 'success');
          _context14.n = 6;
          break;
        case 5:
          _context14.p = 5;
          _t2 = _context14.v;
          showToast('사용자 추가 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context14.a(2);
      }
    }, _callee14, null, [[2, 5]]);
  }));
  return _addUser.apply(this, arguments);
}
function openAddPartModal() {
  document.getElementById('part-name').value = '';
  document.getElementById('part-price').value = '';
  document.getElementById('part-modal').classList.add('show');
}
function closePartModal() {
  document.getElementById('part-modal').classList.remove('show');
}
function savePart() {
  return _savePart.apply(this, arguments);
}
function _savePart() {
  _savePart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15() {
    var name, price, _t3;
    return _regenerator().w(function (_context15) {
      while (1) switch (_context15.p = _context15.n) {
        case 0:
          name = document.getElementById('part-name').value.trim();
          price = parseInt(document.getElementById('part-price').value) || 0;
          if (name) {
            _context15.n = 1;
            break;
          }
          showToast('부위명을 입력하세요.', 'error');
          return _context15.a(2);
        case 1:
          showLoading();
          _context15.p = 2;
          _context15.n = 3;
          return fetch('/api/parts-cost', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              part_name: name,
              price_per_100g: price,
              cost_type: 'weight'
            })
          });
        case 3:
          _context15.n = 4;
          return loadPartsData();
        case 4:
          closePartModal();
          showToast('부위가 저장되었습니다.', 'success');
          _context15.n = 6;
          break;
        case 5:
          _context15.p = 5;
          _t3 = _context15.v;
          showToast('저장 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context15.a(2);
      }
    }, _callee15, null, [[2, 5]]);
  }));
  return _savePart.apply(this, arguments);
}
function deletePart(_x7) {
  return _deletePart.apply(this, arguments);
}
function _deletePart() {
  _deletePart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(name) {
    return _regenerator().w(function (_context16) {
      while (1) switch (_context16.n) {
        case 0:
          if (confirm("\"".concat(name, "\" \uBD80\uC704\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?"))) {
            _context16.n = 1;
            break;
          }
          return _context16.a(2);
        case 1:
          // TODO: 삭제 API 호출
          showToast('삭제되었습니다.', 'success');
          _context16.n = 2;
          return loadPartsData();
        case 2:
          return _context16.a(2);
      }
    }, _callee16);
  }));
  return _deletePart.apply(this, arguments);
}
function openAddPackagingModal() {
  document.getElementById('packaging-name').value = '';
  document.getElementById('packaging-price').value = '';
  document.getElementById('packaging-modal').classList.add('show');
}
function closePackagingModal() {
  document.getElementById('packaging-modal').classList.remove('show');
}
function savePackaging() {
  return _savePackaging.apply(this, arguments);
}
function _savePackaging() {
  _savePackaging = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17() {
    var name, price, _t4;
    return _regenerator().w(function (_context17) {
      while (1) switch (_context17.p = _context17.n) {
        case 0:
          name = document.getElementById('packaging-name').value.trim();
          price = parseInt(document.getElementById('packaging-price').value) || 0;
          if (name) {
            _context17.n = 1;
            break;
          }
          showToast('포장재명을 입력하세요.', 'error');
          return _context17.a(2);
        case 1:
          showLoading();
          _context17.p = 2;
          _context17.n = 3;
          return fetch('/api/packaging-cost', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              packaging_name: name,
              price: price
            })
          });
        case 3:
          _context17.n = 4;
          return loadPackagingData();
        case 4:
          closePackagingModal();
          showToast('포장재가 저장되었습니다.', 'success');
          _context17.n = 6;
          break;
        case 5:
          _context17.p = 5;
          _t4 = _context17.v;
          showToast('저장 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context17.a(2);
      }
    }, _callee17, null, [[2, 5]]);
  }));
  return _savePackaging.apply(this, arguments);
}
function deletePackaging(_x8) {
  return _deletePackaging.apply(this, arguments);
}
function _deletePackaging() {
  _deletePackaging = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(name) {
    return _regenerator().w(function (_context18) {
      while (1) switch (_context18.n) {
        case 0:
          if (confirm("\"".concat(name, "\" \uD3EC\uC7A5\uC7AC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?"))) {
            _context18.n = 1;
            break;
          }
          return _context18.a(2);
        case 1:
          showToast('삭제되었습니다.', 'success');
          _context18.n = 2;
          return loadPackagingData();
        case 2:
          return _context18.a(2);
      }
    }, _callee18);
  }));
  return _deletePackaging.apply(this, arguments);
}
function openAddSkuModal() {
  editingSkuId = null;
  document.getElementById('sku-modal-title').textContent = 'SKU 상품 추가';
  document.getElementById('sku-name').value = '';
  document.getElementById('sku-price').value = '';
  document.getElementById('composition-list').innerHTML = '';
  addCompositionRow();
  document.getElementById('sku-modal').classList.add('show');
}
function closeSkuModal() {
  document.getElementById('sku-modal').classList.remove('show');
}
function addCompositionRow() {
  var container = document.getElementById('composition-list');
  var row = document.createElement('div');
  row.className = 'form-row';
  row.style.marginBottom = '8px';
  row.innerHTML = "\n                <div class=\"form-group\" style=\"flex: 2;\">\n                    <select class=\"comp-part\">\n                        <option value=\"\">\uBD80\uC704 \uC120\uD0DD</option>\n                        ".concat(Object.keys(partsData).map(function (p) {
    return "<option value=\"".concat(escapeHtml(p), "\">").concat(escapeHtml(p), "</option>");
  }).join(''), "\n                    </select>\n                </div>\n                <div class=\"form-group\" style=\"flex: 1;\">\n                    <input type=\"number\" class=\"comp-weight\" placeholder=\"\uC911\uB7C9(g)\">\n                </div>\n                <button type=\"button\" class=\"btn btn-danger btn-small\" onclick=\"this.parentElement.remove()\">X</button>\n            ");
  container.appendChild(row);
}
function saveSku() {
  return _saveSku.apply(this, arguments);
}
function _saveSku() {
  _saveSku = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19() {
    var name, packaging, price, compositions, method, url, _t5;
    return _regenerator().w(function (_context19) {
      while (1) switch (_context19.p = _context19.n) {
        case 0:
          name = document.getElementById('sku-name').value.trim();
          packaging = document.getElementById('sku-packaging').value;
          price = parseInt(document.getElementById('sku-price').value) || 0;
          if (name) {
            _context19.n = 1;
            break;
          }
          showToast('상품명을 입력하세요.', 'error');
          return _context19.a(2);
        case 1:
          compositions = [];
          document.querySelectorAll('#composition-list .form-row').forEach(function (row) {
            var part = row.querySelector('.comp-part').value;
            var weight = parseInt(row.querySelector('.comp-weight').value) || 0;
            if (part && weight > 0) {
              compositions.push({
                part_name: part,
                weight: weight,
                composition_type: 'weight'
              });
            }
          });
          showLoading();
          _context19.p = 2;
          method = editingSkuId ? 'PUT' : 'POST';
          url = editingSkuId ? "/api/sku-products/".concat(editingSkuId) : '/api/sku-products';
          _context19.n = 3;
          return fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sku_name: name,
              packaging: packaging,
              selling_price: price,
              compositions: compositions
            })
          });
        case 3:
          _context19.n = 4;
          return loadSkuProducts();
        case 4:
          closeSkuModal();
          showToast('SKU 상품이 저장되었습니다.', 'success');
          _context19.n = 6;
          break;
        case 5:
          _context19.p = 5;
          _t5 = _context19.v;
          showToast('저장 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context19.a(2);
      }
    }, _callee19, null, [[2, 5]]);
  }));
  return _saveSku.apply(this, arguments);
}
function editSku(id) {
  var sku = skuProducts.find(function (s) {
    return s.id === id;
  });
  if (!sku) return;
  editingSkuId = id;
  document.getElementById('sku-modal-title').textContent = 'SKU 상품 수정';
  document.getElementById('sku-name').value = sku.sku_name;
  document.getElementById('sku-packaging').value = sku.packaging || '';
  document.getElementById('sku-price').value = sku.selling_price || '';
  var container = document.getElementById('composition-list');
  container.innerHTML = '';
  (sku.compositions || []).forEach(function (comp) {
    addCompositionRow();
    var rows = container.querySelectorAll('.form-row');
    var lastRow = rows[rows.length - 1];
    lastRow.querySelector('.comp-part').value = comp.part_name;
    lastRow.querySelector('.comp-weight').value = comp.weight;
  });
  document.getElementById('sku-modal').classList.add('show');
}
function deleteSku(_x9) {
  return _deleteSku.apply(this, arguments);
}
function _deleteSku() {
  _deleteSku = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(id) {
    var _t6;
    return _regenerator().w(function (_context20) {
      while (1) switch (_context20.p = _context20.n) {
        case 0:
          if (confirm('이 SKU 상품을 삭제하시겠습니까?')) {
            _context20.n = 1;
            break;
          }
          return _context20.a(2);
        case 1:
          showLoading();
          _context20.p = 2;
          _context20.n = 3;
          return fetch("/api/sku-products/".concat(id), {
            method: 'DELETE'
          });
        case 3:
          _context20.n = 4;
          return loadSkuProducts();
        case 4:
          showToast('삭제되었습니다.', 'success');
          _context20.n = 6;
          break;
        case 5:
          _context20.p = 5;
          _t6 = _context20.v;
          showToast('삭제 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context20.a(2);
      }
    }, _callee20, null, [[2, 5]]);
  }));
  return _deleteSku.apply(this, arguments);
}
function openAddMappingModal() {
  document.getElementById('mapping-vendor').value = '';
  document.getElementById('mapping-code').value = '';
  document.getElementById('mapping-product-name').value = '';
  document.getElementById('mapping-sku').value = '';
  document.getElementById('mapping-modal').classList.add('show');
}
function closeMappingModal() {
  document.getElementById('mapping-modal').classList.remove('show');
}
function saveMapping() {
  return _saveMapping.apply(this, arguments);
}
function _saveMapping() {
  _saveMapping = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21() {
    var vendor, code, productName, skuId, _t7;
    return _regenerator().w(function (_context21) {
      while (1) switch (_context21.p = _context21.n) {
        case 0:
          vendor = document.getElementById('mapping-vendor').value.trim();
          code = document.getElementById('mapping-code').value.trim();
          productName = document.getElementById('mapping-product-name').value.trim();
          skuId = document.getElementById('mapping-sku').value;
          if (vendor) {
            _context21.n = 1;
            break;
          }
          showToast('거래처명을 입력하세요.', 'error');
          return _context21.a(2);
        case 1:
          showLoading();
          _context21.p = 2;
          _context21.n = 3;
          return fetch('/api/vendor-mappings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              vendor_name: vendor,
              product_code: code,
              product_name: productName,
              sku_product_id: skuId ? parseInt(skuId) : null
            })
          });
        case 3:
          _context21.n = 4;
          return loadVendorMappingsAll();
        case 4:
          closeMappingModal();
          showToast('매핑이 저장되었습니다.', 'success');
          _context21.n = 6;
          break;
        case 5:
          _context21.p = 5;
          _t7 = _context21.v;
          showToast('저장 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context21.a(2);
      }
    }, _callee21, null, [[2, 5]]);
  }));
  return _saveMapping.apply(this, arguments);
}
function deleteMapping(_x0) {
  return _deleteMapping.apply(this, arguments);
} // ==================== 유틸리티 ====================
function _deleteMapping() {
  _deleteMapping = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(id) {
    var _t8;
    return _regenerator().w(function (_context22) {
      while (1) switch (_context22.p = _context22.n) {
        case 0:
          if (confirm('이 매핑을 삭제하시겠습니까?')) {
            _context22.n = 1;
            break;
          }
          return _context22.a(2);
        case 1:
          showLoading();
          _context22.p = 2;
          _context22.n = 3;
          return fetch("/api/vendor-mappings/".concat(id), {
            method: 'DELETE'
          });
        case 3:
          _context22.n = 4;
          return loadVendorMappingsAll();
        case 4:
          showToast('삭제되었습니다.', 'success');
          _context22.n = 6;
          break;
        case 5:
          _context22.p = 5;
          _t8 = _context22.v;
          showToast('삭제 실패', 'error');
        case 6:
          hideLoading();
        case 7:
          return _context22.a(2);
      }
    }, _callee22, null, [[2, 5]]);
  }));
  return _deleteMapping.apply(this, arguments);
}
function updateConnectionStatus(connected) {
  var el = document.getElementById('connection-status');
  if (!el) return;
  var textEl = el.querySelector('.text');
  if (!textEl) return;
  if (connected) {
    el.classList.add('connected');
    textEl.textContent = 'PostgreSQL 연결됨';
  } else {
    el.classList.remove('connected');
    textEl.textContent = '연결 끊김';
  }
}
function updateVendorSelect() {
  var vendors = _toConsumableArray(new Set(vendorMappings.map(function (m) {
    return m.vendor_name;
  })));
  var select = document.getElementById('vendor-name');
  if (select) {
    select.innerHTML = '<option value="">발주처를 선택하세요</option>' + vendors.map(function (v) {
      return "<option value=\"".concat(escapeHtml(v), "\">").concat(escapeHtml(v), "</option>");
    }).join('');
  }
}
function updateVendorFilterSelect() {
  var vendors = _toConsumableArray(new Set(vendorMappings.map(function (m) {
    return m.vendor_name;
  })));
  var select = document.getElementById('vendor-filter');
  if (select) {
    select.innerHTML = '<option value="">전체</option>' + vendors.map(function (v) {
      return "<option value=\"".concat(escapeHtml(v), "\">").concat(escapeHtml(v), "</option>");
    }).join('');
  }
}
function updateIntegratedUserFilter() {
  var select = document.getElementById('integrated-user-filter');
  if (select) {
    select.innerHTML = '<option value="">전체</option>' + userList.map(function (u) {
      return "<option value=\"".concat(u.id, "\">").concat(escapeHtml(u.name), "</option>");
    }).join('');
  }
}
function updatePackagingSelect() {
  var select = document.getElementById('sku-packaging');
  if (select) {
    select.innerHTML = '<option value="">포장재 선택</option>' + Object.keys(packagingData).map(function (p) {
      return "<option value=\"".concat(escapeHtml(p), "\">").concat(escapeHtml(p), "</option>");
    }).join('');
  }
}
function updateSkuSelect() {
  var select = document.getElementById('mapping-sku');
  if (select) {
    select.innerHTML = '<option value="">SKU 선택</option>' + skuProducts.map(function (s) {
      return "<option value=\"".concat(s.id, "\">").concat(escapeHtml(s.sku_name), "</option>");
    }).join('');
  }
}
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}
function goToToday() {
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  renderCalendar();
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
  document.querySelector('.overlay').classList.toggle('show');
}
function showLoading() {
  document.getElementById('loading').classList.add('show');
}
function hideLoading() {
  document.getElementById('loading').classList.remove('show');
}
function showToast(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = "toast ".concat(type);
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function () {
    return toast.remove();
  }, 3000);
}
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function downloadIntegratedExcel() {
  showToast('엑셀 다운로드 준비 중...', 'info');
  // TODO: 엑셀 다운로드 구현
}
function loadVendorMappings() {
  renderVendorMappingTable();
}

// ==================== 발주서 변환 ====================
var uploadArea = document.getElementById('upload-area');
var fileInput = document.getElementById('file-input');
if (uploadArea) {
  uploadArea.onclick = function () {
    return fileInput.click();
  };
  uploadArea.ondragover = function (e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  };
  uploadArea.ondragleave = function () {
    return uploadArea.classList.remove('dragover');
  };
  uploadArea.ondrop = function (e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  };
}
if (fileInput) {
  fileInput.onchange = function () {
    return handleFiles(fileInput.files);
  };
}
function handleFiles(files) {
  if (files.length > 0) {
    var names = Array.from(files).map(function (f) {
      return f.name;
    }).join(', ');
    document.getElementById('file-info').textContent = "\uC120\uD0DD\uB428: ".concat(names);
    document.getElementById('file-info').classList.add('show');
    document.getElementById('btn-convert').disabled = false;
  }
}
function convertOrders() {
  showToast('발주서 변환 기능은 개발 중입니다.', 'info');
}
function confirmConvertedData() {
  showToast('변환확정 이동 기능은 개발 중입니다.', 'info');
}
function registerOrders() {
  showToast('주문 등록 기능은 개발 중입니다.', 'info');
}
function downloadConfirmedExcel() {
  showToast('엑셀 다운로드 기능은 개발 중입니다.', 'info');
}
function downloadOrderExcel() {
  showToast('엑셀 다운로드 기능은 개발 중입니다.', 'info');
}
function bulkUpdateStatus(field, value) {
  showToast("\uC0C1\uD0DC \uC5C5\uB370\uC774\uD2B8 \uAE30\uB2A5\uC740 \uAC1C\uBC1C \uC911\uC785\uB2C8\uB2E4.", 'info');
}
