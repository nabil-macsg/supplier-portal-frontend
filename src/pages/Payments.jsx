import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { payments } from '../data/mockData.js';
import { moneyToNumber } from '../hooks.js';

const statusClass = {
  Scheduled: 'scheduled',
  Paid: 'paid',
  Processing: 'processing',
  Hold: 'hold',
  Disputed: 'disputed',
};

export default function Payments() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewPayment, setViewPayment] = useState(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = selectedStatus === 'All' || payment.status === selectedStatus;
      const searchable = `${payment.ref} ${payment.invoiceNo} ${payment.due} ${payment.amount} ${payment.status}`.toLowerCase();

      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [search, selectedStatus]);

  const insights = useMemo(() => {
    const scheduled = payments
      .filter((payment) => payment.status === 'Scheduled')
      .reduce((sum, payment) => sum + moneyToNumber(payment.amount), 0);

    const paid = payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((sum, payment) => sum + moneyToNumber(payment.amount), 0);

    const processing = payments
      .filter((payment) => payment.status === 'Processing')
      .reduce((sum, payment) => sum + moneyToNumber(payment.amount), 0);

    const disputed = payments
      .filter((payment) => payment.status === 'Disputed')
      .reduce((sum, payment) => sum + moneyToNumber(payment.amount), 0);

    const total = payments.reduce((sum, payment) => sum + moneyToNumber(payment.amount), 0);

    return {
      scheduled,
      paid,
      processing,
      disputed,
      total,
      paidCount: payments.filter((payment) => payment.status === 'Paid').length,
      scheduledCount: payments.filter((payment) => payment.status === 'Scheduled').length,
      processingCount: payments.filter((payment) => payment.status === 'Processing').length,
      disputedCount: payments.filter((payment) => payment.status === 'Disputed').length,
    };
  }, []);

  const formatMoney = (value) => `$${value.toLocaleString()}`;

  return (
    <PageShell
      title="Payment Tracking"
      subtitle="Monitor payment schedules, remittance status, and invoice settlement."
      action={<span className="status prequalified">{insights.scheduledCount} Scheduled</span>}
    >
      <style>{`
        .payment-page {
          display: grid;
          gap: 18px;
        }

        .payment-insight-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .payment-insight-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .payment-insight-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .payment-insight-card strong {
          display: block;
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.1;
        }

        .payment-insight-card small {
          display: block;
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
        }

        .payment-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.payment-cashflow-row {
  background: #ffffff;
  border: 1px solid #dbe3ec;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
}

.payment-cashflow-row-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.payment-cashflow-row-head h3 {
  margin: 0;
  color: #172033;
  font-size: 18px;
}

.payment-cashflow-row-head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.cashflow-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.cashflow-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  background: #f8fafc;
}

.cashflow-card header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.cashflow-card strong {
  color: #172033;
}

.cashflow-card small {
  display: block;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.cashflow-track {
  height: 8px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
}

.cashflow-fill {
  height: 100%;
  border-radius: 999px;
  background: #7545fe;
}

.cashflow-fill.scheduled {
  background: #2563eb;
}

.cashflow-fill.processing {
  background: #d97706;
}

        .payment-panel,
        .payment-side-panel {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .payment-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px 12px;
        }

        .payment-panel-head h3,
        .payment-side-panel h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .payment-panel-head p,
        .payment-side-panel p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .payment-filter-bar {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 170px;
          gap: 10px;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .payment-filter-bar input,
        .payment-filter-bar select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .payment-filter-bar input:focus,
        .payment-filter-bar select:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .payment-table-wrap {
          overflow-x: auto;
        }

        .payment-table {
          width: 100%;
          min-width: 820px;
          border-collapse: collapse;
        }

        .payment-table th {
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

        .payment-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .payment-table tr:hover td {
          background: #fbfdff;
        }

        .payment-ref strong,
        .payment-invoice strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .payment-ref small,
        .payment-invoice small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .payment-status {
          display: inline-flex;
          justify-content: center;
          min-width: 96px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .payment-status.scheduled {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .payment-status.processing {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .payment-status.paid {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .payment-status.hold {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }

        .payment-status.disputed {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .payment-view-btn {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .payment-view-btn:hover {
          border-color: #7545fe;
          color: #7545fe;
          background: #f0fdfa;
        }

        .payment-empty {
          padding: 34px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .payment-side-panel {
          padding: 18px;
        }

        .cashflow-bar {
          margin-top: 16px;
          display: grid;
          gap: 12px;
        }

        .cashflow-row {
          display: grid;
          gap: 7px;
        }

        .cashflow-row header {
          display: flex;
          justify-content: space-between;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
        }

        .cashflow-track {
          height: 8px;
          border-radius: 999px;
          background: #edf2f7;
          overflow: hidden;
        }

        .cashflow-fill {
          height: 100%;
          border-radius: 999px;
          background: #7545fe;
        }

        .cashflow-fill.scheduled {
          background: #2563eb;
        }

        .cashflow-fill.processing {
          background: #d97706;
        }

        .payment-note-list {
          margin-top: 18px;
          display: grid;
          gap: 10px;
        }

        .payment-note {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .payment-note strong {
          display: block;
          color: #172033;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .payment-note small {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .38);
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .payment-modal {
          width: min(760px, 100%);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-head {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .modal-head h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

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

        .modal-body {
          padding: 20px;
        }

        .payment-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .payment-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .payment-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .payment-detail-card strong {
          color: #172033;
          font-size: 14px;
        }

        .payment-timeline {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .payment-timeline-item {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 10px;
          align-items: start;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
        }

        .payment-timeline-icon {
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

        .payment-timeline-item.pending .payment-timeline-icon {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .payment-timeline-item strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .payment-timeline-item small {
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
          .payment-insight-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .payment-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .payment-insight-grid,
          .payment-filter-bar,
          .payment-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="payment-page">
        <div className="payment-insight-grid">
          <div className="payment-insight-card">
            <span>Scheduled</span>
            <strong>{formatMoney(insights.scheduled)}</strong>
            <small>{insights.scheduledCount} upcoming settlements</small>
          </div>

          <div className="payment-insight-card">
            <span>Paid</span>
            <strong>{formatMoney(insights.paid)}</strong>
            <small>{insights.paidCount} completed payments</small>
          </div>

          <div className="payment-insight-card">
            <span>Processing</span>
            <strong>{formatMoney(insights.processing)}</strong>
            <small>{insights.processingCount} finance runs</small>
          </div>

          <div className="payment-insight-card">
            <span>Disputed</span>
            <strong>{formatMoney(insights.disputed)}</strong>
            <small>{insights.disputedCount} open disputes</small>
          </div>
        </div>

        <div className="payment-layout">
          <section className="payment-cashflow-row">
            <div className="payment-cashflow-row-head">
              <div>
                <h3>Cashflow Snapshot</h3>
                <p>Payment pipeline summary across settled, scheduled and processing invoices.</p>
              </div>
            </div>

            <div className="cashflow-grid">
              <div className="cashflow-card">
                <header>
                  <span>Paid</span>
                  <strong>{formatMoney(insights.paid)}</strong>
                </header>

                <div className="cashflow-track">
                  <div
                    className="cashflow-fill"
                    style={{ width: `${Math.min((insights.paid / insights.total) * 100, 100)}%` }}
                  />
                </div>

                <small>{insights.paidCount} completed payments with remittance available.</small>
              </div>

              <div className="cashflow-card">
                <header>
                  <span>Scheduled</span>
                  <strong>{formatMoney(insights.scheduled)}</strong>
                </header>

                <div className="cashflow-track">
                  <div
                    className="cashflow-fill scheduled"
                    style={{ width: `${Math.min((insights.scheduled / insights.total) * 100, 100)}%` }}
                  />
                </div>

                <small>{insights.scheduledCount} upcoming settlements awaiting payment run.</small>
              </div>

              <div className="cashflow-card">
                <header>
                  <span>Processing</span>
                  <strong>{formatMoney(insights.processing)}</strong>
                </header>

                <div className="cashflow-track">
                  <div
                    className="cashflow-fill processing"
                    style={{ width: `${Math.min((insights.processing / insights.total) * 100, 100)}%` }}
                  />
                </div>

                <small>{insights.processingCount} payments currently under bank or finance processing.</small>
              </div>
            </div>
          </section>

          <section className="payment-panel">
            <div className="payment-panel-head">
              <div>
                <h3>Payment Ledger</h3>
                <p>Track invoice settlement, remittance status and payment references.</p>
              </div>
            </div>

            <div className="payment-filter-bar">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search payment ref, invoice, amount, status..."
              />

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                <option>All</option>
                <option>Scheduled</option>
                <option>Processing</option>
                <option>Paid</option>
                <option>Hold</option>
                <option>Disputed</option>
              </select>
            </div>

            <div className="payment-table-wrap">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Invoice No</th>
                    <th>Due / Paid Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.ref}>
                      <td>
                        <div className="payment-ref">
                          <strong>{payment.ref}</strong>
                          <small>Remittance reference</small>
                        </div>
                      </td>

                      <td>
                        <div className="payment-invoice">
                          <strong>{payment.invoiceNo}</strong>
                          <small>Invoice settlement</small>
                        </div>
                      </td>

                      <td>{payment.due}</td>
                      <td>{payment.amount}</td>

                      <td>
                        <span className={`payment-status ${statusClass[payment.status] || 'scheduled'}`}>
                          {payment.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="payment-view-btn"
                          onClick={() => setViewPayment(payment)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="payment-empty">No payments found for the selected filter.</div>
              )}
            </div>
          </section>


        </div>
      </div>

      {viewPayment && (
        <div className="modal-overlay" onClick={() => setViewPayment(null)}>
          <div className="payment-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewPayment.ref}</h3>
                <p>Payment status, invoice settlement and remittance timeline.</p>
              </div>

              <button type="button" className="drawer-close" onClick={() => setViewPayment(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-detail-grid">
                <div className="payment-detail-card">
                  <span>Invoice No</span>
                  <strong>{viewPayment.invoiceNo}</strong>
                </div>

                <div className="payment-detail-card">
                  <span>Due / Paid Date</span>
                  <strong>{viewPayment.due}</strong>
                </div>

                <div className="payment-detail-card">
                  <span>Amount</span>
                  <strong>{viewPayment.amount}</strong>
                </div>

                <div className="payment-detail-card">
                  <span>Status</span>
                  <strong>{viewPayment.status}</strong>
                </div>

                <div className="payment-detail-card">
                  <span>Payment Method</span>
                  <strong>Bank Transfer</strong>
                </div>

                <div className="payment-detail-card">
                  <span>Bank Reference</span>
                  <strong>{viewPayment.status === 'Paid' ? `BNK-${viewPayment.ref}` : 'Pending settlement'}</strong>
                </div>
              </div>

              <div className="payment-timeline">
                <div className="payment-timeline-item">
                  <div className="payment-timeline-icon">1</div>
                  <div>
                    <strong>Invoice approved</strong>
                    <small>Buyer finance team approved invoice for payment run.</small>
                  </div>
                </div>

                <div className={`payment-timeline-item ${viewPayment.status !== 'Paid' ? 'pending' : ''}`}>
                  <div className="payment-timeline-icon">2</div>
                  <div>
                    <strong>Payment scheduled</strong>
                    <small>Invoice included in scheduled supplier payment batch.</small>
                  </div>
                </div>

                <div className={`payment-timeline-item ${viewPayment.status !== 'Paid' ? 'pending' : ''}`}>
                  <div className="payment-timeline-icon">3</div>
                  <div>
                    <strong>Bank settlement</strong>
                    <small>
                      {viewPayment.status === 'Paid'
                        ? 'Payment has been released to supplier bank account.'
                        : 'Bank settlement will be visible after payment release.'}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setViewPayment(null)}>
                Close
              </button>

              <button type="button" className="primary-btn" onClick={() => setViewPayment(null)}>
                Download Remittance
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}