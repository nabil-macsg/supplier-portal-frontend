export const supplierProfile = {
  companyName: 'Al Noor Industrial Supplies LLC',
  supplierId: 'SUP-24018',
  status: 'Prequalified',
  category: 'MRO / Mechanical Parts',
  contact: 'procurement@alnoor.example',
  riskScore: 'Low',
  compliance: 92,
};

export const kpis = [
  { label: 'Open RFQs', value: '08', trend: '+2 this week' },
  { label: 'Active Bids', value: '05', trend: '3 under review' },
  { label: 'POs Pending Ack', value: '03', trend: 'Due today' },
  { label: 'Outstanding Payments', value: '$124K', trend: '4 invoices' },
];

export const rfqs = [
  { id: 'RFQ-2026-1042', title: 'Fire Rated Valve Assemblies', buyer: 'Plant Maintenance', dueDate: '24 Jun 2026', status: 'Open', value: '$48,000' },
  { id: 'RFQ-2026-1037', title: 'Safety PPE Annual Contract', buyer: 'HSE Department', dueDate: '26 Jun 2026', status: 'Clarification', value: '$112,000' },
  { id: 'RFQ-2026-1029', title: 'Compressor Spares Package', buyer: 'Operations', dueDate: '30 Jun 2026', status: 'Open', value: '$76,500' },
  { id: 'RFQ-2026-1008', title: 'Electrical Cable Trays', buyer: 'Projects', dueDate: '05 Jul 2026', status: 'Invited', value: '$39,750' },
];

export const bids = [
  { bidNo: 'BID-7812', rfq: 'RFQ-2026-1042', amount: '$46,800', submitted: '17 Jun 2026', status: 'Submitted', score: 'Pending' },
  { bidNo: 'BID-7760', rfq: 'RFQ-2026-1011', amount: '$92,300', submitted: '10 Jun 2026', status: 'Under Review', score: '82%' },
  { bidNo: 'BID-7618', rfq: 'RFQ-2026-0988', amount: '$18,200', submitted: '02 Jun 2026', status: 'Negotiation', score: '89%' },
];

export const purchaseOrders = [
  { poNo: 'PO-560193', title: 'Valve Assemblies Batch 01', issued: '16 Jun 2026', delivery: '15 Jul 2026', amount: '$21,300', status: 'Pending Ack' },
  { poNo: 'PO-559871', title: 'PPE Quarterly Supply', issued: '12 Jun 2026', delivery: '01 Jul 2026', amount: '$34,100', status: 'Acknowledged' },
  { poNo: 'PO-557420', title: 'Motor Bearing Set', issued: '29 May 2026', delivery: '20 Jun 2026', amount: '$9,800', status: 'Change Requested' },
];

export const invoices = [
  { invoiceNo: 'INV-90312', poNo: 'PO-559871', date: '14 Jun 2026', amount: '$34,100', status: 'Submitted' },
  { invoiceNo: 'INV-89945', poNo: 'PO-555908', date: '02 Jun 2026', amount: '$18,600', status: 'Approved' },
  { invoiceNo: 'INV-89021', poNo: 'PO-551106', date: '18 May 2026', amount: '$71,500', status: 'Rejected' },
];

export const payments = [
  { ref: 'PAY-22681', invoiceNo: 'INV-89945', due: '20 Jun 2026', amount: '$18,600', status: 'Scheduled' },
  { ref: 'PAY-22590', invoiceNo: 'INV-88411', due: '06 Jun 2026', amount: '$29,200', status: 'Paid' },
  { ref: 'PAY-22474', invoiceNo: 'INV-88180', due: '28 May 2026', amount: '$12,900', status: 'Paid' },
];

export const documents = [
  { name: 'Trade License', type: 'Compliance', uploaded: '11 Jun 2026', expiry: '10 Jun 2027', status: 'Valid' },
  { name: 'VAT Certificate', type: 'Finance', uploaded: '03 Jun 2026', expiry: '—', status: 'Valid' },
  { name: 'ISO 9001 Certificate', type: 'Quality', uploaded: '22 May 2026', expiry: '21 May 2027', status: 'Review' },
  { name: 'Bank Letter', type: 'Finance', uploaded: '16 May 2026', expiry: '—', status: 'Valid' },
];

export const activity = [
  'RFQ-2026-1042 bid submitted successfully',
  'PO-560193 awaiting acknowledgement',
  'Trade License verified by buyer compliance team',
  'Invoice INV-89945 approved for payment',
];
