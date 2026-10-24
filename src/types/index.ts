export type GroupStatus = 'ACTIVE' | 'INACTIVE'
export type UserRole = 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'MEMBER' | 'TREASURER' | 'PRESIDENT' | 'ADMIN'
export type MemberStatus = 'ACTIVE' | 'INACTIVE'
export type AccountStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface UserAccount {
  id: string
  full_name: string
  phone_number: string
  email: string
  district: string
  state?: string
  location: string // Village / Area
  status: AccountStatus
  rejection_reason?: string
  role: UserRole
  group_id?: string | null
  group_name?: string | null
  upi_id?: string
  password_hash?: string
  created_at: string
  approved_at?: string
  approved_by?: string
  activated_at?: string
  activated_by?: string
  is_activated?: boolean
  notes?: string | null
}

export type User = UserAccount

export interface Area {
  id: string
  district_id: string
  name: string
  code: string
}

export interface District {
  id: string
  name: string
  areas: Area[]
}

export interface GroupLedgerEntry {
  id: string
  group_id: string
  date: string
  type: 'SAVINGS_DEPOSIT' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'AMOUNT_REQUEST_TRANSFER' | 'FEE_COLLECTION'
  description: string
  amount: number
  balance_after: number
  reference: string
  recorded_by: string
}

export interface FinancialHealthBreakdown {
  savings_score: number // out of 25
  repayment_score: number // out of 30
  fund_sufficiency: number // out of 25
  meeting_regularity: number // out of 20
  total_score: number // 0-100
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION'
  explanation: string
}

export interface SHGGroup {
  id: string
  name: string
  code: string
  registration_number: string
  district: string
  area: string
  village: string
  state: string
  meeting_day: string
  description?: string | null
  creation_date: string
  status: GroupStatus
  group_admin_id: string | null
  group_admin_name: string | null
  member_count: number
  savings_goal: number
  current_savings: number
  available_funds: number
  group_limit: number // Max per single amount request (e.g. 50,000)
  trust_score: number // 0-100
  financial_health_score?: number
  financial_health_details?: FinancialHealthBreakdown
  ledger_entries?: GroupLedgerEntry[]
  created_at?: string
  updated_at?: string
}

export interface GroupCreateInput {
  name: string
  code?: string
  registration_number?: string | null
  district?: string | null
  area?: string | null
  village?: string | null
  state?: string | null
  meeting_day?: string | null
  description?: string | null
  group_limit?: number
}

export interface GroupUpdateInput {
  name?: string
  registration_number?: string | null
  village?: string | null
  district?: string | null
  state?: string | null
  meeting_day?: string | null
  description?: string | null
  group_limit?: number
  status?: GroupStatus
}

// ── Amount Request System ──

export type AmountRequestStatus =
  | 'Pending approval'
  | 'Approved — transfer pending'
  | 'Rejected'
  | 'Transfer initiated'
  | 'Completed'
  | 'Cancelled'

export interface TransferDetails {
  payment_method: 'UPI' | 'CASH'
  transaction_ref?: string
  cash_receipt_no?: string
  payer_name?: string
  recipient_name?: string
  transferred_at: string
  recorded_by: string
  amount: number
  digital_receipt_ref: string
}

export interface AmountRequest {
  id: string // e.g. REQ-2026-00123
  member_id: string
  member_name: string
  member_phone: string
  group_id: string
  group_name: string
  district: string
  requested_amount: number
  purpose: string
  reason: string
  payment_method: 'UPI' | 'CASH'
  upi_id?: string
  request_date: string
  repayment_period: string // e.g. "6 Months"
  proposed_repayment_date?: string
  supporting_doc?: string
  status: AmountRequestStatus
  rejection_reason?: string
  approved_by?: string
  approved_at?: string
  transfer_details?: TransferDetails
  risk_alerts?: string[]
  created_at: string
  updated_at: string
}

export interface AmountRequestCreateInput {
  requested_amount: number
  purpose: string
  reason: string
  payment_method: 'UPI' | 'CASH'
  upi_id?: string
  repayment_period: string
  proposed_repayment_date?: string
  supporting_doc?: string
}

export interface AmountRequestFilter {
  group_id?: string
  member_id?: string
  status?: AmountRequestStatus | 'ALL'
  payment_method?: 'UPI' | 'CASH' | 'ALL'
  district?: string
  date_from?: string
  date_to?: string
  search_query?: string
}

// ── Grievance Feature ──

export interface GrievanceRecord {
  id: string
  member_id: string
  member_name: string
  member_phone: string
  group_id: string
  group_name: string
  category: 'PAYMENT_ISSUE' | 'REQUEST_DELAY' | 'GROUP_MANAGEMENT' | 'DISCRIMINATION' | 'OTHER'
  subject: string
  description: string
  is_confidential: boolean
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'
  resolution_notes?: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export interface SavingsTransaction {
  id: string
  receipt_ref: string
  member_id: string
  member_name: string
  group_id: string
  group_name: string
  district: string
  area: string
  transaction_date: string
  amount: number
  transaction_type: 'WEEKLY_SAVINGS' | 'SPECIAL_CONTRIBUTION' | 'SHARE_CAPITAL' | 'FINE_PENALTY'
  payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER'
  reference_number?: string
  recorded_by: string
  created_at: string
  status: 'CONFIRMED' | 'FLAGGED' | 'ADJUSTED'
}

export interface LoanRecord {
  id: string
  loan_account_no: string
  member_id: string
  member_name: string
  group_id: string
  group_name: string
  district: string
  area: string
  loan_purpose: string
  principal_amount: number
  interest_rate_percent: number
  interest_calculation: 'DIMINISHING' | 'FLAT'
  tenure_months: number
  approved_amount: number
  disbursement_date: string
  repayment_frequency: 'MONTHLY' | 'WEEKLY'
  approved_by: string
  status: 'ACTIVE' | 'PAID_OFF' | 'OVERDUE' | 'PENDING_APPROVAL'
  total_repaid: number
  outstanding_principal: number
  next_due_date: string
  monthly_installment: number
}

export interface LoanRepayment {
  id: string
  loan_id: string
  receipt_ref: string
  member_id: string
  member_name: string
  repayment_date: string
  amount_paid: number
  principal_component: number
  interest_component: number
  payment_method: 'CASH' | 'UPI' | 'BANK_TRANSFER'
  recorded_by: string
  notes?: string
}

export interface MeetingRecord {
  id: string
  group_id: string
  group_name: string
  meeting_date: string
  meeting_title: string
  attendees_count: number
  total_members: number
  resolutions: string[]
  savings_collected: number
  recorded_by: string
}

export interface GroupAnnouncement {
  id: string
  group_id?: string | null
  title: string
  content: string
  published_by: string
  date: string
  category: 'GOVERNMENT_SCHEME' | 'MEETING_NOTICE' | 'TRAINING' | 'FINANCIAL_UPDATE'
}

export interface LoginSession {
  id: string
  user_id: string
  user_name: string
  role: string
  group_name?: string
  login_time: string
  logout_time: string | null
  duration_minutes?: number | null
  status: 'ACTIVE' | 'COMPLETED' | 'SESSION_ENDED_UNEXPECTEDLY'
  device_browser: string
  ip_category: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actor_name: string
  actor_role: string
  action: string
  details: string
  target_entity: string
  target_id: string
}

export interface CorrectionRequest {
  id: string
  transaction_id: string
  receipt_ref: string
  requested_by: string
  original_amount: number
  corrected_amount: number
  reason: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  date: string
}

export interface MemberSummary {
  id: string
  user_id: string
  full_name: string
  phone_number: string
  role: UserRole
  status: MemberStatus
  joined_date?: string | null
}

export interface MemberAddInput {
  user_id: string
  role: UserRole
  joined_date?: string | null
}

export interface MemberUpdateInput {
  role?: UserRole
  status?: MemberStatus
}
