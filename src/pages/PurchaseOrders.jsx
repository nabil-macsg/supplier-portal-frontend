import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { purchaseOrders as seedPOs } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const statusClass = {
  Issued: 'issued',
  Pending: 'pending',
  Acknowledged: 'acknowledged',
  'Change Requested': 'change',
  Rejected: 'rejected',
  Closed: 'closed',
};

const initialAckForm = {
  poNo: '',
  responsiblePerson: 'Aamir Khan',
  contactEmail: 'procurement@alnoor.example',
  promisedDeliveryDate: '',
  deliveryContact: '',
  remarks: '',
  confirm: false,
};

const initialChangeForm = {
  poNo: '',
  changeType: '',
  requestedDeliveryDate: '',
  requestedAmount: '',
  reason: '',
  attachment: '',
  confirm: false,
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useLocalState('supplier-pos', seedPOs);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPO, setSelectedPO] = useState(seedPOs[0]?.poNo || '');

  const [viewPO, setViewPO] = useState(null);
  const [showAckDrawer, setShowAckDrawer] = useState(false);
  const [showChangeDrawer, setShowChangeDrawer] = useState(false);

  const [ackForm, setAckForm] = useState(initialAckForm);
  const [changeForm, setChangeForm] = useState(initialChangeForm);
  const [errors, setErrors] = useState({});

  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      const matchesStatus = selectedStatus === 'All' || po.status === selectedStatus;
      const searchable = `${po.poNo} ${po.title} ${po.amount} ${po.status} ${po.issued}`.toLowerCase();
      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [orders, selectedStatus, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    issued: orders.filter((po) => ['Issued', 'Pending'].includes(po.status)).length,
    acknowledged: orders.filter((po) => po.status === 'Acknowledged').length,
    changes: orders.filter((po) => po.status === 'Change Requested').length,
  }), [orders]);

  const selectedPOData = orders.find((po) => po.poNo === selectedPO) || orders[0];

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1600);
  };

  const openAck = () => {
    setAckForm({
      ...initialAckForm,
      poNo: selectedPOData?.poNo || '',
      promisedDeliveryDate: selectedPOData?.delivery || '',
    });
    setErrors({});
    setShowAckDrawer(true);
  };

  const closeAck = () => {
    setShowAckDrawer(false);
    setErrors({});
  };

  const openChange = () => {
    setChangeForm({
      ...initialChangeForm,
      poNo: selectedPOData?.poNo || '',
      requestedDeliveryDate: selectedPOData?.delivery || '',
      requestedAmount: String(selectedPOData?.amount || '').replace(/[^\d.]/g, ''),
    });
    setErrors({});
    setShowChangeDrawer(true);
  };

  const closeChange = () => {
    setShowChangeDrawer(false);
    setErrors({});
  };

  const updateAck = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setAckForm({ ...ackForm, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  const updateChange = (key) => (event) => {
    const value =
      event.target.type === 'file'
        ? event.target.files?.[0]?.name || ''
        : event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;

    setChangeForm({ ...changeForm, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  const submitAck = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!ackForm.poNo) nextErrors.poNo = 'Purchase order is required';
    if (!ackForm.responsiblePerson.trim()) nextErrors.responsiblePerson = 'Responsible person is required';
    if (!ackForm.contactEmail.trim()) nextErrors.contactEmail = 'Contact email is required';
    if (!ackForm.promisedDeliveryDate.trim()) nextErrors.promisedDeliveryDate = 'Promised delivery date is required';
    if (!ackForm.deliveryContact.trim()) nextErrors.deliveryContact = 'Delivery contact is required';

    if (ackForm.contactEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(ackForm.contactEmail)) {
        nextErrors.contactEmail = 'Enter a valid email address';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !ackForm.confirm) return;

    setOrders(
      orders.map((po) =>
        po.poNo === ackForm.poNo
          ? {
            ...po,
            status: 'Acknowledged',
            delivery: ackForm.promisedDeliveryDate,
            acknowledgedBy: ackForm.responsiblePerson,
          }
          : po
      )
    );

    setSelectedPO(ackForm.poNo);
    setShowAckDrawer(false);
    showMessage(`${ackForm.poNo} acknowledged successfully.`);
  };

  const submitChange = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!changeForm.poNo) nextErrors.poNo = 'Purchase order is required';
    if (!changeForm.changeType) nextErrors.changeType = 'Change type is required';
    if (!changeForm.reason.trim()) nextErrors.reason = 'Change reason is required';

    if (['Delivery Date', 'Delivery & Commercial'].includes(changeForm.changeType) && !changeForm.requestedDeliveryDate) {
      nextErrors.requestedDeliveryDate = 'Requested delivery date is required';
    }

    if (['Commercial Terms', 'Delivery & Commercial'].includes(changeForm.changeType) && !changeForm.requestedAmount) {
      nextErrors.requestedAmount = 'Requested amount is required';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !changeForm.confirm) return;

    setOrders(
      orders.map((po) =>
        po.poNo === changeForm.poNo
          ? {
            ...po,
            status: 'Change Requested',
            changeReason: changeForm.reason,
            requestedDeliveryDate: changeForm.requestedDeliveryDate,
            requestedAmount: changeForm.requestedAmount,
          }
          : po
      )
    );

    setSelectedPO(changeForm.poNo);
    setShowChangeDrawer(false);
    showMessage('PO change request submitted.');
  };

  return (
    <PageShell
      title="PO Acknowledgement"
      subtitle="Review issued purchase orders, acknowledge supplier commitment, or request changes."
      action={<span className="status prequalified">{stats.issued} Awaiting Action</span>}
    >
      <style>{`
        .po-page {
          display: grid;
          gap: 18px;
        }

        .po-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .po-metric {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .po-metric span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .po-metric strong {
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .po-panel {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .po-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px 12px;
        }

        .po-panel-head h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .po-panel-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .po-header-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-left: auto;
        }

        .po-main-btn {
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

        .po-main-btn.secondary {
          background: #fff;
          color: #7545fe;
          border: 1px solid #7545fe;
        }

        .po-filter-bar {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 160px 200px;
          gap: 10px;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .po-filter-bar input,
        .po-filter-bar select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #fff;
        }

        .po-filter-bar input:focus,
        .po-filter-bar select:focus,
        .drawer-form input:focus,
        .drawer-form select:focus,
        .drawer-form textarea:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .po-table-wrap {
          overflow-x: auto;
        }

        .po-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .po-table th {
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

        .po-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .po-table tr:hover td {
          background: #fbfdff;
        }

        .po-ref strong,
        .po-title strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .po-ref small,
        .po-title small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .po-title {
          white-space: normal;
          min-width: 260px;
        }

        .po-status {
          display: inline-flex;
          justify-content: center;
          min-width: 112px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .po-status.issued,
        .po-status.pending {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .po-status.acknowledged {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .po-status.change {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .po-status.rejected {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .po-status.closed {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }

        .po-view-btn {
          border: 1px solid #dbe3ec;
          background: #fff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .po-view-btn:hover {
          border-color: #7545fe;
          color: #7545fe;
          background: #f0fdfa;
        }

        .po-empty {
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
          width: 460px;
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
          background: #fff;
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

        .file-card {
          border: 1px dashed #cbd5e1 !important;
          border-radius: 12px;
          padding: 14px;
          background: #fff;
          cursor: pointer;
        }

        .file-card input {
          display: none;
        }

        .file-card.uploaded {
          background: #f0fdf4;
          border-color: #86efac !important;
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

        .po-modal {
          width: min(820px, 100%);
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-body {
          padding: 20px;
        }

        .po-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .po-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .po-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .po-detail-card strong {
          color: #172033;
          font-size: 14px;
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
          .po-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .po-panel-head {
            flex-direction: column;
          }

          .po-header-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .po-filter-bar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .po-metrics,
          .po-detail-grid {
            grid-template-columns: 1fr;
          }

          .drawer-panel {
            width: 100%;
          }
        }
      `}</style>

      <Toast message={toast} />

      <div className="po-page">
        <div className="po-metrics">
          <div className="po-metric">
            <span>Total POs</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="po-metric">
            <span>Awaiting Action</span>
            <strong>{stats.issued}</strong>
          </div>

          <div className="po-metric">
            <span>Acknowledged</span>
            <strong>{stats.acknowledged}</strong>
          </div>

          <div className="po-metric">
            <span>Change Requests</span>
            <strong>{stats.changes}</strong>
          </div>
        </div>

        <section className="po-panel">
          <div className="po-panel-head">
            <div>
              <h3>Purchase Orders</h3>
              <p>Select a purchase order, acknowledge supplier commitment, or request changes.</p>
            </div>

            <div className="po-header-actions">
              <button type="button" className="po-main-btn" onClick={openAck}>
                Acknowledge PO
              </button>

              <button type="button" className="po-main-btn secondary" onClick={openChange}>
                Request Change
              </button>
            </div>
          </div>

          <div className="po-filter-bar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search PO, description, amount, status..."
            />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option>All</option>
              <option>Issued</option>
              <option>Pending</option>
              <option>Acknowledged</option>
              <option>Change Requested</option>
              <option>Rejected</option>
              <option>Closed</option>
            </select>

            <select value={selectedPO} onChange={(event) => setSelectedPO(event.target.value)}>
              {orders.map((po) => (
                <option key={po.poNo} value={po.poNo}>
                  {po.poNo}
                </option>
              ))}
            </select>
          </div>

          <div className="po-table-wrap">
            <table className="po-table">
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>Description</th>
                  <th>Issued</th>
                  <th>Delivery</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((po) => (
                  <tr key={po.poNo} onClick={() => setSelectedPO(po.poNo)}>
                    <td>
                      <div className="po-ref">
                        <strong>{po.poNo}</strong>
                        <small>Purchase order</small>
                      </div>
                    </td>

                    <td>
                      <div className="po-title">
                        <strong>{po.title}</strong>
                        <small>Issued by buyer procurement team</small>
                      </div>
                    </td>

                    <td>{po.issued}</td>
                    <td>{po.delivery}</td>
                    <td>{po.amount}</td>

                    <td>
                      <span className={`po-status ${statusClass[po.status] || 'issued'}`}>
                        {po.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="po-view-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          setViewPO(po);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="po-empty">No purchase orders found for the selected filter.</div>
            )}
          </div>
        </section>
      </div>

      {viewPO && (
        <div className="modal-overlay" onClick={() => setViewPO(null)}>
          <div className="po-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewPO.poNo}</h3>
                <p>{viewPO.title}</p>
              </div>

              <button type="button" className="drawer-close" onClick={() => setViewPO(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="po-detail-grid">
                <div className="po-detail-card">
                  <span>Issued Date</span>
                  <strong>{viewPO.issued}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Delivery Date</span>
                  <strong>{viewPO.delivery}</strong>
                </div>

                <div className="po-detail-card">
                  <span>PO Amount</span>
                  <strong>{viewPO.amount}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Status</span>
                  <strong>{viewPO.status}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Payment Terms</span>
                  <strong>{viewPO.paymentTerms || '30 Days Credit'}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Delivery Terms</span>
                  <strong>{viewPO.deliveryTerms || 'DAP Buyer Warehouse'}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Supplier Action</span>
                  <strong>{viewPO.status === 'Acknowledged' ? 'Commitment received' : 'Action pending'}</strong>
                </div>

                <div className="po-detail-card">
                  <span>Document</span>
                  <strong>PO document available</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setViewPO(null)}>
                Close
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setSelectedPO(viewPO.poNo);
                  setViewPO(null);
                  openAck();
                }}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {showAckDrawer && (
        <div className="drawer-overlay" onClick={closeAck}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>Acknowledge Purchase Order</h3>
                <p>Confirm supplier acceptance and delivery commitment.</p>
              </div>

              <button type="button" className="drawer-close" onClick={closeAck}>
                ×
              </button>
            </div>

            <form className="drawer-form" onSubmit={submitAck} noValidate>
              <label className={errors.poNo ? 'field-error' : ''}>
                Purchase Order
                <select value={ackForm.poNo} onChange={updateAck('poNo')}>
                  <option value="">Select purchase order</option>
                  {orders.map((po) => (
                    <option key={po.poNo} value={po.poNo}>
                      {po.poNo} - {po.title}
                    </option>
                  ))}
                </select>
                {errors.poNo && <span className="error-text">{errors.poNo}</span>}
              </label>

              <label className={errors.responsiblePerson ? 'field-error' : ''}>
                Responsible Person
                <input
                  value={ackForm.responsiblePerson}
                  onChange={updateAck('responsiblePerson')}
                  placeholder="Enter responsible person name"
                />
                {errors.responsiblePerson && (
                  <span className="error-text">{errors.responsiblePerson}</span>
                )}
              </label>

              <label className={errors.contactEmail ? 'field-error' : ''}>
                Contact Email
                <input
                  value={ackForm.contactEmail}
                  onChange={updateAck('contactEmail')}
                  placeholder="Enter supplier contact email"
                />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </label>

              <label className={errors.promisedDeliveryDate ? 'field-error' : ''}>
                Promised Delivery Date
                <input
                  type="date"
                  value={ackForm.promisedDeliveryDate}
                  onChange={updateAck('promisedDeliveryDate')}
                />
                {errors.promisedDeliveryDate && (
                  <span className="error-text">{errors.promisedDeliveryDate}</span>
                )}
              </label>

              <label className={errors.deliveryContact ? 'field-error' : ''}>
                Delivery Contact
                <input
                  value={ackForm.deliveryContact}
                  onChange={updateAck('deliveryContact')}
                  placeholder="Enter delivery coordinator details"
                />
                {errors.deliveryContact && (
                  <span className="error-text">{errors.deliveryContact}</span>
                )}
              </label>

              <label>
                Acknowledgement Remarks
                <textarea
                  rows="4"
                  value={ackForm.remarks}
                  onChange={updateAck('remarks')}
                  placeholder="Add delivery, packing, or acceptance remarks"
                />
              </label>

              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={ackForm.confirm}
                  onChange={updateAck('confirm')}
                />
                <span>
                  I confirm that this purchase order has been reviewed and accepted for fulfilment.
                </span>
              </label>

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeAck}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={!ackForm.confirm}>
                  Confirm Acknowledgement
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {showChangeDrawer && (
        <div className="drawer-overlay" onClick={closeChange}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>Request PO Change</h3>
                <p>Submit requested change for buyer approval before acknowledgement.</p>
              </div>

              <button type="button" className="drawer-close" onClick={closeChange}>
                ×
              </button>
            </div>

            <form className="drawer-form" onSubmit={submitChange} noValidate>
              <label className={errors.poNo ? 'field-error' : ''}>
                Purchase Order
                <select value={changeForm.poNo} onChange={updateChange('poNo')}>
                  <option value="">Select purchase order</option>
                  {orders.map((po) => (
                    <option key={po.poNo} value={po.poNo}>
                      {po.poNo} - {po.title}
                    </option>
                  ))}
                </select>
                {errors.poNo && <span className="error-text">{errors.poNo}</span>}
              </label>

              <label className={errors.changeType ? 'field-error' : ''}>
                Change Type
                <select value={changeForm.changeType} onChange={updateChange('changeType')}>
                  <option value="">Select change type</option>
                  <option>Delivery Date</option>
                  <option>Commercial Terms</option>
                  <option>Quantity / Scope</option>
                  <option>Delivery & Commercial</option>
                </select>
                {errors.changeType && <span className="error-text">{errors.changeType}</span>}
              </label>

              <label className={errors.requestedDeliveryDate ? 'field-error' : ''}>
                Requested Delivery Date
                <input
                  type="date"
                  value={changeForm.requestedDeliveryDate}
                  onChange={updateChange('requestedDeliveryDate')}
                />
                {errors.requestedDeliveryDate && (
                  <span className="error-text">{errors.requestedDeliveryDate}</span>
                )}
              </label>

              <label className={errors.requestedAmount ? 'field-error' : ''}>
                Requested Amount / Revised Commercials
                <input
                  value={changeForm.requestedAmount}
                  onChange={updateChange('requestedAmount')}
                  placeholder="Enter revised amount if applicable"
                />
                {errors.requestedAmount && (
                  <span className="error-text">{errors.requestedAmount}</span>
                )}
              </label>

              <label className={errors.reason ? 'field-error' : ''}>
                Change Reason
                <textarea
                  rows="5"
                  value={changeForm.reason}
                  onChange={updateChange('reason')}
                  placeholder="Explain requested delivery, quantity, pricing, or terms change"
                />
                {errors.reason && <span className="error-text">{errors.reason}</span>}
              </label>

              <label className={`file-card ${changeForm.attachment ? 'uploaded' : ''}`}>
                <input type="file" onChange={updateChange('attachment')} />
                <strong>Supporting Attachment</strong>
                <small>{changeForm.attachment || 'Optional supporting document'}</small>
              </label>

              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={changeForm.confirm}
                  onChange={updateChange('confirm')}
                />
                <span>
                  I confirm that this change request requires buyer approval before PO acceptance.
                </span>
              </label>

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeChange}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={!changeForm.confirm}>
                  Submit Change Request
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </PageShell>
  );
}