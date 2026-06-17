import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import Toast from '../components/Toast.jsx';
import { documents as seedDocuments } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const documentTypes = [
  'All',
  'Compliance',
  'Finance',
  'Quality',
  'RFQ Attachments',
  'Delivery Notes',
];

const statusClass = {
  Approved: 'approved',
  Review: 'review',
  Expired: 'expired',
  Rejected: 'rejected',
  Valid: 'approved',
};

const initialForm = {
  name: '',
  type: 'Compliance',
  expiry: '',
  fileName: '',
  remarks: '',
};

export default function Documents() {
  const [documents, setDocuments] = useLocalState('supplier-documents', seedDocuments);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [viewDocument, setViewDocument] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesType = filter === 'All' || document.type === filter;
      const searchable = `${document.name} ${document.type} ${document.status} ${document.expiry}`.toLowerCase();

      return matchesType && searchable.includes(search.toLowerCase());
    });
  }, [documents, filter, search]);

  const stats = useMemo(() => ({
    total: documents.length,
    review: documents.filter((document) => document.status === 'Review').length,
    approved: documents.filter((document) => ['Approved', 'Valid'].includes(document.status)).length,
    expiring: documents.filter((document) => document.expiry && document.expiry !== '—').length,
  }), [documents]);

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const openUpload = () => {
    setForm(initialForm);
    setErrors({});
    setShowUploadDrawer(true);
  };

  const closeUpload = () => {
    setShowUploadDrawer(false);
    setErrors({});
  };

  const update = (key) => (event) => {
    const value = event.target.type === 'file'
      ? event.target.files?.[0]?.name || ''
      : event.target.value;

    setForm({ ...form, [key]: value });

    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Document name is required';
    if (!form.type) nextErrors.type = 'Document type is required';
    if (!form.fileName) nextErrors.fileName = 'Document file is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const newDocument = {
      name: form.name,
      type: form.type,
      uploaded: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      expiry: form.expiry || '—',
      status: 'Review',
      fileName: form.fileName,
      remarks: form.remarks,
    };

    setDocuments([newDocument, ...documents]);
    setShowUploadDrawer(false);
    setForm(initialForm);
    showMessage('Document added for buyer review.');
  };

  const replaceDocument = (document) => {
    setForm({
      name: document.name,
      type: document.type,
      expiry: document.expiry === '—' ? '' : document.expiry,
      fileName: '',
      remarks: document.remarks || '',
    });
    setErrors({});
    setShowUploadDrawer(true);
  };

  return (
    <PageShell
      title="Document Management"
      subtitle="Manage compliance, quality, finance, RFQ and delivery supporting documents."
      action={<span className="status prequalified">{stats.review} In Review</span>}
    >
      <style>{`
        .document-page {
          display: grid;
          gap: 18px;
        }

        .document-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .document-metric {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .document-metric span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .document-metric strong {
          color: #172033;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }

        .document-panel {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
        }

        .document-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px 12px;
        }

        .document-panel-head h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .document-panel-head p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .document-main-btn {
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

        .document-filter-bar {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 210px;
          gap: 10px;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .document-filter-bar input,
        .document-filter-bar select {
          height: 38px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          padding: 0 12px;
          color: #172033;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .document-filter-bar input:focus,
        .document-filter-bar select:focus,
        .drawer-form input:focus,
        .drawer-form select:focus,
        .drawer-form textarea:focus {
          border-color: #7545fe;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, .08);
        }

        .document-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 0 18px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .document-tabs button {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #475569;
          border-radius: 999px;
          padding: 8px 13px;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .document-tabs button.active {
          background: #7545fe;
          border-color: #7545fe;
          color: #ffffff;
        }

        .document-table-wrap {
          overflow-x: auto;
        }

        .document-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .document-table th {
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

        .document-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #172033;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .document-table tr:hover td {
          background: #fbfdff;
        }

        .document-name strong {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .document-name small {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        .document-type {
          display: inline-flex;
          min-width: 120px;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        .document-status {
          display: inline-flex;
          justify-content: center;
          min-width: 88px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .document-status.approved {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .document-status.review {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .document-status.expired,
        .document-status.rejected {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .document-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .document-action-btn {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #172033;
          border-radius: 9px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .document-action-btn:hover {
          border-color: #7545fe;
          color: #7545fe;
          background: #f0fdfa;
        }

        .document-empty {
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

        .file-card {
          border: 1px dashed #cbd5e1 !important;
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
          border-color: #86efac !important;
        }

        .file-card.error {
          background: #fffafa;
          border-color: #ef4444 !important;
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

        .modal-overlay {
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .document-modal {
          width: min(720px, 100%);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, .24);
          overflow: hidden;
        }

        .modal-body {
          padding: 20px;
        }

        .document-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .document-detail-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          background: #f8fafc;
        }

        .document-detail-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 5px;
        }

        .document-detail-card strong {
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
          .document-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .document-panel-head {
            flex-direction: column;
          }
        }

        @media (max-width: 700px) {
          .document-metrics,
          .document-filter-bar,
          .document-detail-grid {
            grid-template-columns: 1fr;
          }

          .drawer-panel {
            width: 100%;
          }
        }
      `}</style>

      <Toast message={toast} />

      <div className="document-page">
        <div className="document-metrics">
          <div className="document-metric">
            <span>Total Documents</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="document-metric">
            <span>In Review</span>
            <strong>{stats.review}</strong>
          </div>

          <div className="document-metric">
            <span>Approved</span>
            <strong>{stats.approved}</strong>
          </div>

          <div className="document-metric">
            <span>With Expiry</span>
            <strong>{stats.expiring}</strong>
          </div>
        </div>

        <section className="document-panel">
          <div className="document-panel-head">
            <div>
              <h3>Supplier Documents</h3>
              <p>Upload, replace and monitor documents required for onboarding, RFQs and payments.</p>
            </div>

            <button type="button" className="document-main-btn" onClick={openUpload}>
              Add Document
            </button>
          </div>

          <div className="document-filter-bar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search document name, type, status..."
            />

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {documentTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="document-tabs">
            {documentTypes.map((item) => (
              <button
                type="button"
                className={filter === item ? 'active' : ''}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="document-table-wrap">
            <table className="document-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((document, index) => (
                  <tr key={`${document.name}-${index}`}>
                    <td>
                      <div className="document-name">
                        <strong>{document.name}</strong>
                        <small>{document.fileName || 'Supplier uploaded document'}</small>
                      </div>
                    </td>

                    <td>
                      <span className="document-type">{document.type}</span>
                    </td>

                    <td>{document.uploaded}</td>
                    <td>{document.expiry}</td>

                    <td>
                      <span className={`document-status ${statusClass[document.status] || 'review'}`}>
                        {document.status}
                      </span>
                    </td>

                    <td>
                      <div className="document-actions">
                        <button
                          type="button"
                          className="document-action-btn"
                          onClick={() => setViewDocument(document)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="document-action-btn"
                          onClick={() => replaceDocument(document)}
                        >
                          Replace
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDocuments.length === 0 && (
              <div className="document-empty">No documents found for the selected filter.</div>
            )}
          </div>
        </section>
      </div>

      {showUploadDrawer && (
        <div className="drawer-overlay" onClick={closeUpload}>
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h3>Add Document</h3>
                <p>Classify and submit supplier document for buyer review.</p>
              </div>

              <button type="button" className="drawer-close" onClick={closeUpload}>
                ×
              </button>
            </div>

            <form className="drawer-form" onSubmit={submit} noValidate>
              <label className={errors.name ? 'field-error' : ''}>
                Document Name
                <input
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Example: Trade License Renewal"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </label>

              <label className={errors.type ? 'field-error' : ''}>
                Document Type
                <select value={form.type} onChange={update('type')}>
                  <option>Compliance</option>
                  <option>Finance</option>
                  <option>Quality</option>
                  <option>RFQ Attachments</option>
                  <option>Delivery Notes</option>
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </label>

              <label>
                Expiry Date
                <input type="date" value={form.expiry} onChange={update('expiry')} />
              </label>

              <label className={`file-card ${form.fileName ? 'uploaded' : ''} ${errors.fileName ? 'error' : ''}`}>
                <input type="file" onChange={update('fileName')} />
                <strong>Document File</strong>
                <small>{errors.fileName || form.fileName || 'Upload PDF, image, spreadsheet or document file'}</small>
              </label>

              <label>
                Remarks
                <textarea
                  rows="4"
                  value={form.remarks}
                  onChange={update('remarks')}
                  placeholder="Add any notes for buyer document review"
                />
              </label>

              <div className="drawer-footer">
                <button type="button" className="secondary-btn" onClick={closeUpload}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Submit Document
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {viewDocument && (
        <div className="modal-overlay" onClick={() => setViewDocument(null)}>
          <div className="document-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{viewDocument.name}</h3>
                <p>Document classification, review status and expiry information.</p>
              </div>

              <button type="button" className="drawer-close" onClick={() => setViewDocument(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="document-detail-grid">
                <div className="document-detail-card">
                  <span>Document Type</span>
                  <strong>{viewDocument.type}</strong>
                </div>

                <div className="document-detail-card">
                  <span>Status</span>
                  <strong>{viewDocument.status}</strong>
                </div>

                <div className="document-detail-card">
                  <span>Uploaded Date</span>
                  <strong>{viewDocument.uploaded}</strong>
                </div>

                <div className="document-detail-card">
                  <span>Expiry Date</span>
                  <strong>{viewDocument.expiry}</strong>
                </div>

                <div className="document-detail-card">
                  <span>File Name</span>
                  <strong>{viewDocument.fileName || 'Not available'}</strong>
                </div>

                <div className="document-detail-card">
                  <span>Review Owner</span>
                  <strong>Buyer compliance team</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setViewDocument(null)}>
                Close
              </button>

              <button type="button" className="primary-btn" onClick={() => replaceDocument(viewDocument)}>
                Replace Document
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}