# Supplier Portal Frontend

Enterprise supplier-facing portal built with React + Vite.

## Modules

- Command Center dashboard
- Supplier Registration
- RFQ Participation
- Bid Submissions
- PO Acknowledgement
- Invoice Submission
- Payment Tracking
- Document Management

## Frontend Workable Features

- Editable supplier registration form saved to localStorage
- RFQ participation status update
- RFQ clarification form
- Bid submission form that adds a new bid row
- PO acknowledgement and change request workflow
- Invoice submission form that adds a new invoice row
- Document upload/classification form that adds a new document row
- Document category filtering
- Payment summary and remittance table actions

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Notes

This is a frontend-only implementation using mock data and browser localStorage. It is structured so backend APIs can be connected later without redesigning the screens.
