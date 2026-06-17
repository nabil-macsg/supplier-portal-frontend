import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { invoices as seedInvoices, purchaseOrders } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

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
    grnReference: '',
    invoicePdf: '',
    taxInvoice: '',
    deliveryNote: '',
    remarks: '',
    declaration: false,
};

export default function NewInvoice() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useLocalState('supplier-invoices', seedInvoices);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState('');

    const selectedPO = purchaseOrders.find((po) => po.poNo === form.poNo);

    const update = (key) => (event) => {
        const value =
            event.target.type === 'file'
                ? event.target.files?.[0]?.name || ''
                : event.target.type === 'checkbox'
                    ? event.target.checked
                    : event.target.value;

        setForm({ ...form, [key]: value });
        if (errors[key]) setErrors({ ...errors, [key]: '' });
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.poNo) nextErrors.poNo = 'PO number is required';
        if (!form.invoiceDate) nextErrors.invoiceDate = 'Invoice date is required';
        if (!form.dueDate) nextErrors.dueDate = 'Payment due date is required';
        if (!form.supplierReference.trim()) nextErrors.supplierReference = 'Supplier invoice reference is required';
        if (!form.invoiceAmount) nextErrors.invoiceAmount = 'Invoice amount is required';
        if (!form.totalAmount) nextErrors.totalAmount = 'Total invoice amount is required';
        if (!form.paymentTerms) nextErrors.paymentTerms = 'Payment terms are required';
        if (!form.invoicePdf) nextErrors.invoicePdf = 'Invoice PDF is required';
        if (!form.deliveryNote) nextErrors.deliveryNote = 'Delivery note is required';
        if (!form.declaration) nextErrors.declaration = 'Declaration must be accepted';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const submitInvoice = (event) => {
        event.preventDefault();
        if (!validate()) return;

        const invoiceNo = `INV-${Math.floor(91000 + Math.random() * 900)}`;

        setInvoices([
            {
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
                supplierReference: form.supplierReference,
                invoicePdf: form.invoicePdf,
                deliveryNote: form.deliveryNote,
            },
            ...invoices,
        ]);

        setToast(`${invoiceNo} submitted for buyer validation.`);
        setTimeout(() => navigate('/invoices'), 900);
    };

    return (
        <PageShell
            title="Submit Invoice"
            subtitle="Create invoice against purchase order with payment, tax and supporting document details."
            action={<button className="secondary-btn" onClick={() => navigate('/invoices')}>Back to Invoices</button>}
        >
            <style>{`
        .invoice-create-page {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .invoice-side-card,
        .invoice-form-card {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 18px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, .05);
        }

        .invoice-side-card {
          padding: 18px;
          position: sticky;
          top: 92px;
        }

        .invoice-side-card h3 {
          margin: 0 0 6px;
          color: #172033;
          font-size: 17px;
        }

        .invoice-side-card p {
          margin: 0 0 16px;
          color: #64748b;
          font-size: 13px;
        }

        .invoice-side-item {
          padding: 12px 0;
          border-top: 1px solid #edf2f7;
        }

        .invoice-side-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 4px;
        }

        .invoice-side-item strong {
          color: #172033;
          font-size: 13px;
        }

        .invoice-form-card {
          overflow: hidden;
          border-top: 4px solid #7545fe;
        }

        .invoice-section {
          padding: 22px 24px;
          border-bottom: 1px solid #edf2f7;
        }

        .invoice-section h3 {
          margin: 0 0 4px;
          color: #172033;
          font-size: 18px;
        }

        .invoice-section p {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 13px;
        }

        .invoice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .invoice-grid label {
          display: grid;
          gap: 6px;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
        }

        .invoice-grid label.full {
          grid-column: 1 / -1;
        }

        .invoice-grid input,
        .invoice-grid select,
        .invoice-grid textarea {
          border: 1px solid #dbe3ec;
          border-radius: 11px;
          padding: 11px 12px;
          font-size: 13px;
          color: #172033;
          outline: none;
          background: #fff;
        }

        .invoice-grid input:focus,
        .invoice-grid select:focus,
        .invoice-grid textarea:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .file-tile {
          border: 1px dashed #cbd5e1 !important;
          border-radius: 13px;
          padding: 15px;
          cursor: pointer;
          background: #fff;
        }

        .file-tile input {
          display: none;
        }

        .file-tile.uploaded {
          background: #f0fdf4;
          border-color: #86efac !important;
        }

        .file-tile small {
          color: #64748b;
          font-size: 12px;
          word-break: break-word;
        }

        .field-error input,
        .field-error select,
        .field-error textarea,
        .file-tile.error {
          border-color: #ef4444 !important;
          background: #fffafa;
        }

        .error-text {
          color: #dc2626;
          font-size: 12px;
          font-weight: 600;
        }

        .declaration-box {
          display: flex !important;
          flex-direction: row;
          gap: 10px !important;
          align-items: flex-start;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
          font-weight: 600 !important;
        }

        .declaration-box input {
          width: 16px;
          height: 16px;
          margin-top: 2px;
          padding: 0;
        }

        .invoice-submit-bar {
          position: sticky;
          bottom: 0;
          padding: 16px 24px;
          background: rgba(255,255,255,.96);
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          backdrop-filter: blur(12px);
        }

        .primary-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 1000px) {
          .invoice-create-page {
            grid-template-columns: 1fr;
          }

          .invoice-side-card {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .invoice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

            <Toast message={toast} />

            <div className="invoice-create-page">
                <aside className="invoice-side-card">
                    <h3>PO Snapshot</h3>
                    <p>Selected purchase order for this invoice.</p>

                    <div className="invoice-side-item">
                        <span>PO No</span>
                        <strong>{selectedPO?.poNo || '-'}</strong>
                    </div>

                    <div className="invoice-side-item">
                        <span>Description</span>
                        <strong>{selectedPO?.title || '-'}</strong>
                    </div>

                    <div className="invoice-side-item">
                        <span>PO Amount</span>
                        <strong>{selectedPO?.amount || '-'}</strong>
                    </div>

                    <div className="invoice-side-item">
                        <span>Delivery</span>
                        <strong>{selectedPO?.delivery || '-'}</strong>
                    </div>

                    <div className="invoice-side-item">
                        <span>Status</span>
                        <strong>{selectedPO?.status || '-'}</strong>
                    </div>
                </aside>

                <form className="invoice-form-card" onSubmit={submitInvoice} noValidate>
                    <section className="invoice-section">
                        <h3>PO & Invoice Reference</h3>
                        <p>Select the purchase order and enter supplier invoice reference details.</p>

                        <div className="invoice-grid">
                            <label className={`full ${errors.poNo ? 'field-error' : ''}`}>
                                PO Number
                                <select value={form.poNo} onChange={update('poNo')}>
                                    <option value="">Select purchase order</option>
                                    {purchaseOrders.map((po) => (
                                        <option key={po.poNo} value={po.poNo}>
                                            {po.poNo} - {po.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.poNo && <span className="error-text">{errors.poNo}</span>}
                            </label>

                            <label className={errors.supplierReference ? 'field-error' : ''}>
                                Supplier Invoice Reference
                                <input
                                    value={form.supplierReference}
                                    onChange={update('supplierReference')}
                                    placeholder="Enter supplier invoice reference"
                                />
                                {errors.supplierReference && <span className="error-text">{errors.supplierReference}</span>}
                            </label>

                            <label>
                                Invoice Type
                                <select value={form.invoiceType} onChange={update('invoiceType')}>
                                    <option>Standard Invoice</option>
                                    <option>Milestone Invoice</option>
                                    <option>Advance Invoice</option>
                                    <option>Retention Invoice</option>
                                    <option>Credit Note</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <section className="invoice-section">
                        <h3>Invoice Dates</h3>
                        <p>Capture invoice date and expected payment due date.</p>

                        <div className="invoice-grid">
                            <label className={errors.invoiceDate ? 'field-error' : ''}>
                                Invoice Date
                                <input type="date" value={form.invoiceDate} onChange={update('invoiceDate')} />
                                {errors.invoiceDate && <span className="error-text">{errors.invoiceDate}</span>}
                            </label>

                            <label className={errors.dueDate ? 'field-error' : ''}>
                                Payment Due Date
                                <input type="date" value={form.dueDate} onChange={update('dueDate')} />
                                {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
                            </label>

                            <label className="full">
                                GRN / Delivery Reference
                                <input
                                    value={form.grnReference}
                                    onChange={update('grnReference')}
                                    placeholder="Enter GRN, delivery note, or service entry reference"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="invoice-section">
                        <h3>Amount Breakdown</h3>
                        <p>Enter invoice amount, taxes, freight and final payable amount.</p>

                        <div className="invoice-grid">
                            <label>
                                Currency
                                <select value={form.currency} onChange={update('currency')}>
                                    <option>USD</option>
                                    <option>AED</option>
                                    <option>SAR</option>
                                    <option>INR</option>
                                </select>
                            </label>

                            <label className={errors.invoiceAmount ? 'field-error' : ''}>
                                Invoice Amount
                                <input type="number" min="1" value={form.invoiceAmount} onChange={update('invoiceAmount')} placeholder="Enter invoice amount" />
                                {errors.invoiceAmount && <span className="error-text">{errors.invoiceAmount}</span>}
                            </label>

                            <label>
                                Tax Amount
                                <input type="number" value={form.taxAmount} onChange={update('taxAmount')} placeholder="Enter tax amount" />
                            </label>

                            <label>
                                Freight / Other Charges
                                <input type="number" value={form.freightAmount} onChange={update('freightAmount')} placeholder="Enter other charges" />
                            </label>

                            <label className={errors.totalAmount ? 'field-error' : ''}>
                                Total Invoice Amount
                                <input type="number" min="1" value={form.totalAmount} onChange={update('totalAmount')} placeholder="Enter final invoice amount" />
                                {errors.totalAmount && <span className="error-text">{errors.totalAmount}</span>}
                            </label>

                            <label className={errors.paymentTerms ? 'field-error' : ''}>
                                Payment Terms
                                <select value={form.paymentTerms} onChange={update('paymentTerms')}>
                                    <option value="">Select payment terms</option>
                                    <option>Advance Payment</option>
                                    <option>30 Days Credit</option>
                                    <option>45 Days Credit</option>
                                    <option>60 Days Credit</option>
                                    <option>Against Delivery</option>
                                </select>
                                {errors.paymentTerms && <span className="error-text">{errors.paymentTerms}</span>}
                            </label>
                        </div>
                    </section>

                    <section className="invoice-section">
                        <h3>Supporting Documents</h3>
                        <p>Attach invoice and delivery proof for buyer finance validation.</p>

                        <div className="invoice-grid">
                            <label className={`file-tile ${form.invoicePdf ? 'uploaded' : ''} ${errors.invoicePdf ? 'error' : ''}`}>
                                <input type="file" accept=".pdf,.xml" onChange={update('invoicePdf')} />
                                <strong>Invoice PDF / XML</strong>
                                <small>{errors.invoicePdf || form.invoicePdf || 'Upload invoice PDF or XML'}</small>
                            </label>

                            <label className={`file-tile ${form.taxInvoice ? 'uploaded' : ''}`}>
                                <input type="file" onChange={update('taxInvoice')} />
                                <strong>Tax Invoice / VAT Document</strong>
                                <small>{form.taxInvoice || 'Optional tax supporting document'}</small>
                            </label>

                            <label className={`file-tile ${form.deliveryNote ? 'uploaded' : ''} ${errors.deliveryNote ? 'error' : ''}`}>
                                <input type="file" onChange={update('deliveryNote')} />
                                <strong>Delivery Note / GRN Proof</strong>
                                <small>{errors.deliveryNote || form.deliveryNote || 'Upload delivery note or GRN proof'}</small>
                            </label>
                        </div>
                    </section>

                    <section className="invoice-section">
                        <h3>Declaration</h3>
                        <p>Confirm invoice accuracy before submission.</p>

                        <div className="invoice-grid">
                            <label className="full">
                                Supplier Remarks
                                <textarea
                                    rows="4"
                                    value={form.remarks}
                                    onChange={update('remarks')}
                                    placeholder="Add payment, delivery, or validation remarks"
                                />
                            </label>

                            <label className="full declaration-box">
                                <input type="checkbox" checked={form.declaration} onChange={update('declaration')} />
                                <span>I confirm that this invoice is accurate, supported by delivery documents, and ready for buyer validation.</span>
                            </label>

                            {errors.declaration && <span className="error-text">{errors.declaration}</span>}
                        </div>
                    </section>

                    <div className="invoice-submit-bar">
                        <button type="button" className="secondary-btn" onClick={() => navigate('/invoices')}>
                            Cancel
                        </button>

                        <button type="submit" className="primary-btn" disabled={!form.declaration}>
                            Submit Invoice
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>
    );
}