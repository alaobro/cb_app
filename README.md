# CBAPP

CBAPP is an offline-first bookkeeping app prototype for supplier invoices.

## Current Version

This first version implements the Supplier Invoice module as an Excel-style batch entry workflow:

- Batch enter supplier invoices, one invoice per row
- Supplier autocomplete using browser datalist
- Required supplier name, invoice number, date, amount, and category
- Default `GST-Free` tax handling
- Default categories for suppliers
- `Amount` and `Payable Amount` for credit notes, refunds, and deductions
- Detail panel for optional line items and product-level reporting
- Invoice register with search, status/category/date filters, mark paid, flag, and delete
- Reports for category spend, supplier spend, product spend, unpaid invoices, adjustments, and invoice list
- Supplier management and default settings
- Export/import JSON backup

## How To Run

Open `index.html` in a browser.

The app is currently a local prototype. Data is stored in the browser's `localStorage`, so use `Export Data` regularly if you are entering real records.

## Next Planned Step

After the Supplier Invoice workflow feels right, the next development step is to move the data layer from browser `localStorage` into a real local database, then package the app for Windows and macOS.
