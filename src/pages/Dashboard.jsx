import { useMemo } from 'react';
import PageShell from '../components/PageShell.jsx';
import { activity, kpis, purchaseOrders, rfqs, supplierProfile } from '../data/mockData.js';

const statusClass = {
  Open: 'open',
  Invited: 'invited',
  Participating: 'participating',
  Clarification: 'clarification',
  Submitted: 'submitted',
  Acknowledged: 'acknowledged',
  Issued: 'issued',
  Pending: 'pending',
  'Change Requested': 'change',
};

export default function Dashboard() {
  const dashboardStats = useMemo(() => {
    const openRfqs = rfqs.filter((rfq) => ['Open', 'Invited', 'Clarification'].includes(rfq.status)).length;
    const activePOs = purchaseOrders.filter((po) => ['Issued', 'Pending', 'Change Requested'].includes(po.status)).length;
    const acknowledgedPOs = purchaseOrders.filter((po) => po.status === 'Acknowledged').length;

    return {
      openRfqs,
      activePOs,
      acknowledgedPOs,
      totalRfqs: rfqs.length,
      totalPOs: purchaseOrders.length,
    };
  }, []);

  const workspaceSections = [
    {
      title: 'Registration Profile',
      description: 'Supplier master profile and compliance details',
      status: supplierProfile.status,
      meta: `${supplierProfile.compliance}% compliance completed`,
    },
    {
      title: 'RFQ Participation',
      description: 'Invited RFQs, clarifications and participation',
      status: `${dashboardStats.openRfqs} pending action`,
      meta: `${dashboardStats.totalRfqs} total RFQs`,
    },
    {
      title: 'Purchase Orders',
      description: 'Issued POs and acknowledgement status',
      status: `${dashboardStats.activePOs} awaiting action`,
      meta: `${dashboardStats.acknowledgedPOs} acknowledged`,
    },
    {
      title: 'Invoices & Payments',
      description: 'Invoice validation and payment settlement',
      status: 'In progress',
      meta: 'Payment tracking enabled',
    },
  ];

  return (
    <PageShell
      title="Dashboard"
      subtitle="Supplier workspace for registration, sourcing, purchase orders, invoices and payments."
      action={<button className="primary-btn">Complete Profile</button>}
    >
      <style>{`
        .dashboard-page {
          display: grid;
          gap: 18px;
        }

        .dashboard-welcome {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) 360px;
          gap: 18px;
          align-items: stretch;
        }

        .welcome-card,
        .profile-card,
        .dashboard-panel,
        .workspace-card,
        .kpi-card-new {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, .05);
        }

        .welcome-card {
          padding: 24px;
          border-top: 4px solid #7545fe;
        }

        .welcome-card .eyebrow,
        .profile-card .eyebrow {
          display: block;
          color: #7545fe;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .12em;
          margin-bottom: 10px;
        }

        .welcome-card h2 {
          margin: 0;
          color: #172033;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .welcome-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          max-width: 760px;
          line-height: 1.6;
        }

        .workspace-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .workspace-mini {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          background: #f8fafc;
        }

        .workspace-mini strong {
          display: block;
          color: #172033;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .workspace-mini span {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .profile-card {
          padding: 22px;
        }

        .profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #7545fe;
          color: #ffffff;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .profile-card h3 {
          margin: 0;
          color: #172033;
          font-size: 20px;
          line-height: 1.25;
        }

        .profile-card p {
          margin: 6px 0 16px;
          color: #64748b;
          font-size: 13px;
        }

        .profile-progress {
          margin-top: 14px;
        }

        .profile-progress header {
          display: flex;
          justify-content: space-between;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .progress-track {
          height: 8px;
          border-radius: 999px;
          background: #edf2f7;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7545fe, #14b8a6);
        }

        .risk-pill {
          display: inline-flex;
          margin-top: 14px;
          padding: 6px 11px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #bbf7d0;
          font-size: 12px;
          font-weight: 800;
        }

        .kpi-grid-new {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .kpi-card-new {
          padding: 16px;
        }

        .kpi-card-new span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin-bottom: 8px;
        }

        .kpi-card-new strong {
          display: block;
          color: #172033;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .kpi-card-new small {
          display: block;
          margin-top: 6px;
          color: #64748b;
          font-size: 12px;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .workspace-card {
          padding: 16px;
        }

        .workspace-card h3 {
          margin: 0 0 6px;
          color: #172033;
          font-size: 15px;
        }

        .workspace-card p {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.45;
        }

        .workspace-card .status-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid #edf2f7;
        }

        .workspace-card .status-line strong {
          color: #7545fe;
          font-size: 12px;
        }

        .workspace-card .status-line span {
          color: #64748b;
          font-size: 12px;
        }

        .dashboard-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 18px;
          align-items: start;
        }

        .dashboard-panel {
          overflow: hidden;
        }

        .dashboard-panel-header {
          padding: 16px 18px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .dashboard-panel-header h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .dashboard-panel-header p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .compact-table {
          width: 100%;
          border-collapse: collapse;
        }

        .compact-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
          text-align: left;
          padding: 11px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .compact-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
        }

        .compact-title strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .compact-title small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .dash-status {
          display: inline-flex;
          justify-content: center;
          min-width: 88px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          border: 1px solid transparent;
        }

        .dash-status.open,
        .dash-status.issued,
        .dash-status.pending {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        .dash-status.invited {
          background: #f5f3ff;
          color: #6d28d9;
          border-color: #ddd6fe;
        }

        .dash-status.participating,
        .dash-status.acknowledged {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .dash-status.clarification,
        .dash-status.change {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .activity-list {
          padding: 10px 18px 18px;
          display: grid;
          gap: 10px;
        }

        .activity-row {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
        }

        .activity-dot {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #e0f2fe;
          color: #0369a1;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
        }

        .activity-row strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .activity-row small {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .quick-actions {
          display: grid;
          gap: 10px;
          padding: 0 18px 18px;
        }

        .quick-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
        }

        .quick-action strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .quick-action small {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-top: 2px;
        }

        .quick-action span {
          color: #7545fe;
          font-weight: 900;
          font-size: 18px;
        }

        @media (max-width: 1200px) {
          .dashboard-welcome,
          .dashboard-two-col {
            grid-template-columns: 1fr;
          }

          .workspace-strip,
          .workspace-grid,
          .kpi-grid-new {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .workspace-strip,
          .workspace-grid,
          .kpi-grid-new {
            grid-template-columns: 1fr;
          }

          .compact-table {
            min-width: 720px;
          }

          .dashboard-panel {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="dashboard-page">
        <div className="dashboard-welcome">
          <section className="welcome-card">
            <span className="eyebrow">Supplier Workspace</span>
            <h2>Welcome back, {supplierProfile.companyName}</h2>
            <p>
              This workspace gives you a single operational view of your supplier profile,
              sourcing invitations, purchase orders, invoice validation and payment status.
            </p>

            <div className="workspace-strip">
              <div className="workspace-mini">
                <strong>{dashboardStats.openRfqs}</strong>
                <span>RFQs need supplier action</span>
              </div>

              <div className="workspace-mini">
                <strong>{dashboardStats.activePOs}</strong>
                <span>POs awaiting acknowledgement</span>
              </div>

              <div className="workspace-mini">
                <strong>{supplierProfile.compliance}%</strong>
                <span>Profile compliance</span>
              </div>

              <div className="workspace-mini">
                <strong>{supplierProfile.riskScore}</strong>
                <span>Current risk rating</span>
              </div>
            </div>
          </section>

          <aside className="profile-card">
            <span className="eyebrow">Active Supplier</span>
            <div className="profile-avatar">AN</div>
            <h3>{supplierProfile.companyName}</h3>
            <p>{supplierProfile.category}</p>

            <div className="profile-progress">
              <header>
                <span>Profile Completion</span>
                <strong>{supplierProfile.compliance}%</strong>
              </header>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${supplierProfile.compliance}%` }} />
              </div>
            </div>

            <span className="risk-pill">{supplierProfile.status} · {supplierProfile.riskScore}</span>
          </aside>
        </div>

        <div className="kpi-grid-new">
          {kpis.map((kpi) => (
            <div className="kpi-card-new" key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.trend}</small>
            </div>
          ))}
        </div>

        <div className="workspace-grid">
          {workspaceSections.map((section) => (
            <div className="workspace-card" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>

              <div className="status-line">
                <strong>{section.status}</strong>
                <span>{section.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-two-col">
          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>RFQs Requiring Attention</h3>
                <p>Latest buyer sourcing events and response status.</p>
              </div>
            </div>

            <table className="compact-table">
              <thead>
                <tr>
                  <th>RFQ No</th>
                  <th>Requirement</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {rfqs.slice(0, 4).map((rfq) => (
                  <tr key={rfq.id}>
                    <td>{rfq.id}</td>

                    <td>
                      <div className="compact-title">
                        <strong>{rfq.title}</strong>
                        <small>{rfq.buyer}</small>
                      </div>
                    </td>

                    <td>{rfq.dueDate}</td>

                    <td>
                      <span className={`dash-status ${statusClass[rfq.status] || 'open'}`}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <aside className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Latest Activity</h3>
                <p>Recent supplier portal updates.</p>
              </div>
            </div>

            <div className="activity-list">
              {activity.map((item, index) => (
                <div className="activity-row" key={item}>
                  <div className="activity-dot">{index + 1}</div>
                  <div>
                    <strong>{item}</strong>
                    <small>Updated recently</small>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Purchase Order Commitments</h3>
              <p>Issued purchase orders, delivery commitments and acknowledgement status.</p>
            </div>
          </div>

          <table className="compact-table">
            <thead>
              <tr>
                <th>PO No</th>
                <th>Description</th>
                <th>Delivery</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.poNo}>
                  <td>{po.poNo}</td>

                  <td>
                    <div className="compact-title">
                      <strong>{po.title}</strong>
                      <small>{po.amount}</small>
                    </div>
                  </td>

                  <td>{po.delivery}</td>

                  <td>
                    <span className={`dash-status ${statusClass[po.status] || 'issued'}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </PageShell>
  );
}