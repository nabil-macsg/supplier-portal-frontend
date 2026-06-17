import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { rfqs as seedRfqs } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const statusClass = {
  Open: 'open',
  Invited: 'invited',
  Participating: 'participating',
  Clarification: 'clarification',
  Submitted: 'submitted',
  Closed: 'closed',
};

export default function RFQs() {
  const [rfqs, setRfqs] = useLocalState('supplier-rfqs', seedRfqs);
  const [toast, setToast] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRfq, setSelectedRfq] = useState(seedRfqs[0]?.id || '');

  const [showClarification, setShowClarification] = useState(false);
  const [showParticipation, setShowParticipation] = useState(false);
  const [viewRfq, setViewRfq] = useState(null);

  const [clarification, setClarification] = useState({
    rfq: seedRfqs[0]?.id || '',
    subject: '',
    message: '',
  });

  const [participation, setParticipation] = useState({
    rfq: seedRfqs[0]?.id || '',
    contactName: 'Aamir Khan',
    contactEmail: 'procurement@alnoor.example',
    deliveryLeadTime: '',
    bidValidity: '',
    remarks: '',
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const filteredRfqs = useMemo(() => {
    return rfqs.filter((rfq) => {
      const matchesStatus = selectedStatus === 'All' || rfq.status === selectedStatus;
      const searchable = `${rfq.id} ${rfq.title} ${rfq.buyer} ${rfq.status}`.toLowerCase();
      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [rfqs, selectedStatus, search]);

  const stats = useMemo(() => ({
    total: rfqs.length,
    open: rfqs.filter((rfq) => ['Open', 'Invited'].includes(rfq.status)).length,
    participating: rfqs.filter((rfq) => rfq.status === 'Participating').length,
    clarification: rfqs.filter((rfq) => rfq.status === 'Clarification').length,
  }), [rfqs]);

  const selectedRfqData = rfqs.find((rfq) => rfq.id === selectedRfq) || rfqs[0];

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1600);
  };

  const openParticipation = () => {
    setParticipation({
      rfq: selectedRfqData?.id || '',
      contactName: 'Aamir Khan',
      contactEmail: 'procurement@alnoor.example',
      deliveryLeadTime: '',
      bidValidity: '',
      remarks: '',
      confirm: false,
    });
    setErrors({});
    setShowParticipation(true);
  };

  const closeParticipation = () => {
    setShowParticipation(false);
    setErrors({});
  };

  const submitParticipation = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!participation.rfq) nextErrors.rfq = 'RFQ is required';
    if (!participation.contactName.trim()) nextErrors.contactName = 'Contact name is required';
    if (!participation.contactEmail.trim()) nextErrors.contactEmail = 'Contact email is required';
    if (!participation.deliveryLeadTime.trim()) nextErrors.deliveryLeadTime = 'Delivery lead time is required';
    if (!participation.bidValidity.trim()) nextErrors.bidValidity = 'Bid validity is required';

    if (participation.contactEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(participation.contactEmail)) {
        nextErrors.contactEmail = 'Enter a valid email address';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !participation.confirm) return;

    setRfqs(rfqs.map((rfq) => (
      rfq.id === participation.rfq ? { ...rfq, status: 'Participating' } : rfq
    )));

    setSelectedRfq(participation.rfq);
    setShowParticipation(false);
    showMessage(`${participation.rfq} participation confirmed.`);
  };

  const openClarification = () => {
    setClarification({
      rfq: selectedRfqData?.id || '',
      subject: '',
      message: '',
    });
    setErrors({});
    setShowClarification(true);
  };

  const closeClarification = () => {
    setShowClarification(false);
    setErrors({});
  };

  const submitClarification = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!clarification.rfq) nextErrors.rfq = 'RFQ is required';
    if (!clarification.subject.trim()) nextErrors.subject = 'Subject is required';
    if (!clarification.message.trim()) nextErrors.message = 'Clarification question is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setRfqs(rfqs.map((rfq) => (
      rfq.id === clarification.rfq ? { ...rfq, status: 'Clarification' } : rfq
    )));

    setSelectedRfq(clarification.rfq);
    setShowClarification(false);
    showMessage('Clarification request submitted.');
  };

  return (
    <PageShell
      title="RFQ Participation"
      subtitle="Review invited RFQs, confirm participation, and raise clarification queries."
      action={<span className="status prequalified">{stats.open} Open RFQs</span>}
    >
      <style>{`
        .rfq-page {
          display: grid;
          gap: 18px;
        }

        .rfq-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .rfq-metric {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .rfq-metric span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .rfq-metric strong {
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .rfq-panel {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .rfq-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border-bottom: 1px solid #e2e8f0;
        }

        .rfq-panel-head h3 {
          margin: 0;
          font-size: 18px;
          color: #172033;
        }

        .rfq-panel-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .rfq-tools {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .rfq-tools input,
        .rfq-tools select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          background: #fff;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
        }

        .rfq-tools input {
          width: 250px;
        }

        .rfq-tools select {
          width: 145px;
        }

        .rfq-tools .rfq-select-main {
          width: 220px;
        }

        .rfq-main-btn {
          height: 38px;
          border: 0;
          border-radius: 10px;
          padding: 0 14px;
          background: #7545fe;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .rfq-main-btn.secondary {
          background: #ffffff;
          color: #7545fe;
          border: 1px solid #7545fe;
        }

        .rfq-table-wrap {
          overflow-x: auto;
        }

        .rfq-table {
          width: 100%;
          min-width: 860px;
          border-collapse: collapse;
        }

        .rfq-table th {
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

        .rfq-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .rfq-table tr:hover td {
          background: #fbfdff;
        }

        .rfq-title {
          white-space: normal;
          min-width: 240px;
        }

        .rfq-id strong,
        .rfq-title strong {
          display: block;
          font-size: 13px;
          color: #172033;
        }

        .rfq-id small,
        .rfq-title small {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 11px;
        }

        .rfq-status {
          display: inline-flex;
          justify-content: center;
          min-width: 92px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .rfq-status.open {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .rfq-status.invited {
          background: #f5f3ff;
          color: #6d28d9;
          border-color: #ddd6fe;
        }

        .rfq-status.participating {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .rfq-status.clarification {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .rfq-status.submitted {
          background: #f0fdfa;
          color: #7545fe;
          border-color: #99f6e4;
        }

        .rfq-status.closed {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }

        .rfq-view-btn {
          border: 1px solid #dbe3ec;
          background: #fff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .rfq-view-btn:hover {
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
          width: 430px;
          max-width: 100%;
          height: 100%;
          background: #fff;
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
          background: #fff;
          border-radius: 9px;
          cursor: pointer;
          font-size: 20px;
          color: #64748b;
        }

        .drawer-form {
          padding: 20px;
          display: grid;
          gap: 14px;
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
        }

        .drawer-form textarea {
          resize: vertical;
        }

        .terms-check {
          display: flex !important;
          align-items: flex-start;
          gap: 10px !important;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          font-weight: 600 !important;
        }

        .terms-check input {
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

        .rfq-modal {
          width: min(760px, 100%);
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-body {
          padding: 20px;
        }

        .rfq-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .rfq-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .rfq-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .rfq-detail-card strong {
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
          .rfq-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .rfq-panel-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .rfq-tools {
            width: 100%;
          }

          .rfq-tools input,
          .rfq-tools select,
          .rfq-tools .rfq-select-main {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .rfq-metrics,
          .rfq-detail-grid {
            grid-template-columns: 1fr;
          }

          .drawer-panel {
            width: 100%;
          }
        }

        .rfq-panel-head.clean {
  padding: 16px 18px 12px;
  border-bottom: 0;
}

.rfq-header-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.rfq-filter-bar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 160px 200px;
  gap: 10px;
  padding: 0 18px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.rfq-filter-bar input,
.rfq-filter-bar select {
  height: 38px;
  border: 1px solid #dbe3ec;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.rfq-filter-bar input:focus,
.rfq-filter-bar select:focus {
  border-color: #7545fe;
  box-shadow: 0 0 0 3px rgba(15,118,110,.08);
}

@media (max-width: 900px) {
  .rfq-panel-head.clean {
    flex-direction: column;
    align-items: flex-start;
  }

  .rfq-header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .rfq-filter-bar {
    grid-template-columns: 1fr;
  }
}
      `}</style>

      <Toast message={toast} />

      <div className="rfq-page">
        <div className="rfq-metrics">
          <div className="rfq-metric"><span>Total RFQs</span><strong>{stats.total}</strong></div>
          <div className="rfq-metric"><span>Open</span><strong>{stats.open}</strong></div>
          <div className="rfq-metric"><span>Participating</span><strong>{stats.participating}</strong></div>
          <div className="rfq-metric"><span>Clarifications</span><strong>{stats.clarification}</strong></div>
        </div>

        <section className="rfq-panel">
          <div className="rfq-panel-head clean">
            <div>
              <h3>RFQ Invitations</h3>
              <p>Select an RFQ and perform participation or clarification actions.</p>
            </div>

            <div className="rfq-header-actions">
              <button type="button" className="rfq-main-btn" onClick={openParticipation}>
                Participate
              </button>

              <button type="button" className="rfq-main-btn secondary" onClick={openClarification}>
                Clarify
              </button>
            </div>
          </div>

          <div className="rfq-filter-bar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search RFQ, requirement, buyer..."
            />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option>All</option>
              <option>Open</option>
              <option>Invited</option>
              <option>Participating</option>
              <option>Clarification</option>
              <option>Submitted</option>
              <option>Closed</option>
            </select>

            <select
              value={selectedRfq}
              onChange={(event) => setSelectedRfq(event.target.value)}
            >
              {rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id}>{rfq.id}</option>
              ))}
            </select>
          </div>

          <div className="rfq-table-wrap">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>RFQ No</th>
                  <th>Requirement</th>
                  <th>Buyer Team</th>
                  <th>Due Date</th>
                  <th>Est. Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRfqs.map((rfq) => (
                  <tr key={rfq.id} onClick={() => setSelectedRfq(rfq.id)}>
                    <td>
                      <div className="rfq-id">
                        <strong>{rfq.id}</strong>
                        <small>Invitation</small>
                      </div>
                    </td>

                    <td>
                      <div className="rfq-title">
                        <strong>{rfq.title}</strong>
                        <small>Technical and commercial response</small>
                      </div>
                    </td>

                    <td>{rfq.buyer}</td>
                    <td>{rfq.dueDate}</td>
                    <td>{rfq.value}</td>

                    <td>
                      <span className={`rfq-status ${statusClass[rfq.status] || 'open'}`}>
                        {rfq.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="rfq-view-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          setViewRfq(rfq);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {viewRfq && (
        <div className="modal-overlay" onClick={() => setViewRfq(null)}>
          <div className="rfq-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewRfq.id}</h3>
                <p>{viewRfq.title}</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setViewRfq(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="rfq-detail-grid">
                <div className="rfq-detail-card"><span>Buyer Team</span><strong>{viewRfq.buyer}</strong></div>
                <div className="rfq-detail-card"><span>Due Date</span><strong>{viewRfq.dueDate}</strong></div>
                <div className="rfq-detail-card"><span>Estimated Value</span><strong>{viewRfq.value}</strong></div>
                <div className="rfq-detail-card"><span>Status</span><strong>{viewRfq.status}</strong></div>
                <div className="rfq-detail-card"><span>Scope</span><strong>Technical and commercial bid response required</strong></div>
                <div className="rfq-detail-card"><span>Submission Mode</span><strong>Online supplier portal</strong></div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="primary-btn" onClick={() => setViewRfq(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showParticipation && (
        <div className="drawer-overlay" onClick={closeParticipation}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>Confirm RFQ Participation</h3>
                <p>Submit participation intent before preparing your bid response.</p>
              </div>
              <button type="button" className="drawer-close" onClick={closeParticipation}>×</button>
            </div>

            <form className="drawer-form" onSubmit={submitParticipation} noValidate>
              <label className={errors.rfq ? 'field-error' : ''}>
                RFQ
                <select value={participation.rfq} onChange={(event) => setParticipation({ ...participation, rfq: event.target.value })}>
                  <option value="">Select RFQ</option>
                  {rfqs.map((rfq) => <option key={rfq.id} value={rfq.id}>{rfq.id} - {rfq.title}</option>)}
                </select>
                {errors.rfq && <span className="error-text">{errors.rfq}</span>}
              </label>

              <label className={errors.contactName ? 'field-error' : ''}>
                Responsible Contact
                <input value={participation.contactName} onChange={(event) => setParticipation({ ...participation, contactName: event.target.value })} placeholder="Enter responsible contact name" />
                {errors.contactName && <span className="error-text">{errors.contactName}</span>}
              </label>

              <label className={errors.contactEmail ? 'field-error' : ''}>
                Contact Email
                <input value={participation.contactEmail} onChange={(event) => setParticipation({ ...participation, contactEmail: event.target.value })} placeholder="Enter contact email" />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </label>

              <label className={errors.deliveryLeadTime ? 'field-error' : ''}>
                Expected Delivery Lead Time
                <input value={participation.deliveryLeadTime} onChange={(event) => setParticipation({ ...participation, deliveryLeadTime: event.target.value })} placeholder="Example: 4-6 weeks after PO" />
                {errors.deliveryLeadTime && <span className="error-text">{errors.deliveryLeadTime}</span>}
              </label>

              <label className={errors.bidValidity ? 'field-error' : ''}>
                Bid Validity
                <select value={participation.bidValidity} onChange={(event) => setParticipation({ ...participation, bidValidity: event.target.value })}>
                  <option value="">Select bid validity</option>
                  <option>30 Days</option>
                  <option>45 Days</option>
                  <option>60 Days</option>
                  <option>90 Days</option>
                </select>
                {errors.bidValidity && <span className="error-text">{errors.bidValidity}</span>}
              </label>

              <label>
                Remarks
                <textarea rows="4" value={participation.remarks} onChange={(event) => setParticipation({ ...participation, remarks: event.target.value })} placeholder="Add any initial participation notes..." />
              </label>

              <label className="terms-check">
                <input type="checkbox" checked={participation.confirm} onChange={(event) => setParticipation({ ...participation, confirm: event.target.checked })} />
                <span>I confirm that we intend to participate in this RFQ and submit a bid before the due date.</span>
              </label>

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeParticipation}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={!participation.confirm}>Confirm Participation</button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {showClarification && (
        <div className="drawer-overlay" onClick={closeClarification}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>Raise Clarification</h3>
                <p>Send a buyer-facing query before bid submission.</p>
              </div>
              <button type="button" className="drawer-close" onClick={closeClarification}>×</button>
            </div>

            <form className="drawer-form" onSubmit={submitClarification} noValidate>
              <label className={errors.rfq ? 'field-error' : ''}>
                RFQ
                <select value={clarification.rfq} onChange={(event) => setClarification({ ...clarification, rfq: event.target.value })}>
                  <option value="">Select RFQ</option>
                  {rfqs.map((rfq) => <option key={rfq.id} value={rfq.id}>{rfq.id} - {rfq.title}</option>)}
                </select>
                {errors.rfq && <span className="error-text">{errors.rfq}</span>}
              </label>

              <label className={errors.subject ? 'field-error' : ''}>
                Subject
                <input value={clarification.subject} onChange={(event) => setClarification({ ...clarification, subject: event.target.value })} placeholder="Example: Delivery timeline clarification" />
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </label>

              <label className={errors.message ? 'field-error' : ''}>
                Clarification Question
                <textarea rows="6" value={clarification.message} onChange={(event) => setClarification({ ...clarification, message: event.target.value })} placeholder="Enter technical or commercial clarification..." />
                {errors.message && <span className="error-text">{errors.message}</span>}
              </label>

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeClarification}>Cancel</button>
                <button type="submit" className="primary-btn">Submit Query</button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </PageShell>
  );
}