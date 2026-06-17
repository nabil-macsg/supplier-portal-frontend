import { Navigate, Route, Routes } from 'react-router-dom';
import PortalLayout from './layouts/PortalLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Registration from './pages/Registration.jsx';
import RFQs from './pages/RFQs.jsx';
import Bids from './pages/Bids.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Documents from './pages/Documents.jsx';
import NewBid from './pages/NewBid.jsx';
import NewInvoice from './pages/NewInvoice.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PortalLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="registration" element={<Registration />} />
        <Route path="rfqs" element={<RFQs />} />
        <Route path="bids" element={<Bids />} />
        <Route path="/bids/new" element={<NewBid />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="/invoices/new" element={<NewInvoice />} />
        <Route path="payments" element={<Payments />} />
        <Route path="documents" element={<Documents />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
