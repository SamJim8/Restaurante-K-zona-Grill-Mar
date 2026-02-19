/**
 * Daily menu section: loads menu from Google Apps Script Web App (no CORS).
 * Same menu (Google Sheets) every day; weekend prices are applied automatically via getDiaryMenuPrices().
 */

const DIARY_MENU_CONFIG = {
  diaryMenuApiUrl:
    "https://script.google.com/macros/s/AKfycbyziNUwUscOdG0VBnhWO7sopD4oWOCwEGFY0SyqOvnLdfSrr2wLNmJaXrR7qlqHCiYJlA/exec",

  sheetGidsByMonth: [
    809953540, 0, 1318363453, 1656569497, 1894987393, 1214624297, 2016672776,
    1045389944, 1845539428, 569415544, 952435126,
  ],
};

const SECTION_HEADERS = ["Sopa", "Plato fuerte"];
const FECHA_HEADER = "Fecha";
const SECTION_HEADER_ALIASES = {
  sopa: ["sopa", "sopas", "soup", "soups", "soupwithprotein", "vegetariansoup"],
  platofuerte: [
    "platofuerte",
    "segundo",
    "platoprincipal",
    "chickensecond",
    "anothersecond",
    "second",
  ],
  postre: ["postre", "postres", "dessert", "desserts"],
  bebida: ["bebida", "bebidas", "drink", "drinks"],
};
const DATE_COLUMN_NORMS = ["fecha", "dia", "date", "diadelmes"];
const WHATSAPP_NUMBER = "593979495354";
const SECTION_LABELS = { sopa: "Sopa", platofuerte: "Plato fuerte" };
var lastDiaryMenuData = null;
var DIARY_MENU_PRICES = { completo: 3.25, soloSopa: 1.5, soloPlatoFuerte: 2.5 };
var DIARY_MENU_PRICES_WEEKEND = { completo: 4, soloSopa: 1.75, soloPlatoFuerte: 3.25 };

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function getDiaryMenuPrices() {
  return isWeekend() ? DIARY_MENU_PRICES_WEEKEND : DIARY_MENU_PRICES;
}

function getDiaryMenuBaseUrl() {
  const base = DIARY_MENU_CONFIG.diaryMenuApiUrl;
  if (!base || base.includes("YOUR_")) return null;
  if (base.startsWith("http://") || base.startsWith("https://"))
    return base.replace(/\/exec\/?$/, "") + "/exec";
  return (
    "https://script.google.com/macros/s/" +
    base.replace(/^\/+|\/+$/g, "") +
    "/exec"
  );
}

function getDiaryMenuApiUrl() {
  const today = new Date();
  const monthIndex = today.getMonth();
  const day = today.getDate();
  const month = monthIndex + 1;
  const year = today.getFullYear();
  const gids = DIARY_MENU_CONFIG.sheetGidsByMonth;
  const gid =
    Array.isArray(gids) && gids[monthIndex] !== undefined
      ? gids[monthIndex]
      : 0;
  const base = getDiaryMenuBaseUrl();
  if (!base) return null;
  const sep = base.indexOf("?") >= 0 ? "&" : "?";
  return `${base}${sep}gid=${gid}&day=${day}&month=${month}&year=${year}`;
}

function escapeHtml(text) {
  if (text == null || text === "") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function normHeader(h) {
  if (h == null || h === "") return "";
  return String(h)
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/í/g, "i")
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u");
}

function isDateColumn(norm) {
  return DATE_COLUMN_NORMS.indexOf(norm) !== -1;
}

/**
 * Renders menu HTML as read-only (list only).
 */
function buildDailyMenuHtml(headers, row, formattedDate) {
  const parts = [];
  parts.push(`<h3>Menú diario</h3>`);
  parts.push(`<p><span>Fecha: ${escapeHtml(formattedDate)}</span></p>`);

  const renderedCols = {};
  for (const sectionName of SECTION_HEADERS) {
    const key = normHeader(sectionName);
    const aliases = SECTION_HEADER_ALIASES[key] || [key];
    const matchingCols = [];
    for (let i = 0; i < headers.length; i++) {
      const n = normHeader(headers[i]);
      if (aliases.indexOf(n) !== -1) matchingCols.push(i);
    }
    const sectionItems = [];
    for (let i = 0; i < matchingCols.length; i++) {
      const colIndex = matchingCols[i];
      const cell = row[colIndex];
      if (cell === undefined || String(cell).trim() === "") continue;
      const items = String(cell)
        .split(/[\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      sectionItems.push.apply(sectionItems, items);
      renderedCols[colIndex] = true;
    }
    if (sectionItems.length === 0) continue;
    parts.push(`<h4><strong>${escapeHtml(sectionName)}:</strong></h4>`);
    parts.push(`<ul class="diary-menu-list">`);
    sectionItems.forEach((item) => {
      parts.push(`<li>${escapeHtml(item)}</li>`);
    });
    parts.push(`</ul>`);
  }

  for (let c = 0; c < headers.length; c++) {
    if (renderedCols[c]) continue;
    const n = normHeader(headers[c]);
    if (isDateColumn(n)) continue;
    const cell = row[c];
    if (cell === undefined || cell === null || String(cell).trim() === "")
      continue;
    const items = String(cell)
      .split(/[\n;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) continue;
    parts.push(`<h4><strong>${escapeHtml(headers[c])}:</strong></h4>`);
    items.forEach((item) => {
      parts.push(`<p>${escapeHtml(item)}</p>`);
    });
  }

  parts.push(
    `<div class="diary-cart-actions"><button type="button" id="diary-build-cart-btn" class="diary-build-cart-btn">Armar menú del día</button></div>`,
  );
  return parts.join("");
}

/**
 * Returns array of item strings for a section (soup or main) from the menu row.
 */
function getDiarySectionItems(headers, row, sectionKey) {
  var aliases = SECTION_HEADER_ALIASES[sectionKey] || [sectionKey];
  var items = [];
  for (var i = 0; i < headers.length; i++) {
    var n = normHeader(headers[i]);
    if (aliases.indexOf(n) === -1) continue;
    var cell = row[i];
    if (cell === undefined || cell === null) continue;
    var parts = String(cell)
      .split(/[\n;]+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    items.push.apply(items, parts);
  }
  return items;
}

function buildDiaryCartFormHtml(headers, row) {
  var sopaItems = getDiarySectionItems(headers, row, "sopa");
  var platoItems = getDiarySectionItems(headers, row, "platofuerte");
  var sopaParts = [];
  sopaItems.forEach(function (item) {
    sopaParts.push(
      '<label class="diary-option"><input type="radio" name="diary-complete-soup" value="' +
        escapeHtml(item) +
        '"> ' +
        escapeHtml(item) +
        "</label>",
    );
  });
  var platoParts = [];
  platoItems.forEach(function (item) {
    platoParts.push(
      '<label class="diary-option"><input type="radio" name="diary-complete-main" value="' +
        escapeHtml(item) +
        '"> ' +
        escapeHtml(item) +
        "</label>",
    );
  });
 var soloSopaParts = [];
  sopaItems.forEach(function (item) {
    soloSopaParts.push(
    '<div class="diary-single-soup-wrap diary-single-row">' +
      '<label class="diary-single-label">' +
        escapeHtml(item) +
      '</label>' +
      '<div class="diary-qty-wrap">' +
        '<button type="button" class="diary-qty-btn diary-qty-minus" aria-label="Menos">−</button>' +
        '<input type="number" min="0" max="99" step="1" value="0" ' +
          'class="diary-qty-input diary-single-soup-qty" ' +
          'data-item="' + escapeHtml(item) + '" ' +
          'aria-label="Cantidad ' + escapeHtml(item) + '" inputmode="numeric" />' +
        '<button type="button" class="diary-qty-btn diary-qty-plus" aria-label="Más">+</button>' +
      '</div>' +
    '</div>'
  );
});
var soloSegundoParts = [];
platoItems.forEach(function (item) {
  soloSegundoParts.push(
    '<div class="diary-single-main-wrap diary-single-row">' +
      '<label class="diary-single-label">' +
        escapeHtml(item) +
      '</label>' +
      '<div class="diary-qty-wrap">' +
        '<button type="button" class="diary-qty-btn diary-qty-minus" aria-label="Menos">−</button>' +
        '<input type="number" min="0" max="99" step="1" value="0" ' +
          'class="diary-qty-input diary-single-main-qty" ' +
          'data-item="' + escapeHtml(item) + '" ' +
          'aria-label="Cantidad ' + escapeHtml(item) + '" inputmode="numeric" />' +
        '<button type="button" class="diary-qty-btn diary-qty-plus" aria-label="Más">+</button>' +
      '</div>' +
    '</div>'
  );
});
  
  return {
    sopaHtml: sopaParts.join(""),
    platoHtml: platoParts.join(""),
    soloSopaHtml:
      '<div class="diary-section-grid">' +
      soloSopaParts.join("") +
      '</div>',

    soloSegundoHtml:
      '<div class="diary-section-grid">' +
      soloSegundoParts.join("") +
      '</div>',
    sopaItems: sopaItems,
    platoItems: platoItems,
  };
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderError(container, message) {
  container.innerHTML = `
    <h3>Menú diario</h3>
    <p class="diary-menu-error">${escapeHtml(message)}</p>
  `;
}

function renderLoading(container) {
  container.innerHTML = `<p class="diary-menu-loading">Cargando menú…</p>`;
}

function showDiaryCartView() {
  var content = document.getElementById("diary-menu-content");
  var cartInline = document.getElementById("diary-cart-inline");
  if (content) content.hidden = true;
  if (cartInline) {
    cartInline.hidden = false;
    cartInline.setAttribute("aria-hidden", "false");
  }
}

function showDiaryMenuView() {
  var content = document.getElementById("diary-menu-content");
  var cartInline = document.getElementById("diary-cart-inline");
  if (cartInline) {
    cartInline.hidden = true;
    cartInline.setAttribute("aria-hidden", "true");
  }
  if (!content) return;
  content.hidden = false;
  if (
    !lastDiaryMenuData ||
    !lastDiaryMenuData.headers ||
    !lastDiaryMenuData.row
  )
    return;
  var formattedDate = formatDisplayDate(new Date());
  content.innerHTML = buildDailyMenuHtml(
    lastDiaryMenuData.headers,
    lastDiaryMenuData.row,
    formattedDate,
  );
  bindDiaryCartButton();
}

function updateDiaryCartTotal() {
  var total = 0;

  document
    .querySelectorAll("#diary-cart-complete-list .diary-complete-qty")
    .forEach(function (input) {
      total += (parseInt(input.value, 10) || 0) * getDiaryMenuPrices().completo;
    });

  document
    .querySelectorAll(".diary-single-soup-qty")
    .forEach(function (input) {
      var qty = parseInt(input.value, 10) || 0;
      if (qty > 0) {
        total += qty * getDiaryMenuPrices().soloSopa;
      }
    });

  document
    .querySelectorAll(".diary-single-main-qty")
    .forEach(function (input) {
      var qty = parseInt(input.value, 10) || 0;
      if (qty > 0) {
        total += qty * getDiaryMenuPrices().soloPlatoFuerte;
      }
    });

  var el = document.getElementById("diary-cart-total");
  if (el) el.textContent = total.toFixed(2);
}

function updateDiaryCartResumen() {
  var linesEl = document.getElementById("diary-cart-summary-lines");
  var emptyEl = document.querySelector(
    "#diary-cart-summary .diary-summary-empty",
  );
  if (!linesEl) return;
  var lines = [];
  var prices = getDiaryMenuPrices();
  var priceCompleto = prices.completo;
  var priceSopa = prices.soloSopa;
  var pricePlato = prices.soloPlatoFuerte;

  document
    .querySelectorAll("#diary-cart-complete-list .diary-complete-item")
    .forEach(function (div) {
      var input = div.querySelector(".diary-complete-qty");
      var qty = input ? parseInt(input.value, 10) || 0 : 0;
      if (qty <= 0) return;
      var sopa = (input && input.getAttribute("data-sopa")) || "";
      var plato = (input && input.getAttribute("data-plato")) || "";
      var subtotal = (qty * priceCompleto).toFixed(2);
      lines.push(
        '<div class="diary-summary-line" data-type="complete" data-sopa="' +
          escapeHtml(sopa) +
          '" data-plato="' +
          escapeHtml(plato) +
          '">' +
          '<span class="diary-summary-qty">' +
          escapeHtml(String(qty)) +
          '</span> <span class="diary-summary-text">Almuerzo completo:<br>Sopa = ' +
          escapeHtml(sopa) +
          ", Plato fuerte = " +
          escapeHtml(plato) +
          '</span> <span class="diary-summary-price">= $' +
          subtotal +
          '</span> <button type="button" class="diary-summary-remove-btn" aria-label="Eliminar">×</button></div>',
      );
    });

  document.querySelectorAll(".diary-single-soup-wrap").forEach(function (wrap) {
    var input = wrap.querySelector(".diary-single-soup-qty");
    var qty = parseInt(input.value, 10) || 0;
    if (qty <= 0) return;
    var item = input.getAttribute("data-item") || "Sopa";
    var subtotal = (qty * priceSopa).toFixed(2);
    lines.push(
      '<div class="diary-summary-line" data-type="soup" data-item="' +
        escapeHtml(item) +
        '">' +
        '<span class="diary-summary-qty">' +
        escapeHtml(String(qty)) +
        '</span> <span class="diary-summary-text">' +
        escapeHtml(item) +
        '</span> <span class="diary-summary-price">= $' +
        subtotal +
        '</span> <button type="button" class="diary-summary-remove-btn" aria-label="Eliminar">×</button></div>',
    );
  });

  document
    .querySelectorAll(".diary-single-main-wrap")
    .forEach(function (wrap) {
      var input = wrap.querySelector(".diary-single-main-qty");
      if (!input) return;
      var qty = parseInt(input.value, 10) || 0;
      if (qty <= 0) return;
      var item = input.getAttribute("data-item") || "Plato fuerte";
      var subtotal = (qty * pricePlato).toFixed(2);
      lines.push(
        '<div class="diary-summary-line" data-type="main" data-item="' +
          escapeHtml(item) +
          '">' +
          '<span class="diary-summary-qty">' +
          escapeHtml(String(qty)) +
          '</span> <span class="diary-summary-text">' +
          escapeHtml(item) +
          '</span> <span class="diary-summary-price">= $' +
          subtotal +
          '</span> <button type="button" class="diary-summary-remove-btn" aria-label="Eliminar">×</button></div>',
      );
    });

  linesEl.innerHTML = lines.join("");
  if (emptyEl) {
    emptyEl.style.display = lines.length ? "none" : "block";
  }
}

function addDiaryCompleteListeners() {
  function onUpdate() {
    updateDiaryCartTotal();
    updateDiaryCartResumen();
  }
  document
    .querySelectorAll(
      "#diary-cart-complete-list .diary-complete-qty, .diary-single-soup-qty, .diary-single-main-qty",
    )
    .forEach(function (input) {
      input.removeEventListener("input", onUpdate);
      input.removeEventListener("change", onUpdate);
      input.addEventListener("input", onUpdate);
      input.addEventListener("change", onUpdate);
    });
}

function bindDiaryQtyButtons() {
  var container = document.getElementById("diary-cart-inline");
  if (!container) return;
  container.removeEventListener("click", onDiaryQtyButtonClick);
  container.addEventListener("click", onDiaryQtyButtonClick);
}

function bindDiaryRemoveItemButtons() {
  var summaryEl = document.getElementById("diary-cart-summary");
  if (!summaryEl) return;
  summaryEl.removeEventListener("click", onDiarySummaryRemoveClick);
  summaryEl.addEventListener("click", onDiarySummaryRemoveClick);
}

function onDiarySummaryRemoveClick(e) {
  var btn = e.target.closest(".diary-summary-remove-btn");
  if (!btn) return;
  e.preventDefault();
  var lineEl = btn.closest(".diary-summary-line");
  if (!lineEl) return;
  var type = lineEl.getAttribute("data-type");
  if (type === "complete") {
    var sopa = lineEl.getAttribute("data-sopa") || "";
    var plato = lineEl.getAttribute("data-plato") || "";
    var completeList = document.getElementById("diary-cart-complete-list");
    if (completeList) {
      var items = completeList.querySelectorAll(".diary-complete-item");
      for (var i = 0; i < items.length; i++) {
        var input = items[i].querySelector(".diary-complete-qty");
        if (input && input.getAttribute("data-sopa") === sopa && input.getAttribute("data-plato") === plato) {
          items[i].remove();
          break;
        }
      }
    }
  } else if (type === "soup") {
    var item = lineEl.getAttribute("data-item") || "";
    var wraps = document.querySelectorAll(".diary-single-soup-wrap");
    for (var w = 0; w < wraps.length; w++) {
      var inp = wraps[w].querySelector(".diary-single-soup-qty");
      if (inp && inp.getAttribute("data-item") === item) {
        inp.value = "0";
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
        break;
      }
    }
  } else if (type === "main") {
    var item = lineEl.getAttribute("data-item") || "";
    var wraps = document.querySelectorAll(".diary-single-main-wrap");
    for (var w = 0; w < wraps.length; w++) {
      var inp = wraps[w].querySelector(".diary-single-main-qty");
      if (inp && inp.getAttribute("data-item") === item) {
        inp.value = "0";
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
        break;
      }
    }
  }
  updateDiaryCartTotal();
  updateDiaryCartResumen();
}

function onDiaryQtyButtonClick(e) {
  var target = e.target;
  if (!target.classList.contains("diary-qty-btn")) return;
  var wrap = target.closest(".diary-qty-wrap");
  if (!wrap) return;
  var input = wrap.querySelector(".diary-qty-input");
  if (!input || input.type !== "number") return;
  var min = parseInt(input.getAttribute("min"), 10) || 0;
  var max = parseInt(input.getAttribute("max"), 10) || 99;
  var val = parseInt(input.value, 10) || 0;
  if (target.classList.contains("diary-qty-minus")) {
    val = Math.max(min, val - 1);
  } else if (target.classList.contains("diary-qty-plus")) {
    val = Math.min(max, val + 1);
  }
  input.value = String(val);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillDiaryCartModalWithForm() {
  if (
    !lastDiaryMenuData ||
    !lastDiaryMenuData.headers ||
    !lastDiaryMenuData.row
  )
    return;
  var headers = lastDiaryMenuData.headers;
  var row = lastDiaryMenuData.row;
  var data = buildDiaryCartFormHtml(headers, row);
  var sopaEl = document.getElementById("diary-complete-soup");
  var platoEl = document.getElementById("diary-complete-main");
  var soloSopaEl = document.getElementById("diary-cart-single-soup-list");
  var soloSegundoEl = document.getElementById("diary-cart-single-main-list");
  var completeListEl = document.getElementById("diary-cart-complete-list");
  if (sopaEl) sopaEl.innerHTML = data.sopaHtml;
  if (platoEl) platoEl.innerHTML = data.platoHtml;
  if (soloSopaEl) soloSopaEl.innerHTML = data.soloSopaHtml;
  if (soloSegundoEl) soloSegundoEl.innerHTML = data.soloSegundoHtml;
  if (completeListEl) completeListEl.innerHTML = "";

  var selectionWrap = document.getElementById("diary-complete-selection-wrap");
  var selectedSopaSpan = document.getElementById("diary-selected-soup");
  var selectedMainSpan = document.getElementById("diary-selected-main");
  var completeQtyInput = document.getElementById("diary-complete-qty-input");

  function updateCompleteSelectionVisibility() {
    var sopaRadio = document.querySelector('input[name="diary-complete-soup"]:checked');
    var platoRadio = document.querySelector('input[name="diary-complete-main"]:checked');
    if (!selectionWrap || !selectedSopaSpan || !selectedMainSpan) return;
    if (sopaRadio && platoRadio) {
      selectedSopaSpan.textContent = sopaRadio.value.trim();
      selectedMainSpan.textContent = platoRadio.value.trim();
      selectionWrap.hidden = false;
    } else {
      selectionWrap.hidden = true;
    }
  }

  if (sopaEl) {
    sopaEl.addEventListener("change", updateCompleteSelectionVisibility);
  }
  if (platoEl) {
    platoEl.addEventListener("change", updateCompleteSelectionVisibility);
  }
  updateCompleteSelectionVisibility();

  if (completeQtyInput) {
    completeQtyInput.addEventListener("input", function () {
      var v = parseInt(completeQtyInput.value, 10);
      if (isNaN(v) || v < 1) completeQtyInput.value = "1";
      else if (v > 99) completeQtyInput.value = "99";
    });
    completeQtyInput.addEventListener("change", function () {
      var v = parseInt(completeQtyInput.value, 10);
      if (isNaN(v) || v < 1) completeQtyInput.value = "1";
      else if (v > 99) completeQtyInput.value = "99";
    });
  }

  var paraLlevar = document.getElementById("diary-para-llevar");
  if (paraLlevar) paraLlevar.checked = false;
  var reservar = document.getElementById("diary-dine-in");
  if (reservar) reservar.checked = false;
  var nameInput = document.getElementById("diary-customer-name");
  if (nameInput) nameInput.value = "";
  updateDiaryCartTotal();
  updateDiaryCartResumen();
  addDiaryCompleteListeners();
  var addBtn = document.getElementById("diary-add-complete-btn");
  if (addBtn) {
    addBtn.onclick = function () {
      var sopaRadio = document.querySelector(
        'input[name="diary-complete-soup"]:checked',
      );
      var platoRadio = document.querySelector(
        'input[name="diary-complete-main"]:checked',
      );
      if (!sopaRadio || !platoRadio) {
        alert("Elige una sopa y un plato fuerte para agregar el almuerzo.");
        return;
      }
      var sopaVal = sopaRadio.value.trim();
      var platoVal = platoRadio.value.trim();
      var qty = 1;
      if (completeQtyInput) {
        qty = parseInt(completeQtyInput.value, 10) || 1;
        if (qty < 1) qty = 1;
        if (qty > 99) qty = 99;
      }
      var div = document.createElement("div");
      div.className = "diary-complete-item";
      div.innerHTML =
        "Almuerzo completo: Sopa = " +
        escapeHtml(sopaVal) +
        ", Plato fuerte = " +
        escapeHtml(platoVal) +
        ' — Cantidad: <input type="number" min="1" value="' +
        String(qty) +
        '" class="diary-qty-input diary-complete-qty" data-sopa="' +
        escapeHtml(sopaVal) +
        '" data-plato="' +
        escapeHtml(platoVal) +
        '" />';
      completeListEl.appendChild(div);
      if (completeQtyInput) completeQtyInput.value = "1";
      sopaRadio.checked = false;
      platoRadio.checked = false;
      updateCompleteSelectionVisibility();
      addDiaryCompleteListeners();
      updateDiaryCartTotal();
      updateDiaryCartResumen();
    };
  }
}

function sendDiaryOrderToWhatsApp() {
  var nameInput = document.getElementById("diary-customer-name");
  var paraLlevar = document.getElementById("diary-para-llevar");
  var paraReservar = document.getElementById("diary-dine-in");
  var name = nameInput && nameInput.value.trim();
  if (!name) {
    alert("Por favor ingresa tu nombre para enviar el pedido.");
    return;
  }
  var lines = ["Hola! Soy " + name + ". Quiero el menú del día:"];
  var total = 0;
  document
    .querySelectorAll("#diary-cart-complete-list .diary-complete-item")
    .forEach(function (div) {
      var input = div.querySelector(".diary-complete-qty");
      var qty = input ? parseInt(input.value, 10) || 0 : 0;
      if (qty <= 0) return;
      var sopa = input.getAttribute("data-sopa") || "";
      var plato = input.getAttribute("data-plato") || "";
      lines.push(
        "Almuerzo completo: Sopa = " +
          sopa +
          ", Plato fuerte = " +
          plato +
          " x " +
          qty +
          " = $" +
          (qty * getDiaryMenuPrices().completo).toFixed(2),
      );
      total += qty * getDiaryMenuPrices().completo;
    });
  document.querySelectorAll(".diary-single-soup-wrap").forEach(function (wrap) {
    var input = wrap.querySelector(".diary-single-soup-qty");
    if (!input) return;
    var qty = parseInt(input.value, 10) || 0;
    if (qty <= 0) return;
    var item = input.getAttribute("data-item") || "Sopa";
    lines.push(
      "Solo sopa: " +
        item +
        " x " +
        qty +
        " = $" +
        (qty * getDiaryMenuPrices().soloSopa).toFixed(2),
    );
    total += qty * getDiaryMenuPrices().soloSopa;
  });
  document
    .querySelectorAll(".diary-single-main-wrap")
    .forEach(function (wrap) {
      var input = wrap.querySelector(".diary-single-main-qty");
      if (!input) return;
      var qty = parseInt(input.value, 10) || 0;
      if (qty <= 0) return;
      var item = input.getAttribute("data-item") || "Plato fuerte";
      lines.push(
        "Solo plato fuerte: " +
          item +
          " x " +
          qty +
          " = $" +
          (qty * getDiaryMenuPrices().soloPlatoFuerte).toFixed(2),
      );
      total += qty * getDiaryMenuPrices().soloPlatoFuerte;
    });
  if (total <= 0) {
    alert(
      "Agrega al menos un almuerzo completo o indica cantidades en solo sopa o solo plato fuerte.",
    );
    return;
  }
  lines.push("Total: $" + total.toFixed(2));
  if (paraLlevar && paraLlevar.checked) lines.push("Para llevar: Sí");
  if (paraReservar && paraReservar.checked)
    lines.push("Para reservar en el local: Sí");
  var message = lines.join("\n");
  var url =
    "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

function initDiaryMenu() {
  const section = document.getElementById("diary-menu");
  if (!section) return;

  const container = section.querySelector("#diary-menu-content");
  if (!container) return;

  const apiUrl = getDiaryMenuApiUrl();
  if (!apiUrl) {
    renderError(
      container,
      "Configure the Web App URL in js/daily-menu.js (diaryMenuApiUrl). See docs/daily-menu-apps-script.js.",
    );
    return;
  }

  renderLoading(container);

  function onSuccess(data) {
    if (data.error) {
      if (
        data.error === "No menu for this day" ||
        data.error.indexOf("No menu") !== -1
      ) {
        renderError(container, "No hay menú para hoy.");
        return;
      }
      renderError(container, data.error);
      return;
    }
    if (!data.headers || !data.row) {
      renderError(container, "Respuesta del servidor inválida.");
      return;
    }
    lastDiaryMenuData = { headers: data.headers, row: data.row };
    var formattedDate = formatDisplayDate(new Date());
    container.innerHTML = buildDailyMenuHtml(
      data.headers,
      data.row,
      formattedDate,
    );
    bindDiaryCartButton();
  }

  function onFail(msg, debugUrl) {
    var debug = debugUrl
      ? ' <a href="' +
        escapeHtml(debugUrl) +
        '" target="_blank" rel="noopener">Abre esta URL en una nueva pestaña</a> para ver la respuesta del servidor.'
      : "";
    renderError(container, msg + debug);
  }

  var jsonpUrl =
    apiUrl + (apiUrl.indexOf("?") >= 0 ? "&" : "?") + "callback=diaryMenuCb";
  var timeoutMs = 8000;
  var timeoutId = setTimeout(function () {
    if (window.diaryMenuCb) {
      window.diaryMenuCb = null;
      onFail("Tiempo de espera agotado.", jsonpUrl);
    }
  }, timeoutMs);

  window.diaryMenuCb = function (data) {
    clearTimeout(timeoutId);
    window.diaryMenuCb = null;
    var s = document.getElementById("diary-menu-jsonp");
    if (s) s.remove();
    onSuccess(data);
  };

  var script = document.createElement("script");
  script.id = "diary-menu-jsonp";
  script.src = jsonpUrl;
  script.onerror = function () {
    clearTimeout(timeoutId);
    window.diaryMenuCb = null;
    script.remove();
    onFail(
      "Error al cargar el menú. Asegúrate de que la URL termine con /exec, la aplicación esté desplegada como \"Cualquiera\", y que Apps Script soporte JSONP (callback).",
      jsonpUrl,
    );
  };
  document.body.appendChild(script);
}

function bindDiaryCartButton() {
  var section = document.getElementById("diary-menu");
  if (!section) return;
  section.removeEventListener("click", onDiaryMenuSectionClick);
  section.addEventListener("click", onDiaryMenuSectionClick);
}

function onDiaryMenuSectionClick(e) {
  if (e.target.id !== "diary-build-cart-btn") return;
  if (!lastDiaryMenuData) return;
  fillDiaryCartModalWithForm();
  showDiaryCartView();
}

function bindDiaryCartModal() {
  var closeBtn = document.getElementById("close-diary-cart-btn");
  var backLabel = document.querySelector(".diary-cart-back-label");
  var sendBtn = document.getElementById("diary-send-order");
  if (closeBtn) closeBtn.addEventListener("click", showDiaryMenuView);
  if (backLabel) {
    backLabel.addEventListener("click", showDiaryMenuView);
    backLabel.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showDiaryMenuView();
      }
    });
  }
  if (sendBtn) sendBtn.addEventListener("click", sendDiaryOrderToWhatsApp);
  bindDiaryQtyButtons();
  bindDiaryRemoveItemButtons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    bindDiaryCartModal();
    initDiaryMenu();
  });
} else {
  bindDiaryCartModal();
  initDiaryMenu();
}
