import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { supplierProfile } from '../data/mockData.js';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/registration', label: 'Registration', icon: 'registration' },
  { to: '/rfqs', label: 'RFQ Participation', icon: 'rfq' },
  { to: '/bids', label: 'Bid Submissions', icon: 'bid' },
  { to: '/purchase-orders', label: 'PO Acknowledgement', icon: 'po' },
  { to: '/invoices', label: 'Invoice Submission', icon: 'invoice' },
  { to: '/payments', label: 'Payment Tracking', icon: 'payment' },
  { to: '/documents', label: 'Documents', icon: 'docs' },
];

export default function PortalLayout() {
  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SP</div>
          <div>
            <div className="brand-title">Supplier Portal</div>
            <div className="brand-subtitle">Enterprise Procurement</div>
          </div>
        </div>
        <nav className="nav-list">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="eyebrow">Supplier ID</span>
          <strong>{supplierProfile.supplierId}</strong>
          <p>{supplierProfile.status} · {supplierProfile.riskScore} risk</p>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="search-box"><Icon name="search" size={18} /><span>Search RFQ, PO, Invoice, Document...</span></div>
          <div className="topbar-actions">
            <button className="icon-btn"><Icon name="bell" size={18} /></button>
            <div className="profile-pill"><span>AN</span><div><strong>{supplierProfile.companyName}</strong><small>{supplierProfile.category}</small></div></div>
          </div>
        </header>
        <section className="content-area"><Outlet /></section>
      </main>
    </div>
  );
}
