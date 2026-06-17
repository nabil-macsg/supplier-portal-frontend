import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { supplierProfile } from '../data/mockData.js';
import { useLocalState } from '../hooks.js';

const steps = [
  {
    key: 'company',
    title: 'Company Profile',
    description: 'Legal entity details',
    required: ['legalName', 'licenseNo', 'email', 'category', 'contact'],
  },
  {
    key: 'taxBank',
    title: 'Tax & Bank Details',
    description: 'VAT and payment information',
    required: ['vatNo', 'bankName', 'iban'],
  },
  {
    key: 'documents',
    title: 'Compliance Documents',
    description: 'Mandatory supplier documents',
    required: ['tradeLicenseDoc', 'vatCertificateDoc', 'bankLetterDoc'],
  },
  {
    key: 'buyerReview',
    title: 'Review & Submit',
    description: 'Submit registration for buyer validation',
    required: [],
  },
];

const documents = [
  { key: 'tradeLicenseDoc', title: 'Trade License' },
  { key: 'vatCertificateDoc', title: 'VAT Certificate' },
  { key: 'bankLetterDoc', title: 'Bank Letter' },
];

const fieldLabels = {
  legalName: 'Legal Name',
  licenseNo: 'Trade License No',
  email: 'Primary Email',
  category: 'Supplier Category',
  contact: 'Primary Contact',
  vatNo: 'VAT / Tax No',
  bankName: 'Bank Name',
  iban: 'IBAN',
  tradeLicenseDoc: 'Trade License',
  vatCertificateDoc: 'VAT Certificate',
  bankLetterDoc: 'Bank Letter',
};

export default function Registration() {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [registrationStatus, setRegistrationStatus] = useLocalState('supplier-registration-status', {
    submitted: false,
    submittedAt: '',
    status: 'Draft',
  });

  const [profile, setProfile] = useLocalState('supplier-profile', {
    legalName: supplierProfile.companyName,
    licenseNo: 'TL-984823-UAE',
    email: supplierProfile.contact,
    category: supplierProfile.category,
    vatNo: '100498223900003',
    bankName: 'Emirates NBD',
    iban: 'AE070331234567890123456',
    address: 'Industrial Area, Dubai, United Arab Emirates',
    contact: 'Aamir Khan · +971 55 000 0000',
    tradeLicenseDoc: '',
    vatCertificateDoc: '',
    bankLetterDoc: '',
    reviewRemarks: '',
  });

  const currentStep = steps[activeStep];

  const update = (key) => (event) => {
    const value =
      event.target.type === 'file'
        ? event.target.files?.[0]?.name || ''
        : event.target.value;

    setProfile({ ...profile, [key]: value });

    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const isStepComplete = (step) => {
    if (step.key === 'buyerReview') {
      return steps
        .filter((item) => ['company', 'taxBank', 'documents'].includes(item.key))
        .every((item) => isStepComplete(item));
    }

    return step.required.every((key) => String(profile[key] || '').trim() !== '');
  };

  const validateCurrentStep = () => {
    const nextErrors = {};

    currentStep.required.forEach((key) => {
      if (!String(profile[key] || '').trim()) {
        nextErrors[key] = `${fieldLabels[key]} is required`;
      }
    });

    if (currentStep.key === 'company' && profile.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(profile.email)) {
        nextErrors.email = 'Enter a valid email address';
      }
    }

    if (currentStep.key === 'taxBank' && profile.iban) {
      if (profile.iban.trim().length < 15) {
        nextErrors.iban = 'Enter a valid IBAN';
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const completedCount = useMemo(
    () => steps.filter((step) => isStepComplete(step)).length,
    [profile]
  );

  const progressPercentage = Math.round(((activeStep + 1) / steps.length) * 100);
  const completionPercentage = Math.round((completedCount / steps.length) * 100);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('supplier-profile', JSON.stringify(profile));
    }, 500);

    return () => clearTimeout(timeout);
  }, [profile]);

  const save = (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setErrors({});
      return;
    }

    setRegistrationStatus({
      submitted: true,
      submittedAt: new Date().toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Submitted for Buyer Review',
    });
  };

  const goPrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setErrors({});
    }
  };

  const goToStep = (index) => {
    setActiveStep(index);
    setErrors({});
  };

  const reopenRegistration = () => {
    setRegistrationStatus({
      submitted: false,
      submittedAt: '',
      status: 'Draft',
    });
    setActiveStep(0);
  };

  return (
    <PageShell
      title="Supplier Registration"
      subtitle="Maintain supplier master data and track onboarding approval progress."
      action={
        <span className="status prequalified">
          {registrationStatus.submitted ? 'Under Review' : 'Draft'}
        </span>
      }
    >
      <style>{`
        .registration-grid {
          grid-template-columns: 360px minmax(0, 1fr);
          align-items: start;
          gap: 24px;
        }

        .supplier-step-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 18px;
        }

        .supplier-step {
          width: 100%;
          border: 1px solid #e1e7ef;
          background: #fff;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          text-align: left;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .supplier-step:hover {
          border-color: #b9c7d6;
          background: #f8fafc;
        }

        .supplier-step.active {
          border-color: #7545fe;
          background: #f0fdfa;
          box-shadow: inset 4px 0 0 #7545fe;
        }

        .supplier-step.done {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .supplier-step-no {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #eaf0f6;
          color: #475569;
          display: grid;
          place-items: center;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .supplier-step.done .supplier-step-no {
          background: #16a34a;
          color: #fff;
        }

        .supplier-step.active .supplier-step-no {
          background: #7545fe;
          color: #fff;
        }

        .supplier-step strong {
          display: block;
          font-size: 14px;
          color: #172033;
        }

        .supplier-step small {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
        }

        .supplier-progress {
          height: 8px;
          border-radius: 999px;
          background: #edf2f7;
          overflow: hidden;
          margin-top: 16px;
        }

        .supplier-progress div {
          height: 100%;
          background: linear-gradient(90deg, #7545fe, #14b8a6);
          border-radius: 999px;
          transition: width 0.25s ease;
        }

        .supplier-progress-text {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .supplier-form-surface {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-top: 4px solid #7545fe;
          border-radius: 22px;
          padding: 26px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .supplier-form-surface .form-grid {
          flex: 1;
          align-content: start;
        }

        .registration-form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 22px;
        }

        .autosave-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          margin-top: 2px;
        }

        .autosave-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
        }

        .supplier-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .sticky-actions {
          position: sticky;
          bottom: 0;
          margin: 24px -26px -26px;
          padding: 18px 26px;
          background: rgba(255, 255, 255, 0.96);
          border-top: 1px solid #e2e8f0;
          backdrop-filter: blur(12px);
          border-radius: 0 0 22px 22px;
          z-index: 5;
        }

        .field-error input,
        .field-error select,
        .field-error textarea {
          border-color: #ef4444 !important;
          background: #fffafa;
        }

        .error-text {
          display: block;
          margin-top: 6px;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
        }

        .supplier-doc-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .supplier-doc-card {
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          background: #fff;
          transition: 0.18s ease;
        }

        .supplier-doc-card:hover {
          border-color: #7545fe;
          background: #f8fafc;
        }

        .supplier-doc-card input {
          display: none;
        }

        .supplier-doc-card.uploaded {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .supplier-doc-card.error {
          background: #fffafa;
          border-color: #ef4444;
        }

        .supplier-doc-card span {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #eaf0f6;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .supplier-doc-card.uploaded span {
          background: #16a34a;
          color: #fff;
        }

        .supplier-doc-card.error span {
          background: #fee2e2;
          color: #dc2626;
        }

        .supplier-doc-card strong,
        .supplier-doc-card small {
          display: block;
        }

        .supplier-doc-card strong {
          color: #172033;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .supplier-doc-card small {
          color: #64748b;
          font-size: 12px;
          word-break: break-word;
        }

        .review-box,
        .submitted-panel {
          grid-column: 1 / -1;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
        }

        .review-box h3,
        .submitted-panel h3 {
          margin: 0 0 8px;
          color: #172033;
        }

        .review-box p,
        .submitted-panel p {
          margin: 0;
          color: #64748b;
        }

        .submitted-hero {
          background: linear-gradient(135deg, #ecfdf5, #ffffff);
          border: 1px solid #bbf7d0;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 18px;
        }

        .submitted-hero span {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .submitted-hero h3 {
          margin: 0 0 8px;
          color: #172033;
        }

        .registration-updates {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .registration-update {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 12px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
        }

        .registration-update-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 800;
        }

        .registration-update.done .registration-update-icon {
          background: #dcfce7;
          color: #15803d;
        }

        .registration-update.pending .registration-update-icon {
          background: #fef3c7;
          color: #b45309;
        }

        .registration-update strong {
          display: block;
          color: #172033;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .registration-update small {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        .supplier-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .supplier-summary-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
        }

        .supplier-summary-item span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .supplier-summary-item strong {
          display: block;
          color: #172033;
          font-size: 14px;
        }

        @media (max-width: 1000px) {
          .registration-grid {
            grid-template-columns: 1fr;
          }

          .supplier-doc-grid,
          .supplier-summary-grid {
            grid-template-columns: 1fr;
          }

          .registration-form-header {
            flex-direction: column;
          }

          .sticky-actions {
            position: static;
          }
        }
      `}</style>

      <div className="registration-grid">
        <div className="timeline-card refined">
          <h3>Onboarding Status</h3>
          <p>Buyer compliance workflow snapshot</p>

          <div className="supplier-progress">
            <div style={{ width: `${registrationStatus.submitted ? 100 : progressPercentage}%` }} />
          </div>

          <p className="supplier-progress-text">
            {registrationStatus.submitted ? 'Submitted for buyer review' : `${progressPercentage}% Completed`}
          </p>

          <div className="supplier-step-list">
            {steps.map((step, index) => {
              const done = registrationStatus.submitted || isStepComplete(step);
              const active = !registrationStatus.submitted && activeStep === index;

              return (
                <button
                  type="button"
                  key={step.key}
                  className={`supplier-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                  onClick={() => !registrationStatus.submitted && goToStep(index)}
                >
                  <span className="supplier-step-no">{done ? '✓' : index + 1}</span>

                  <div>
                    <strong>{step.title}</strong>
                    <small>
                      {registrationStatus.submitted
                        ? 'Completed'
                        : done
                          ? 'Completed'
                          : active
                            ? 'In progress'
                            : 'Pending'}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {registrationStatus.submitted ? (
          <section className="form-panel supplier-form-surface">
            <div className="submitted-hero">
              <span>{registrationStatus.status}</span>
              <h3>Registration submitted successfully</h3>
              <p>
                Your supplier registration has been submitted to the buyer onboarding team.
                You can track review progress and requested updates from this screen.
              </p>
            </div>

            <div className="supplier-summary-grid">
              <div className="supplier-summary-item">
                <span>Supplier Name</span>
                <strong>{profile.legalName}</strong>
              </div>

              <div className="supplier-summary-item">
                <span>Submitted On</span>
                <strong>{registrationStatus.submittedAt}</strong>
              </div>

              <div className="supplier-summary-item">
                <span>Current Status</span>
                <strong>Buyer Compliance Review</strong>
              </div>
            </div>

            <div className="submitted-panel">
              <h3>Registration Updates</h3>
              <p>Latest onboarding events and buyer-side review progress.</p>

              <div className="registration-updates">
                <div className="registration-update done">
                  <div className="registration-update-icon">✓</div>
                  <div>
                    <strong>Registration submitted</strong>
                    <small>Supplier profile, banking details and documents received.</small>
                  </div>
                </div>

                <div className="registration-update pending">
                  <div className="registration-update-icon">2</div>
                  <div>
                    <strong>Compliance review in progress</strong>
                    <small>Buyer team is validating trade license, VAT certificate and bank letter.</small>
                  </div>
                </div>

                <div className="registration-update">
                  <div className="registration-update-icon">3</div>
                  <div>
                    <strong>Commercial approval pending</strong>
                    <small>Procurement team will approve supplier category and payment terms.</small>
                  </div>
                </div>

                <div className="registration-update">
                  <div className="registration-update-icon">4</div>
                  <div>
                    <strong>Supplier prequalification</strong>
                    <small>Once approved, RFQ participation and PO acknowledgement will be enabled.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="supplier-form-actions sticky-actions">
              <button type="button" className="secondary-btn" onClick={reopenRegistration}>
                Edit Registration
              </button>

              <button type="button" className="primary-btn">
                View Submitted Profile
              </button>
            </div>
          </section>
        ) : (
          <form className="form-panel supplier-form-surface" onSubmit={save} noValidate>
            <div className="form-panel-header registration-form-header">
              <div>
                <h3>{currentStep.title}</h3>
                <p>{currentStep.description}</p>
              </div>

              <div className="autosave-status">
                <span className="autosave-dot"></span>
                Auto saved
              </div>
            </div>

            <div className="form-grid">
              {currentStep.key === 'company' && (
                <>
                  <label className={errors.legalName ? 'field-error' : ''}>
                    Legal Name
                    <input
                      value={profile.legalName}
                      onChange={update('legalName')}
                      placeholder="Enter registered legal company name"
                    />
                    {errors.legalName && <small className="error-text">{errors.legalName}</small>}
                  </label>

                  <label className={errors.licenseNo ? 'field-error' : ''}>
                    Trade License No
                    <input
                      value={profile.licenseNo}
                      onChange={update('licenseNo')}
                      placeholder="Enter trade license number"
                    />
                    {errors.licenseNo && <small className="error-text">{errors.licenseNo}</small>}
                  </label>

                  <label className={errors.email ? 'field-error' : ''}>
                    Primary Email
                    <input
                      type="email"
                      value={profile.email}
                      onChange={update('email')}
                      placeholder="Enter official supplier email"
                    />
                    {errors.email && <small className="error-text">{errors.email}</small>}
                  </label>

                  <label className={errors.category ? 'field-error' : ''}>
                    Supplier Category
                    <select value={profile.category} onChange={update('category')}>
                      <option value="">Select supplier category</option>
                      <option>MRO / Mechanical Parts</option>
                      <option>Logistics</option>
                      <option>Facilities Services</option>
                      <option>IT Services</option>
                    </select>
                    {errors.category && <small className="error-text">{errors.category}</small>}
                  </label>

                  <label className={errors.contact ? 'field-error' : ''}>
                    Primary Contact
                    <input
                      value={profile.contact}
                      onChange={update('contact')}
                      placeholder="Enter contact name and mobile number"
                    />
                    {errors.contact && <small className="error-text">{errors.contact}</small>}
                  </label>

                  <label className="full">
                    Registered Address
                    <textarea
                      value={profile.address}
                      onChange={update('address')}
                      rows="4"
                      placeholder="Enter complete registered office address"
                    />
                  </label>
                </>
              )}

              {currentStep.key === 'taxBank' && (
                <>
                  <label className={errors.vatNo ? 'field-error' : ''}>
                    VAT / Tax No
                    <input
                      value={profile.vatNo}
                      onChange={update('vatNo')}
                      placeholder="Enter VAT or tax registration number"
                    />
                    {errors.vatNo && <small className="error-text">{errors.vatNo}</small>}
                  </label>

                  <label className={errors.bankName ? 'field-error' : ''}>
                    Bank Name
                    <input
                      value={profile.bankName}
                      onChange={update('bankName')}
                      placeholder="Enter supplier bank name"
                    />
                    {errors.bankName && <small className="error-text">{errors.bankName}</small>}
                  </label>

                  <label className={errors.iban ? 'field-error' : ''}>
                    IBAN
                    <input
                      value={profile.iban}
                      onChange={update('iban')}
                      placeholder="Enter IBAN number"
                    />
                    {errors.iban && <small className="error-text">{errors.iban}</small>}
                  </label>
                </>
              )}

              {currentStep.key === 'documents' && (
                <div className="supplier-doc-grid">
                  {documents.map((doc) => (
                    <label
                      className={`supplier-doc-card ${profile[doc.key] ? 'uploaded' : ''} ${errors[doc.key] ? 'error' : ''
                        }`}
                      key={doc.key}
                    >
                      <input type="file" onChange={update(doc.key)} />
                      <span>{profile[doc.key] ? '✓' : errors[doc.key] ? '!' : '↑'}</span>
                      <strong>{doc.title}</strong>
                      <small>{errors[doc.key] || profile[doc.key] || 'Upload PDF, JPG or PNG'}</small>
                    </label>
                  ))}
                </div>
              )}

              {currentStep.key === 'buyerReview' && (
                <div className="review-box">
                  <h3>Review Before Submission</h3>
                  <p>
                    Please review your registration details before sending them to the buyer
                    onboarding team. After submission, updates will appear on this page.
                  </p>

                  <label className="full" style={{ marginTop: 18 }}>
                    Buyer Review Remarks
                    <textarea
                      value={profile.reviewRemarks}
                      onChange={update('reviewRemarks')}
                      rows="5"
                      placeholder="Enter any remarks for buyer review team"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="supplier-form-actions sticky-actions">
              <button
                type="button"
                className="secondary-btn"
                disabled={activeStep === 0}
                onClick={goPrevious}
              >
                Previous
              </button>

              <button type="submit" className="primary-btn">
                {activeStep === steps.length - 1 ? 'Submit Registration' : 'Save & Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  );
}