import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { bids as seedBids, rfqs } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const initialForm = {
    rfq: rfqs[0]?.id || '',
    currency: 'USD',
    baseAmount: '',
    discount: '',
    taxPercent: '',
    freightCharges: '',
    totalAmount: '',
    deliveryLeadTime: '',
    deliveryLocation: '',
    incoterms: 'DAP',
    paymentTerms: '30 Days Credit',
    bidValidity: '60 Days',
    warranty: '',
    technicalCompliance: '',
    deviations: '',
    technicalAttachment: '',
    commercialAttachment: '',
    complianceAttachment: '',
    remarks: '',
    declaration: false,
};

export default function NewBid() {
    const navigate = useNavigate();
    const [bids, setBids] = useLocalState('supplier-bids', seedBids);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    const selectedRfq = useMemo(
        () => rfqs.find((rfq) => rfq.id === form.rfq),
        [form.rfq]
    );

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

    const validate = () => {
        const nextErrors = {};

        if (!form.rfq) nextErrors.rfq = 'RFQ reference is required';
        if (!form.baseAmount) nextErrors.baseAmount = 'Base amount is required';
        if (!form.totalAmount) nextErrors.totalAmount = 'Total bid amount is required';
        if (!form.deliveryLeadTime) nextErrors.deliveryLeadTime = 'Delivery lead time is required';
        if (!form.deliveryLocation) nextErrors.deliveryLocation = 'Delivery location is required';
        if (!form.paymentTerms) nextErrors.paymentTerms = 'Payment terms are required';
        if (!form.bidValidity) nextErrors.bidValidity = 'Bid validity is required';
        if (!form.technicalCompliance) nextErrors.technicalCompliance = 'Technical compliance response is required';
        if (!form.technicalAttachment) nextErrors.technicalAttachment = 'Technical attachment is required';
        if (!form.commercialAttachment) nextErrors.commercialAttachment = 'Commercial attachment is required';
        if (!form.declaration) nextErrors.declaration = 'Declaration must be accepted';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const submitBid = (event) => {
        event.preventDefault();

        if (!validate()) return;

        const bidNo = `BID-${Math.floor(8000 + Math.random() * 900)}`;

        setBids([
            {
                bidNo,
                rfq: form.rfq,
                amount: `${form.currency} ${Number(form.totalAmount).toLocaleString()}`,
                submitted: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }),
                status: 'Submitted',
                score: 'Pending',
                leadTime: form.deliveryLeadTime,
                validity: form.bidValidity,
                paymentTerms: form.paymentTerms,
                technicalAttachment: form.technicalAttachment,
                commercialAttachment: form.commercialAttachment,
            },
            ...bids,
        ]);

        setToast(`${bidNo} submitted successfully.`);
        setTimeout(() => navigate('/bids'), 900);
    };

    return (
        <PageShell
            title="New Bid Package"
            subtitle="Prepare a complete technical and commercial bid response for buyer evaluation."
            action={<button className="secondary-btn" onClick={() => navigate('/bids')}>Back to Bids</button>}
        >
            <style>{`
        .new-bid-page {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .bid-side-card,
        .bid-form-card {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 18px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, .05);
        }

        .bid-side-card {
          padding: 18px;
          position: sticky;
          top: 92px;
        }

        .bid-side-card h3 {
          margin: 0 0 6px;
          color: #172033;
          font-size: 17px;
        }

        .bid-side-card p {
          margin: 0 0 16px;
          color: #64748b;
          font-size: 13px;
        }

        .bid-side-item {
          padding: 12px 0;
          border-top: 1px solid #edf2f7;
        }

        .bid-side-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 4px;
        }

        .bid-side-item strong {
          color: #172033;
          font-size: 13px;
        }

        .bid-form-card {
          overflow: hidden;
          border-top: 4px solid #7545fe;
        }

        .bid-section {
          padding: 22px 24px;
          border-bottom: 1px solid #edf2f7;
        }

        .bid-section h3 {
          margin: 0 0 4px;
          color: #172033;
          font-size: 18px;
        }

        .bid-section p {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 13px;
        }

        .bid-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .bid-form-grid label {
          display: grid;
          gap: 6px;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
        }

        .bid-form-grid label.full {
          grid-column: 1 / -1;
        }

        .bid-form-grid input,
        .bid-form-grid select,
        .bid-form-grid textarea {
          border: 1px solid #dbe3ec;
          border-radius: 11px;
          padding: 11px 12px;
          font-size: 13px;
          color: #172033;
          outline: none;
          background: #fff;
        }

        .bid-form-grid textarea {
          resize: vertical;
        }

        .bid-form-grid input:focus,
        .bid-form-grid select:focus,
        .bid-form-grid textarea:focus {
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

        .bid-submit-bar {
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
          .new-bid-page {
            grid-template-columns: 1fr;
          }

          .bid-side-card {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .bid-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

            <Toast message={toast} />

            <div className="new-bid-page">
                <aside className="bid-side-card">
                    <h3>RFQ Snapshot</h3>
                    <p>Selected buyer requirement for this bid package.</p>

                    <div className="bid-side-item">
                        <span>RFQ No</span>
                        <strong>{selectedRfq?.id || '-'}</strong>
                    </div>

                    <div className="bid-side-item">
                        <span>Requirement</span>
                        <strong>{selectedRfq?.title || '-'}</strong>
                    </div>

                    <div className="bid-side-item">
                        <span>Buyer Team</span>
                        <strong>{selectedRfq?.buyer || '-'}</strong>
                    </div>

                    <div className="bid-side-item">
                        <span>Due Date</span>
                        <strong>{selectedRfq?.dueDate || '-'}</strong>
                    </div>

                    <div className="bid-side-item">
                        <span>Estimated Value</span>
                        <strong>{selectedRfq?.value || '-'}</strong>
                    </div>
                </aside>

                <form className="bid-form-card" onSubmit={submitBid} noValidate>
                    <section className="bid-section">
                        <h3>RFQ Selection</h3>
                        <p>Select the RFQ for which this bid package is being submitted.</p>

                        <div className="bid-form-grid">
                            <label className={`full ${errors.rfq ? 'field-error' : ''}`}>
                                RFQ Reference
                                <select value={form.rfq} onChange={update('rfq')}>
                                    <option value="">Select RFQ reference</option>
                                    {rfqs.map((rfq) => (
                                        <option key={rfq.id} value={rfq.id}>
                                            {rfq.id} - {rfq.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.rfq && <span className="error-text">{errors.rfq}</span>}
                            </label>
                        </div>
                    </section>

                    <section className="bid-section">
                        <h3>Commercial Pricing</h3>
                        <p>Enter financial offer values for buyer evaluation.</p>

                        <div className="bid-form-grid">
                            <label>
                                Currency
                                <select value={form.currency} onChange={update('currency')}>
                                    <option>USD</option>
                                    <option>AED</option>
                                    <option>SAR</option>
                                    <option>INR</option>
                                </select>
                            </label>

                            <label className={errors.baseAmount ? 'field-error' : ''}>
                                Base Amount
                                <input type="number" value={form.baseAmount} onChange={update('baseAmount')} placeholder="Enter base bid amount" />
                                {errors.baseAmount && <span className="error-text">{errors.baseAmount}</span>}
                            </label>

                            <label>
                                Discount
                                <input type="number" value={form.discount} onChange={update('discount')} placeholder="Enter discount amount if any" />
                            </label>

                            <label>
                                Tax %
                                <input type="number" value={form.taxPercent} onChange={update('taxPercent')} placeholder="Enter tax percentage" />
                            </label>

                            <label>
                                Freight / Logistics Charges
                                <input type="number" value={form.freightCharges} onChange={update('freightCharges')} placeholder="Enter freight charges" />
                            </label>

                            <label className={errors.totalAmount ? 'field-error' : ''}>
                                Total Bid Amount
                                <input type="number" value={form.totalAmount} onChange={update('totalAmount')} placeholder="Enter final submitted amount" />
                                {errors.totalAmount && <span className="error-text">{errors.totalAmount}</span>}
                            </label>
                        </div>
                    </section>

                    <section className="bid-section">
                        <h3>Delivery & Payment Terms</h3>
                        <p>Provide delivery commitment and commercial conditions.</p>

                        <div className="bid-form-grid">
                            <label className={errors.deliveryLeadTime ? 'field-error' : ''}>
                                Delivery Lead Time
                                <input value={form.deliveryLeadTime} onChange={update('deliveryLeadTime')} placeholder="Example: 4-6 weeks after PO" />
                                {errors.deliveryLeadTime && <span className="error-text">{errors.deliveryLeadTime}</span>}
                            </label>

                            <label className={errors.deliveryLocation ? 'field-error' : ''}>
                                Delivery Location
                                <input value={form.deliveryLocation} onChange={update('deliveryLocation')} placeholder="Enter delivery location or warehouse" />
                                {errors.deliveryLocation && <span className="error-text">{errors.deliveryLocation}</span>}
                            </label>

                            <label>
                                Incoterms
                                <select value={form.incoterms} onChange={update('incoterms')}>
                                    <option>EXW</option>
                                    <option>FOB</option>
                                    <option>CIF</option>
                                    <option>DAP</option>
                                    <option>DDP</option>
                                </select>
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

                            <label className={errors.bidValidity ? 'field-error' : ''}>
                                Bid Validity
                                <select value={form.bidValidity} onChange={update('bidValidity')}>
                                    <option value="">Select bid validity</option>
                                    <option>30 Days</option>
                                    <option>45 Days</option>
                                    <option>60 Days</option>
                                    <option>90 Days</option>
                                </select>
                                {errors.bidValidity && <span className="error-text">{errors.bidValidity}</span>}
                            </label>

                            <label>
                                Warranty / Support
                                <input value={form.warranty} onChange={update('warranty')} placeholder="Example: 12 months warranty" />
                            </label>
                        </div>
                    </section>

                    <section className="bid-section">
                        <h3>Technical Compliance</h3>
                        <p>Declare compliance against RFQ scope and technical requirements.</p>

                        <div className="bid-form-grid">
                            <label className={`full ${errors.technicalCompliance ? 'field-error' : ''}`}>
                                Technical Compliance Response
                                <textarea rows="4" value={form.technicalCompliance} onChange={update('technicalCompliance')} placeholder="Summarize technical compliance against RFQ requirements" />
                                {errors.technicalCompliance && <span className="error-text">{errors.technicalCompliance}</span>}
                            </label>

                            <label className="full">
                                Deviations / Exclusions
                                <textarea rows="3" value={form.deviations} onChange={update('deviations')} placeholder="Mention any deviations, exclusions or alternate proposals" />
                            </label>
                        </div>
                    </section>

                    <section className="bid-section">
                        <h3>Attachments</h3>
                        <p>Upload technical, commercial and compliance documents.</p>

                        <div className="bid-form-grid">
                            <label className={`file-tile ${form.technicalAttachment ? 'uploaded' : ''} ${errors.technicalAttachment ? 'error' : ''}`}>
                                <input type="file" onChange={update('technicalAttachment')} />
                                <strong>Technical Proposal</strong>
                                <small>{errors.technicalAttachment || form.technicalAttachment || 'Upload technical proposal file'}</small>
                            </label>

                            <label className={`file-tile ${form.commercialAttachment ? 'uploaded' : ''} ${errors.commercialAttachment ? 'error' : ''}`}>
                                <input type="file" onChange={update('commercialAttachment')} />
                                <strong>Commercial Quotation</strong>
                                <small>{errors.commercialAttachment || form.commercialAttachment || 'Upload commercial quotation file'}</small>
                            </label>

                            <label className={`file-tile ${form.complianceAttachment ? 'uploaded' : ''}`}>
                                <input type="file" onChange={update('complianceAttachment')} />
                                <strong>Compliance Document</strong>
                                <small>{form.complianceAttachment || 'Optional compliance / datasheet attachment'}</small>
                            </label>
                        </div>
                    </section>

                    <section className="bid-section">
                        <h3>Declaration</h3>
                        <p>Confirm bid validity before submitting to buyer.</p>

                        <div className="bid-form-grid">
                            <label className="full">
                                Supplier Remarks
                                <textarea rows="4" value={form.remarks} onChange={update('remarks')} placeholder="Add assumptions, commercial notes or internal reference" />
                            </label>

                            <label className="full declaration-box">
                                <input type="checkbox" checked={form.declaration} onChange={update('declaration')} />
                                <span>I confirm that pricing, delivery, technical response and attachments are valid for buyer evaluation.</span>
                            </label>

                            {errors.declaration && <span className="error-text">{errors.declaration}</span>}
                        </div>
                    </section>

                    <div className="bid-submit-bar">
                        <button type="button" className="secondary-btn" onClick={() => navigate('/bids')}>
                            Cancel
                        </button>

                        <button type="submit" className="primary-btn" disabled={!form.declaration}>
                            Submit Bid
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>
    );
}