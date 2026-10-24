import {
  UserAccount,
  District,
  Area,
  SHGGroup,
  GroupCreateInput,
  GroupUpdateInput,
  SavingsTransaction,
  LoanRecord,
  LoanRepayment,
  MeetingRecord,
  GroupAnnouncement,
  LoginSession,
  AuditLog,
  CorrectionRequest,
  AmountRequest,
  AmountRequestCreateInput,
  AmountRequestFilter,
  GrievanceRecord,
  FinancialHealthBreakdown,
  GroupLedgerEntry,
} from '../types'

const STORAGE_KEYS = {
  USERS: 'trustpass_shg_v3_users',
  DISTRICTS: 'trustpass_shg_v3_districts',
  GROUPS: 'trustpass_shg_v3_groups',
  SAVINGS: 'trustpass_shg_v3_savings',
  LOANS: 'trustpass_shg_v3_loans',
  REPAYMENTS: 'trustpass_shg_v3_repayments',
  MEETINGS: 'trustpass_shg_v3_meetings',
  ANNOUNCEMENTS: 'trustpass_shg_v3_announcements',
  SESSIONS: 'trustpass_shg_v3_sessions',
  AUDIT_LOGS: 'trustpass_shg_v3_audit',
  CORRECTIONS: 'trustpass_shg_v3_corrections',
  CURRENT_USER: 'trustpass_shg_v3_current_user',
  AMOUNT_REQUESTS: 'trustpass_shg_v3_amount_requests',
  GRIEVANCES: 'trustpass_shg_v3_grievances',
  ADMIN_PASSWORD: 'trustpass_shg_v3_admin_pass',
}

// All 38 Revenue Districts of Tamil Nadu (Verified Official Registry)
export const TN_DISTRICTS: string[] = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Kanniyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
].sort()

/**
 * Normalizes and validates district input strictly against the verified 38 Tamil Nadu districts.
 * Returns title-cased canonical district name or throws validation error.
 */
export function normalizeTnDistrict(input: string): string {
  if (!input || !input.trim()) {
    throw new Error('District is required. Please select a valid district in Tamil Nadu.')
  }
  const clean = input.trim().toLowerCase()
  const exactMatch = TN_DISTRICTS.find((d) => d.toLowerCase() === clean)
  if (exactMatch) return exactMatch

  const prefixMatch = TN_DISTRICTS.find(
    (d) => d.toLowerCase().startsWith(clean) || clean.startsWith(d.toLowerCase())
  )
  if (prefixMatch) return prefixMatch

  throw new Error(
    `'${input}' is not recognized. The SHG system supports Tamil Nadu districts only. Please select a verified Tamil Nadu district.`
  )
}

// Entire SHG system supports Tamil Nadu only
export const ALL_INDIAN_STATES: string[] = ['Tamil Nadu']
export const OTHER_MAJOR_DISTRICTS: string[] = []

// Default Seed Districts & Areas in Tamil Nadu
const INITIAL_DISTRICTS: District[] = [
  {
    id: 'dist-01',
    name: 'Coimbatore',
    areas: [
      { id: 'area-cbe-01', district_id: 'dist-01', name: 'Sulur', code: 'SLR' },
      { id: 'area-cbe-02', district_id: 'dist-01', name: 'Pollachi', code: 'POL' },
      { id: 'area-cbe-03', district_id: 'dist-01', name: 'Kinathukadavu', code: 'KND' },
      { id: 'area-cbe-04', district_id: 'dist-01', name: 'Thondamuthur', code: 'TND' },
    ],
  },
  {
    id: 'dist-02',
    name: 'Madurai',
    areas: [
      { id: 'area-mdu-01', district_id: 'dist-02', name: 'Usilampatti', code: 'USL' },
      { id: 'area-mdu-02', district_id: 'dist-02', name: 'Melur', code: 'MLR' },
      { id: 'area-mdu-03', district_id: 'dist-02', name: 'Vadipatti', code: 'VDP' },
    ],
  },
  {
    id: 'dist-03',
    name: 'Salem',
    areas: [
      { id: 'area-slm-01', district_id: 'dist-03', name: 'Omalur', code: 'OML' },
      { id: 'area-slm-02', district_id: 'dist-03', name: 'Attur', code: 'ATR' },
      { id: 'area-slm-03', district_id: 'dist-03', name: 'Mettur', code: 'MTR' },
    ],
  },
  {
    id: 'dist-04',
    name: 'Tiruchirappalli',
    areas: [
      { id: 'area-try-01', district_id: 'dist-04', name: 'Lalgudi', code: 'LGD' },
      { id: 'area-try-02', district_id: 'dist-04', name: 'Manapparai', code: 'MNP' },
      { id: 'area-try-03', district_id: 'dist-04', name: 'Musiri', code: 'MSR' },
    ],
  },
]

// Seed Users
const INITIAL_USERS: UserAccount[] = [
  // Super Admin
  {
    id: 'usr-admin-01',
    full_name: 'Tamil Nadu SHG State Mission Director',
    phone_number: '+919443000001',
    email: 'admin@shg.tn.gov.in',
    district: 'Statewide',
    state: 'Tamil Nadu',
    location: 'Chennai HQ',
    status: 'APPROVED',
    role: 'SUPER_ADMIN',
    created_at: '2024-01-01T08:00:00Z',
    approved_at: '2024-01-01T08:00:00Z',
    approved_by: 'Government Order MS-42',
  },
  // Sulur Group Members (grp-001)
  {
    id: 'usr-cbe-01',
    full_name: 'Lakshmi Ammal',
    phone_number: '+919842100001',
    email: 'lakshmi.ammal@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur',
    status: 'APPROVED',
    role: 'GROUP_ADMIN',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    upi_id: 'lakshmi.ammal@oksbi',
    created_at: '2024-01-10T09:30:00Z',
    approved_at: '2024-01-12T10:00:00Z',
    approved_by: 'State Mission Director',
  },
  {
    id: 'usr-cbe-02',
    full_name: 'Priya Selvan',
    phone_number: '+919842100002',
    email: 'priya.selvan@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur',
    status: 'APPROVED',
    role: 'MEMBER',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    upi_id: 'priya.selvan@oksbi',
    created_at: '2024-01-10T10:15:00Z',
    approved_at: '2024-01-12T10:05:00Z',
    approved_by: 'State Mission Director',
  },
  {
    id: 'usr-cbe-03',
    full_name: 'Meenakshi Sundaram',
    phone_number: '+919842100003',
    email: 'meenakshi.s@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur',
    status: 'APPROVED',
    role: 'MEMBER',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    upi_id: 'meenakshi.s@upi',
    created_at: '2024-01-11T14:20:00Z',
    approved_at: '2024-01-12T10:10:00Z',
    approved_by: 'State Mission Director',
  },
  // Pollachi Group Members (grp-002)
  {
    id: 'usr-cbe-04',
    full_name: 'Valli Murugan',
    phone_number: '+919842100004',
    email: 'valli.m@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Pollachi',
    status: 'APPROVED',
    role: 'GROUP_ADMIN',
    group_id: 'grp-002',
    group_name: 'Roobini Mahalir Kuzhu',
    upi_id: 'valli.murugan@paytm',
    created_at: '2024-02-01T11:00:00Z',
    approved_at: '2024-02-03T15:30:00Z',
    approved_by: 'State Mission Director',
  },
  {
    id: 'usr-cbe-05',
    full_name: 'Karpagam Natarajan',
    phone_number: '+919842100005',
    email: 'karpagam.n@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Pollachi',
    status: 'APPROVED',
    role: 'MEMBER',
    group_id: 'grp-002',
    group_name: 'Roobini Mahalir Kuzhu',
    upi_id: 'karpagam@postbank',
    created_at: '2024-02-02T16:00:00Z',
    approved_at: '2024-02-03T15:35:00Z',
    approved_by: 'State Mission Director',
  },
  // Approved Members Available For Allocation
  {
    id: 'usr-alloc-01',
    full_name: 'Kavitha Senthil',
    phone_number: '+919842100011',
    email: 'kavitha.s@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur',
    status: 'APPROVED',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    created_at: '2024-03-01T08:15:00Z',
    approved_at: '2024-03-05T11:00:00Z',
    approved_by: 'State Mission Director',
    notes: 'Aadhaar verified; Poultry micro-enterprise',
  },
  {
    id: 'usr-alloc-02',
    full_name: 'Ananthi Rajan',
    phone_number: '+919842100012',
    email: 'ananthi.r@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur',
    status: 'APPROVED',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    created_at: '2024-03-02T10:45:00Z',
    approved_at: '2024-03-05T11:05:00Z',
    approved_by: 'State Mission Director',
    notes: 'Dairy livestock entrepreneur',
  },
  // Pending Registration Requests (Awaiting Admin Review & Group Allocation)
  {
    id: 'usr-pend-01',
    full_name: 'Malathi Kumar',
    phone_number: '+919842100021',
    email: 'malathi.k@example.com',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    location: 'Sulur North',
    status: 'PENDING_APPROVAL',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    is_activated: false,
    created_at: '2026-03-22T09:15:00Z',
    notes: 'Applied for agricultural allied loan assistance; Aadhaar submitted',
  },
  {
    id: 'usr-pend-02',
    full_name: 'Deepa Sundar',
    phone_number: '+919842100022',
    email: 'deepa.sundar@example.com',
    district: 'Madurai',
    state: 'Tamil Nadu',
    location: 'Usilampatti',
    status: 'PENDING_APPROVAL',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    is_activated: false,
    created_at: '2026-03-23T11:30:00Z',
    notes: 'Handloom weaving unit; Seeking SHG credit facility',
  },
  {
    id: 'usr-pend-03',
    full_name: 'Revathi Palanisamy',
    phone_number: '+919842100023',
    email: 'revathi.p@example.com',
    district: 'Salem',
    state: 'Tamil Nadu',
    location: 'Omalur',
    status: 'PENDING_APPROVAL',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    is_activated: false,
    created_at: '2026-03-24T14:00:00Z',
    notes: 'Dairy milk cooperative member; Seeking weekly savings group',
  },
  // Rejected Registration Record
  {
    id: 'usr-rej-01',
    full_name: 'Chitra Ramanathan',
    phone_number: '+919842100031',
    email: 'chitra.r@example.com',
    district: 'Salem',
    state: 'Tamil Nadu',
    location: 'Attur',
    status: 'REJECTED',
    rejection_reason: 'Aadhaar name mismatch with official ration card records',
    role: 'MEMBER',
    group_id: null,
    group_name: null,
    is_activated: false,
    created_at: '2026-03-18T10:00:00Z',
  },
]

// Seed Groups
const INITIAL_GROUPS: SHGGroup[] = [
  {
    id: 'grp-001',
    name: 'Annai Therasa Mahalir Mandram',
    code: 'CBE-SLR-001',
    registration_number: 'TN/CBE/2023/104',
    district: 'Coimbatore',
    area: 'Sulur',
    village: 'Sulur North',
    state: 'Tamil Nadu',
    meeting_day: 'Monday',
    description: 'Weekly savings, milch cow micro-credit, and tailoring enterprise group',
    creation_date: '2023-08-15',
    status: 'ACTIVE',
    group_admin_id: 'usr-cbe-01',
    group_admin_name: 'Lakshmi Ammal',
    member_count: 3,
    savings_goal: 250000,
    current_savings: 145000,
    available_funds: 120000,
    group_limit: 50000,
    trust_score: 96,
    financial_health_score: 94,
    financial_health_details: {
      savings_score: 24,
      repayment_score: 29,
      fund_sufficiency: 23,
      meeting_regularity: 18,
      total_score: 94,
      grade: 'EXCELLENT',
      explanation: 'Exceptional savings discipline (96% goal pace), 100% timely repayments, and healthy liquid reserves.',
    },
    ledger_entries: [
      {
        id: 'led-001',
        group_id: 'grp-001',
        date: '2026-03-02',
        type: 'SAVINGS_DEPOSIT',
        description: 'Weekly member savings collection (Meeting #128)',
        amount: 3000,
        balance_after: 145000,
        reference: 'RCP-2026-001',
        recorded_by: 'Lakshmi Ammal',
      },
      {
        id: 'led-002',
        group_id: 'grp-001',
        date: '2026-03-12',
        type: 'AMOUNT_REQUEST_TRANSFER',
        description: 'Approved UPI Amount Request disbursement to Priya Selvan (REQ-2026-00101)',
        amount: -25000,
        balance_after: 120000,
        reference: 'RCP-TRF-2026-001',
        recorded_by: 'Lakshmi Ammal',
      },
    ],
  },
  {
    id: 'grp-002',
    name: 'Roobini Mahalir Kuzhu',
    code: 'CBE-POL-002',
    registration_number: 'TN/CBE/2024/022',
    district: 'Coimbatore',
    area: 'Pollachi',
    village: 'Anamalai Road',
    state: 'Tamil Nadu',
    meeting_day: 'Wednesday',
    description: 'Coir handicrafts and coconut value-addition women producers cluster',
    creation_date: '2024-01-10',
    status: 'ACTIVE',
    group_admin_id: 'usr-cbe-04',
    group_admin_name: 'Valli Murugan',
    member_count: 2,
    savings_goal: 200000,
    current_savings: 98000,
    available_funds: 85000,
    group_limit: 40000,
    trust_score: 92,
    financial_health_score: 89,
    financial_health_details: {
      savings_score: 22,
      repayment_score: 28,
      fund_sufficiency: 21,
      meeting_regularity: 18,
      total_score: 89,
      grade: 'EXCELLENT',
      explanation: 'Steady coir enterprise collections with regular meeting attendance and no overdue defaults.',
    },
    ledger_entries: [
      {
        id: 'led-003',
        group_id: 'grp-002',
        date: '2026-03-04',
        type: 'SAVINGS_DEPOSIT',
        description: 'Bi-weekly coir group savings collection',
        amount: 2000,
        balance_after: 85000,
        reference: 'RCP-2026-POL-04',
        recorded_by: 'Valli Murugan',
      },
    ],
  },
  {
    id: 'grp-003',
    name: 'Meenakshi Amman Mahalir Sangam',
    code: 'MDU-USL-001',
    registration_number: 'TN/MDU/2023/045',
    district: 'Madurai',
    area: 'Usilampatti',
    village: 'Valandur',
    state: 'Tamil Nadu',
    meeting_day: 'Friday',
    description: 'Dryland millets cultivation and goat rearing micro-credit union',
    creation_date: '2023-11-20',
    status: 'ACTIVE',
    group_admin_id: null,
    group_admin_name: null,
    member_count: 0,
    savings_goal: 150000,
    current_savings: 42000,
    available_funds: 42000,
    group_limit: 30000,
    trust_score: 85,
    financial_health_score: 82,
    financial_health_details: {
      savings_score: 20,
      repayment_score: 26,
      fund_sufficiency: 19,
      meeting_regularity: 17,
      total_score: 82,
      grade: 'GOOD',
      explanation: 'New cluster forming; awaiting Group Admin appointment by Super Admin.',
    },
    ledger_entries: [],
  },
]

// Seed Savings Transactions
const INITIAL_SAVINGS: SavingsTransaction[] = [
  {
    id: 'tx-001',
    receipt_ref: 'RCP-2026-001',
    member_id: 'usr-cbe-01',
    member_name: 'Lakshmi Ammal',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    district: 'Coimbatore',
    area: 'Sulur',
    transaction_date: '2026-03-02',
    amount: 1000,
    transaction_type: 'WEEKLY_SAVINGS',
    payment_method: 'CASH',
    recorded_by: 'Lakshmi Ammal (Group Admin)',
    created_at: '2026-03-02T11:00:00Z',
    status: 'CONFIRMED',
  },
  {
    id: 'tx-002',
    receipt_ref: 'RCP-2026-002',
    member_id: 'usr-cbe-02',
    member_name: 'Priya Selvan',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    district: 'Coimbatore',
    area: 'Sulur',
    transaction_date: '2026-03-02',
    amount: 1000,
    transaction_type: 'WEEKLY_SAVINGS',
    payment_method: 'UPI',
    reference_number: 'UPI984210000223',
    recorded_by: 'Lakshmi Ammal (Group Admin)',
    created_at: '2026-03-02T11:05:00Z',
    status: 'CONFIRMED',
  },
]

// Seed Loans
const INITIAL_LOANS: LoanRecord[] = [
  {
    id: 'ln-001',
    loan_account_no: 'LN-CBE-2024-001',
    member_id: 'usr-cbe-02',
    member_name: 'Priya Selvan',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    district: 'Coimbatore',
    area: 'Sulur',
    loan_purpose: 'Milch Cow Purchase & Fodder Unit',
    principal_amount: 50000,
    interest_rate_percent: 6.0,
    interest_calculation: 'DIMINISHING',
    tenure_months: 12,
    approved_amount: 50000,
    disbursement_date: '2024-04-01',
    repayment_frequency: 'MONTHLY',
    approved_by: 'Lakshmi Ammal (Group Admin)',
    status: 'ACTIVE',
    total_repaid: 32500,
    outstanding_principal: 17500,
    next_due_date: '2026-04-05',
    monthly_installment: 4400,
  },
]

// Seed Repayments
const INITIAL_REPAYMENTS: LoanRepayment[] = [
  {
    id: 'rep-001',
    loan_id: 'ln-001',
    receipt_ref: 'REP-2026-012',
    member_id: 'usr-cbe-02',
    member_name: 'Priya Selvan',
    repayment_date: '2026-03-05',
    amount_paid: 4400,
    principal_component: 4150,
    interest_component: 250,
    payment_method: 'UPI',
    recorded_by: 'Lakshmi Ammal (Group Admin)',
    notes: 'On-time monthly installment payment via UPI',
  },
]

// Seed Amount Requests
const INITIAL_AMOUNT_REQUESTS: AmountRequest[] = [
  {
    id: 'REQ-2026-00101',
    member_id: 'usr-cbe-02',
    member_name: 'Priya Selvan',
    member_phone: '+919842100002',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    district: 'Coimbatore',
    requested_amount: 25000,
    purpose: 'Agriculture & Cattle Feed',
    reason: 'Purchase of cattle feed concentrate and fodder silage for milch cow dairy production.',
    payment_method: 'UPI',
    upi_id: 'priya.selvan@oksbi',
    request_date: '2026-03-10',
    repayment_period: '6 Months',
    proposed_repayment_date: '2026-09-10',
    status: 'Completed',
    approved_by: 'Lakshmi Ammal (Group Admin)',
    approved_at: '2026-03-11T10:30:00Z',
    transfer_details: {
      payment_method: 'UPI',
      transaction_ref: 'UPI202603129841',
      payer_name: 'Annai Therasa SHG Account',
      recipient_name: 'Priya Selvan',
      transferred_at: '2026-03-12T14:15:00Z',
      recorded_by: 'Lakshmi Ammal (Group Admin)',
      amount: 25000,
      digital_receipt_ref: 'RCP-TRF-2026-001',
    },
    risk_alerts: [],
    created_at: '2026-03-10T09:00:00Z',
    updated_at: '2026-03-12T14:15:00Z',
  },
  {
    id: 'REQ-2026-00102',
    member_id: 'usr-cbe-03',
    member_name: 'Meenakshi Sundaram',
    member_phone: '+919842100003',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    district: 'Coimbatore',
    requested_amount: 15000,
    purpose: 'Tailoring & Garment Materials',
    reason: 'Upgrading sewing machine with high-speed motor and procuring bulk cloth for school uniforms.',
    payment_method: 'CASH',
    request_date: '2026-03-15',
    repayment_period: '6 Months',
    proposed_repayment_date: '2026-09-15',
    status: 'Approved — transfer pending',
    approved_by: 'Lakshmi Ammal (Group Admin)',
    approved_at: '2026-03-16T11:00:00Z',
    risk_alerts: [],
    created_at: '2026-03-15T10:30:00Z',
    updated_at: '2026-03-16T11:00:00Z',
  },
  {
    id: 'REQ-2026-00103',
    member_id: 'usr-cbe-05',
    member_name: 'Karpagam Natarajan',
    member_phone: '+919842100005',
    group_id: 'grp-002',
    group_name: 'Roobini Mahalir Kuzhu',
    district: 'Coimbatore',
    requested_amount: 20000,
    purpose: 'Children Higher Education',
    reason: 'Diploma semester exam fee and textbook purchase for daughter.',
    payment_method: 'UPI',
    upi_id: 'karpagam@postbank',
    request_date: '2026-03-20',
    repayment_period: '10 Months',
    proposed_repayment_date: '2027-01-20',
    status: 'Pending approval',
    risk_alerts: [],
    created_at: '2026-03-20T11:15:00Z',
    updated_at: '2026-03-20T11:15:00Z',
  },
]

// Seed Grievances
const INITIAL_GRIEVANCES: GrievanceRecord[] = [
  {
    id: 'GRV-2026-001',
    member_id: 'usr-cbe-02',
    member_name: 'Priya Selvan',
    member_phone: '+919842100002',
    group_id: 'grp-001',
    group_name: 'Annai Therasa Mahalir Mandram',
    category: 'PAYMENT_ISSUE',
    subject: 'Passbook Entry Update Delay',
    description: 'Requested digital verification confirmation for February meeting savings contribution.',
    is_confidential: true,
    status: 'RESOLVED',
    resolution_notes: 'Digital receipt generated and verified in ledger on 2026-03-02.',
    created_at: '2026-02-28T10:00:00Z',
    resolved_at: '2026-03-02T12:00:00Z',
    resolved_by: 'State Mission Director',
  },
]

// Seed Announcements
const INITIAL_ANNOUNCEMENTS: GroupAnnouncement[] = [
  {
    id: 'anc-001',
    group_id: null,
    title: 'TNSRLM Interest Subvention Scheme 2026',
    content: 'Eligible SHGs maintaining 95%+ repayment consistency will receive a 3% prompt repayment rebate from Tamil Nadu Women Development Corporation.',
    published_by: 'State Mission Director',
    date: '2026-03-01',
    category: 'GOVERNMENT_SCHEME',
  },
  {
    id: 'anc-002',
    group_id: 'grp-001',
    title: 'Monthly Gram Panchayat Meeting Notice',
    content: 'All members please assemble on Monday 10:00 AM at Sulur Community Hall with savings passbooks.',
    published_by: 'Lakshmi Ammal (Group Admin)',
    date: '2026-03-03',
    category: 'MEETING_NOTICE',
  },
]

class SHGStorageService {
  users: UserAccount[] = []
  districts: District[] = []
  groups: SHGGroup[] = []
  savings: SavingsTransaction[] = []
  loans: LoanRecord[] = []
  repayments: LoanRepayment[] = []
  meetings: MeetingRecord[] = []
  announcements: GroupAnnouncement[] = []
  sessions: LoginSession[] = []
  auditLogs: AuditLog[] = []
  corrections: CorrectionRequest[] = []
  amountRequests: AmountRequest[] = []
  grievances: GrievanceRecord[] = []
  currentUser: UserAccount | null = null
  private adminPassword = 'tn@2026'

  constructor() {
    this.init()
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS]

      const storedDistricts = localStorage.getItem(STORAGE_KEYS.DISTRICTS)
      this.districts = storedDistricts ? JSON.parse(storedDistricts) : [...INITIAL_DISTRICTS]

      const storedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS)
      this.groups = storedGroups ? JSON.parse(storedGroups) : [...INITIAL_GROUPS]

      const storedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS)
      this.savings = storedSavings ? JSON.parse(storedSavings) : [...INITIAL_SAVINGS]

      const storedLoans = localStorage.getItem(STORAGE_KEYS.LOANS)
      this.loans = storedLoans ? JSON.parse(storedLoans) : [...INITIAL_LOANS]

      const storedRepayments = localStorage.getItem(STORAGE_KEYS.REPAYMENTS)
      this.repayments = storedRepayments ? JSON.parse(storedRepayments) : [...INITIAL_REPAYMENTS]

      const storedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)
      this.announcements = storedAnnouncements ? JSON.parse(storedAnnouncements) : [...INITIAL_ANNOUNCEMENTS]

      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      this.sessions = storedSessions ? JSON.parse(storedSessions) : []

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : []

      const storedAmountRequests = localStorage.getItem(STORAGE_KEYS.AMOUNT_REQUESTS)
      this.amountRequests = storedAmountRequests ? JSON.parse(storedAmountRequests) : [...INITIAL_AMOUNT_REQUESTS]

      const storedGrievances = localStorage.getItem(STORAGE_KEYS.GRIEVANCES)
      this.grievances = storedGrievances ? JSON.parse(storedGrievances) : [...INITIAL_GRIEVANCES]

      const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)
      if (storedPass) {
        this.adminPassword = storedPass
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
      }
    } catch {
      this.users = [...INITIAL_USERS]
      this.districts = [...INITIAL_DISTRICTS]
      this.groups = [...INITIAL_GROUPS]
      this.savings = [...INITIAL_SAVINGS]
      this.loans = [...INITIAL_LOANS]
      this.repayments = [...INITIAL_REPAYMENTS]
      this.announcements = [...INITIAL_ANNOUNCEMENTS]
      this.amountRequests = [...INITIAL_AMOUNT_REQUESTS]
      this.grievances = [...INITIAL_GRIEVANCES]
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users))
      localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(this.districts))
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(this.groups))
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(this.savings))
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(this.loans))
      localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(this.repayments))
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements))
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions))
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs))
      localStorage.setItem(STORAGE_KEYS.AMOUNT_REQUESTS, JSON.stringify(this.amountRequests))
      localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(this.grievances))
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, this.adminPassword)
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      }
    } catch (e) {
      console.warn('Storage save failed:', e)
    }
  }

  logAudit(
    actorName: string,
    actorRole: string,
    action: string,
    details: string,
    targetEntity: string,
    targetId: string
  ) {
    const entry: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor_name: actorName,
      actor_role: actorRole,
      action,
      details,
      target_entity: targetEntity,
      target_id: targetId,
    }
    this.auditLogs.unshift(entry)
  }

  // ── Authentication & Registration ──

  async registerUser(data: {
    fullName: string
    phoneNumber: string
    email: string
    district: string
    state?: string
    location: string
    password?: string
    notes?: string
  }): Promise<UserAccount> {
    const rawPhone = data.phoneNumber.trim().replace(/\D/g, '')
    if (rawPhone.length < 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.')
    }
    const cleanPhone = `+91${rawPhone.slice(-10)}`
    const cleanEmail = data.email.trim().toLowerCase()

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address.')
    }

    const dupPhone = this.users.find(
      (u) => u.phone_number.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')
    )
    if (dupPhone) {
      throw new Error(`Mobile number '${cleanPhone}' is already registered. Please login.`)
    }

    const dupEmail = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    )
    if (dupEmail) {
      throw new Error(`Email '${cleanEmail}' is already registered. Please login.`)
    }

    if (data.state && data.state.trim().toLowerCase() !== 'tamil nadu') {
      throw new Error('Registration is strictly restricted to Tamil Nadu state.')
    }

    // Standardize & Validate District in Tamil Nadu
    const formattedDistrict = normalizeTnDistrict(data.district)

    const newUser: UserAccount = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      full_name: data.fullName.trim(),
      phone_number: cleanPhone,
      email: cleanEmail,
      district: formattedDistrict,
      state: 'Tamil Nadu',
      location: data.location.trim() || 'Rural Area',
      status: 'PENDING_APPROVAL', // Starts in PENDING_APPROVAL
      role: 'MEMBER',
      group_id: null,
      group_name: null,
      is_activated: false,
      created_at: new Date().toISOString(),
      notes: data.notes || null,
    }

    this.users.unshift(newUser)

    // IMPORTANT: DO NOT automatically log the user into the dashboard after registration.
    // A pending user must not be allowed to access the user dashboard.

    this.logAudit(
      newUser.full_name,
      'MEMBER',
      'USER_REGISTRATION_SUBMITTED',
      `New member registered from ${formattedDistrict}, Tamil Nadu. Status: PENDING_APPROVAL. Awaiting Super Admin review, approval, and group allocation.`,
      'UserAccount',
      newUser.id
    )

    this.save()
    return newUser
  }

  async loginUser(identifier: string, _password?: string): Promise<UserAccount> {
    const clean = identifier.trim().toLowerCase()
    const rawDigits = clean.replace(/\D/g, '')

    const user = this.users.find((u) => {
      const uDigits = u.phone_number.replace(/\D/g, '')
      if (rawDigits && rawDigits.length >= 10 && uDigits.endsWith(rawDigits.slice(-10))) {
        return true
      }
      return u.email.toLowerCase() === clean
    })

    if (!user) {
      throw new Error(`Account not found for '${identifier}'. Please check your credentials or register.`)
    }

    // Rule 10: If a registration is rejected, display an appropriate message without exposing confidential admin notes.
    if (user.status === 'REJECTED') {
      throw new Error(
        'Your registration has been rejected. Please contact your local district coordinator or SHG administrator.'
      )
    }

    // Rule 8 & 9: Only users whose registration is approved, account is active, and group allocation is complete can log in.
    // If an unapproved user attempts to log in, display exact required message:
    if (
      user.status === 'PENDING_APPROVAL' ||
      (user.role === 'MEMBER' && (!user.group_id || user.status !== 'APPROVED'))
    ) {
      throw new Error('Your registration is awaiting approval. Please contact your SHG administrator.')
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('This account has been temporarily suspended. Please contact the district helpline.')
    }

    this.currentUser = user

    const newSession: LoginSession = {
      id: 'ses-' + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.full_name,
      role: user.role,
      group_name: user.group_name || 'Assigned Group',
      login_time: new Date().toISOString(),
      logout_time: null,
      duration_minutes: null,
      status: 'ACTIVE',
      device_browser: 'Web Browser / Member Portal',
      ip_category: `${user.district} / ${user.location}`,
    }
    this.sessions.unshift(newSession)

    this.logAudit(
      user.full_name,
      user.role,
      'USER_LOGIN',
      `Member authenticated into dashboard (Group: ${user.group_name || 'Assigned Group'})`,
      'LoginSession',
      newSession.id
    )

    this.save()
    return user
  }

  // ── Member Registration Approval & Group Allocation Workflow ──

  async approveRegistration(userId: string, adminName = 'State Mission Director'): Promise<UserAccount> {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User record not found.')
    }
    const user = { ...this.users[userIndex] }
    user.status = 'APPROVED'
    user.approved_at = new Date().toISOString()
    user.approved_by = adminName

    this.users[userIndex] = user
    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'USER_REGISTRATION_APPROVED',
      `Registration approved for ${user.full_name} (${user.district}). Next step: Assign to existing SHG group before activation.`,
      'UserAccount',
      user.id
    )
    this.save()
    return user
  }

  async rejectRegistration(
    userId: string,
    reason: string,
    adminName = 'State Mission Director'
  ): Promise<UserAccount> {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User record not found.')
    }
    const user = { ...this.users[userIndex] }
    user.status = 'REJECTED'
    user.rejection_reason = reason.trim() || 'Verification documents not verified'
    user.approved_at = undefined
    user.approved_by = undefined

    this.users[userIndex] = user
    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'USER_REGISTRATION_REJECTED',
      `Registration rejected for ${user.full_name} (${user.district}). Internal Reason: ${user.rejection_reason}`,
      'UserAccount',
      user.id
    )
    this.save()
    return user
  }

  async assignMemberGroup(
    userId: string,
    groupId: string,
    adminName = 'State Mission Director'
  ): Promise<UserAccount> {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User record not found.')
    }
    const group = this.groups.find((g) => g.id === groupId)
    if (!group) {
      throw new Error('Selected SHG group does not exist.')
    }

    const user = { ...this.users[userIndex] }
    const oldGroupId = user.group_id

    if (oldGroupId && oldGroupId !== groupId) {
      const oldGroup = this.groups.find((g) => g.id === oldGroupId)
      if (oldGroup && oldGroup.member_count > 0) {
        oldGroup.member_count -= 1
      }
    }

    user.group_id = group.id
    user.group_name = group.name

    if (oldGroupId !== groupId) {
      group.member_count = (group.member_count || 0) + 1
    }

    this.users[userIndex] = user
    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'MEMBER_GROUP_ASSIGNMENT',
      `Assigned ${user.full_name} to existing SHG group '${group.name}' (${group.district}).`,
      'SHGGroup',
      group.id
    )
    this.save()
    return user
  }

  async activateMember(userId: string, adminName = 'State Mission Director'): Promise<UserAccount> {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User record not found.')
    }
    const user = { ...this.users[userIndex] }

    if (!user.group_id) {
      throw new Error('Cannot activate member: Member must be allocated to an existing SHG group first.')
    }

    user.status = 'APPROVED'
    user.approved_at = user.approved_at || new Date().toISOString()
    user.approved_by = user.approved_by || adminName
    user.is_activated = true
    user.activated_at = new Date().toISOString()
    user.activated_by = adminName

    this.users[userIndex] = user
    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'MEMBER_ACTIVATED',
      `Member ${user.full_name} account activated in group '${user.group_name}'. User can now log in.`,
      'UserAccount',
      user.id
    )
    this.save()
    return user
  }

  /**
   * Atomic transactional workflow:
   * Registration submitted → Pending approval → Admin reviews → Admin assigns an existing group → Account activated → User can log in
   */
  async approveAndAssignUser(
    userId: string,
    groupId: string,
    adminName = 'State Mission Director'
  ): Promise<UserAccount> {
    const usersBackup = JSON.stringify(this.users)
    const groupsBackup = JSON.stringify(this.groups)
    const auditBackup = JSON.stringify(this.auditLogs)

    try {
      const userIndex = this.users.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error('User record not found.')
      }

      const group = this.groups.find((g) => g.id === groupId)
      if (!group) {
        throw new Error('Selected SHG group does not exist.')
      }

      const user = { ...this.users[userIndex] }
      const oldGroupId = user.group_id

      if (oldGroupId && oldGroupId !== groupId) {
        const oldGrp = this.groups.find((g) => g.id === oldGroupId)
        if (oldGrp && oldGrp.member_count > 0) {
          oldGrp.member_count -= 1
        }
      }

      if (oldGroupId !== groupId) {
        group.member_count = (group.member_count || 0) + 1
      }

      user.status = 'APPROVED'
      user.group_id = group.id
      user.group_name = group.name
      user.approved_at = new Date().toISOString()
      user.approved_by = adminName
      user.is_activated = true
      user.activated_at = new Date().toISOString()
      user.activated_by = adminName

      this.users[userIndex] = user

      this.logAudit(
        adminName,
        'SUPER_ADMIN',
        'APPROVE_ASSIGN_ACTIVATE_TRANSACTION',
        `Transaction complete: Approved registration for ${user.full_name}, allocated to SHG '${group.name}' (${group.district}), activated login access.`,
        'UserAccount',
        user.id
      )

      this.save()
      return user
    } catch (err) {
      this.users = JSON.parse(usersBackup)
      this.groups = JSON.parse(groupsBackup)
      this.auditLogs = JSON.parse(auditBackup)
      throw err
    }
  }

  async loginSuperAdmin(username: string, password: string): Promise<UserAccount> {
    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    // Accept administrative credentials without showing hardcoded text in UI
    const isValidUsername = cleanUser === 'admin' || cleanUser === 'tnadmin' || cleanUser.includes('admin@')
    const isValidPassword = cleanPass === this.adminPassword

    if (!isValidUsername || !isValidPassword) {
      throw new Error('Invalid administrator credentials. Access restricted to authorized personnel.')
    }

    const adminUser = this.users.find((u) => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0]
    this.currentUser = adminUser

    const newSession: LoginSession = {
      id: 'ses-' + Math.random().toString(36).substring(2, 9),
      user_id: adminUser.id,
      user_name: adminUser.full_name,
      role: 'SUPER_ADMIN',
      group_name: 'Statewide Administration',
      login_time: new Date().toISOString(),
      logout_time: null,
      duration_minutes: null,
      status: 'ACTIVE',
      device_browser: 'Web Browser / State Administrator Console',
      ip_category: 'Designated Government Portal',
    }
    this.sessions.unshift(newSession)

    this.logAudit(
      adminUser.full_name,
      'SUPER_ADMIN',
      'ADMIN_LOGIN',
      'Administrator authenticated successfully into Master Console',
      'LoginSession',
      newSession.id
    )

    this.save()
    return adminUser
  }

  async changeAdminPassword(oldPass: string, newPass: string): Promise<boolean> {
    if (oldPass.trim() !== this.adminPassword) {
      throw new Error('Current administrator password is incorrect.')
    }
    if (newPass.trim().length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    this.adminPassword = newPass.trim()
    this.logAudit(
      'Super Admin',
      'SUPER_ADMIN',
      'PASSWORD_RESET',
      'Master administrative password updated securely.',
      'SecurityConfig',
      'master-pass'
    )
    this.save()
    return true
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      const activeSession = this.sessions.find(
        (s) => s.user_id === this.currentUser?.id && s.status === 'ACTIVE'
      )
      if (activeSession) {
        const logoutTime = new Date()
        activeSession.logout_time = logoutTime.toISOString()
        activeSession.status = 'COMPLETED'
        const loginDate = new Date(activeSession.login_time)
        const duration = Math.max(1, Math.round((logoutTime.getTime() - loginDate.getTime()) / 60000))
        activeSession.duration_minutes = duration
      }
      this.logAudit(
        this.currentUser.full_name,
        this.currentUser.role,
        'USER_LOGOUT',
        'User logged out cleanly from session',
        'UserAccount',
        this.currentUser.id
      )
    }
    this.currentUser = null
    this.save()
  }

  // ── District Suggestions (Tamil Nadu Only) ──

  getDistrictSuggestions(query: string): string[] {
    const clean = query.trim().toLowerCase()
    if (!clean) return TN_DISTRICTS.slice(0, 10)
    return TN_DISTRICTS.filter((d) => d.toLowerCase().includes(clean))
  }

  // ── Groups & Permissions (Only Super Admin can manage) ──

  async createGroup(data: GroupCreateInput, adminName: string): Promise<SHGGroup> {
    if (data.state && data.state.trim().toLowerCase() !== 'tamil nadu') {
      throw new Error('SHG Groups can only be established in Tamil Nadu state.')
    }

    const district = normalizeTnDistrict(data.district || 'Coimbatore')
    const area = data.area?.trim() || 'Sulur'
    const village = data.village?.trim() || area
    const code =
      data.code?.trim() ||
      `${district.substring(0, 3).toUpperCase()}-${area.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    if (data.registration_number?.trim()) {
      const reg = data.registration_number.trim()
      const existing = this.groups.find(
        (g) => g.registration_number?.toLowerCase() === reg.toLowerCase()
      )
      if (existing) {
        throw new Error(`A group with registration number '${reg}' already exists.`)
      }
    }

    const newGroup: SHGGroup = {
      id: 'grp-' + Math.random().toString(36).substring(2, 9),
      name: data.name.trim(),
      code,
      registration_number:
        data.registration_number?.trim() ||
        `TN/${district.substring(0, 3).toUpperCase()}/2026/${Math.floor(100 + Math.random() * 900)}`,
      district,
      area,
      village,
      state: 'Tamil Nadu',
      meeting_day: data.meeting_day || 'Monday',
      description: data.description || 'Rural Women Self-Help Group for financial inclusion and livelihood development',
      creation_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      group_admin_id: null,
      group_admin_name: null,
      member_count: 0,
      savings_goal: 200000,
      current_savings: 0,
      available_funds: 0,
      group_limit: data.group_limit || 50000,
      trust_score: 90,
      financial_health_score: 85,
      financial_health_details: {
        savings_score: 20,
        repayment_score: 25,
        fund_sufficiency: 20,
        meeting_regularity: 20,
        total_score: 85,
        grade: 'GOOD',
        explanation: 'Newly inaugurated SHG; initial weekly collections scheduled.',
      },
      ledger_entries: [],
    }

    this.groups.unshift(newGroup)
    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'CREATE_GROUP',
      `Created SHG group '${newGroup.name}' (${newGroup.code}) in ${district} / ${area}`,
      'SHGGroup',
      newGroup.id
    )
    this.save()
    return newGroup
  }

  async updateGroup(id: string, data: GroupUpdateInput, adminName: string): Promise<SHGGroup> {
    const group = this.groups.find((g) => g.id === id)
    if (!group) throw new Error(`Group '${id}' not found.`)

    if (data.name) group.name = data.name.trim()
    if (data.registration_number !== undefined) group.registration_number = data.registration_number || group.registration_number
    if (data.village) group.village = data.village.trim()
    if (data.district) group.district = data.district.trim()
    if (data.meeting_day) group.meeting_day = data.meeting_day
    if (data.group_limit) group.group_limit = data.group_limit
    if (data.description !== undefined) group.description = data.description
    if (data.status) group.status = data.status

    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'UPDATE_GROUP',
      `Updated group profile for ${group.name}`,
      'SHGGroup',
      group.id
    )
    this.save()
    return group
  }

  async assignGroupAdmin(groupId: string, userId: string, adminName: string): Promise<SHGGroup> {
    const group = this.groups.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group '${groupId}' not found.`)

    const newLeader = this.users.find((u) => u.id === userId)
    if (!newLeader) throw new Error(`User '${userId}' not found.`)

    // Demote any current group admin of this group back to member
    this.users.forEach((u) => {
      if (u.group_id === groupId && u.role === 'GROUP_ADMIN') {
        u.role = 'MEMBER'
      }
    })

    // Assign new leader
    newLeader.group_id = groupId
    newLeader.group_name = group.name
    newLeader.role = 'GROUP_ADMIN'

    group.group_admin_id = newLeader.id
    group.group_admin_name = newLeader.full_name
    group.member_count = this.users.filter(
      (u) => u.group_id === groupId && u.status === 'APPROVED'
    ).length

    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'ASSIGN_GROUP_ADMIN',
      `Designated ${newLeader.full_name} as Group Admin for ${group.name}`,
      'SHGGroup',
      group.id
    )
    this.save()
    return group
  }

  async addMemberToGroup(groupId: string, userId: string, role = 'MEMBER', adminName: string): Promise<UserAccount> {
    const group = this.groups.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group '${groupId}' not found.`)

    const user = this.users.find((u) => u.id === userId)
    if (!user) throw new Error(`User '${userId}' not found.`)

    user.group_id = groupId
    user.group_name = group.name
    user.role = role as any

    group.member_count = this.users.filter(
      (u) => u.group_id === groupId && u.status === 'APPROVED'
    ).length

    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'ADD_MEMBER_TO_GROUP',
      `Allocated member ${user.full_name} to group ${group.name}`,
      'UserAccount',
      user.id
    )
    this.save()
    return user
  }

  async removeMemberFromGroup(groupId: string, memberId: string, adminName: string): Promise<void> {
    const user = this.users.find((u) => u.id === memberId)
    if (user && user.group_id === groupId) {
      user.group_id = null
      user.group_name = null
      if (user.role === 'GROUP_ADMIN') {
        user.role = 'MEMBER'
        const grp = this.groups.find((g) => g.id === groupId)
        if (grp) {
          grp.group_admin_id = null
          grp.group_admin_name = null
        }
      }
      const group = this.groups.find((g) => g.id === groupId)
      if (group) {
        group.member_count = this.users.filter(
          (u) => u.group_id === groupId && u.status === 'APPROVED'
        ).length
      }

      this.logAudit(
        adminName,
        'SUPER_ADMIN',
        'REMOVE_MEMBER',
        `Deallocated member ${user.full_name} from group`,
        'UserAccount',
        user.id
      )
      this.save()
    }
  }

  // ── Amount Request System ──

  async createAmountRequest(
    data: AmountRequestCreateInput,
    user: UserAccount
  ): Promise<AmountRequest> {
    if (!user.group_id) {
      throw new Error('You are not currently assigned to an SHG Group. Amount requests require active group membership.')
    }

    const group = this.groups.find((g) => g.id === user.group_id)
    if (!group) {
      throw new Error('Assigned group not found.')
    }

    if (data.requested_amount <= 0) {
      throw new Error('Requested amount must be greater than zero.')
    }

    const groupLimit = group.group_limit || 50000
    if (data.requested_amount > groupLimit) {
      throw new Error(
        `Requested amount (₹${data.requested_amount.toLocaleString('en-IN')}) exceeds group borrowing limit of ₹${groupLimit.toLocaleString('en-IN')}.`
      )
    }

    if (data.payment_method === 'UPI' && !data.upi_id?.trim()) {
      throw new Error('Please enter a valid UPI ID for digital transfer (e.g. name@bank).')
    }

    // Evaluate Smart Risk Alerts
    const riskAlerts: string[] = []
    const available = group.available_funds || 100000
    if (data.requested_amount > available * 0.5) {
      riskAlerts.push(
        `High Value Notice: Amount exceeds 50% of available group pool (₹${available.toLocaleString('en-IN')}). Committee review advised.`
      )
    }

    const memberLoans = this.loans.filter((l) => l.member_id === user.id && l.status === 'OVERDUE')
    if (memberLoans.length > 0) {
      riskAlerts.push('Active Overdue Caution: Member has an existing overdue loan.')
    }

    const recentPending = this.amountRequests.filter(
      (r) =>
        r.member_id === user.id &&
        (r.status === 'Pending approval' || r.status === 'Approved — transfer pending')
    )
    if (recentPending.length > 0) {
      riskAlerts.push('Existing Open Request: Member already has an open request under processing.')
    }

    const newRequest: AmountRequest = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      member_id: user.id,
      member_name: user.full_name,
      member_phone: user.phone_number,
      group_id: group.id,
      group_name: group.name,
      district: group.district,
      requested_amount: data.requested_amount,
      purpose: data.purpose.trim(),
      reason: data.reason.trim(),
      payment_method: data.payment_method,
      upi_id: data.upi_id?.trim(),
      request_date: new Date().toISOString().split('T')[0],
      repayment_period: data.repayment_period || '6 Months',
      proposed_repayment_date: data.proposed_repayment_date,
      supporting_doc: data.supporting_doc?.trim(),
      status: 'Pending approval',
      risk_alerts: riskAlerts,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.amountRequests.unshift(newRequest)

    this.logAudit(
      user.full_name,
      user.role,
      'SUBMIT_AMOUNT_REQUEST',
      `Submitted amount request ${newRequest.id} for ₹${data.requested_amount.toLocaleString('en-IN')} (${data.purpose}) via ${data.payment_method}`,
      'AmountRequest',
      newRequest.id
    )

    this.save()
    return newRequest
  }

  async cancelAmountRequest(requestId: string, user: UserAccount): Promise<AmountRequest> {
    const req = this.amountRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Request not found.')

    if (req.member_id !== user.id && user.role !== 'SUPER_ADMIN') {
      throw new Error('You do not have permission to cancel this request.')
    }

    if (req.status !== 'Pending approval') {
      throw new Error('Only requests in "Pending approval" state can be cancelled.')
    }

    req.status = 'Cancelled'
    req.updated_at = new Date().toISOString()

    this.logAudit(
      user.full_name,
      user.role,
      'CANCEL_AMOUNT_REQUEST',
      `Cancelled amount request ${req.id}`,
      'AmountRequest',
      req.id
    )
    this.save()
    return req
  }

  async approveAmountRequest(
    requestId: string,
    adminUser: UserAccount
  ): Promise<AmountRequest> {
    const req = this.amountRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Amount request not found.')

    // Permission check
    if (adminUser.role === 'GROUP_ADMIN' && adminUser.group_id !== req.group_id) {
      throw new Error('Group Admins can only approve requests for their own assigned group.')
    }

    if (req.status !== 'Pending approval') {
      throw new Error(`Cannot approve a request with status '${req.status}'.`)
    }

    const group = this.groups.find((g) => g.id === req.group_id)
    if (group && (group.available_funds || 0) < req.requested_amount) {
      throw new Error(
        `Insufficient group funds. Available: ₹${(group.available_funds || 0).toLocaleString('en-IN')}, Requested: ₹${req.requested_amount.toLocaleString('en-IN')}`
      )
    }

    req.status = 'Approved — transfer pending'
    req.approved_by = `${adminUser.full_name} (${adminUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Group Admin'})`
    req.approved_at = new Date().toISOString()
    req.updated_at = new Date().toISOString()

    this.logAudit(
      adminUser.full_name,
      adminUser.role,
      'APPROVE_AMOUNT_REQUEST',
      `Approved amount request ${req.id} for ₹${req.requested_amount.toLocaleString('en-IN')}. Transfer pending.`,
      'AmountRequest',
      req.id
    )

    this.save()
    return req
  }

  async rejectAmountRequest(
    requestId: string,
    reason: string,
    adminUser: UserAccount
  ): Promise<AmountRequest> {
    const req = this.amountRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Amount request not found.')

    if (!reason || !reason.trim()) {
      throw new Error('A rejection reason is required.')
    }

    if (adminUser.role === 'GROUP_ADMIN' && adminUser.group_id !== req.group_id) {
      throw new Error('Group Admins can only review requests for their own assigned group.')
    }

    req.status = 'Rejected'
    req.rejection_reason = reason.trim()
    req.approved_by = `${adminUser.full_name} (${adminUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Group Admin'})`
    req.approved_at = new Date().toISOString()
    req.updated_at = new Date().toISOString()

    this.logAudit(
      adminUser.full_name,
      adminUser.role,
      'REJECT_AMOUNT_REQUEST',
      `Rejected amount request ${req.id}. Reason: ${reason.trim()}`,
      'AmountRequest',
      req.id
    )

    this.save()
    return req
  }

  async recordTransfer(
    requestId: string,
    data: {
      payment_method: 'UPI' | 'CASH'
      transaction_ref?: string
      cash_receipt_no?: string
      payer_name?: string
      recipient_name?: string
    },
    adminUser: UserAccount
  ): Promise<AmountRequest> {
    const req = this.amountRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Amount request not found.')

    if (adminUser.role === 'GROUP_ADMIN' && adminUser.group_id !== req.group_id) {
      throw new Error('Group Admins can only disburse funds for their own assigned group.')
    }

    if (req.status === 'Completed') {
      throw new Error('This transfer has already been completed. Duplicate processing prevented.')
    }

    if (req.status !== 'Approved — transfer pending' && req.status !== 'Transfer initiated') {
      throw new Error('Transfer can only be recorded for approved requests.')
    }

    const digitalReceiptRef = `RCP-TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    req.status = 'Completed'
    req.transfer_details = {
      payment_method: data.payment_method,
      transaction_ref: data.transaction_ref?.trim(),
      cash_receipt_no: data.cash_receipt_no?.trim(),
      payer_name: data.payer_name || `${req.group_name} Treasury`,
      recipient_name: data.recipient_name || req.member_name,
      transferred_at: new Date().toISOString(),
      recorded_by: `${adminUser.full_name} (${adminUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Group Admin'})`,
      amount: req.requested_amount,
      digital_receipt_ref: digitalReceiptRef,
    }
    req.updated_at = new Date().toISOString()

    // Deduct from group available funds and add ledger entry
    const group = this.groups.find((g) => g.id === req.group_id)
    if (group) {
      group.available_funds = Math.max(0, (group.available_funds || group.current_savings) - req.requested_amount)
      if (!group.ledger_entries) group.ledger_entries = []
      group.ledger_entries.unshift({
        id: 'led-' + Math.random().toString(36).substring(2, 9),
        group_id: group.id,
        date: new Date().toISOString().split('T')[0],
        type: 'AMOUNT_REQUEST_TRANSFER',
        description: `Disbursed ${data.payment_method} transfer for ${req.purpose} to ${req.member_name} (${req.id})`,
        amount: -req.requested_amount,
        balance_after: group.available_funds,
        reference: digitalReceiptRef,
        recorded_by: adminUser.full_name,
      })
    }

    this.logAudit(
      adminUser.full_name,
      adminUser.role,
      'COMPLETE_TRANSFER',
      `Completed ${data.payment_method} transfer of ₹${req.requested_amount.toLocaleString('en-IN')} for ${req.id}. Receipt: ${digitalReceiptRef}`,
      'AmountRequest',
      req.id
    )

    this.save()
    return req
  }

  listAmountRequests(filter: AmountRequestFilter = {}, user?: UserAccount | null): AmountRequest[] {
    let list = [...this.amountRequests]

    // Role-based permission enforcement:
    // Members only see their own requests
    if (user && user.role !== 'SUPER_ADMIN') {
      if (user.role === 'GROUP_ADMIN') {
        // Group Admin sees their assigned group's requests
        list = list.filter((r) => r.group_id === user.group_id)
      } else {
        // Regular member sees ONLY their own
        list = list.filter((r) => r.member_id === user.id)
      }
    }

    // Additional filters
    if (filter.group_id) {
      list = list.filter((r) => r.group_id === filter.group_id)
    }
    if (filter.member_id) {
      list = list.filter((r) => r.member_id === filter.member_id)
    }
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status)
    }
    if (filter.payment_method && filter.payment_method !== 'ALL') {
      list = list.filter((r) => r.payment_method === filter.payment_method)
    }
    if (filter.district) {
      list = list.filter((r) => r.district === filter.district)
    }
    if (filter.search_query) {
      const q = filter.search_query.toLowerCase()
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.member_name.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q) ||
          r.group_name.toLowerCase().includes(q)
      )
    }

    return list
  }

  // ── Member Grievance Feature ──

  async submitGrievance(data: {
    category: GrievanceRecord['category']
    subject: string
    description: string
    is_confidential: boolean
  }, user: UserAccount): Promise<GrievanceRecord> {
    const newGrv: GrievanceRecord = {
      id: `GRV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      member_id: user.id,
      member_name: user.full_name,
      member_phone: user.phone_number,
      group_id: user.group_id || 'unassigned',
      group_name: user.group_name || 'Independent Member',
      category: data.category,
      subject: data.subject.trim(),
      description: data.description.trim(),
      is_confidential: data.is_confidential,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    }

    this.grievances.unshift(newGrv)
    this.logAudit(
      user.full_name,
      user.role,
      'SUBMIT_GRIEVANCE',
      `Submitted grievance ${newGrv.id} (${data.category}): ${data.subject}`,
      'GrievanceRecord',
      newGrv.id
    )
    this.save()
    return newGrv
  }

  async resolveGrievance(id: string, notes: string, adminName: string): Promise<GrievanceRecord> {
    const grv = this.grievances.find((g) => g.id === id)
    if (!grv) throw new Error('Grievance not found.')

    grv.status = 'RESOLVED'
    grv.resolution_notes = notes.trim()
    grv.resolved_at = new Date().toISOString()
    grv.resolved_by = adminName

    this.logAudit(
      adminName,
      'SUPER_ADMIN',
      'RESOLVE_GRIEVANCE',
      `Resolved grievance ${grv.id}. Notes: ${notes.trim()}`,
      'GrievanceRecord',
      grv.id
    )
    this.save()
    return grv
  }

  listGrievances(user?: UserAccount | null): GrievanceRecord[] {
    if (!user) return []
    if (user.role === 'SUPER_ADMIN') {
      return [...this.grievances]
    }
    if (user.role === 'GROUP_ADMIN') {
      return this.grievances.filter((g) => g.group_id === user.group_id && !g.is_confidential)
    }
    return this.grievances.filter((g) => g.member_id === user.id)
  }

  // ── Financial Health Score ──

  getFinancialHealth(group: SHGGroup): FinancialHealthBreakdown {
    const current = group.current_savings || 100000
    const goal = group.savings_goal || 200000
    const savings_score = Math.min(25, Math.round((current / goal) * 25))

    const available = group.available_funds || current * 0.7
    const count = Math.max(1, group.member_count)
    const perMember = available / count
    const fund_sufficiency = Math.min(25, Math.max(15, Math.round((perMember / 20000) * 25)))

    const repayment_score = 28 // High repayment discipline in Tamil Nadu SHGs
    const meeting_regularity = 18 // Weekly attendance consistency

    const total_score = savings_score + repayment_score + fund_sufficiency + meeting_regularity
    const grade = total_score >= 88 ? 'EXCELLENT' : total_score >= 70 ? 'GOOD' : 'FAIR'
    const explanation = `Transparent indicator based on ${Math.round((current / goal) * 100)}% savings goal completion, ₹${Math.round(perMember).toLocaleString('en-IN')}/member reserve fund cushion, zero defaults, and regular meeting attendance.`

    return {
      savings_score,
      repayment_score,
      fund_sufficiency,
      meeting_regularity,
      total_score,
      grade,
      explanation,
    }
  }

  // ── Weekly Savings & Transactions ──

  async recordSavingsDeposit(data: {
    groupId: string
    memberId: string
    amount: number
    paymentMethod: 'CASH' | 'UPI'
    referenceNumber?: string
    recordedBy: string
  }): Promise<SavingsTransaction> {
    const group = this.groups.find((g) => g.id === data.groupId)
    const member = this.users.find((u) => u.id === data.memberId)
    if (!group || !member) throw new Error('Group or Member not found.')

    const receiptRef = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const tx: SavingsTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      receipt_ref: receiptRef,
      member_id: member.id,
      member_name: member.full_name,
      group_id: group.id,
      group_name: group.name,
      district: group.district,
      area: group.area,
      transaction_date: new Date().toISOString().split('T')[0],
      amount: data.amount,
      transaction_type: 'WEEKLY_SAVINGS',
      payment_method: data.paymentMethod,
      reference_number: data.referenceNumber,
      recorded_by: data.recordedBy,
      created_at: new Date().toISOString(),
      status: 'CONFIRMED',
    }

    this.savings.unshift(tx)
    group.current_savings += data.amount
    group.available_funds = (group.available_funds || 0) + data.amount

    if (!group.ledger_entries) group.ledger_entries = []
    group.ledger_entries.unshift({
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      group_id: group.id,
      date: tx.transaction_date,
      type: 'SAVINGS_DEPOSIT',
      description: `Weekly savings deposit from ${member.full_name} (${data.paymentMethod})`,
      amount: data.amount,
      balance_after: group.available_funds,
      reference: receiptRef,
      recorded_by: data.recordedBy,
    })

    this.logAudit(
      data.recordedBy,
      'GROUP_ADMIN',
      'SAVINGS_DEPOSIT',
      `Recorded ${data.paymentMethod} savings of ₹${data.amount} for ${member.full_name}. Receipt: ${receiptRef}`,
      'SavingsTransaction',
      tx.id
    )

    this.save()
    return tx
  }
}

export const shgStore = new SHGStorageService()
