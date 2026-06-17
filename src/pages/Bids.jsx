import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { bids as seedBids, rfqs } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const statusClass = {
  Draft: 'draft',
  Submitted: 'submitted',
  Revision: 'revision',
  Awarded: 'awarded',
  Rejected: 'rejected',
};

const initialForm = {
  rfq: rfqs[0]?.id || '',
  commercialAmount: '',
  currency: 'USD',
  leadTime: '',
  validity: '30 Days',
  paymentTerms: '30 Days Credit',
  warranty: '',
  technicalAttachment: '',
  commercialAttachment: '',
  notes: '',
  declaration: false,
};

export default function Bids() {
  const [bids, setBids] = useLocalState('supplier-bids', seedBids);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showBidDrawer, setShowBidDrawer] = useState(false);
  const [viewBid, setViewBid] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      const statusMatch = selectedStatus === 'All' || bid.status === selectedStatus;
      const searchable = `${bid.bidNo} ${bid.rfq} ${bid.amount} ${bid.status} ${bid.score}`.toLowerCase();

      return statusMatch && searchable.includes(search.toLowerCase());
    });
  }, [bids, selectedStatus, search]);

  const stats = useMemo(() => ({
    total: bids.length,
    submitted: bids.filter((bid) => bid.status === 'Submitted').length,
    awarded: bids.filter((bid) => bid.status === 'Awarded').length,
    pending: bids.filter((bid) => bid.score === 'Pending').length,
  }), [bids]);

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
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

  const openNewBid = () => {
    setForm(initialForm);
    setErrors({});
    setShowBidDrawer(true);
  };

  const openReviseBid = (bid) => {
    const amountOnly = String(bid.amount || '').replace(/[^\d.]/g, '');

    setForm({
      ...initialForm,
      rfq: bid.rfq,
      commercialAmount: amountOnly,
      validity: '45 Days',
      notes: `Revision against ${bid.bidNo}`,
    });

    setErrors({});
    setShowBidDrawer(true);
  };

  const closeBidDrawer = () => {
    setShowBidDrawer(false);
    setErrors({});
  };

  const validateBid = () => {
    const nextErrors = {};

    if (!form.rfq) nextErrors.rfq = 'RFQ reference is required';
    if (!form.commercialAmount.trim()) nextErrors.commercialAmount = 'Bid amount is required';
    if (!form.leadTime.trim()) nextErrors.leadTime = 'Lead time is required';
    if (!form.validity) nextErrors.validity = 'Bid validity is required';
    if (!form.paymentTerms) nextErrors.paymentTerms = 'Payment terms are required';
    if (!form.technicalAttachment) nextErrors.technicalAttachment = 'Technical attachment is required';
    if (!form.commercialAttachment) nextErrors.commercialAttachment = 'Commercial attachment is required';
    if (!form.declaration) nextErrors.declaration = 'Declaration must be accepted';

    if (form.commercialAmount && Number(form.commercialAmount) <= 0) {
      nextErrors.commercialAmount = 'Enter a valid amount';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();

    if (!validateBid()) return;

    const bidNo = `BID-${Math.floor(8000 + Math.random() * 900)}`;

    const newBid = {
      bidNo,
      rfq: form.rfq,
      amount: `${form.currency} ${Number(form.commercialAmount).toLocaleString()}`,
      submitted: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Submitted',
      score: 'Pending',
      leadTime: form.leadTime,
      validity: form.validity,
      paymentTerms: form.paymentTerms,
      technicalAttachment: form.technicalAttachment,
      commercialAttachment: form.commercialAttachment,
      notes: form.notes,
    };

    setBids([newBid, ...bids]);
    setForm(initialForm);
    setShowBidDrawer(false);
    showMessage(`${bidNo} submitted successfully.`);
  };

  return (
    <PageShell
      title="Bid Submissions"
      subtitle="Prepare technical and commercial offers with revision tracking."
      action={<span className="status prequalified">{stats.submitted} Submitted Bids</span>}
    >
      <style>{`
        .bid-page {
          display: grid;
          gap: 18px;
        }

        .bid-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .bid-metric {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .bid-metric span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .bid-metric strong {
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .bid-panel {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .bid-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px 12px;
        }

        .bid-panel-head h3 {
          margin: 0;
          font-size: 18px;
          color: #172033;
        }

        .bid-panel-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .bid-header-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-left: auto;
        }

        .bid-main-btn {
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

        .bid-filter-bar {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 160px;
          gap: 10px;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .bid-filter-bar input,
        .bid-filter-bar select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .bid-filter-bar input:focus,
        .bid-filter-bar select:focus,
        .drawer-form input:focus,
        .drawer-form select:focus,
        .drawer-form textarea:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .bid-table-wrap {
          overflow-x: auto;
        }

        .bid-table {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
        }

        .bid-table th {
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

        .bid-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .bid-table tr:hover td {
          background: #fbfdff;
        }

        .bid-no strong,
        .bid-rfq strong {
          display: block;
          font-size: 13px;
          color: #172033;
        }

        .bid-no small,
        .bid-rfq small {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 11px;
        }

        .bid-status {
          display: inline-flex;
          justify-content: center;
          min-width: 92px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .bid-status.draft {
          background: #f8fafc;
          color: #64748b;
          border-color: #e2e8f0;
        }

        .bid-status.submitted {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .bid-status.revision {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .bid-status.awarded {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .bid-status.rejected {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .bid-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .bid-action-btn {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .bid-action-btn:hover {
          border-color: #7545fe;
          color: #7545fe;
          background: #f0fdfa;
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
          width: 460px;
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
          border: 1px dashed #cbd5e1;
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
          border-color: #86efac;
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

        .file-card.error {
          background: #fffafa;
          border-color: #ef4444;
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
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .modal-overlay {
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .bid-modal {
          width: min(760px, 100%);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-body {
          padding: 20px;
        }

        .bid-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .bid-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .bid-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .bid-detail-card strong {
          color: #172033;
          font-size: 14px;
        }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 1100px) {
          .bid-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .bid-panel-head {
            flex-direction: column;
          }

          .bid-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 700px) {
          .bid-metrics,
          .bid-filter-bar,
          .two-col,
          .bid-detail-grid {
            grid-template-columns: 1fr;
          }

          .drawer-panel {
            width: 100%;
          }
        }
      `}</style>

      <Toast message={toast} />

      <div className="bid-page">
        <div className="bid-metrics">
          <div className="bid-metric">
            <span>Total Bids</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="bid-metric">
            <span>Submitted</span>
            <strong>{stats.submitted}</strong>
          </div>

          <div className="bid-metric">
            <span>Awarded</span>
            <strong>{stats.awarded}</strong>
          </div>

          <div className="bid-metric">
            <span>Evaluation Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <section className="bid-panel">
          <div className="bid-panel-head">
            <div>
              <h3>Bid Packages</h3>
              <p>Track submitted commercial offers, technical attachments and revisions.</p>
            </div>

            <div className="bid-header-actions">
              <button type="button" className="bid-main-btn" onClick={() => navigate('/bids/new')}>
                New Bid
              </button>
            </div>
          </div>

          <div className="bid-filter-bar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bid no, RFQ, amount, status..."
            />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option>All</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Revision</option>
              <option>Awarded</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="bid-table-wrap">
            <table className="bid-table">
              <thead>
                <tr>
                  <th>Bid No</th>
                  <th>RFQ Ref</th>
                  <th>Amount</th>
                  <th>Submitted On</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBids.map((bid) => (
                  <tr key={bid.bidNo}>
                    <td>
                      <div className="bid-no">
                        <strong>{bid.bidNo}</strong>
                        <small>Commercial offer</small>
                      </div>
                    </td>

                    <td>
                      <div className="bid-rfq">
                        <strong>{bid.rfq}</strong>
                        <small>Buyer RFQ reference</small>
                      </div>
                    </td>

                    <td>{bid.amount}</td>
                    <td>{bid.submitted}</td>
                    <td>{bid.score}</td>

                    <td>
                      <span className={`bid-status ${statusClass[bid.status] || 'submitted'}`}>
                        {bid.status}
                      </span>
                    </td>

                    <td>
                      <div className="bid-actions">
                        <button
                          type="button"
                          className="bid-action-btn"
                          onClick={() => setViewBid(bid)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="bid-action-btn"
                          onClick={() => openReviseBid(bid)}
                        >
                          Revise
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showBidDrawer && (
        <div className="drawer-overlay" onClick={closeBidDrawer}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>New Bid Package</h3>
                <p>Submit commercial price, lead time, validity and required documents.</p>
              </div>

              <button type="button" className="drawer-close" onClick={closeBidDrawer}>
                ×
              </button>
            </div>

            <form className="drawer-form" onSubmit={submit} noValidate>
              <label className={errors.rfq ? 'field-error' : ''}>
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

              <div className="two-col">
                <label>
                  Currency
                  <select value={form.currency} onChange={update('currency')}>
                    <option>USD</option>
                    <option>AED</option>
                    <option>SAR</option>
                    <option>INR</option>
                  </select>
                </label>

                <label className={errors.commercialAmount ? 'field-error' : ''}>
                  Bid Amount
                  <input
                    value={form.commercialAmount}
                    onChange={update('commercialAmount')}
                    placeholder="Enter total bid amount"
                    type="number"
                    min="1"
                  />
                  {errors.commercialAmount && (
                    <span className="error-text">{errors.commercialAmount}</span>
                  )}
                </label>
              </div>

              <div className="two-col">
                <label className={errors.leadTime ? 'field-error' : ''}>
                  Lead Time
                  <input
                    value={form.leadTime}
                    onChange={update('leadTime')}
                    placeholder="Example: 4 weeks"
                  />
                  {errors.leadTime && <span className="error-text">{errors.leadTime}</span>}
                </label>

                <label className={errors.validity ? 'field-error' : ''}>
                  Validity
                  <select value={form.validity} onChange={update('validity')}>
                    <option value="">Select validity</option>
                    <option>30 Days</option>
                    <option>45 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                  </select>
                  {errors.validity && <span className="error-text">{errors.validity}</span>}
                </label>
              </div>

              <div className="two-col">
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

                <label>
                  Warranty / Support
                  <input
                    value={form.warranty}
                    onChange={update('warranty')}
                    placeholder="Example: 12 months"
                  />
                </label>
              </div>

              <label
                className={`file-card ${form.technicalAttachment ? 'uploaded' : ''} ${errors.technicalAttachment ? 'error' : ''
                  }`}
              >
                <input type="file" onChange={update('technicalAttachment')} />
                <strong>Technical Attachment</strong>
                <small>
                  {errors.technicalAttachment ||
                    form.technicalAttachment ||
                    'Upload technical proposal file'}
                </small>
              </label>

              <label
                className={`file-card ${form.commercialAttachment ? 'uploaded' : ''} ${errors.commercialAttachment ? 'error' : ''
                  }`}
              >
                <input type="file" onChange={update('commercialAttachment')} />
                <strong>Commercial Attachment</strong>
                <small>
                  {errors.commercialAttachment ||
                    form.commercialAttachment ||
                    'Upload commercial quotation file'}
                </small>
              </label>

              <label>
                Supplier Notes
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={update('notes')}
                  placeholder="Add assumptions, exclusions, delivery notes or commercial remarks"
                />
              </label>

              <label className="declaration-check">
                <input
                  type="checkbox"
                  checked={form.declaration}
                  onChange={update('declaration')}
                />
                <span>
                  I confirm that submitted pricing, attachments and commercial terms are valid
                  for buyer evaluation.
                </span>
              </label>
              {errors.declaration && <span className="error-text">{errors.declaration}</span>}

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeBidDrawer}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={!form.declaration}>
                  Submit Bid
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {viewBid && (
        <div className="modal-overlay" onClick={() => setViewBid(null)}>
          <div className="bid-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewBid.bidNo}</h3>
                <p>Bid package details and buyer evaluation snapshot.</p>
              </div>

              <button type="button" className="drawer-close" onClick={() => setViewBid(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="bid-detail-grid">
                <div className="bid-detail-card">
                  <span>RFQ Reference</span>
                  <strong>{viewBid.rfq}</strong>
                </div>

                <div className="bid-detail-card">
                  <span>Amount</span>
                  <strong>{viewBid.amount}</strong>
                </div>

                <div className="bid-detail-card">
                  <span>Submitted On</span>
                  <strong>{viewBid.submitted}</strong>
                </div>

                <div className="bid-detail-card">
                  <span>Status</span>
                  <strong>{viewBid.status}</strong>
                </div>

                <div className="bid-detail-card">
                  <span>Evaluation Score</span>
                  <strong>{viewBid.score}</strong>
                </div>

                <div className="bid-detail-card">
                  <span>Lead Time</span>
                  <strong>{viewBid.leadTime || 'Not specified'}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="primary-btn" onClick={() => setViewBid(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}