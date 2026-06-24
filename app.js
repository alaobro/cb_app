const DEFAULT_CATEGORIES = ["Beef", "Lamb", "Poultry", "Seafood", "Other Frozen Product", "Other"];
const STATUSES = ["Unpaid", "Paid", "Part Paid", "Flagged", "Void"];
const CUSTOMER_STATUSES = ["Draft", "Sent", "Unpaid", "Paid", "Part Paid", "Void"];
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
const SALES_REPORT_TYPES = [
  "Sales Summary",
  "Customer Sales",
  "Category Sales",
  "Product Sales",
  "Unit / Weight",
  "Unpaid / Overdue",
  "All Sales Invoices",
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

const seedProducts = [
  { id: uid(), name: "Beef Mince", category: "Beef", unit: "kg", defaultPrice: 12.5, taxType: "GST-Free" },
  { id: uid(), name: "Topside", category: "Beef", unit: "kg", defaultPrice: 14.5, taxType: "GST-Free" },
  { id: uid(), name: "Lamb Leg", category: "Lamb", unit: "kg", defaultPrice: 16.5, taxType: "GST-Free" },
  { id: uid(), name: "Chicken Breast", category: "Poultry", unit: "kg", defaultPrice: 10.5, taxType: "GST-Free" },
  { id: uid(), name: "Chicken Thigh", category: "Poultry", unit: "kg", defaultPrice: 8.5, taxType: "GST-Free" },
];

let state = loadState();
let batchRows = Array.from({ length: 12 }, () => createBatchRow());
let activeDetail = null;
let activeSupplierId = null;
let activeCustomerId = null;
let activeProductId = null;
let activeCustomerInvoiceId = null;
let customerInvoiceDraft = null;
let customerProductDraftIds = [];
let customerProductDraftPrices = {};
let pendingSupplierRowIndex = null;
let pendingCustomerInvoiceAdd = false;
let registerPage = 1;
let registerSort = { field: "date", direction: "desc" };
let openCategoryPickerRowId = null;

const el = {
  workspaceSwitchItems: document.querySelectorAll(".module-nav-item"),
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
  newCategoryInput: document.querySelector("#newCategoryInput"),
  addCategoryBtn: document.querySelector("#addCategoryBtn"),
  supplierTaxInput: document.querySelector("#supplierTaxInput"),
  supplierContactInput: document.querySelector("#supplierContactInput"),
  supplierNotesInput: document.querySelector("#supplierNotesInput"),
  saveSupplierBtn: document.querySelector("#saveSupplierBtn"),
  customerBody: document.querySelector("#customerBody"),
  addCustomerBtn: document.querySelector("#addCustomerBtn"),
  customerDialog: document.querySelector("#customerDialog"),
  customerDialogTitle: document.querySelector("#customerDialogTitle"),
  customerNameInput: document.querySelector("#customerNameInput"),
  customerContactInput: document.querySelector("#customerContactInput"),
  customerEmailInput: document.querySelector("#customerEmailInput"),
  customerPhoneInput: document.querySelector("#customerPhoneInput"),
  customerAddressInput: document.querySelector("#customerAddressInput"),
  customerTermsInput: document.querySelector("#customerTermsInput"),
  customerProductCategoryInput: document.querySelector("#customerProductCategoryInput"),
  customerProductSearchInput: document.querySelector("#customerProductSearchInput"),
  customerProductPicker: document.querySelector("#customerProductPicker"),
  customerProductInput: document.querySelector("#customerProductInput"),
  customerNotesInput: document.querySelector("#customerNotesInput"),
  cancelCustomerDialogBtn: document.querySelector("#cancelCustomerDialogBtn"),
  saveCustomerBtn: document.querySelector("#saveCustomerBtn"),
  productBody: document.querySelector("#productBody"),
  addProductBtn: document.querySelector("#addProductBtn"),
  productDialog: document.querySelector("#productDialog"),
  productDialogTitle: document.querySelector("#productDialogTitle"),
  productNameInput: document.querySelector("#productNameInput"),
  productCategoryInput: document.querySelector("#productCategoryInput"),
  productCategoryNameInput: document.querySelector("#productCategoryNameInput"),
  addProductCategoryBtn: document.querySelector("#addProductCategoryBtn"),
  renameProductCategoryBtn: document.querySelector("#renameProductCategoryBtn"),
  deleteProductCategoryBtn: document.querySelector("#deleteProductCategoryBtn"),
  productUnitInput: document.querySelector("#productUnitInput"),
  productPriceInput: document.querySelector("#productPriceInput"),
  productTaxInput: document.querySelector("#productTaxInput"),
  saveProductBtn: document.querySelector("#saveProductBtn"),
  customerInvoiceBody: document.querySelector("#customerInvoiceBody"),
  newCustomerInvoiceBtn: document.querySelector("#newCustomerInvoiceBtn"),
  customerInvoiceSearch: document.querySelector("#customerInvoiceSearch"),
  customerInvoiceStatus: document.querySelector("#customerInvoiceStatus"),
  customerInvoiceCustomer: document.querySelector("#customerInvoiceCustomer"),
  customerInvoiceFrom: document.querySelector("#customerInvoiceFrom"),
  customerInvoiceTo: document.querySelector("#customerInvoiceTo"),
  customerInvoiceDialog: document.querySelector("#customerInvoiceDialog"),
  customerInvoiceDialogTitle: document.querySelector("#customerInvoiceDialogTitle"),
  ciCustomerInput: document.querySelector("#ciCustomerInput"),
  ciCustomerSuggestions: document.querySelector("#ciCustomerSuggestions"),
  ciDateInput: document.querySelector("#ciDateInput"),
  ciNumberInput: document.querySelector("#ciNumberInput"),
  ciTaxInput: document.querySelector("#ciTaxInput"),
  ciPaymentTermInput: document.querySelector("#ciPaymentTermInput"),
  ciDueDateDisplay: document.querySelector("#ciDueDateDisplay"),
  ciQuickProducts: document.querySelector("#ciQuickProducts"),
  ciLineBody: document.querySelector("#ciLineBody"),
  ciSubtotalDisplay: document.querySelector("#ciSubtotalDisplay"),
  ciGstDisplay: document.querySelector("#ciGstDisplay"),
  ciTotalDisplay: document.querySelector("#ciTotalDisplay"),
  ciNotesInput: document.querySelector("#ciNotesInput"),
  addCiLineBtn: document.querySelector("#addCiLineBtn"),
  cancelCustomerInvoiceBtn: document.querySelector("#cancelCustomerInvoiceBtn"),
  saveCustomerInvoiceBtn: document.querySelector("#saveCustomerInvoiceBtn"),
  statementCustomer: document.querySelector("#statementCustomer"),
  statementFrom: document.querySelector("#statementFrom"),
  statementTo: document.querySelector("#statementTo"),
  statementPaymentDate: document.querySelector("#statementPaymentDate"),
  statementPaymentAmount: document.querySelector("#statementPaymentAmount"),
  applyStatementPaymentBtn: document.querySelector("#applyStatementPaymentBtn"),
  generateStatementBtn: document.querySelector("#generateStatementBtn"),
  statementOutput: document.querySelector("#statementOutput"),
  salesReportType: document.querySelector("#salesReportType"),
  salesReportFrom: document.querySelector("#salesReportFrom"),
  salesReportTo: document.querySelector("#salesReportTo"),
  salesReportCustomer: document.querySelector("#salesReportCustomer"),
  salesReportCategory: document.querySelector("#salesReportCategory"),
  salesReportProduct: document.querySelector("#salesReportProduct"),
  salesReportStatus: document.querySelector("#salesReportStatus"),
  salesReportChartType: document.querySelector("#salesReportChartType"),
  generateSalesReportBtn: document.querySelector("#generateSalesReportBtn"),
  salesReportOutput: document.querySelector("#salesReportOutput"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  toast: document.querySelector("#toast"),
};

function init() {
  setDefaultDates();
  fillStaticSelects();
  bindEvents();
  renderAll();
}

function bindEvents() {
  el.workspaceSwitchItems.forEach((button) => {
    button.addEventListener("click", () => setWorkspace(button.dataset.workspace));
  });
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
  el.addCategoryBtn.addEventListener("click", addCategoryFromSupplierDialog);
  el.newCategoryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCategoryFromSupplierDialog();
    }
  });
  el.saveSettingsBtn.addEventListener("click", saveSettings);
  el.addLineItemBtn.addEventListener("click", addLineItemToDetail);
  el.saveDetailBtn.addEventListener("click", saveDetail);
  el.addCustomerBtn.addEventListener("click", () => openCustomerDialog());
  el.saveCustomerBtn.addEventListener("click", saveCustomerFromDialog);
  el.customerProductCategoryInput.addEventListener("change", () => renderCustomerProductEditor());
  el.customerProductSearchInput.addEventListener("input", () => renderCustomerProductEditor());
  el.cancelCustomerDialogBtn.addEventListener("click", () => {
    el.customerDialog.close();
    returnToCustomerInvoiceIfPending();
  });
  el.customerDialog.addEventListener("close", () => {
    returnToCustomerInvoiceIfPending();
  });
  el.addProductBtn.addEventListener("click", () => openProductDialog());
  el.saveProductBtn.addEventListener("click", saveProductFromDialog);
  el.productCategoryInput.addEventListener("change", () => {
    el.productCategoryNameInput.value = el.productCategoryInput.value;
  });
  el.addProductCategoryBtn.addEventListener("click", addCategoryFromProductDialog);
  el.renameProductCategoryBtn.addEventListener("click", renameCategoryFromProductDialog);
  el.deleteProductCategoryBtn.addEventListener("click", deleteCategoryFromProductDialog);
  el.newCustomerInvoiceBtn.addEventListener("click", () => openCustomerInvoiceDialog());
  [el.customerInvoiceSearch, el.customerInvoiceStatus, el.customerInvoiceCustomer, el.customerInvoiceFrom, el.customerInvoiceTo].forEach((input) => {
    input.addEventListener("input", renderCustomerInvoices);
  });
  el.ciCustomerInput.addEventListener("change", () => {
    if (customerInvoiceDraft) {
      customerInvoiceDraft.customerId = customerByName(el.ciCustomerInput.value)?.id || "";
      renderCustomerInvoiceDialog();
    }
  });
  el.ciDateInput.addEventListener("change", updateCustomerInvoiceDueDate);
  el.ciPaymentTermInput.addEventListener("input", updateCustomerInvoiceDueDate);
  el.ciTaxInput.addEventListener("change", () => {
    if (customerInvoiceDraft) customerInvoiceDraft.taxType = el.ciTaxInput.value;
    renderCustomerInvoiceLines();
  });
  attachCustomerAutocomplete();
  el.addCiLineBtn.addEventListener("click", () => addCustomerInvoiceLine());
  el.cancelCustomerInvoiceBtn.addEventListener("click", () => {
    customerInvoiceDraft = null;
    el.customerInvoiceDialog.close();
  });
  el.saveCustomerInvoiceBtn.addEventListener("click", saveCustomerInvoiceFromDialog);
  el.applyStatementPaymentBtn.addEventListener("click", applyStatementPayment);
  el.generateStatementBtn.addEventListener("click", renderStatement);
  el.generateSalesReportBtn.addEventListener("click", renderSalesReport);
  el.exportDataBtn.addEventListener("click", exportData);
  el.importDataInput.addEventListener("change", importData);
}

function fillStaticSelects() {
  fillSelect(el.registerStatus, ["All Statuses", ...STATUSES]);
  fillSelect(el.registerCategory, ["All Categories", ...getCategories()]);
  fillSelect(el.registerPageSize, ["20 per page", "50 per page", "100 per page"], "50 per page");
  fillSelect(el.reportType, REPORT_TYPES);
  fillSelect(el.reportCategory, ["All Categories", ...getCategories()]);
  fillSelect(el.reportStatus, ["All Statuses", ...STATUSES]);
  fillSelect(el.reportChartType, ["Table Only", "Bar Chart", "Pie Chart", "Bar + Pie"], "Bar Chart");
  fillSelect(el.defaultStatus, STATUSES, state.settings.defaultStatus);
  fillSelect(el.defaultTax, TAX_TYPES, state.settings.defaultTax);
  fillSelect(el.defaultUnit, UNITS, state.settings.defaultUnit);
  fillSelect(el.supplierTaxInput, TAX_TYPES);
  renderCheckboxGroup(el.supplierCategoryInput, getCategories(), "supplier-category");
  fillSelect(el.customerInvoiceStatus, ["All Statuses", ...CUSTOMER_STATUSES, "Overdue"]);
  fillSelect(el.salesReportType, SALES_REPORT_TYPES);
  fillSelect(el.salesReportStatus, ["All Statuses", ...CUSTOMER_STATUSES, "Overdue"]);
  fillSelect(el.salesReportChartType, ["Table Only", "Bar Chart", "Pie Chart", "Bar + Pie"], "Bar + Pie");
  fillSelect(el.ciTaxInput, TAX_TYPES, "GST-Free");
  fillSelect(el.productUnitInput, UNITS, "kg");
  fillSelect(el.productTaxInput, TAX_TYPES, "GST-Free");
}

function renderAll() {
  refreshCategoryControls();
  renderBatch();
  renderRegisterFilters();
  renderRegister();
  renderSupplierList();
  renderReport();
  renderCustomerLists();
  renderProductList();
  renderCustomerInvoices();
  renderStatementFilters();
  renderSalesReportFilters();
  renderSalesReport();
}

function getCategories() {
  return state?.settings?.categories?.length ? state.settings.categories : DEFAULT_CATEGORIES;
}

function refreshCategoryControls() {
  fillSelect(el.registerCategory, ["All Categories", ...getCategories()], el.registerCategory.value || "All Categories");
  fillSelect(el.reportCategory, ["All Categories", ...getCategories()], el.reportCategory.value || "All Categories");
  fillSelect(el.salesReportCategory, ["All Categories", ...getCategories()], el.salesReportCategory.value || "All Categories");
  fillSelect(el.productCategoryInput, getCategories(), el.productCategoryInput.value || getCategories()[0]);
  renderCheckboxGroup(el.supplierCategoryInput, getCategories(), "supplier-category");
}

function setTab(tab) {
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === tab));
  el.navItems.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  el.pageTitle.textContent = document.querySelector(`[data-tab="${tab}"]`).textContent;
}

function setWorkspace(workspace) {
  el.workspaceSwitchItems.forEach((button) => button.classList.toggle("active", button.dataset.workspace === workspace));
  document.querySelectorAll(".workspace-nav").forEach((nav) => nav.classList.toggle("active", nav.dataset.workspaceNav === workspace));
  const firstTab = workspace === "sales" ? "customers" : "batch";
  setTab(firstTab);
}

function renderBatch() {
  el.batchBody.innerHTML = "";
  const duplicateMap = getBatchDuplicateMap();
  batchRows.forEach((row, index) => {
    const duplicateWarning = getDuplicateWarning(row, duplicateMap);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="date" data-field="date" value="${escapeAttr(row.date)}"></td>
      <td class="supplier-cell">
        <input data-field="supplierName" value="${escapeAttr(row.supplierName)}" placeholder="Type supplier" autocomplete="off">
        <div class="supplier-suggestions" data-supplier-suggestions></div>
      </td>
      <td><input data-field="invoiceNumber" value="${escapeAttr(row.invoiceNumber)}"></td>
      <td><input type="number" min="0" step="0.01" data-field="amount" value="${escapeAttr(row.amount)}"></td>
      <td><input type="number" min="0" step="0.01" data-field="payableAmount" value="${escapeAttr(row.payableAmount)}"></td>
      <td class="category-cell">
        <button class="mini-button category-picker-button" data-action="category-picker">${categoryPickerLabel(row)}</button>
        <div class="row-warning" data-warning>${escapeHtml(duplicateWarning)}</div>
        <div class="category-picker ${openCategoryPickerRowId === row.id ? "show" : ""}" data-category-picker>${categoryPickerHtml(row)}</div>
      </td>
      <td>${selectHtml("status", STATUSES, row.status)}</td>
      <td>${selectHtml("taxType", TAX_TYPES, row.taxType)}</td>
      <td><textarea rows="1" data-field="comment">${escapeHtml(row.comment)}</textarea></td>
    `;
    tr.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", () => updateBatchRow(index, input.dataset.field, input.value));
      input.addEventListener("change", () => updateBatchRow(index, input.dataset.field, input.value));
    });
    attachSupplierAutocomplete(tr.querySelector('[data-field="supplierName"]'), index);
    attachCategoryPicker(tr, index);
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

function attachSupplierAutocomplete(input, index) {
  if (!input) return;
  const suggestions = input.closest(".supplier-cell")?.querySelector("[data-supplier-suggestions]");
  if (!suggestions) return;

  const renderSuggestions = () => {
    const query = input.value.trim().toLowerCase();
    const matches = state.suppliers
      .filter((supplier) => !query || supplier.name.toLowerCase().includes(query))
      .slice(0, 8);
    const exactMatch = state.suppliers.some((supplier) => supplier.name.toLowerCase() === query);
    const addNew = query && !exactMatch
      ? `<button type="button" class="supplier-suggestion add-new" data-add-supplier="${escapeAttr(input.value.trim())}">Add new supplier: ${escapeHtml(input.value.trim())}</button>`
      : "";
    suggestions.innerHTML = matches
      .map((supplier) => `<button type="button" class="supplier-suggestion" data-supplier-id="${escapeAttr(supplier.id)}">${escapeHtml(supplier.name)}</button>`)
      .join("") + addNew;
    suggestions.classList.toggle("show", (matches.length > 0 || addNew) && document.activeElement === input);
  };

  input.addEventListener("focus", renderSuggestions);
  input.addEventListener("input", renderSuggestions);
  input.addEventListener("blur", () => {
    window.setTimeout(() => suggestions.classList.remove("show"), 120);
  });
  suggestions.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  suggestions.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-supplier]");
    if (addButton) {
      const row = batchRows[index];
      row.supplierName = addButton.dataset.addSupplier;
      pendingSupplierRowIndex = index;
      suggestions.classList.remove("show");
      openSupplierDialog(null, { name: addButton.dataset.addSupplier });
      return;
    }
    const button = event.target.closest("[data-supplier-id]");
    if (!button) return;
    const supplier = state.suppliers.find((item) => item.id === button.dataset.supplierId);
    if (!supplier) return;
    const row = batchRows[index];
    row.supplierId = supplier.id;
    row.supplierName = supplier.name;
    if (!row.category && supplier.categories.length === 1) row.category = supplier.categories[0];
    row.taxType = supplier.taxType || state.settings.defaultTax;
    suggestions.classList.remove("show");
    renderBatch();
  });
}

function attachCustomerAutocomplete() {
  const input = el.ciCustomerInput;
  const suggestions = el.ciCustomerSuggestions;
  if (!input || !suggestions) return;

  const renderSuggestions = () => {
    const query = input.value.trim().toLowerCase();
    const matches = state.customers
      .filter((customer) => !query || customer.name.toLowerCase().includes(query))
      .slice(0, 8);
    const exactMatch = state.customers.some((customer) => customer.name.toLowerCase() === query);
    const addNew = query && !exactMatch
      ? `<button type="button" class="supplier-suggestion add-new" data-add-customer="${escapeAttr(input.value.trim())}">Add new customer: ${escapeHtml(input.value.trim())}</button>`
      : "";
    suggestions.innerHTML = matches
      .map((customer) => `<button type="button" class="supplier-suggestion" data-customer-id="${escapeAttr(customer.id)}">${escapeHtml(customer.name)}</button>`)
      .join("") + addNew;
    suggestions.classList.toggle("show", (matches.length > 0 || addNew) && document.activeElement === input);
  };

  input.addEventListener("focus", renderSuggestions);
  input.addEventListener("input", () => {
    if (customerInvoiceDraft) customerInvoiceDraft.customerId = customerByName(input.value)?.id || "";
    renderSuggestions();
    if (customerInvoiceDraft) renderQuickProducts();
  });
  input.addEventListener("blur", () => {
    window.setTimeout(() => suggestions.classList.remove("show"), 120);
  });
  suggestions.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  suggestions.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-customer]");
    if (addButton) {
      input.value = addButton.dataset.addCustomer;
      pendingCustomerInvoiceAdd = true;
      suggestions.classList.remove("show");
      el.customerInvoiceDialog.close();
      openCustomerDialog(null, { name: addButton.dataset.addCustomer, fromCustomerInvoice: true });
      return;
    }
    const button = event.target.closest("[data-customer-id]");
    if (!button) return;
    const customer = state.customers.find((item) => item.id === button.dataset.customerId);
    if (!customer || !customerInvoiceDraft) return;
    customerInvoiceDraft.customerId = customer.id;
    input.value = customer.name;
    suggestions.classList.remove("show");
    renderCustomerInvoiceDialog();
  });
}

function categoryPickerHtml(row) {
  const selected = selectedCategoryAmounts(row);
  const selectedCount = selected.length;
  return `
    <div class="category-picker-title">Select categories</div>
    ${getCategories().map((category) => {
      const item = selected.find((entry) => entry.category === category);
      const checked = Boolean(item);
      const amount = item?.amount ?? "";
      return `
        <label class="category-option">
          <span><input type="checkbox" data-category-check="${escapeAttr(category)}" ${checked ? "checked" : ""}> ${escapeHtml(category)}</span>
          <input class="category-amount" type="number" min="0" step="0.01" data-category-amount="${escapeAttr(category)}" value="${escapeAttr(amount)}" ${selectedCount > 1 && checked ? "" : "disabled"} placeholder="Amount">
        </label>
      `;
    }).join("")}
    <div class="category-picker-note">${selectedCount > 1 ? "Split amount across selected categories." : "One category uses the full payable amount."}</div>
  `;
}

function attachCategoryPicker(tr, index) {
  const button = tr.querySelector('[data-action="category-picker"]');
  const picker = tr.querySelector("[data-category-picker]");
  if (!button || !picker) return;

  button.addEventListener("click", (event) => {
    event.preventDefault();
    const row = batchRows[index];
    openCategoryPickerRowId = openCategoryPickerRowId === row.id ? null : row.id;
    document.querySelectorAll(".category-picker.show").forEach((openPicker) => {
      if (openPicker !== picker) openPicker.classList.remove("show");
    });
    picker.classList.toggle("show", openCategoryPickerRowId === row.id);
  });

  picker.addEventListener("mousedown", (event) => event.stopPropagation());
  picker.addEventListener("change", (event) => {
    if (event.target.matches("[data-category-check]")) {
      updateRowCategoriesFromPicker(index, picker);
    }
  });
  picker.addEventListener("input", (event) => {
    if (event.target.matches("[data-category-amount]")) {
      updateRowCategoriesFromPicker(index, picker);
    }
  });
}

function updateRowCategoriesFromPicker(index, picker) {
  const row = batchRows[index];
  const checkedCategories = [...picker.querySelectorAll("[data-category-check]:checked")].map((input) => input.dataset.categoryCheck);
  if (!checkedCategories.length) {
    row.category = "";
    row.lineItems = [];
    openCategoryPickerRowId = row.id;
    renderBatch();
    return;
  }
  if (checkedCategories.length === 1) {
    row.category = checkedCategories[0];
    row.lineItems = [];
    openCategoryPickerRowId = row.id;
    renderBatch();
    return;
  }
  row.category = checkedCategories.join(" + ");
  row.lineItems = checkedCategories.map((category) => {
    const amountInput = picker.querySelector(`[data-category-amount="${cssEscape(category)}"]`);
    return {
      id: uid(),
      category,
      product: "",
      qty: "",
      unit: state.settings.defaultUnit,
      unitPrice: "",
      amount: amountInput?.value || "",
    };
  });
  openCategoryPickerRowId = row.id;
  renderBatch();
}

function selectedCategoryAmounts(row) {
  if (row.lineItems.length) {
    return row.lineItems.map((line) => ({ category: line.category, amount: line.amount }));
  }
  return row.category ? [{ category: row.category, amount: row.payableAmount || row.amount || "" }] : [];
}

function categoryPickerLabel(row) {
  const selected = selectedCategoryAmounts(row);
  if (!selected.length) return "Select";
  if (selected.length === 1) return selected[0].category;
  return selected.map((entry) => `${entry.category} ${entry.amount ? money(entry.amount) : ""}`.trim()).join(" + ");
}

function validateBatchDisplay() {
  const duplicateMap = getBatchDuplicateMap();
  [...el.batchBody.rows].forEach((tr, index) => {
    const row = batchRows[index];
    const active = isActiveBatchRow(row);
    const missing = active ? getMissingFields(row) : [];
    const warning = active ? getRowWarning(row, duplicateMap) : "";
    tr.classList.toggle("duplicate-row", Boolean(warning));
    tr.querySelectorAll("[data-field]").forEach((input) => input.classList.remove("invalid"));
    missing.forEach((field) => {
      const input = tr.querySelector(`[data-field="${field}"]`);
      if (input) input.classList.add("invalid");
    });
    if (warning) {
      if (getDuplicateWarning(row, duplicateMap)) {
        ["supplierName", "invoiceNumber"].forEach((field) => tr.querySelector(`[data-field="${field}"]`)?.classList.add("invalid"));
      }
      if (getSplitWarning(row)) {
        tr.querySelector('[data-action="category-picker"]')?.classList.add("invalid");
      }
      tr.title = warning;
    } else {
      tr.removeAttribute("title");
    }
    const warningNode = tr.querySelector("[data-warning]");
    if (warningNode) warningNode.textContent = warning;
  });
}

function updateBatchSummary() {
  const activeRows = batchRows.filter(isActiveBatchRow);
  const amountTotal = activeRows.reduce((sum, row) => sum + number(row.amount), 0);
  const payableTotal = activeRows.reduce((sum, row) => sum + number(row.payableAmount || row.amount), 0);
  const duplicateMap = getBatchDuplicateMap();
  const attention = activeRows.filter((row) => getMissingFields(row).length > 0 || getDuplicateWarning(row, duplicateMap) || getSplitWarning(row)).length;
  el.unsavedCount.textContent = activeRows.length;
  el.batchTotal.textContent = money(amountTotal);
  el.batchPayable.textContent = money(payableTotal);
  el.attentionCount.textContent = attention;
  validateBatchDisplay();
}

function saveBatch() {
  const activeRows = batchRows.filter(isActiveBatchRow);
  const duplicateMap = getBatchDuplicateMap();
  const validRows = activeRows.filter((row) => getMissingFields(row).length === 0 && !getDuplicateWarning(row, duplicateMap) && !getSplitWarning(row));
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
      <td>${escapeHtml(invoiceCategoryLabel(invoice))}</td>
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
    if (filters.category && filters.category !== "All Categories" && !invoiceHasCategory(invoice, filters.category)) return false;
    if (filters.supplier && filters.supplier !== "All Suppliers" && invoice.supplierName !== filters.supplier) return false;
    if (filters.from && invoice.date < filters.from) return false;
    if (filters.to && invoice.date > filters.to) return false;
    return true;
  });
}

function invoiceCategories(invoice) {
  const lineCategories = (invoice.lineItems || []).map((line) => normalizeCategory(line.category)).filter(Boolean);
  const categories = unique(lineCategories.length ? lineCategories : [normalizeCategory(invoice.category)]);
  return categories.filter((category) => getCategories().includes(category));
}

function invoiceCategoryLabel(invoice) {
  const categories = invoiceCategories(invoice);
  if (!categories.length) return "";
  return categories.join(" + ");
}

function invoiceHasCategory(invoice, category) {
  return invoiceCategories(invoice).includes(category);
}

function detailCategoryLabel(row) {
  if (!row.lineItems.length) return "Add Split";
  const categories = invoiceCategories(row);
  if (categories.length) return categories.join(" + ");
  return `${row.lineItems.length} line${row.lineItems.length === 1 ? "" : "s"}`;
}

function normalizeCategory(category) {
  return category === "Mixed" ? "" : category;
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
    if (field === "category") {
      left = invoiceCategoryLabel(a);
      right = invoiceCategoryLabel(b);
    }
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
    const base = button.dataset.label || button.textContent.replace(/\s+(ASC|DESC)$/g, "").trim();
    button.dataset.label = base;
    button.classList.toggle("active", active);
    button.textContent = active ? `${base} ${registerSort.direction === "asc" ? "ASC" : "DESC"}` : base;
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
    chartRows = groupByCategoryLines(invoices);
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

function groupByCategoryLines(invoices) {
  const grouped = new Map();
  invoices.forEach((invoice) => {
    const lines = (invoice.lineItems || []).length
      ? invoice.lineItems
      : [{ category: invoice.category, amount: invoice.payableAmount || invoice.amount }];
    lines.forEach((line) => {
      const category = normalizeCategory(line.category);
      if (!category || !getCategories().includes(category)) return;
      if (!grouped.has(category)) grouped.set(category, { label: category, count: 0, amount: 0, payable: 0 });
      const row = grouped.get(category);
      row.count += 1;
      row.amount += number(line.amount);
      row.payable += number(line.amount);
    });
  });
  return [...grouped.values()];
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

function chartPanel(rows, title, chartType = el.reportChartType.value) {
  const type = chartType;
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
        <td>${escapeHtml(invoiceCategoryLabel(invoice))}</td>
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

function openSupplierDialog(id = null, defaults = {}) {
  activeSupplierId = id;
  if (!defaults.name) pendingSupplierRowIndex = null;
  const supplier = id ? state.suppliers.find((item) => item.id === id) : null;
  el.supplierDialogTitle.textContent = supplier ? "Edit Supplier" : "Add Supplier";
  el.supplierNameInput.value = supplier?.name || defaults.name || "";
  el.supplierTaxInput.value = supplier?.taxType || state.settings.defaultTax;
  el.supplierContactInput.value = supplier?.contact || "";
  el.supplierNotesInput.value = supplier?.notes || "";
  el.supplierCategoryInput.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = supplier ? supplier.categories.includes(input.value) : defaults.categories?.includes(input.value) || false;
  });
  el.supplierDialog.showModal();
}

function saveSupplierFromDialog() {
  const name = el.supplierNameInput.value.trim();
  const categories = selectedCheckboxValues(el.supplierCategoryInput);
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
  let savedSupplier;
  if (activeSupplierId) {
    savedSupplier = state.suppliers.find((item) => item.id === activeSupplierId);
    Object.assign(savedSupplier, payload);
  } else {
    savedSupplier = { id: uid(), ...payload };
    state.suppliers.push(savedSupplier);
  }
  if (pendingSupplierRowIndex !== null && batchRows[pendingSupplierRowIndex]) {
    const row = batchRows[pendingSupplierRowIndex];
    row.supplierId = savedSupplier.id;
    row.supplierName = savedSupplier.name;
    if (!row.category && savedSupplier.categories.length === 1) row.category = savedSupplier.categories[0];
    row.taxType = savedSupplier.taxType || state.settings.defaultTax;
    pendingSupplierRowIndex = null;
  }
  saveState();
  el.supplierDialog.close();
  renderAll();
  showToast("Supplier saved.");
}

function addCategoryFromSupplierDialog() {
  const name = cleanCategoryName(el.newCategoryInput.value);
  if (!name) {
    showToast("Enter a category name.");
    return;
  }
  const result = addCategory(name);
  if (!result.added) {
    const existing = result.category;
    el.supplierCategoryInput.querySelector(`input[value="${cssEscape(existing)}"]`)?.click();
    el.newCategoryInput.value = "";
    showToast(`${existing} already exists.`);
    return;
  }
  const addedCategory = result.category;
  const selected = selectedCheckboxValues(el.supplierCategoryInput);
  renderCheckboxGroup(el.supplierCategoryInput, getCategories(), "supplier-category");
  el.supplierCategoryInput.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = selected.includes(input.value) || input.value === addedCategory;
  });
  el.newCategoryInput.value = "";
  refreshAfterCategoryChange(addedCategory);
  showToast(`Added category ${addedCategory}.`);
}

function cleanCategoryName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function addCategory(name) {
  const cleanName = cleanCategoryName(name);
  const existing = getCategories().find((category) => category.toLowerCase() === cleanName.toLowerCase());
  if (existing) return { added: false, category: existing };
  state.settings.categories = [...getCategories(), cleanName];
  saveState();
  return { added: true, category: cleanName };
}

function renameCategory(oldName, newName) {
  const from = cleanCategoryName(oldName);
  const to = cleanCategoryName(newName);
  if (!from || !to) return { ok: false, message: "Choose a category and enter a new name." };
  if (from.toLowerCase() === to.toLowerCase()) return { ok: false, message: "Category name is unchanged." };
  if (getCategories().some((category) => category.toLowerCase() === to.toLowerCase())) {
    return { ok: false, message: `${to} already exists.` };
  }
  state.settings.categories = getCategories().map((category) => (category === from ? to : category));
  state.suppliers.forEach((supplier) => {
    supplier.categories = (supplier.categories || []).map((category) => (category === from ? to : category));
  });
  state.products.forEach((product) => {
    if (product.category === from) product.category = to;
  });
  state.invoices.forEach((invoice) => {
    if (invoice.category) invoice.category = renameCategoryText(invoice.category, from, to);
    (invoice.lineItems || []).forEach((line) => {
      if (line.category === from) line.category = to;
    });
  });
  batchRows.forEach((row) => {
    if (row.category === from) row.category = to;
    (row.lineItems || []).forEach((line) => {
      if (line.category === from) line.category = to;
    });
  });
  saveState();
  return { ok: true, category: to };
}

function renameCategoryText(value, from, to) {
  return String(value || "")
    .split("+")
    .map((category) => cleanCategoryName(category) === from ? to : cleanCategoryName(category))
    .filter(Boolean)
    .join(" + ");
}

function deleteCategory(name) {
  const category = cleanCategoryName(name);
  if (!category) return { ok: false, message: "Choose a category to delete." };
  if (getCategories().length <= 1) return { ok: false, message: "At least one category is required." };
  const usage = categoryUsage(category);
  if (usage.total > 0) {
    return { ok: false, message: `${category} is used in ${usage.summary}. Change those records before deleting it.` };
  }
  state.settings.categories = getCategories().filter((item) => item !== category);
  saveState();
  return { ok: true };
}

function categoryUsage(category) {
  const supplierCount = state.suppliers.filter((supplier) => (supplier.categories || []).includes(category)).length;
  const productCount = state.products.filter((product) => product.category === category).length;
  const invoiceCount = state.invoices.filter((invoice) => invoiceUsesCategory(invoice, category)).length;
  const batchCount = batchRows.filter((row) => invoiceUsesCategory(row, category)).length;
  const parts = [
    supplierCount ? `${supplierCount} supplier${supplierCount === 1 ? "" : "s"}` : "",
    productCount ? `${productCount} product${productCount === 1 ? "" : "s"}` : "",
    invoiceCount ? `${invoiceCount} invoice${invoiceCount === 1 ? "" : "s"}` : "",
    batchCount ? `${batchCount} batch row${batchCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return { total: supplierCount + productCount + invoiceCount + batchCount, summary: parts.join(", ") };
}

function invoiceUsesCategory(invoice, category) {
  if (invoice.category && renameCategoryText(invoice.category, category, category).split(" + ").includes(category)) return true;
  return (invoice.lineItems || []).some((line) => line.category === category);
}

function refreshAfterCategoryChange(selectedCategory = "") {
  refreshCategoryControls();
  if (selectedCategory) {
    fillSelect(el.productCategoryInput, getCategories(), selectedCategory);
    el.productCategoryNameInput.value = selectedCategory;
  }
  renderBatch();
  renderRegisterFilters();
  renderRegister();
  renderReport();
  renderSupplierList();
  renderProductList();
  renderSalesReportFilters();
  renderSalesReport();
}

function renderCustomerLists() {
  renderCustomerList();
  refreshCustomerInvoiceFilters();
}

function renderCustomerList() {
  el.customerBody.innerHTML = "";
  state.customers
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((customer) => {
      const balance = customerBalance(customer.id);
      const productNames = (customer.defaultProducts || [])
        .map((id) => customerProductLabel(customer, id))
        .filter(Boolean)
        .join(", ");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(customer.name)}</td>
        <td>${escapeHtml(customer.contact || "")}</td>
        <td>${escapeHtml(customer.email || "")}</td>
        <td>${escapeHtml(customer.address || "")}</td>
        <td>${escapeHtml(customer.terms || "")}</td>
        <td>${escapeHtml(productNames)}</td>
        <td>${money(balance)}</td>
        <td><button class="mini-button" data-action="edit">Edit</button></td>
      `;
      tr.querySelector('[data-action="edit"]').addEventListener("click", () => openCustomerDialog(customer.id));
      el.customerBody.appendChild(tr);
    });
}

function openCustomerDialog(id = null, defaults = {}) {
  activeCustomerId = id;
  if (!defaults.fromCustomerInvoice) pendingCustomerInvoiceAdd = false;
  const customer = id ? state.customers.find((item) => item.id === id) : null;
  el.customerDialogTitle.textContent = customer ? "Edit Customer" : "Add Customer";
  el.customerNameInput.value = customer?.name || defaults.name || "";
  el.customerContactInput.value = customer?.contact || "";
  el.customerEmailInput.value = customer?.email || "";
  el.customerPhoneInput.value = customer?.phone || "";
  el.customerAddressInput.value = customer?.address || "";
  el.customerTermsInput.value = customer?.terms || "7 days";
  el.customerNotesInput.value = customer?.notes || "";
  customerProductDraftIds = [...(customer?.defaultProducts || [])].filter((id) => productById(id));
  customerProductDraftPrices = {};
  customerProductDraftIds.forEach((productId) => {
    const product = productById(productId);
    customerProductDraftPrices[productId] = defaultProductPrice(customer, product);
  });
  el.customerProductSearchInput.value = "";
  fillSelect(el.customerProductCategoryInput, ["All Categories", ...getCategories()], "All Categories");
  renderCustomerProductEditor(customer);
  el.customerDialog.showModal();
}

function saveCustomerFromDialog() {
  const name = el.customerNameInput.value.trim();
  if (!name) {
    showToast("Customer name is required.");
    return;
  }
  const payload = {
    name,
    contact: el.customerContactInput.value.trim(),
    email: el.customerEmailInput.value.trim(),
    phone: el.customerPhoneInput.value.trim(),
    address: el.customerAddressInput.value.trim(),
    terms: el.customerTermsInput.value,
    defaultProducts: [...customerProductDraftIds],
    defaultProductPrices: defaultProductPricesFromDialog(),
    notes: el.customerNotesInput.value.trim(),
  };
  let savedCustomer;
  if (activeCustomerId) {
    savedCustomer = state.customers.find((item) => item.id === activeCustomerId);
    Object.assign(savedCustomer, payload);
  } else {
    savedCustomer = { id: uid(), ...payload };
    state.customers.push(savedCustomer);
  }
  const shouldReturnToInvoice = pendingCustomerInvoiceAdd && customerInvoiceDraft;
  if (shouldReturnToInvoice) {
    customerInvoiceDraft.customerId = savedCustomer.id;
    pendingCustomerInvoiceAdd = false;
  }
  saveState();
  el.customerDialog.close();
  renderAll();
  if (shouldReturnToInvoice) {
    renderCustomerInvoiceDialog();
    el.customerInvoiceDialog.showModal();
  }
  showToast("Customer saved.");
}

function returnToCustomerInvoiceIfPending() {
  if (!pendingCustomerInvoiceAdd || !customerInvoiceDraft || el.customerInvoiceDialog.open) return;
  pendingCustomerInvoiceAdd = false;
  renderCustomerInvoiceDialog();
  el.customerInvoiceDialog.showModal();
}

function renderProductList() {
  el.productBody.innerHTML = "";
  state.products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(product.name)}</td>
        <td>${escapeHtml(product.category)}</td>
        <td>${escapeHtml(product.unit)}</td>
        <td>${money(product.defaultPrice)}</td>
        <td>${escapeHtml(product.taxType || "GST-Free")}</td>
        <td><button class="mini-button" data-action="edit">Edit</button></td>
      `;
      tr.querySelector('[data-action="edit"]').addEventListener("click", () => openProductDialog(product.id));
      el.productBody.appendChild(tr);
    });
}

function openProductDialog(id = null) {
  activeProductId = id;
  const product = id ? productById(id) : null;
  const selectedCategory = product?.category || getCategories()[0];
  el.productDialogTitle.textContent = product ? "Edit Product" : "Add Product";
  el.productNameInput.value = product?.name || "";
  fillSelect(el.productCategoryInput, getCategories(), selectedCategory);
  el.productCategoryNameInput.value = selectedCategory;
  fillSelect(el.productUnitInput, UNITS, product?.unit || "kg");
  el.productPriceInput.value = product?.defaultPrice ?? "";
  el.productTaxInput.value = product?.taxType || "GST-Free";
  el.productDialog.showModal();
}

function addCategoryFromProductDialog() {
  const result = addCategory(el.productCategoryNameInput.value);
  if (!result.added) {
    fillSelect(el.productCategoryInput, getCategories(), result.category);
    el.productCategoryNameInput.value = result.category;
    showToast(`${result.category} already exists.`);
    return;
  }
  refreshAfterCategoryChange(result.category);
  showToast(`Added category ${result.category}.`);
}

function renameCategoryFromProductDialog() {
  const selected = el.productCategoryInput.value;
  const result = renameCategory(selected, el.productCategoryNameInput.value);
  if (!result.ok) {
    showToast(result.message);
    return;
  }
  refreshAfterCategoryChange(result.category);
  showToast(`Renamed category to ${result.category}.`);
}

function deleteCategoryFromProductDialog() {
  const selected = el.productCategoryInput.value;
  const result = deleteCategory(selected);
  if (!result.ok) {
    showToast(result.message);
    return;
  }
  const nextCategory = getCategories()[0] || "";
  refreshAfterCategoryChange(nextCategory);
  showToast(`Deleted category ${selected}.`);
}

function saveProductFromDialog() {
  const name = el.productNameInput.value.trim();
  if (!name) {
    showToast("Product name is required.");
    return;
  }
  const payload = {
    name,
    category: el.productCategoryInput.value,
    unit: el.productUnitInput.value,
    defaultPrice: number(el.productPriceInput.value),
    taxType: el.productTaxInput.value,
  };
  if (activeProductId) {
    Object.assign(productById(activeProductId), payload);
  } else {
    state.products.push({ id: uid(), ...payload });
  }
  saveState();
  el.productDialog.close();
  renderAll();
  showToast("Product saved.");
}

function refreshCustomerInvoiceFilters() {
  const customerOptions = ["All Customers", ...state.customers.map((customer) => customer.name)];
  fillSelect(el.customerInvoiceCustomer, customerOptions, el.customerInvoiceCustomer.value || "All Customers");
  fillSelect(el.statementCustomer, state.customers.map((customer) => customer.name), el.statementCustomer.value || state.customers[0]?.name || "");
}

function renderCustomerInvoices() {
  const invoices = filteredCustomerInvoices();
  el.customerInvoiceBody.innerHTML = "";
  invoices.forEach((invoice) => {
    const customer = customerById(invoice.customerId);
    const paid = paidForCustomerInvoice(invoice.id);
    const balance = invoice.total - paid;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(invoice.date)}</td>
      <td>${escapeHtml(customer?.name || "")}</td>
      <td>${escapeHtml(invoice.invoiceNumber)}</td>
      <td>${money(invoice.total)}</td>
      <td>${money(paid)}</td>
      <td>${money(balance)}</td>
      <td>${statusPill(invoiceStatus(invoice))}</td>
      <td class="inline-actions">
        <button class="mini-button" data-action="edit">Edit</button>
        <button class="mini-button" data-action="paid">${balance > 0 ? "Mark Paid" : "Mark Unpaid"}</button>
        <button class="mini-button" data-action="add-payment">Add Payment</button>
      </td>
    `;
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => openCustomerInvoiceDialog(invoice.id));
    tr.querySelector('[data-action="paid"]').addEventListener("click", () => toggleCustomerInvoicePaid(invoice.id));
    tr.querySelector('[data-action="add-payment"]').addEventListener("click", () => promptAddCustomerInvoicePayment(invoice.id));
    el.customerInvoiceBody.appendChild(tr);
  });
}

function filteredCustomerInvoices() {
  return state.customerInvoices.filter((invoice) => {
    const customer = customerById(invoice.customerId);
    const haystack = `${customer?.name || ""} ${invoice.invoiceNumber} ${invoice.notes || ""}`.toLowerCase();
    if (el.customerInvoiceSearch.value && !haystack.includes(el.customerInvoiceSearch.value.toLowerCase())) return false;
    if (el.customerInvoiceCustomer.value && el.customerInvoiceCustomer.value !== "All Customers" && customer?.name !== el.customerInvoiceCustomer.value) return false;
    if (el.customerInvoiceStatus.value && el.customerInvoiceStatus.value !== "All Statuses" && invoiceStatus(invoice) !== el.customerInvoiceStatus.value) return false;
    if (el.customerInvoiceFrom.value && invoice.date < el.customerInvoiceFrom.value) return false;
    if (el.customerInvoiceTo.value && invoice.date > el.customerInvoiceTo.value) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function openCustomerInvoiceDialog(id = null) {
  activeCustomerInvoiceId = id;
  const invoice = id ? state.customerInvoices.find((item) => item.id === id) : null;
  customerInvoiceDraft = invoice ? cloneData(invoice) : {
    id: uid(),
    customerId: "",
    date: today(),
    invoiceNumber: nextCustomerInvoiceNumber(),
    status: "Unpaid",
    taxType: "GST-Free",
    paymentTermDays: 7,
    notes: "",
    lines: [],
    subtotal: 0,
    gstAmount: 0,
    total: 0,
  };
  renderCustomerInvoiceDialog();
  el.customerInvoiceDialog.showModal();
}

function renderCustomerInvoiceDialog() {
  if (!customerInvoiceDraft) return;
  el.customerInvoiceDialogTitle.textContent = activeCustomerInvoiceId ? "Edit Invoice" : "New Invoice";
  el.ciCustomerInput.value = customerById(customerInvoiceDraft.customerId)?.name || "";
  el.ciDateInput.value = customerInvoiceDraft.date;
  el.ciNumberInput.value = customerInvoiceDraft.invoiceNumber;
  el.ciTaxInput.value = customerInvoiceDraft.taxType || "GST-Free";
  el.ciPaymentTermInput.value = clampPaymentTerm(customerInvoiceDraft.paymentTermDays ?? termsDays(customerById(customerInvoiceDraft.customerId)?.terms));
  updateCustomerInvoiceDueDate();
  el.ciNotesInput.value = customerInvoiceDraft.notes || "";
  renderQuickProducts();
  renderCustomerInvoiceLines();
}

function renderQuickProducts() {
  const customer = customerByName(el.ciCustomerInput.value) || customerById(customerInvoiceDraft.customerId);
  customerInvoiceDraft.customerId = customer?.id || "";
  const productIds = customer?.defaultProducts?.length ? customer.defaultProducts : state.products.map((product) => product.id);
  el.ciQuickProducts.innerHTML = productIds.map((id) => {
    const product = productById(id);
    if (!product) return "";
    return `<button type="button" class="quick-product-button" data-product-id="${escapeAttr(product.id)}">${escapeHtml(product.name)} <span>${money(defaultProductPrice(customer, product))}/${escapeHtml(product.unit)}</span></button>`;
  }).join("");
  el.ciQuickProducts.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => addCustomerInvoiceLine(button.dataset.productId));
  });
}

function addCustomerInvoiceLine(productId = "") {
  const product = productById(productId) || state.products[0];
  const customer = customerById(customerInvoiceDraft?.customerId);
  if (!product || !customerInvoiceDraft) return;
  customerInvoiceDraft.lines.push({
    id: uid(),
    productId: product.id,
    description: product.name,
    qty: 1,
    unit: product.unit,
    price: defaultProductPrice(customer, product),
    taxType: product.taxType || "GST-Free",
    total: defaultProductPrice(customer, product),
  });
  renderCustomerInvoiceLines();
}

function renderCustomerInvoiceLines() {
  el.ciLineBody.innerHTML = "";
  customerInvoiceDraft.lines.forEach((line, index) => {
    line.total = round(number(line.qty) * number(line.price));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(line.description)}</td>
      <td><input type="number" min="0" step="0.001" data-field="qty" value="${escapeAttr(line.qty)}"></td>
      <td>${escapeHtml(line.unit)}</td>
      <td><input type="number" min="0" step="0.01" data-field="price" value="${escapeAttr(line.price)}"></td>
      <td>${money(line.total)}</td>
      <td><button class="mini-button" type="button" data-action="remove">Remove</button></td>
    `;
    tr.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", () => {
        line[input.dataset.field] = number(input.value);
        renderCustomerInvoiceLines();
      });
    });
    tr.querySelector('[data-action="remove"]').addEventListener("click", () => {
      customerInvoiceDraft.lines.splice(index, 1);
      renderCustomerInvoiceLines();
    });
    el.ciLineBody.appendChild(tr);
  });
  applyCustomerInvoiceTotals();
}

function applyCustomerInvoiceTotals() {
  const totals = calculateCustomerInvoiceTotals(customerInvoiceDraft.taxType || el.ciTaxInput.value, customerInvoiceDraft.lines);
  customerInvoiceDraft.subtotal = totals.subtotal;
  customerInvoiceDraft.gstAmount = totals.gstAmount;
  customerInvoiceDraft.total = totals.total;
  el.ciSubtotalDisplay.textContent = money(totals.subtotal);
  el.ciGstDisplay.textContent = money(totals.gstAmount);
  el.ciTotalDisplay.textContent = money(totals.total);
}

function calculateCustomerInvoiceTotals(taxType, lines) {
  const lineAmount = round(lines.reduce((sum, line) => sum + number(line.total), 0));
  if (taxType === "GST Excluded") {
    const gstAmount = round(lineAmount * 0.1);
    return { subtotal: lineAmount, gstAmount, total: round(lineAmount + gstAmount) };
  }
  if (taxType === "GST Included") {
    const gstAmount = round(lineAmount / 11);
    return { subtotal: round(lineAmount - gstAmount), gstAmount, total: lineAmount };
  }
  return { subtotal: lineAmount, gstAmount: 0, total: lineAmount };
}

function saveCustomerInvoiceFromDialog() {
  const customer = customerByName(el.ciCustomerInput.value);
  if (!customer) {
    showToast("Select a customer first.");
    return;
  }
  if (!customerInvoiceDraft.lines.length) {
    showToast("Add at least one invoice line.");
    return;
  }
  customerInvoiceDraft.customerId = customer.id;
  customerInvoiceDraft.date = el.ciDateInput.value;
  customerInvoiceDraft.invoiceNumber = el.ciNumberInput.value.trim() || nextCustomerInvoiceNumber();
  customerInvoiceDraft.status = customerInvoiceDraft.status || "Unpaid";
  customerInvoiceDraft.taxType = el.ciTaxInput.value;
  customerInvoiceDraft.paymentTermDays = clampPaymentTerm(el.ciPaymentTermInput.value);
  customerInvoiceDraft.notes = el.ciNotesInput.value.trim();
  applyCustomerInvoiceTotals();
  customerInvoiceDraft.updatedAt = new Date().toISOString();
  if (activeCustomerInvoiceId) {
    Object.assign(state.customerInvoices.find((item) => item.id === activeCustomerInvoiceId), customerInvoiceDraft);
  } else {
    customerInvoiceDraft.createdAt = new Date().toISOString();
    state.customerInvoices.unshift(customerInvoiceDraft);
  }
  if (customerInvoiceDraft.status === "Paid") {
    state.customerPayments = state.customerPayments.filter((payment) => payment.invoiceId !== customerInvoiceDraft.id);
    recordCustomerPayment(customerInvoiceDraft, customerInvoiceDraft.total, today(), "Marked paid");
  }
  saveState();
  el.customerInvoiceDialog.close();
  customerInvoiceDraft = null;
  renderAll();
  showToast("Customer invoice saved.");
}

function toggleCustomerInvoicePaid(id) {
  const invoice = state.customerInvoices.find((item) => item.id === id);
  if (!invoice) return;
  const paid = paidForCustomerInvoice(id);
  if (paid >= invoice.total) {
    state.customerPayments = state.customerPayments.filter((payment) => payment.invoiceId !== id);
    invoice.status = "Unpaid";
  } else {
    recordCustomerPayment(invoice, number(invoice.total) - paid, today(), "Marked paid");
  }
  saveState();
  renderAll();
}

function renderStatementFilters() {
  refreshCustomerInvoiceFilters();
}

function renderStatement() {
  const customer = customerByName(el.statementCustomer.value) || state.customers[0];
  if (!customer) {
    el.statementOutput.innerHTML = `<div class="metric-card"><span>No customer selected</span><strong>$0.00</strong></div>`;
    return;
  }
  const invoices = state.customerInvoices.filter((invoice) => invoice.customerId === customer.id && (!el.statementFrom.value || invoice.date >= el.statementFrom.value) && (!el.statementTo.value || invoice.date <= el.statementTo.value));
  const unpaidAmount = invoices.reduce((sum, invoice) => {
    return sum + Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id));
  }, 0);
  const overdueAmount = invoices.reduce((sum, invoice) => {
    if (!isOverdue(invoice)) return sum;
    return sum + number(invoice.total) - paidForCustomerInvoice(invoice.id);
  }, 0);
  const averagePayDays = averageCustomerPayDays(invoices);
  el.statementOutput.innerHTML = `
    <div class="metric-grid">
      ${metric("Customer", customer.name)}
      ${metric("Unpaid Amount", money(unpaidAmount))}
      ${metric("Overdue Amount", money(overdueAmount))}
      ${metric("Average Pay Term", averagePayDays == null ? "No paid invoices" : `${averagePayDays} days`)}
    </div>
    ${customerStatementTable(invoices)}
    ${customerPaymentLog(customer.id)}
  `;
  el.statementOutput.querySelectorAll("[data-statement-invoice]").forEach((button) => {
    button.addEventListener("click", () => openCustomerInvoiceDialog(button.dataset.statementInvoice));
  });
  el.statementOutput.querySelectorAll("[data-statement-toggle-paid]").forEach((button) => {
    button.addEventListener("click", () => toggleCustomerInvoicePaid(button.dataset.statementTogglePaid));
  });
  el.statementOutput.querySelectorAll("[data-statement-add-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      const invoiceId = button.dataset.statementAddPayment;
      const input = el.statementOutput.querySelector(`[data-statement-payment-input="${cssEscape(invoiceId)}"]`);
      addCustomerInvoicePayment(invoiceId, number(input?.value), el.statementPaymentDate.value || today(), "Statement invoice payment");
      if (input) input.value = "";
    });
  });
}

function customerStatementTable(invoices) {
  const body = invoices.map((invoice) => {
    const paid = paidForCustomerInvoice(invoice.id);
    const balance = Math.max(0, number(invoice.total) - paid);
    const paidDate = paidInFullDate(invoice);
    return `<tr><td>${formatDate(invoice.date)}</td><td>${formatDate(dueDateForInvoice(invoice))}</td><td><button class="text-link-button" type="button" data-statement-invoice="${escapeAttr(invoice.id)}">${escapeHtml(invoice.invoiceNumber)}</button></td><td>${money(invoice.total)}</td><td>${money(paid)}</td><td>${money(balance)}</td><td>${paidDate ? `${daysBetween(invoice.date, paidDate)} days` : ""}</td><td><button class="status-button" type="button" data-statement-toggle-paid="${escapeAttr(invoice.id)}">${statusPill(invoiceStatus(invoice))}</button></td><td><div class="payment-cell"><input type="number" min="0" step="0.01" max="${escapeAttr(balance)}" data-statement-payment-input="${escapeAttr(invoice.id)}" placeholder="${balance ? money(balance) : "$0.00"}"><button class="mini-button" type="button" data-statement-add-payment="${escapeAttr(invoice.id)}">Add</button></div></td></tr>`;
  }).join("");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Due</th><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance</th><th>Pay Term</th><th>Status</th><th>Add Payment</th></tr></thead><tbody>${body || '<tr><td colspan="9">No invoices for this customer.</td></tr>'}</tbody></table></div>`;
}

function applyStatementPayment() {
  const customer = customerByName(el.statementCustomer.value);
  const amount = number(el.statementPaymentAmount.value);
  if (!customer) {
    showToast("Select a customer first.");
    return;
  }
  if (amount <= 0) {
    showToast("Enter a payment amount.");
    return;
  }
  const applied = autoApplyCustomerPayment(customer.id, amount, el.statementPaymentDate.value || today());
  el.statementPaymentAmount.value = "";
  renderAll();
  showToast(`Applied ${money(applied)} to oldest invoices.`);
}

function autoApplyCustomerPayment(customerId, amount, date = today()) {
  let remaining = round(amount);
  let appliedTotal = 0;
  recordCustomerPaymentLog(customerId, "", amount, date, "Bulk payment received");
  const invoices = state.customerInvoices
    .filter((invoice) => invoice.customerId === customerId && invoiceStatus(invoice) !== "Void")
    .sort((a, b) => a.date.localeCompare(b.date) || a.invoiceNumber.localeCompare(b.invoiceNumber));
  invoices.forEach((invoice) => {
    if (remaining <= 0) return;
    const balance = Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id));
    if (balance <= 0) return;
    const applied = round(Math.min(balance, remaining));
    recordCustomerPayment(invoice, applied, date, "Bulk payment auto-match");
    appliedTotal += applied;
    remaining = round(remaining - applied);
  });
  if (remaining > 0) {
    recordCustomerPaymentLog(customerId, "", remaining, date, "Unapplied credit");
  }
  saveState();
  return round(appliedTotal);
}

function promptAddCustomerInvoicePayment(invoiceId) {
  const invoice = state.customerInvoices.find((item) => item.id === invoiceId);
  if (!invoice) return;
  const balance = Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id));
  if (balance <= 0) {
    showToast("Invoice is already paid.");
    return;
  }
  const value = window.prompt(`Add payment for ${invoice.invoiceNumber}`, String(round(balance)));
  if (value === null) return;
  addCustomerInvoicePayment(invoiceId, number(value), today(), "Invoice list payment");
}

function addCustomerInvoicePayment(invoiceId, amount, date = today(), notes = "Manual invoice payment") {
  const invoice = state.customerInvoices.find((item) => item.id === invoiceId);
  if (!invoice) return;
  const balance = Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id));
  if (balance <= 0) {
    showToast("Invoice is already paid.");
    return;
  }
  if (amount <= 0) {
    showToast("Enter a payment amount.");
    return;
  }
  const applied = round(Math.min(amount, balance));
  recordCustomerPayment(invoice, applied, date, notes);
  saveState();
  renderAll();
  showToast(`Added payment ${money(applied)}.`);
}

function recordCustomerPayment(invoice, amount, date, notes) {
  recordCustomerPaymentLog(invoice.customerId, invoice.id, amount, date, notes);
  const balance = Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id));
  invoice.status = balance <= 0.001 ? "Paid" : "Part Paid";
}

function recordCustomerPaymentLog(customerId, invoiceId, amount, date, notes) {
  state.customerPayments.push({
    id: uid(),
    customerId,
    invoiceId,
    date,
    amount: round(amount),
    notes,
    createdAt: new Date().toISOString(),
  });
}

function customerPaymentLog(customerId) {
  const rows = state.customerPayments
    .filter((payment) => payment.customerId === customerId)
    .slice()
    .sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date)))
    .map((payment) => {
      const invoice = state.customerInvoices.find((item) => item.id === payment.invoiceId);
      return `<tr><td>${formatDate(payment.date)}</td><td>${escapeHtml(invoice?.invoiceNumber || "")}</td><td>${money(payment.amount)}</td><td>${escapeHtml(payment.notes || "")}</td><td>${escapeHtml(payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "")}</td></tr>`;
    }).join("");
  return `
    <section class="log-section">
      <h4>Payment Log</h4>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Payment Date</th><th>Invoice</th><th>Amount</th><th>Action</th><th>Recorded</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No payment activity yet.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

function averageCustomerPayDays(invoices) {
  const paidTerms = invoices
    .map((invoice) => {
      const paidDate = paidInFullDate(invoice);
      return paidDate ? daysBetween(invoice.date, paidDate) : null;
    })
    .filter((days) => days !== null);
  if (!paidTerms.length) return null;
  return Math.round(paidTerms.reduce((sum, days) => sum + days, 0) / paidTerms.length);
}

function paidInFullDate(invoice) {
  const payments = state.customerPayments
    .filter((payment) => payment.invoiceId === invoice.id)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let paid = 0;
  for (const payment of payments) {
    paid += number(payment.amount);
    if (paid + 0.001 >= number(invoice.total)) return payment.date;
  }
  return null;
}

function daysBetween(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  return Math.max(0, Math.round((to - from) / 86400000));
}

function renderSalesReportFilters() {
  fillSelect(el.salesReportCustomer, ["All Customers", ...state.customers.map((customer) => customer.name)], el.salesReportCustomer.value || "All Customers");
  fillSelect(el.salesReportProduct, ["All Products", ...state.products.map((product) => product.name)], el.salesReportProduct.value || "All Products");
}

function renderSalesReport() {
  const invoices = filteredSalesReportInvoices();
  const lines = salesReportLines(invoices);
  const totalSales = invoices.reduce((sum, invoice) => sum + number(invoice.total), 0);
  const subtotal = invoices.reduce((sum, invoice) => sum + number(invoice.subtotal ?? invoice.total), 0);
  const gstAmount = invoices.reduce((sum, invoice) => sum + number(invoice.gstAmount), 0);
  const unpaidAmount = invoices.reduce((sum, invoice) => sum + Math.max(0, number(invoice.total) - paidForCustomerInvoice(invoice.id)), 0);
  const kgSold = lines.filter((line) => line.unit.toLowerCase() === "kg").reduce((sum, line) => sum + number(line.qty), 0);
  const unitsSold = lines.reduce((sum, line) => sum + number(line.qty), 0);

  let html = `
    <div class="metric-grid">
      ${metric("Invoices", invoices.length)}
      ${metric("Sales Total", money(totalSales))}
      ${metric("Subtotal", money(subtotal))}
      ${metric("GST", money(gstAmount))}
      ${metric("Unpaid", money(unpaidAmount))}
      ${metric("KG Sold", round(kgSold))}
    </div>
  `;

  const type = el.salesReportType.value;
  if (type === "Customer Sales") {
    const rows = groupSalesInvoicesBy(invoices, (invoice) => customerById(invoice.customerId)?.name || "Unknown");
    html += chartPanel(rows, "Customer Sales", el.salesReportChartType.value);
    html += salesReportTable(["Customer", "Invoices", "Sales", "Paid", "Balance"], rows);
  } else if (type === "Category Sales") {
    const rows = groupSalesLines(lines, (line) => line.category || "Unknown");
    html += chartPanel(rows, "Category Sales", el.salesReportChartType.value);
    html += salesLineReportTable(["Category", "Lines", "Qty", "KG", "Sales"], rows);
  } else if (type === "Product Sales") {
    const rows = groupSalesLines(lines, (line) => line.product || "Unknown");
    html += chartPanel(rows, "Product Sales", el.salesReportChartType.value);
    html += salesLineReportTable(["Product", "Lines", "Qty", "KG", "Sales"], rows);
  } else if (type === "Unit / Weight") {
    const rows = groupSalesLines(lines, (line) => line.unit || "Unknown");
    html += chartPanel(rows, "Unit / Weight Sales", el.salesReportChartType.value);
    html += salesLineReportTable(["Unit", "Lines", "Qty", "KG", "Sales"], rows);
  } else if (type === "Unpaid / Overdue") {
    const rows = invoices.filter((invoice) => ["Unpaid", "Part Paid", "Overdue"].includes(invoiceStatus(invoice)));
    html += chartPanel(groupSalesInvoicesBy(rows, invoiceStatus), "Unpaid / Overdue", el.salesReportChartType.value);
    html += salesInvoiceListTable(rows);
  } else if (type === "All Sales Invoices") {
    html += chartPanel(groupSalesInvoicesBy(invoices, invoiceStatus), "Sales Status", el.salesReportChartType.value);
    html += salesInvoiceListTable(invoices);
  } else {
    const rows = groupSalesLines(lines, (line) => line.category || "Unknown");
    html += chartPanel(rows, "Sales by Category", el.salesReportChartType.value);
    html += salesLineReportTable(["Category", "Lines", "Qty", "KG", "Sales"], rows);
  }

  if (!invoices.length) {
    html += `<div class="metric-card"><span>No sales match these filters.</span><strong>$0.00</strong></div>`;
  }
  el.salesReportOutput.innerHTML = html;
}

function filteredSalesReportInvoices() {
  return state.customerInvoices.filter((invoice) => {
    const customer = customerById(invoice.customerId);
    const status = invoiceStatus(invoice);
    if (el.salesReportFrom.value && invoice.date < el.salesReportFrom.value) return false;
    if (el.salesReportTo.value && invoice.date > el.salesReportTo.value) return false;
    if (el.salesReportCustomer.value && el.salesReportCustomer.value !== "All Customers" && customer?.name !== el.salesReportCustomer.value) return false;
    if (el.salesReportStatus.value && el.salesReportStatus.value !== "All Statuses" && status !== el.salesReportStatus.value) return false;
    const lines = salesReportLines([invoice]);
    if (el.salesReportCategory.value && el.salesReportCategory.value !== "All Categories" && !lines.some((line) => line.category === el.salesReportCategory.value)) return false;
    if (el.salesReportProduct.value && el.salesReportProduct.value !== "All Products" && !lines.some((line) => line.product === el.salesReportProduct.value)) return false;
    return true;
  });
}

function salesReportLines(invoices) {
  const categoryFilter = el.salesReportCategory?.value;
  const productFilter = el.salesReportProduct?.value;
  return invoices.flatMap((invoice) => (invoice.lines || []).map((line) => {
    const product = productById(line.productId);
    return {
      invoice,
      product: product?.name || line.description || "Unknown",
      category: product?.category || "Unknown",
      qty: number(line.qty),
      unit: line.unit || product?.unit || "",
      amount: number(line.total),
    };
  })).filter((line) => {
    if (categoryFilter && categoryFilter !== "All Categories" && line.category !== categoryFilter) return false;
    if (productFilter && productFilter !== "All Products" && line.product !== productFilter) return false;
    return true;
  });
}

function groupSalesInvoicesBy(invoices, getLabel) {
  const grouped = new Map();
  invoices.forEach((invoice) => {
    const label = typeof getLabel === "function" ? getLabel(invoice) : invoice[getLabel];
    if (!grouped.has(label)) grouped.set(label, { label, count: 0, amount: 0, payable: 0, paid: 0, balance: 0 });
    const row = grouped.get(label);
    const paid = paidForCustomerInvoice(invoice.id);
    row.count += 1;
    row.amount += number(invoice.total);
    row.payable += number(invoice.total);
    row.paid += paid;
    row.balance += Math.max(0, number(invoice.total) - paid);
  });
  return [...grouped.values()];
}

function groupSalesLines(lines, getLabel) {
  const grouped = new Map();
  lines.forEach((line) => {
    const label = getLabel(line);
    if (!grouped.has(label)) grouped.set(label, { label, count: 0, qty: 0, kg: 0, amount: 0, payable: 0 });
    const row = grouped.get(label);
    row.count += 1;
    row.qty += number(line.qty);
    if (line.unit.toLowerCase() === "kg") row.kg += number(line.qty);
    row.amount += number(line.amount);
    row.payable += number(line.amount);
  });
  return [...grouped.values()];
}

function salesReportTable(headers, rows) {
  const body = rows
    .sort((a, b) => b.amount - a.amount)
    .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${row.count}</td><td>${money(row.amount)}</td><td>${money(row.paid)}</td><td>${money(row.balance)}</td></tr>`)
    .join("");
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${headers.length}">No sales for this report.</td></tr>`}</tbody></table></div>`;
}

function salesLineReportTable(headers, rows) {
  const body = rows
    .sort((a, b) => b.amount - a.amount)
    .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${row.count}</td><td>${round(row.qty)}</td><td>${round(row.kg)}</td><td>${money(row.amount)}</td></tr>`)
    .join("");
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${headers.length}">No line items for this report.</td></tr>`}</tbody></table></div>`;
}

function salesInvoiceListTable(invoices) {
  const body = invoices.map((invoice) => {
    const customer = customerById(invoice.customerId);
    const paid = paidForCustomerInvoice(invoice.id);
    return `<tr><td>${formatDate(invoice.date)}</td><td>${formatDate(dueDateForInvoice(invoice))}</td><td>${escapeHtml(customer?.name || "")}</td><td>${escapeHtml(invoice.invoiceNumber)}</td><td>${money(invoice.total)}</td><td>${money(paid)}</td><td>${money(number(invoice.total) - paid)}</td><td>${statusPill(invoiceStatus(invoice))}</td></tr>`;
  }).join("");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Due</th><th>Customer</th><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${body || '<tr><td colspan="8">No sales invoices match this report.</td></tr>'}</tbody></table></div>`;
}

function customerBalance(customerId) {
  return state.customerInvoices.filter((invoice) => invoice.customerId === customerId).reduce((sum, invoice) => sum + invoice.total - paidForCustomerInvoice(invoice.id), 0);
}

function paidForCustomerInvoice(invoiceId) {
  return state.customerPayments.filter((payment) => payment.invoiceId === invoiceId).reduce((sum, payment) => sum + number(payment.amount), 0);
}

function invoiceStatus(invoice) {
  const balance = number(invoice.total) - paidForCustomerInvoice(invoice.id);
  if (invoice.status === "Void" || invoice.status === "Draft") return invoice.status;
  if (balance <= 0 && invoice.total > 0) return "Paid";
  if (paidForCustomerInvoice(invoice.id) > 0) return "Part Paid";
  if (isOverdue(invoice)) return "Overdue";
  return invoice.status || "Unpaid";
}

function customerById(id) {
  return state.customers.find((customer) => customer.id === id);
}

function customerByName(name) {
  return state.customers.find((customer) => customer.name === name);
}

function productById(id) {
  return state.products.find((product) => product.id === id);
}

function defaultProductPrice(customer, product) {
  const override = customer?.defaultProductPrices?.[product.id];
  return override === "" || override == null ? product.defaultPrice : number(override);
}

function customerProductLabel(customer, productId) {
  const product = productById(productId);
  if (!product) return "";
  return `${product.name} (${money(defaultProductPrice(customer, product))}/${product.unit})`;
}

function defaultProductPricesFromDialog() {
  const prices = {};
  el.customerProductInput.querySelectorAll("[data-product-price]").forEach((input) => {
    const productId = input.dataset.productPrice;
    if (customerProductDraftIds.includes(productId)) {
      prices[productId] = number(input.value);
    }
  });
  return prices;
}

function updateCustomerInvoiceDueDate() {
  if (!customerInvoiceDraft) return;
  customerInvoiceDraft.date = el.ciDateInput.value || today();
  customerInvoiceDraft.paymentTermDays = clampPaymentTerm(el.ciPaymentTermInput.value || customerInvoiceDraft.paymentTermDays);
  el.ciPaymentTermInput.value = customerInvoiceDraft.paymentTermDays;
  el.ciDueDateDisplay.value = formatDate(dueDateForInvoice(customerInvoiceDraft));
}

function dueDateForInvoice(invoice) {
  const customer = customerById(invoice.customerId);
  const days = clampPaymentTerm(invoice.paymentTermDays ?? termsDays(customer?.terms));
  const due = new Date(`${invoice.date}T00:00:00`);
  due.setDate(due.getDate() + days);
  return toInputDate(due);
}

function isOverdue(invoice) {
  const balance = number(invoice.total) - paidForCustomerInvoice(invoice.id);
  return balance > 0 && dueDateForInvoice(invoice) < today();
}

function termsDays(terms) {
  if (terms === "COD") return 0;
  const match = String(terms || "").match(/\d+/);
  return match ? number(match[0]) : 7;
}

function clampPaymentTerm(value) {
  const days = Math.round(number(value));
  if (!days) return 7;
  return Math.min(30, Math.max(1, days));
}

function nextCustomerInvoiceNumber() {
  return `CINV-${String(state.customerInvoices.length + 1).padStart(4, "0")}`;
}

function renderCustomerProductEditor(customer = activeCustomerId ? customerById(activeCustomerId) : null) {
  const selectedCategory = el.customerProductCategoryInput.value || "All Categories";
  const search = el.customerProductSearchInput.value.trim().toLowerCase();
  fillSelect(el.customerProductCategoryInput, ["All Categories", ...getCategories()], selectedCategory);
  const activeCategory = el.customerProductCategoryInput.value || "All Categories";
  el.customerProductInput.innerHTML = customerProductDraftIds.map((productId) => {
    const product = productById(productId);
    if (!product) return "";
    return `
      <div class="customer-product-option" data-customer-product-id="${escapeAttr(product.id)}">
        <div class="customer-product-name">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.category)} - ${escapeHtml(product.unit)}</span>
        </div>
        <label>
          Price
          <input type="number" min="0" step="0.01" data-product-price="${escapeAttr(product.id)}" value="${escapeAttr(customerProductDraftPrices[product.id] ?? defaultProductPrice(customer, product))}">
        </label>
        <button class="mini-button" type="button" data-remove-customer-product="${escapeAttr(product.id)}">Remove</button>
      </div>
    `;
  }).join("") || `<p class="muted empty-state">No default products selected.</p>`;
  el.customerProductInput.querySelectorAll("[data-product-price]").forEach((input) => {
    input.addEventListener("input", () => {
      customerProductDraftPrices[input.dataset.productPrice] = number(input.value);
    });
  });
  el.customerProductInput.querySelectorAll("[data-remove-customer-product]").forEach((button) => {
    button.addEventListener("click", () => {
      customerProductDraftIds = customerProductDraftIds.filter((id) => id !== button.dataset.removeCustomerProduct);
      delete customerProductDraftPrices[button.dataset.removeCustomerProduct];
      renderCustomerProductEditor(customer);
    });
  });
  const availableProducts = state.products
    .filter((product) => !customerProductDraftIds.includes(product.id))
    .filter((product) => activeCategory === "All Categories" || product.category === activeCategory)
    .filter((product) => !search || `${product.name} ${product.category}`.toLowerCase().includes(search))
    .sort((a, b) => a.name.localeCompare(b.name));
  el.customerProductPicker.innerHTML = availableProducts.map((product) => `
    <button class="product-picker-option" type="button" data-add-customer-product="${escapeAttr(product.id)}">
      <strong>${escapeHtml(product.name)}</strong>
      <span>${escapeHtml(product.category)} - ${escapeHtml(product.unit)} - ${money(product.defaultPrice)} - ${escapeHtml(product.taxType || "GST-Free")}</span>
    </button>
  `).join("") || `<p class="muted empty-state">No products match this category.</p>`;
  el.customerProductPicker.querySelectorAll("[data-add-customer-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = productById(button.dataset.addCustomerProduct);
      if (!product || customerProductDraftIds.includes(product.id)) return;
      customerProductDraftIds.push(product.id);
      customerProductDraftPrices[product.id] = product.defaultPrice;
      renderCustomerProductEditor(customer);
    });
  });
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
    item.lineItems.push({ id: uid(), category: item.category || getCategories()[0], product: "", qty: "", unit: state.settings.defaultUnit, unitPrice: "", amount: item.amount || "" });
  }
  renderLineItems(item);
  el.detailDialog.showModal();
}

function renderLineItems(item) {
  el.lineItemBody.innerHTML = "";
  item.lineItems.forEach((line, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${selectHtml("category", getCategories(), line.category)}</td>
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
  item.lineItems.push({ id: uid(), category: item.category || getCategories()[0], product: "", qty: "", unit: state.settings.defaultUnit, unitPrice: "", amount: "" });
  renderLineItems(item);
}

function saveDetail() {
  const item = getActiveDetailItem();
  if (!item) return;
  const lineTotal = item.lineItems.reduce((sum, line) => sum + number(line.amount), 0);
  if (lineTotal > 0) {
    item.amount = round(lineTotal);
    if (!item.payableEdited && activeDetail.source === "batch") item.payableAmount = item.amount;
    item.category = invoiceCategoryLabel(item);
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
      state = migrateState({
        invoices: imported.invoices,
        suppliers: imported.suppliers,
        customers: imported.customers || [],
        products: imported.products || seedProducts,
        customerInvoices: imported.customerInvoices || [],
        customerPayments: imported.customerPayments || [],
        settings: { ...defaultSettings(), ...(imported.settings || {}) },
      });
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

function getSplitWarning(row) {
  if (!row.lineItems.length) return "";
  const splitTotal = row.lineItems.reduce((sum, line) => sum + number(line.amount), 0);
  const target = number(row.payableAmount || row.amount);
  if (target <= 0) return "";
  const difference = round(splitTotal - target);
  if (Math.abs(difference) <= 0.01) return "";
  if (difference > 0) {
    return `Split total is ${money(splitTotal)}, ${money(difference)} over invoice amount.`;
  }
  return `Split total is ${money(splitTotal)}, ${money(Math.abs(difference))} under invoice amount.`;
}

function getRowWarning(row, batchDuplicateMap) {
  return [getDuplicateWarning(row, batchDuplicateMap), getSplitWarning(row)].filter(Boolean).join(" ");
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
      const loaded = {
        invoices: parsed.invoices || [],
        suppliers: parsed.suppliers?.length ? parsed.suppliers : seedSuppliers,
        customers: parsed.customers || [],
        products: parsed.products?.length ? parsed.products : seedProducts,
        customerInvoices: parsed.customerInvoices || [],
        customerPayments: parsed.customerPayments || [],
        settings: { ...defaultSettings(), ...(parsed.settings || {}) },
      };
      return migrateState(loaded);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { invoices: [], suppliers: seedSuppliers, customers: [], products: seedProducts, customerInvoices: [], customerPayments: [], settings: defaultSettings() };
}

function migrateState(loaded) {
  let changed = false;
  const categories = new Set([...(loaded.settings.categories || DEFAULT_CATEGORIES)]);
  loaded.suppliers.forEach((supplier) => (supplier.categories || []).forEach((category) => categories.add(category)));
  loaded.invoices.forEach((invoice) => {
    if (invoice.category && invoice.category !== "Mixed") {
      invoice.category.split(" + ").forEach((category) => categories.add(category));
    }
    (invoice.lineItems || []).forEach((line) => {
      if (line.category && line.category !== "Mixed") categories.add(line.category);
    });
  });
  const nextCategories = [...categories].map(cleanCategoryName).filter(Boolean);
  if (JSON.stringify(loaded.settings.categories || []) !== JSON.stringify(nextCategories)) {
    loaded.settings.categories = nextCategories;
    changed = true;
  }
  loaded.invoices = loaded.invoices.map((invoice) => {
    const next = { ...invoice, lineItems: invoice.lineItems || [] };
    if (next.category === "Mixed") {
      const label = unique(next.lineItems.map((line) => line.category).filter((category) => category && category !== "Mixed")).join(" + ");
      if (label) {
        next.category = label;
        changed = true;
      }
    }
    next.lineItems = next.lineItems.map((line) => {
      if (line.category === "Mixed") {
        changed = true;
        return { ...line, category: "Beef" };
      }
      return line;
    });
    return next;
  });
  loaded.customers = loaded.customers.map((customer) => {
    const next = { ...customer };
    next.address = next.address || "";
    next.defaultProducts = next.defaultProducts || [];
    next.defaultProductPrices = next.defaultProductPrices || {};
    next.defaultProducts.forEach((productId) => {
      const product = loaded.products.find((item) => item.id === productId);
      if (product && next.defaultProductPrices[productId] == null) {
        next.defaultProductPrices[productId] = product.defaultPrice;
        changed = true;
      }
    });
    return next;
  });
  loaded.products = loaded.products.map((product) => {
    if (product.taxType) return product;
    changed = true;
    return { ...product, taxType: "GST-Free" };
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
  }
  return loaded;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultSettings() {
  return { defaultStatus: "Unpaid", defaultTax: "GST-Free", defaultUnit: "kg", categories: DEFAULT_CATEGORIES };
}

function setDefaultDates() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  el.reportFrom.value = toInputDate(first);
  el.reportTo.value = today();
  el.salesReportFrom.value = toInputDate(first);
  el.salesReportTo.value = today();
  el.statementPaymentDate.value = today();
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

function renderCheckboxGroup(container, options, name) {
  container.innerHTML = options
    .map((option) => `
      <label class="checkbox-option">
        <input type="checkbox" name="${escapeAttr(name)}" value="${escapeAttr(option)}">
        <span>${escapeHtml(option)}</span>
      </label>
    `)
    .join("");
}

function selectedCheckboxValues(container) {
  return [...container.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
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

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
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

function cssEscape(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 2600);
}

init();
