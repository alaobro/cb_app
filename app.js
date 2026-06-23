const CATEGORIES = ["Beef", "Lamb", "Poultry", "Seafood", "Other Frozen Product", "Other"];
const STATUSES = ["Unpaid", "Paid", "Part Paid", "Flagged", "Void"];
const TAX_TYPES = ["GST-Free", "GST Included", "GST Excluded", "No Tax / Out of Scope"];
const UNITS = ["kg", "each", "bag", "box"];
const REPORT_TYPES = [
  "Category Spend",
  "Supplier Spend",
  "Product Spend",
  "Unpaid Invoices",
  "Credit / Adjustment",
  "Invoice List",
];

const STORAGE_KEY = "cbapp.supplierInvoices.v1";

const seedSuppliers = [
  { id: uid(), name: "HT Poultry", categories: ["Poultry"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Poultry Plus", categories: ["Poultry"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Poultry N More", categories: ["Poultry"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "G&B Gathercole", categories: ["Beef", "Lamb"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Colonial Meat", categories: ["Beef", "Lamb"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "PJ Meat", categories: ["Beef", "Lamb"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Seafood Link", categories: ["Seafood"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Aquabest", categories: ["Seafood"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Longs Packaging", categories: ["Other"], taxType: "GST-Free", contact: "", notes: "" },
  { id: uid(), name: "Fung Lea Food", categories: ["Other Frozen Product"], taxType: "GST-Free", contact: "", notes: "" },
];

let state = loadState();
let batchRows = Array.from({ length: 12 }, () => createBatchRow());
let activeDetail = null;
let activeSupplierId = null;
let registerPage = 1;
let registerSort = { field: "date", direction: "desc" };

const el = {
  navItems: document.querySelectorAll(".nav-item"),
  pageTitle: document.querySelector("#pageTitle"),
  batchBody: document.querySelector("#batchBody"),
  addRowsBtn: document.querySelector("#addRowsBtn"),
  saveBatchBtn: document.querySelector("#saveBatchBtn"),
  unsavedCount: document.querySelector("#unsavedCount"),
  batchTotal: document.querySelector("#batchTotal"),
  batchPayable: document.querySelector("#batchPayable"),
  attentionCount: document.querySelector("#attentionCount"),
  registerBody: document.querySelector("#registerBody"),
  registerSearch: document.querySelector("#registerSearch"),
  registerStatus: document.querySelector("#registerStatus"),
  registerCategory: document.querySelector("#registerCategory"),
  registerFrom: document.querySelector("#registerFrom"),
  registerTo: document.querySelector("#registerTo"),
  registerPageSize: document.querySelector("#registerPageSize"),
  registerPageInfo: document.querySelector("#registerPageInfo"),
  registerPrevPage: document.querySelector("#registerPrevPage"),
  registerNextPage: document.querySelector("#registerNextPage"),
  reportType: document.querySelector("#reportType"),
  reportFrom: document.querySelector("#reportFrom"),
  reportTo: document.querySelector("#reportTo"),
  reportSupplier: document.querySelector("#reportSupplier"),
  reportCategory: document.querySelector("#reportCategory"),
  reportStatus: document.querySelector("#reportStatus"),
  reportChartType: document.querySelector("#reportChartType"),
  generateReportBtn: document.querySelector("#generateReportBtn"),
  reportOutput: document.querySelector("#reportOutput"),
  supplierBody: document.querySelector("#supplierBody"),
  addSupplierBtn: document.querySelector("#addSupplierBtn"),
  defaultStatus: document.querySelector("#defaultStatus"),
  defaultTax: document.querySelector("#defaultTax"),
  defaultUnit: document.querySelector("#defaultUnit"),
  saveSettingsBtn: document.querySelector("#saveSettingsBtn"),
  detailDialog: document.querySelector("#detailDialog"),
  detailTitle: document.querySelector("#detailTitle"),
  detailSupplier: document.querySelector("#detailSupplier"),
  detailNumber: document.querySelector("#detailNumber"),
  detailAmount: document.querySelector("#detailAmount"),
  detailPayable: document.querySelector("#detailPayable"),
  lineItemBody: document.querySelector("#lineItemBody"),
  addLineItemBtn: document.querySelector("#addLineItemBtn"),
  saveDetailBtn: document.querySelector("#saveDetailBtn"),
  supplierDialog: document.querySelector("#supplierDialog"),
  supplierDialogTitle: document.querySelector("#supplierDialogTitle"),
  supplierNameInput: document.querySelector("#supplierNameInput"),
  supplierCategoryInput: document.querySelector("#supplierCategoryInput"),
  supplierTaxInput: document.querySelector("#supplierTaxInput"),
  supplierContactInput: document.querySelector("#supplierContactInput"),
  supplierNotesInput: document.querySelector("#supplierNotesInput"),
  saveSupplierBtn: document.querySelector("#saveSupplierBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  setDefaultDates();
  fillStaticSelects();
  bindEvents();
  renderAll();
}

function bindEvents() {
  el.navItems.forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  el.addRowsBtn.addEventListener("click", () => {
    batchRows.push(...Array.from({ length: 5 }, () => createBatchRow()));
    renderBatch();
  });

  el.saveBatchBtn.addEventListener("click", saveBatch);
  [el.registerSearch, el.registerStatus, el.registerCategory, el.registerFrom, el.registerTo, el.registerPageSize].forEach((input) => {
    input.addEventListener("input", () => {
      registerPage = 1;
      renderRegister();
    });
  });
  el.registerPrevPage.addEventListener("click", () => {
    registerPage = Math.max(1, registerPage - 1);
    renderRegister();
  });
  el.registerNextPage.addEventListener("click", () => {
    registerPage += 1;
    renderRegister();
  });
  document.querySelectorAll(".sort-header").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.sort;
      if (registerSort.field === field) {
        registerSort.direction = registerSort.direction === "asc" ? "desc" : "asc";
      } else {
        registerSort = { field, direction: field === "date" ? "desc" : "asc" };
      }
      registerPage = 1;
      renderRegister();
    });
  });
  el.generateReportBtn.addEventListener("click", renderReport);
  el.addSupplierBtn.addEventListener("click", () => openSupplierDialog());
  el.saveSupplierBtn.addEventListener("click", saveSupplierFromDialog);
  el.saveSettingsBtn.addEventListener("click", saveSettings);
  el.addLineItemBtn.addEventListener("click", addLineItemToDetail);
  el.saveDetailBtn.addEventListener("click", saveDetail);
  el.exportDataBtn.addEventListener("click", exportData);
  el.importDataInput.addEventListener("change", importData);
}

function fillStaticSelects() {
  fillSelect(el.registerStatus, ["All Statuses", ...STATUSES]);
  fillSelect(el.registerCategory, ["All Categories", ...CATEGORIES]);
  fillSelect(el.registerPageSize, ["20 per page", "50 per page", "100 per page"], "50 per page");
  fillSelect(el.reportType, REPORT_TYPES);
  fillSelect(el.reportCategory, ["All Categories", ...CATEGORIES]);
  fillSelect(el.reportStatus, ["All Statuses", ...STATUSES]);
  fillSelect(el.reportChartType, ["Table Only", "Bar Chart", "Pie Chart", "Bar + Pie"], "Bar Chart");
  fillSelect(el.defaultStatus, STATUSES, state.settings.defaultStatus);
  fillSelect(el.defaultTax, TAX_TYPES, state.settings.defaultTax);
  fillSelect(el.defaultUnit, UNITS, state.settings.defaultUnit);
  fillSelect(el.supplierTaxInput, TAX_TYPES);
  fillSelect(el.supplierCategoryInput, CATEGORIES);
}

function renderAll() {
  renderBatch();
  renderRegisterFilters();
  renderRegister();
  renderSupplierList();
  renderReport();
}

function setTab(tab) {
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tab));
  el.navItems.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  el.pageTitle.textContent = document.querySelector(`[data-tab="${tab}"]`).textContent;
}

function renderBatch() {
  el.batchBody.innerHTML = "";
  const duplicateMap = getBatchDuplicateMap();
  batchRows.forEach((row, index) => {
    const duplicateWarning = getDuplicateWarning(row, duplicateMap);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="date" data-field="date" value="${escapeAttr(row.date)}"></td>
      <td>
        <input list="supplierOptions" data-field="supplierName" value="${escapeAttr(row.supplierName)}" placeholder="Type supplier">
      </td>
      <td><input data-field="invoiceNumber" value="${escapeAttr(row.invoiceNumber)}"></td>
      <td><input type="number" min="0" step="0.01" data-field="amount" value="${escapeAttr(row.amount)}"></td>
      <td><input type="number" min="0" step="0.01" data-field="payableAmount" value="${escapeAttr(row.payableAmount)}"></td>
      <td>${selectHtml("category", CATEGORIES, row.category)}</td>
      <td>${selectHtml("status", STATUSES, row.status)}</td>
      <td>${selectHtml("taxType", TAX_TYPES, row.taxType)}</td>
      <td><textarea rows="1" data-field="comment">${escapeHtml(row.comment)}</textarea></td>
      <td>
        <button class="mini-button" data-action="detail">Detail</button>
        <div class="row-warning" data-warning>${escapeHtml(duplicateWarning)}</div>
      </td>
    `;
    tr.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", () => updateBatchRow(index, input.dataset.field, input.value));
      input.addEventListener("change", () => updateBatchRow(index, input.dataset.field, input.value));
    });
    tr.querySelector('[data-action="detail"]').addEventListener("click", () => openDetail("batch", row.id));
    el.batchBody.appendChild(tr);
  });
  ensureSupplierDatalist();
  validateBatchDisplay();
  updateBatchSummary();
}

function updateBatchRow(index, field, value) {
  const row = batchRows[index];
  row[field] = value;
  if (field === "supplierName") {
    const supplier = findSupplier(value);
    if (supplier) {
      row.supplierId = supplier.id;
      if (!row.category && supplier.categories.length === 1) row.category = supplier.categories[0];
      if (supplier.categories.length > 1 && !row.category) row.category = supplier.categories[0];
      row.taxType = supplier.taxType || state.settings.defaultTax;
      renderBatch();
      return;
    }
  }
  if (field === "amount" && !row.payableEdited) {
    row.payableAmount = value;
    const tr = el.batchBody.rows[index];
    const payableInput = tr?.querySelector('[data-field="payableAmount"]');
    if (payableInput) payableInput.value = value;
  }
  if (field === "payableAmount") {
    row.payableEdited = true;
  }
  updateBatchSummary();
}

function validateBatchDisplay() {
  const duplicateMap = getBatchDuplicateMap();
  [...el.batchBody.rows].forEach((tr, index) => {
    const row = batchRows[index];
    const active = isActiveBatchRow(row);
    const missing = active ? getMissingFields(row) : [];
    const duplicateWarning = active ? getDuplicateWarning(row, duplicateMap) : "";
    tr.classList.toggle("duplicate-row", Boolean(duplicateWarning));
    tr.querySelectorAll("[data-field]").forEach((input) => input.classList.remove("invalid"));
    missing.forEach((field) => {
      const input = tr.querySelector(`[data-field="${field}"]`);
      if (input) input.classList.add("invalid");
    });
    if (duplicateWarning) {
      ["supplierName", "invoiceNumber"].forEach((field) => tr.querySelector(`[data-field="${field}"]`)?.classList.add("invalid"));
      tr.title = duplicateWarning;
    } else {
      tr.removeAttribute("title");
    }
    const warning = tr.querySelector("[data-warning]");
    if (warning) warning.textContent = duplicateWarning;
  });
}

function updateBatchSummary() {
  const activeRows = batchRows.filter(isActiveBatchRow);
  const amountTotal = activeRows.reduce((sum, row) => sum + number(row.amount), 0);
  const payableTotal = activeRows.reduce((sum, row) => sum + number(row.payableAmount || row.amount), 0);
  const duplicateMap = getBatchDuplicateMap();
  const attention = activeRows.filter((row) => getMissingFields(row).length > 0 || getDuplicateWarning(row, duplicateMap)).length;
  el.unsavedCount.textContent = activeRows.length;
  el.batchTotal.textContent = money(amountTotal);
  el.batchPayable.textContent = money(payableTotal);
  el.attentionCount.textContent = attention;
  validateBatchDisplay();
}

function saveBatch() {
  const activeRows = batchRows.filter(isActiveBatchRow);
  const duplicateMap = getBatchDuplicateMap();
  const validRows = activeRows.filter((row) => getMissingFields(row).length === 0 && !getDuplicateWarning(row, duplicateMap));
  const invalidRows = activeRows.length - validRows.length;
  if (!validRows.length) {
    showToast("No complete invoice rows to save.");
    updateBatchSummary();
    return;
  }

  const invoices = validRows.map((row) => normalizeInvoice(row));
  state.invoices.unshift(...invoices);
  batchRows = batchRows.filter((row) => !validRows.includes(row));
  while (batchRows.length < 12) batchRows.push(createBatchRow());
  saveState();
  renderAll();
  showToast(`Saved ${validRows.length} invoice${validRows.length === 1 ? "" : "s"}${invalidRows ? `; ${invalidRows} row${invalidRows === 1 ? "" : "s"} need attention` : ""}.`);
}

function normalizeInvoice(row) {
  const supplier = findSupplier(row.supplierName);
  const amount = number(row.amount);
  const payableAmount = row.payableAmount === "" ? amount : number(row.payableAmount);
  const lineItems = row.lineItems.length
    ? row.lineItems
    : [{ id: uid(), category: row.category, product: "", qty: "", unit: state.settings.defaultUnit, unitPrice: "", amount }];
  return {
    id: uid(),
    date: row.date,
    supplierId: supplier?.id || "",
    supplierName: row.supplierName.trim(),
    invoiceNumber: row.invoiceNumber.trim(),
    amount,
    payableAmount,
    category: row.category,
    status: row.status || state.settings.defaultStatus,
    taxType: row.taxType || state.settings.defaultTax,
    comment: row.comment.trim(),
    lineItems,
    paidDate: (row.status === "Paid" ? today() : ""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function renderRegisterFilters() {
  fillSelect(el.reportSupplier, ["All Suppliers", ...state.suppliers.map((supplier) => supplier.name)]);
}

function renderRegister() {
  const invoices = sortInvoices(filterInvoices({
    search: el.registerSearch.value,
    status: el.registerStatus.value,
    category: el.registerCategory.value,
    from: el.registerFrom.value,
    to: el.registerTo.value,
  }));
  const pageSize = getRegisterPageSize();
  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
  registerPage = Math.min(Math.max(1, registerPage), totalPages);
  const start = (registerPage - 1) * pageSize;
  const pageInvoices = invoices.slice(start, start + pageSize);
  el.registerBody.innerHTML = "";
  pageInvoices.forEach((invoice) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(invoice.date)}</td>
      <td>${escapeHtml(invoice.supplierName)}</td>
      <td>${escapeHtml(invoice.invoiceNumber)}</td>
      <td>${money(invoice.amount)}</td>
      <td>${money(invoice.payableAmount)}</td>
      <td>${escapeHtml(invoice.category)}</td>
      <td>${statusPill(invoice.status)}</td>
      <td>${escapeHtml(invoice.taxType)}</td>
      <td>${escapeHtml(invoice.comment)}</td>
      <td>
        <div class="row-actions">
          <button class="mini-button" data-action="payment-toggle">${invoice.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}</button>
          <button class="mini-button" data-action="flag">Flag</button>
          <button class="mini-button" data-action="detail">Detail</button>
          <button class="mini-button" data-action="delete">Delete</button>
        </div>
      </td>
    `;
    tr.querySelector('[data-action="payment-toggle"]').addEventListener("click", () => togglePaid(invoice.id));
    tr.querySelector('[data-action="flag"]').addEventListener("click", () => setInvoiceStatus(invoice.id, "Flagged"));
    tr.querySelector('[data-action="detail"]').addEventListener("click", () => openDetail("saved", invoice.id));
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => deleteInvoice(invoice.id));
    el.registerBody.appendChild(tr);
  });
  const from = invoices.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, invoices.length);
  el.registerPageInfo.textContent = `${from}-${to} of ${invoices.length} invoices`;
  el.registerPrevPage.disabled = registerPage <= 1;
  el.registerNextPage.disabled = registerPage >= totalPages;
  renderRegisterSortHeaders();
}

function filterInvoices(filters) {
  return state.invoices.filter((invoice) => {
    const haystack = `${invoice.supplierName} ${invoice.invoiceNumber} ${invoice.comment}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
    if (filters.status && filters.status !== "All Statuses" && invoice.status !== filters.status) return false;
    if (filters.category && filters.category !== "All Categories" && invoice.category !== filters.category) return false;
    if (filters.supplier && filters.supplier !== "All Suppliers" && invoice.supplierName !== filters.supplier) return false;
    if (filters.from && invoice.date < filters.from) return false;
    if (filters.to && invoice.date > filters.to) return false;
    return true;
  });
}

function getRegisterPageSize() {
  const parsed = Number.parseInt(el.registerPageSize.value, 10);
  return [20, 50, 100].includes(parsed) ? parsed : 50;
}

function sortInvoices(invoices) {
  const { field, direction } = registerSort;
  const sign = direction === "asc" ? 1 : -1;
  return invoices.slice().sort((a, b) => {
    let left = a[field] ?? "";
    let right = b[field] ?? "";
    if (field === "amount" || field === "payableAmount") {
      left = number(left);
      right = number(right);
      return (left - right) * sign;
    }
    return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" }) * sign;
  });
}

function renderRegisterSortHeaders() {
  document.querySelectorAll(".sort-header").forEach((button) => {
    const active = button.dataset.sort === registerSort.field;
    const base = button.dataset.label || button.textContent.replace(/[▲▼]/g, "").trim();
    button.dataset.label = base;
    button.classList.toggle("active", active);
    button.textContent = active ? `${base} ${registerSort.direction === "asc" ? "▲" : "▼"}` : base;
  });
}

function togglePaid(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  if (invoice.status === "Paid") {
    invoice.status = "Unpaid";
    invoice.paidDate = "";
  } else {
    invoice.status = "Paid";
    invoice.paidDate = today();
  }
  invoice.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
  showToast(invoice.status === "Paid" ? "Invoice marked as paid." : "Invoice marked as unpaid.");
}

function setInvoiceStatus(id, status) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  invoice.status = status;
  invoice.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
  showToast(`Invoice marked ${status}.`);
}

function deleteInvoice(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  const ok = window.confirm(`Delete invoice ${invoice.invoiceNumber} from ${invoice.supplierName}?`);
  if (!ok) return;
  state.invoices = state.invoices.filter((item) => item.id !== id);
  saveState();
  renderAll();
  showToast("Invoice deleted.");
}

function renderReport() {
  const filters = {
    from: el.reportFrom.value,
    to: el.reportTo.value,
    supplier: el.reportSupplier.value,
    category: el.reportCategory.value,
    status: el.reportStatus.value,
  };
  const invoices = filterInvoices(filters);
  const totalAmount = invoices.reduce((sum, invoice) => sum + number(invoice.amount), 0);
  const totalPayable = invoices.reduce((sum, invoice) => sum + number(invoice.payableAmount), 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status !== "Paid" && invoice.status !== "Void")
    .reduce((sum, invoice) => sum + number(invoice.payableAmount), 0);

  let html = `
    <div class="metric-grid">
      ${metric("Invoices", invoices.length)}
      ${metric("Invoice Amount", money(totalAmount))}
      ${metric("Payable Amount", money(totalPayable))}
      ${metric("Outstanding", money(outstanding))}
    </div>
  `;

  const type = el.reportType.value;
  let chartRows = [];
  if (type === "Category Spend") {
    chartRows = groupBy(invoices, "category");
    html += chartPanel(chartRows, "Category Spend");
    html += reportTable(["Category", "Invoices", "Invoice Amount", "Payable Amount"], chartRows);
  } else if (type === "Supplier Spend") {
    chartRows = groupBy(invoices, "supplierName");
    html += chartPanel(chartRows, "Supplier Spend");
    html += reportTable(["Supplier", "Invoices", "Invoice Amount", "Payable Amount"], chartRows);
  } else if (type === "Product Spend") {
    chartRows = productRows(invoices).map((row) => ({ label: row.product, count: row.qty, amount: row.amount, payable: row.amount }));
    html += chartPanel(chartRows, "Product Spend");
    html += productReport(invoices);
  } else if (type === "Unpaid Invoices") {
    const rows = invoices.filter((invoice) => invoice.status !== "Paid" && invoice.status !== "Void");
    html += chartPanel(groupBy(rows, "status"), "Unpaid Status Breakdown");
    html += invoiceListTable(rows);
  } else if (type === "Credit / Adjustment") {
    const rows = invoices.filter((invoice) => Math.abs(number(invoice.amount) - number(invoice.payableAmount)) > 0.001 || invoice.comment);
    html += chartPanel(groupBy(rows, "supplierName"), "Adjustment by Supplier");
    html += invoiceListTable(rows);
  } else {
    html += chartPanel(groupBy(invoices, "status"), "Status Breakdown");
    html += invoiceListTable(invoices);
  }
  el.reportOutput.innerHTML = html;
}

function groupBy(invoices, field) {
  const grouped = new Map();
  invoices.forEach((invoice) => {
    const key = invoice[field] || "Unknown";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(invoice);
  });
  return [...grouped.entries()].map(([label, items]) => ({
    label,
    count: items.length,
    amount: items.reduce((sum, invoice) => sum + number(invoice.amount), 0),
    payable: items.reduce((sum, invoice) => sum + number(invoice.payableAmount), 0),
  }));
}

function reportTable(headers, rows) {
  const body = rows
    .sort((a, b) => b.payable - a.payable)
    .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${row.count}</td><td>${money(row.amount)}</td><td>${money(row.payable)}</td></tr>`)
    .join("");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${body || `<tr><td colspan="${headers.length}">No data for this report.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function productRows(invoices) {
  const products = new Map();
  invoices.forEach((invoice) => {
    invoice.lineItems.forEach((line) => {
      if (!line.product) return;
      const key = `${line.category}|${line.product}|${line.unit || ""}`;
      const existing = products.get(key) || { category: line.category, product: line.product, qty: 0, unit: line.unit || "", amount: 0 };
      existing.qty += number(line.qty);
      existing.amount += number(line.amount);
      products.set(key, existing);
    });
  });
  return [...products.values()].sort((a, b) => b.amount - a.amount);
}

function productReport(invoices) {
  const body = productRows(invoices)
    .sort((a, b) => b.amount - a.amount)
    .map((row) => `<tr><td>${escapeHtml(row.product)}</td><td>${escapeHtml(row.category)}</td><td>${round(row.qty)}</td><td>${escapeHtml(row.unit)}</td><td>${money(row.amount)}</td></tr>`)
    .join("");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Product</th><th>Category</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead>
        <tbody>${body || `<tr><td colspan="5">No product line items recorded yet.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function chartPanel(rows, title) {
  const type = el.reportChartType.value;
  if (type === "Table Only") return "";
  const topRows = rows.filter((row) => number(row.payable) > 0).sort((a, b) => b.payable - a.payable).slice(0, 12);
  if (!topRows.length) return "";
  const charts = [];
  if (type === "Bar Chart" || type === "Bar + Pie") charts.push(barChart(topRows, title));
  if (type === "Pie Chart" || type === "Bar + Pie") charts.push(pieChart(topRows, title));
  return `<div class="chart-grid ${charts.length > 1 ? "two" : ""}">${charts.join("")}</div>`;
}

function barChart(rows, title) {
  const max = Math.max(...rows.map((row) => number(row.payable)), 1);
  return `
    <section class="chart-card">
      <div class="chart-title">${escapeHtml(title)} - Bar Chart</div>
      <div class="bar-chart">
        ${rows.map((row) => `
          <div class="bar-row">
            <span class="bar-label" title="${escapeAttr(row.label)}">${escapeHtml(row.label)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (number(row.payable) / max) * 100)}%"></div></div>
            <strong>${money(row.payable)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function pieChart(rows, title) {
  const total = rows.reduce((sum, row) => sum + number(row.payable), 0) || 1;
  let cursor = 0;
  const colors = ["#1f6f5b", "#c45f35", "#5f7c95", "#d39a2e", "#745b8f", "#44835c", "#9c4a55", "#4d6f3d", "#93784b", "#3f7d80", "#b77d89", "#6f6f6f"];
  const stops = rows.map((row, index) => {
    const start = cursor;
    cursor += (number(row.payable) / total) * 100;
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  });
  return `
    <section class="chart-card">
      <div class="chart-title">${escapeHtml(title)} - Pie Chart</div>
      <div class="pie-layout">
        <div class="pie-chart" style="background: conic-gradient(${stops.join(", ")})"></div>
        <div class="pie-legend">
          ${rows.map((row, index) => `
            <div class="legend-row">
              <span class="legend-swatch" style="background:${colors[index % colors.length]}"></span>
              <span class="legend-label" title="${escapeAttr(row.label)}">${escapeHtml(row.label)}</span>
              <strong>${Math.round((number(row.payable) / total) * 100)}%</strong>
              <span class="legend-value">${money(row.payable)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function invoiceListTable(invoices) {
  const body = invoices
    .map((invoice) => `
      <tr>
        <td>${formatDate(invoice.date)}</td>
        <td>${escapeHtml(invoice.supplierName)}</td>
        <td>${escapeHtml(invoice.invoiceNumber)}</td>
        <td>${escapeHtml(invoice.category)}</td>
        <td>${money(invoice.amount)}</td>
        <td>${money(invoice.payableAmount)}</td>
        <td>${statusPill(invoice.status)}</td>
        <td>${escapeHtml(invoice.comment)}</td>
      </tr>
    `)
    .join("");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Supplier</th><th>Inv Number</th><th>Category</th><th>Amount</th><th>Payable</th><th>Status</th><th>Comment</th></tr></thead>
        <tbody>${body || `<tr><td colspan="8">No invoices match this report.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderSupplierList() {
  el.supplierBody.innerHTML = "";
  state.suppliers
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((supplier) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(supplier.name)}</td>
        <td>${escapeHtml(supplier.categories.join(", "))}</td>
        <td>${escapeHtml(supplier.taxType)}</td>
        <td>${escapeHtml(supplier.contact || "")}</td>
        <td>${escapeHtml(supplier.notes || "")}</td>
        <td><button class="mini-button" data-action="edit">Edit</button></td>
      `;
      tr.querySelector("[data-action='edit']").addEventListener("click", () => openSupplierDialog(supplier.id));
      el.supplierBody.appendChild(tr);
    });
}

function openSupplierDialog(id = null) {
  activeSupplierId = id;
  const supplier = id ? state.suppliers.find((item) => item.id === id) : null;
  el.supplierDialogTitle.textContent = supplier ? "Edit Supplier" : "Add Supplier";
  el.supplierNameInput.value = supplier?.name || "";
  el.supplierTaxInput.value = supplier?.taxType || state.settings.defaultTax;
  el.supplierContactInput.value = supplier?.contact || "";
  el.supplierNotesInput.value = supplier?.notes || "";
  [...el.supplierCategoryInput.options].forEach((option) => {
    option.selected = supplier ? supplier.categories.includes(option.value) : false;
  });
  el.supplierDialog.showModal();
}

function saveSupplierFromDialog() {
  const name = el.supplierNameInput.value.trim();
  const categories = [...el.supplierCategoryInput.selectedOptions].map((option) => option.value);
  if (!name || !categories.length) {
    showToast("Supplier name and at least one category are required.");
    return;
  }
  const payload = {
    name,
    categories,
    taxType: el.supplierTaxInput.value,
    contact: el.supplierContactInput.value.trim(),
    notes: el.supplierNotesInput.value.trim(),
  };
  if (activeSupplierId) {
    const supplier = state.suppliers.find((item) => item.id === activeSupplierId);
    Object.assign(supplier, payload);
  } else {
    state.suppliers.push({ id: uid(), ...payload });
  }
  saveState();
  el.supplierDialog.close();
  renderAll();
  showToast("Supplier saved.");
}

function openDetail(source, id) {
  activeDetail = { source, id };
  const item = source === "batch" ? batchRows.find((row) => row.id === id) : state.invoices.find((invoice) => invoice.id === id);
  if (!item) return;
  el.detailTitle.textContent = `${item.supplierName || "New invoice"} ${item.invoiceNumber || ""}`.trim();
  el.detailSupplier.value = item.supplierName || "";
  el.detailNumber.value = item.invoiceNumber || "";
  el.detailAmount.value = money(number(item.amount));
  el.detailPayable.value = money(number(item.payableAmount || item.amount));
  if (!item.lineItems.length) {
    item.lineItems.push({ id: uid(), category: item.category || CATEGORIES[0], product: "", qty: "", unit: state.settings.defaultUnit, unitPrice: "", amount: item.amount || "" });
  }
  renderLineItems(item);
  el.detailDialog.showModal();
}

function renderLineItems(item) {
  el.lineItemBody.innerHTML = "";
  item.lineItems.forEach((line, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${selectHtml("category", CATEGORIES, line.category)}</td>
      <td><input data-field="product" value="${escapeAttr(line.product || "")}"></td>
      <td><input type="number" min="0" step="0.001" data-field="qty" value="${escapeAttr(line.qty)}"></td>
      <td>${selectHtml("unit", UNITS, line.unit || state.settings.defaultUnit)}</td>
      <td><input type="number" min="0" step="0.01" data-field="unitPrice" value="${escapeAttr(line.unitPrice)}"></td>
      <td><input type="number" min="0" step="0.01" data-field="amount" value="${escapeAttr(line.amount)}"></td>
      <td><button class="mini-button" type="button" data-action="remove">Remove</button></td>
    `;
    tr.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", () => {
        line[input.dataset.field] = input.value;
        if ((input.dataset.field === "qty" || input.dataset.field === "unitPrice") && line.qty !== "" && line.unitPrice !== "") {
          line.amount = round(number(line.qty) * number(line.unitPrice));
          renderLineItems(item);
        }
      });
      input.addEventListener("change", () => {
        line[input.dataset.field] = input.value;
      });
    });
    tr.querySelector("[data-action='remove']").addEventListener("click", () => {
      item.lineItems.splice(index, 1);
      renderLineItems(item);
    });
    el.lineItemBody.appendChild(tr);
  });
}

function addLineItemToDetail() {
  const item = getActiveDetailItem();
  if (!item) return;
  item.lineItems.push({ id: uid(), category: item.category || CATEGORIES[0], product: "", qty: "", unit: state.settings.defaultUnit, unitPrice: "", amount: "" });
  renderLineItems(item);
}

function saveDetail() {
  const item = getActiveDetailItem();
  if (!item) return;
  const lineTotal = item.lineItems.reduce((sum, line) => sum + number(line.amount), 0);
  if (lineTotal > 0) {
    item.amount = round(lineTotal);
    if (!item.payableEdited && activeDetail.source === "batch") item.payableAmount = item.amount;
    item.category = unique(item.lineItems.map((line) => line.category)).length > 1 ? "Mixed" : item.lineItems[0].category;
  }
  if (activeDetail.source === "saved") {
    item.updatedAt = new Date().toISOString();
    saveState();
  }
  el.detailDialog.close();
  renderAll();
  showToast("Invoice detail saved.");
}

function getActiveDetailItem() {
  if (!activeDetail) return null;
  return activeDetail.source === "batch"
    ? batchRows.find((row) => row.id === activeDetail.id)
    : state.invoices.find((invoice) => invoice.id === activeDetail.id);
}

function saveSettings() {
  state.settings.defaultStatus = el.defaultStatus.value;
  state.settings.defaultTax = el.defaultTax.value;
  state.settings.defaultUnit = el.defaultUnit.value;
  batchRows.forEach((row) => {
    if (!isActiveBatchRow(row)) {
      row.status = state.settings.defaultStatus;
      row.taxType = state.settings.defaultTax;
    }
  });
  saveState();
  renderBatch();
  showToast("Settings saved.");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cbapp-supplier-invoices-${today()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported.invoices) || !Array.isArray(imported.suppliers)) throw new Error("Invalid file");
      state = {
        invoices: imported.invoices,
        suppliers: imported.suppliers,
        settings: { ...defaultSettings(), ...(imported.settings || {}) },
      };
      saveState();
      renderAll();
      showToast("Data imported.");
    } catch {
      showToast("Could not import this data file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function createBatchRow() {
  return {
    id: uid(),
    date: today(),
    supplierId: "",
    supplierName: "",
    invoiceNumber: "",
    amount: "",
    payableAmount: "",
    payableEdited: false,
    category: "",
    status: state?.settings?.defaultStatus || "Unpaid",
    taxType: state?.settings?.defaultTax || "GST-Free",
    comment: "",
    lineItems: [],
  };
}

function getMissingFields(row) {
  const missing = [];
  if (!row.date) missing.push("date");
  if (!row.supplierName.trim()) missing.push("supplierName");
  if (!row.invoiceNumber.trim()) missing.push("invoiceNumber");
  if (row.amount === "" || number(row.amount) <= 0) missing.push("amount");
  if (!row.category) missing.push("category");
  return missing;
}

function getBatchDuplicateMap() {
  const map = new Map();
  batchRows.filter(isActiveBatchRow).forEach((row) => {
    const key = duplicateKey(row);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

function getDuplicateWarning(row, batchDuplicateMap) {
  const key = duplicateKey(row);
  if (!key) return "";
  const savedMatch = state.invoices.find((invoice) => duplicateKey(invoice) === key);
  if (savedMatch) {
    return `Duplicate: already in register (${savedMatch.status}, ${formatDate(savedMatch.date)}, ${money(savedMatch.payableAmount)})`;
  }
  if ((batchDuplicateMap.get(key) || 0) > 1) {
    return "Duplicate: repeated in this batch";
  }
  return "";
}

function duplicateKey(item) {
  const supplier = (item.supplierName || "").trim().toLowerCase();
  const invoiceNumber = (item.invoiceNumber || "").trim().toLowerCase();
  if (!supplier || !invoiceNumber) return "";
  return `${supplier}::${invoiceNumber}`;
}

function isActiveBatchRow(row) {
  return Boolean(row.supplierName || row.invoiceNumber || row.amount || row.payableAmount || row.category || row.comment || row.lineItems.length);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        invoices: parsed.invoices || [],
        suppliers: parsed.suppliers?.length ? parsed.suppliers : seedSuppliers,
        settings: { ...defaultSettings(), ...(parsed.settings || {}) },
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { invoices: [], suppliers: seedSuppliers, settings: defaultSettings() };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultSettings() {
  return { defaultStatus: "Unpaid", defaultTax: "GST-Free", defaultUnit: "kg" };
}

function setDefaultDates() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  el.reportFrom.value = toInputDate(first);
  el.reportTo.value = today();
}

function ensureSupplierDatalist() {
  let datalist = document.querySelector("#supplierOptions");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "supplierOptions";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = state.suppliers.map((supplier) => `<option value="${escapeAttr(supplier.name)}"></option>`).join("");
}

function fillSelect(select, options, selected = "") {
  select.innerHTML = options.map((option) => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`).join("");
  if (selected) select.value = selected;
}

function selectHtml(field, options, selected) {
  const list = selected && !options.includes(selected) ? [selected, ...options] : options;
  return `<select data-field="${field}">${list.map((option) => `<option value="${escapeAttr(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
}

function findSupplier(name) {
  const clean = name.trim().toLowerCase();
  return state.suppliers.find((supplier) => supplier.name.toLowerCase() === clean);
}

function metric(label, value) {
  return `<div class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function statusPill(status) {
  const cls = `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  return `<span class="status-pill ${cls}">${escapeHtml(status)}</span>`;
}

function money(value) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(number(value));
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function today() {
  return toInputDate(new Date());
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value) {
  return Math.round(number(value) * 1000) / 1000;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 2600);
}
