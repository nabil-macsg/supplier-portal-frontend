import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { invoices as seedInvoices, purchaseOrders } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';
import { useNavigate } from 'react-router-dom';

const statusClass = {
  Draft: 'draft',
  Submitted: 'submitted',
  'Under Validation': 'validation',
  Approved: 'approved',
  Rejected: 'rejected',
  Paid: 'paid',
};

const initialForm = {
  poNo: purchaseOrders[0]?.poNo || '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  currency: 'USD',
  invoiceAmount: '',
  taxAmount: '',
  freightAmount: '',
  totalAmount: '',
  paymentTerms: '30 Days Credit',
  invoiceType: 'Standard Invoice',
  supplierReference: '',
  invoicePdf: '',
  taxInvoice: '',
  deliveryNote: '',
  grnReference: '',
  remarks: '',
  declaration: false,
};

export default function Invoices() {
  const [invoices, setInvoices] = useLocalState('supplier-invoices', seedInvoices);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPO, setSelectedPO] = useState(purchaseOrders[0]?.poNo || '');
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = selectedStatus === 'All' || invoice.status === selectedStatus;
      const searchable = `${invoice.invoiceNo} ${invoice.poNo} ${invoice.amount} ${invoice.status} ${invoice.date}`.toLowerCase();

      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [invoices, selectedStatus, search]);

  const stats = useMemo(() => ({
    total: invoices.length,
    submitted: invoices.filter((invoice) => ['Submitted', 'Under Validation'].includes(invoice.status)).length,
    approved: invoices.filter((invoice) => invoice.status === 'Approved').length,
    paid: invoices.filter((invoice) => invoice.status === 'Paid').length,
  }), [invoices]);

  const selectedPOData = purchaseOrders.find((po) => po.poNo === form.poNo);

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const openInvoiceDrawer = () => {
    setForm({
      ...initialForm,
      poNo: selectedPO,
    });
    setErrors({});
    setShowInvoiceDrawer(true);
  };

  const closeInvoiceDrawer = () => {
    setShowInvoiceDrawer(false);
    setErrors({});
  };

  const update = (key) => (event) => {
    const value =
      event.target.type === 'file'
        ? event.target.files?.[0]?.name || ''
        : event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;

    setForm({ ...form, [key]: value });

    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const validateInvoice = () => {
    const nextErrors = {};

    if (!form.poNo) nextErrors.poNo = 'PO number is required';
    if (!form.invoiceDate) nextErrors.invoiceDate = 'Invoice date is required';
    if (!form.dueDate) nextErrors.dueDate = 'Payment due date is required';
    if (!form.invoiceAmount) nextErrors.invoiceAmount = 'Invoice amount is required';
    if (!form.totalAmount) nextErrors.totalAmount = 'Total invoice amount is required';
    if (!form.paymentTerms) nextErrors.paymentTerms = 'Payment terms are required';
    if (!form.supplierReference.trim()) nextErrors.supplierReference = 'Supplier invoice reference is required';
    if (!form.invoicePdf) nextErrors.invoicePdf = 'Invoice PDF is required';
    if (!form.deliveryNote) nextErrors.deliveryNote = 'Delivery note is required';
    if (!form.declaration) nextErrors.declaration = 'Declaration must be accepted';

    if (form.invoiceAmount && Number(form.invoiceAmount) <= 0) {
      nextErrors.invoiceAmount = 'Enter a valid invoice amount';
    }

    if (form.totalAmount && Number(form.totalAmount) <= 0) {
      nextErrors.totalAmount = 'Enter a valid total amount';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submitInvoice = (event) => {
    event.preventDefault();

    if (!validateInvoice()) return;

    const invoiceNo = `INV-${Math.floor(91000 + Math.random() * 900)}`;

    const newInvoice = {
      invoiceNo,
      poNo: form.poNo,
      date: new Date(form.invoiceDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      amount: `${form.currency} ${Number(form.totalAmount).toLocaleString()}`,
      status: 'Submitted',
      dueDate: form.dueDate,
      paymentTerms: form.paymentTerms,
      invoiceType: form.invoiceType,
      supplierReference: form.supplierReference,
      invoicePdf: form.invoicePdf,
      taxInvoice: form.taxInvoice,
      deliveryNote: form.deliveryNote,
      grnReference: form.grnReference,
      remarks: form.remarks,
    };

    setInvoices([newInvoice, ...invoices]);
    setSelectedPO(form.poNo);
    setShowInvoiceDrawer(false);
    setForm(initialForm);
    showMessage(`${invoiceNo} submitted for buyer validation.`);
  };

  return (
    <PageShell
      title="Invoice Submission"
      subtitle="Submit invoices against acknowledged purchase orders and track buyer validation."
      action={<span className="status prequalified">{stats.submitted} In Validation</span>}
    >
      <style>{`
        .invoice-page {
          display: grid;
          gap: 18px;
        }

        .invoice-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .invoice-metric {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .invoice-metric span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .invoice-metric strong {
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .invoice-panel {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .invoice-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px 12px;
        }

        .invoice-panel-head h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .invoice-panel-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .invoice-header-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-left: auto;
        }

        .invoice-main-btn {
          height: 38px;
          border: 0;
          border-radius: 10px;
          padding: 0 14px;
          background: #7545fe;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .invoice-filter-bar {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 170px 210px;
          gap: 10px;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .invoice-filter-bar input,
        .invoice-filter-bar select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .invoice-filter-bar input:focus,
        .invoice-filter-bar select:focus,
        .drawer-form input:focus,
        .drawer-form select:focus,
        .drawer-form textarea:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .invoice-table-wrap {
          overflow-x: auto;
        }

        .invoice-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .invoice-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          text-align: left;
          padding: 11px 16px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .invoice-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .invoice-table tr:hover td {
          background: #fbfdff;
        }

        .invoice-ref strong,
        .invoice-po strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .invoice-ref small,
        .invoice-po small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .invoice-status {
          display: inline-flex;
          justify-content: center;
          min-width: 108px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .invoice-status.draft {
          background: #f8fafc;
          color: #64748b;
          border-color: #e2e8f0;
        }

        .invoice-status.submitted {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .invoice-status.validation {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .invoice-status.approved {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .invoice-status.rejected {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .invoice-status.paid {
          background: #f0fdfa;
          color: #7545fe;
          border-color: #99f6e4;
        }

        .invoice-view-btn {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .invoice-view-btn:hover {
          border-color: #7545fe;
          color: #7545fe;
          background: #f0fdfa;
        }

        .invoice-empty {
          padding: 34px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .drawer-overlay,
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .38);
          z-index: 50;
        }

        .drawer-overlay {
          display: flex;
          justify-content: flex-end;
        }

        .drawer-panel {
          width: 480px;
          max-width: 100%;
          height: 100%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          box-shadow: -18px 0 40px rgba(15, 23, 42, .16);
        }

        .drawer-head,
        .modal-head {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .drawer-head h3,
        .modal-head h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .drawer-head p,
        .modal-head p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .drawer-close {
          width: 34px;
          height: 34px;
          border: 1px solid #dbe3ec;
          background: #ffffff;
          border-radius: 9px;
          cursor: pointer;
          font-size: 20px;
          color: #64748b;
        }

        .drawer-form {
          padding: 20px;
          display: grid;
          gap: 14px;
          overflow-y: auto;
        }

        .drawer-form label {
          display: grid;
          gap: 6px;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
        }

        .drawer-form input,
        .drawer-form select,
        .drawer-form textarea {
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 11px 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .drawer-form textarea {
          resize: vertical;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .file-card {
          border: 1px dashed #cbd5e1 !important;
          border-radius: 12px;
          padding: 14px;
          background: #ffffff;
          cursor: pointer;
        }

        .file-card input {
          display: none;
        }

        .file-card.uploaded {
          background: #f0fdf4;
          border-color: #86efac !important;
        }

        .file-card.error {
          background: #fffafa;
          border-color: #ef4444 !important;
        }

        .file-card strong,
        .file-card small {
          display: block;
        }

        .file-card strong {
          color: #172033;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .file-card small {
          color: #64748b;
          font-size: 12px;
          word-break: break-word;
        }

        .declaration-check {
          display: flex !important;
          align-items: flex-start;
          gap: 10px !important;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          font-weight: 600 !important;
        }

        .declaration-check input {
          width: 16px;
          height: 16px;
          margin-top: 2px;
          padding: 0;
        }

        .field-error input,
        .field-error select,
        .field-error textarea {
          border-color: #ef4444 !important;
          background: #fffafa;
        }

        .error-text {
          color: #dc2626;
          font-size: 12px;
          font-weight: 600;
        }

        .drawer-footer {
          margin-top: auto;
          padding: 14px 20px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .primary-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .modal-overlay {
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .invoice-modal {
          width: min(820px, 100%);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-body {
          padding: 20px;
        }

        .invoice-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .invoice-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .invoice-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .invoice-detail-card strong {
          color: #172033;
          font-size: 14px;
        }

        .invoice-timeline {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .invoice-timeline-item {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 10px;
          align-items: start;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
        }

        .invoice-timeline-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: #ecfdf5;
          color: #047857;
          font-weight: 800;
          font-size: 12px;
        }

        .invoice-timeline-item strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .invoice-timeline-item small {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        @media (max-width: 1100px) {
          .invoice-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .invoice-panel-head {
            flex-direction: column;
          }

          .invoice-header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .invoice-filter-bar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .invoice-metrics,
          .invoice-detail-grid,
          .two-col {
            grid-template-columns: 1fr;
          }

          .drawer-panel {
            width: 100%;
          }
        }
      `}</style>

      <Toast message={toast} />

      <div className="invoice-page">
        <div className="invoice-metrics">
          <div className="invoice-metric">
            <span>Total Invoices</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="invoice-metric">
            <span>In Validation</span>
            <strong>{stats.submitted}</strong>
          </div>

          <div className="invoice-metric">
            <span>Approved</span>
            <strong>{stats.approved}</strong>
          </div>

          <div className="invoice-metric">
            <span>Paid</span>
            <strong>{stats.paid}</strong>
          </div>
        </div>

        <section className="invoice-panel">
          <div className="invoice-panel-head">
            <div>
              <h3>Supplier Invoices</h3>
              <p>Submit invoices, monitor validation status and track payment readiness.</p>
            </div>

            <div className="invoice-header-actions">
              <button
                type="button"
                className="invoice-main-btn"
                onClick={() => navigate('/invoices/new')}
              >
                Submit Invoice
              </button>
            </div>
          </div>

          <div className="invoice-filter-bar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice no, PO, amount, status..."
            />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option>All</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Under Validation</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Paid</option>
            </select>

            <select value={selectedPO} onChange={(event) => setSelectedPO(event.target.value)}>
              {purchaseOrders.map((po) => (
                <option key={po.poNo} value={po.poNo}>
                  {po.poNo}
                </option>
              ))}
            </select>
          </div>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>PO No</th>
                  <th>Invoice Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.invoiceNo}>
                    <td>
                      <div className="invoice-ref">
                        <strong>{invoice.invoiceNo}</strong>
                        <small>Supplier invoice</small>
                      </div>
                    </td>

                    <td>
                      <div className="invoice-po">
                        <strong>{invoice.poNo}</strong>
                        <small>Purchase order reference</small>
                      </div>
                    </td>

                    <td>{invoice.date}</td>
                    <td>{invoice.amount}</td>

                    <td>
                      <span className={`invoice-status ${statusClass[invoice.status] || 'submitted'}`}>
                        {invoice.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="invoice-view-btn"
                        onClick={() => setViewInvoice(invoice)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="invoice-empty">No invoices found for the selected filter.</div>
            )}
          </div>
        </section>
      </div>



      {viewInvoice && (
        <div className="modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="invoice-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewInvoice.invoiceNo}</h3>
                <p>Invoice validation, payment readiness and supporting document snapshot.</p>
              </div>

              <button type="button" className="drawer-close" onClick={() => setViewInvoice(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="invoice-detail-grid">
                <div className="invoice-detail-card">
                  <span>PO Number</span>
                  <strong>{viewInvoice.poNo}</strong>
                </div>

                <div className="invoice-detail-card">
                  <span>Invoice Date</span>
                  <strong>{viewInvoice.date}</strong>
                </div>

                <div className="invoice-detail-card">
                  <span>Amount</span>
                  <strong>{viewInvoice.amount}</strong>
                </div>

                <div className="invoice-detail-card">
                  <span>Status</span>
                  <strong>{viewInvoice.status}</strong>
                </div>

                <div className="invoice-detail-card">
                  <span>Payment Terms</span>
                  <strong>{viewInvoice.paymentTerms || '30 Days Credit'}</strong>
                </div>

                <div className="invoice-detail-card">
                  <span>Supplier Reference</span>
                  <strong>{viewInvoice.supplierReference || 'Not available'}</strong>
                </div>
              </div>

              <div className="invoice-timeline">
                <div className="invoice-timeline-item">
                  <div className="invoice-timeline-icon">1</div>
                  <div>
                    <strong>Invoice submitted</strong>
                    <small>Supplier invoice details and attachments received.</small>
                  </div>
                </div>

                <div className="invoice-timeline-item">
                  <div className="invoice-timeline-icon">2</div>
                  <div>
                    <strong>Buyer validation</strong>
                    <small>Finance team validates PO, GRN, tax and invoice amount.</small>
                  </div>
                </div>

                <div className="invoice-timeline-item">
                  <div className="invoice-timeline-icon">3</div>
                  <div>
                    <strong>Payment processing</strong>
                    <small>Approved invoices move to payment tracking.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setViewInvoice(null)}>
                Close
              </button>

              <button type="button" className="primary-btn" onClick={() => setViewInvoice(null)}>
                Download Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}