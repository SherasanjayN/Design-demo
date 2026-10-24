# TrustPass SHG — Implementation Plan

> **Project:** Offline-First Digital Savings and Loan Management System for Rural Women's Self-Help Groups
> **Last Updated:** Phase 1 complete

---

## Overview

TrustPass SHG is built in eight incremental phases. Each phase delivers working, testable software. No phase begins until the previous one is reviewed and approved.

---

## Phase 1 — Project Foundation (Complete)

**Goal:** Set up the complete project skeleton. Both servers must start and be independently reachable.

### Deliverables
- [x] Verify prerequisites (Python, Node, npm, Git)
- [x] Create folder structure: `frontend/`, `backend/`, `docs/`
- [x] Initialize React + Vite frontend
- [x] Create Python virtual environment
- [x] Install all dependencies (frontend + backend)
- [x] Create FastAPI application with health-check endpoint (`GET /health`)
- [x] Create professional TrustPass SHG landing page (Tamil + English)
- [x] Add global CSS design system (tokens, utilities)
- [x] Add StatusBar component (online/offline detection)
- [x] Add Header component with language toggle
- [x] Add `.env.example` with safe configuration template
- [x] Add `.gitignore`
- [x] Add `README.md` with startup instructions
- [x] Add automated tests for health endpoint (pytest)

### Acceptance Criteria
- `GET /health` returns `{"status":"ok","database":"connected"}`
- Frontend loads at `http://localhost:5173` with no console errors
- `pytest -v` shows all tests passing
- Both servers are independently startable

---

## Phase 2 — Database Models & Member Management (Planned)

**Goal:** Define the database schema and build CRUD APIs for groups and members.

### Planned Deliverables
- SQLAlchemy ORM models: `User`, `SHGGroup`, `GroupMember`
- Pydantic schemas for all models
- API endpoints: Create/Read/Update/Deactivate members and groups
- Frontend: Member list page, Add member form, Group management page
- Role constants: ADMIN, PRESIDENT, TREASURER, MEMBER

### Acceptance Criteria
- Can create a new SHG group via API
- Can add members to a group with a role
- Member list shows on the frontend
- All new endpoints covered by tests

---

## Phase 3 — Authentication (Passkeys / WebAuthn) (Planned)

**Goal:** Implement secure, passwordless authentication using WebAuthn passkeys.

### Planned Deliverables
- WebAuthn registration flow (backend + frontend)
- WebAuthn authentication (login) flow
- JWT session tokens issued after successful authentication
- Role-based route protection on the backend
- Protected pages on the frontend (redirect to login if not authenticated)
- Fallback PIN-based authentication for devices that do not support WebAuthn

### Acceptance Criteria
- A user can register a passkey using their device biometrics or security key
- A user can log in using their passkey — no password required
- Accessing protected routes without authentication returns HTTP 401
- JWT tokens expire after the configured duration
- **No fake or mocked biometric verification is ever shown**

---

## Phase 4 — Savings Notebook (Planned)

**Goal:** Record and view savings deposits and withdrawals.

### Planned Deliverables
- `Transaction` ORM model with idempotency key (duplicate prevention)
- API endpoints: Create transaction, List transactions (by member, by group)
- Frontend: Savings entry form, Transaction history list
- Tamil currency formatting with proper locale
- Pending / server-confirmed status display per transaction

### Acceptance Criteria
- Treasurer can record a savings deposit for a member
- Transaction shows as "pending" until the server confirms it
- Submitting the same transaction twice does not create a duplicate
- Transaction history is sortable by date

---

## Phase 5 — Loan Management (Planned)

**Goal:** Full loan lifecycle: request → approve → disburse → repay.

### Planned Deliverables
- `Loan` and `LoanRepayment` ORM models
- API endpoints: Apply for loan, List loans, Approve/Reject, Record repayment
- Frontend: Loan application form, Loan status page, Repayment entry
- Outstanding balance calculation
- Overdue detection

### Acceptance Criteria
- Member can apply for a loan
- President can approve or reject with a reason
- Treasurer can record repayments
- Outstanding balance updates correctly after each repayment
- Overdue loans are highlighted

---

## Phase 6 — Offline Storage & Synchronisation (Planned)

**Goal:** Allow full transaction entry without internet. Sync reliably when connectivity returns.

### Planned Deliverables
- IndexedDB schema using the `idb` library
- Offline transaction queue
- Background sync using Service Worker or polling
- Conflict detection: server-wins strategy with UI notification
- Idempotency keys prevent duplicates during retry
- Sync status indicator (synced / pending / conflict)

### Acceptance Criteria
- Transactions can be entered with no network connection
- All pending transactions appear with "Pending Sync" label
- When internet returns, data syncs automatically within 30 seconds
- Duplicate detection prevents the same entry appearing twice
- A conflict is shown clearly to the user (not silently overwritten)

---

## Phase 7 — Reports & Export (Planned)

**Goal:** Give leaders actionable financial summaries.

### Planned Deliverables
- Report API endpoints: Group collection summary, Member savings statement, Loan outstanding report
- Frontend report pages with print-friendly layout
- CSV export for each report type
- Date range filters

### Acceptance Criteria
- Group President can see total collections for any month
- A member savings statement can be printed from the browser
- CSV export opens correctly in Excel / LibreOffice

---

## Phase 8 — Audit Trail & Financial Corrections (Planned)

**Goal:** Maintain a tamper-evident log of all changes and allow authorised corrections.

### Planned Deliverables
- `AuditLog` model: every insert/update creates an immutable audit row
- Correction workflow: mark original as superseded, create new transaction with reason
- Audit history view per transaction and per member
- Only Admins and Treasurers can create corrections

### Acceptance Criteria
- Every transaction shows its full edit history
- Deleting a transaction is not possible — only corrections are allowed
- Corrections require a written reason
- Audit log cannot be modified via the API

---

## Non-Functional Requirements (All Phases)

| Requirement       | Target                                                                 |
|-------------------|------------------------------------------------------------------------|
| Mobile usability  | Works on 360px-wide phones with touch targets at least 44px            |
| Offline capability| Core features work with no network                                     |
| Language support  | Tamil (primary), English (secondary)                                   |
| Security          | No plaintext passwords stored; all secrets in `.env`                   |
| Data integrity    | Idempotency keys on all financial transactions                         |
| Accessibility     | Keyboard navigable; screen-reader labels on all interactive elements   |
| Performance       | Initial page load under 3 seconds on a 3G connection                  |
