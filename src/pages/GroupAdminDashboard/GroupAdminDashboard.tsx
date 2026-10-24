import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  groupsApi,
  usersApi,
  savingsApi,
  loansApi,
  announcementsApi,
  amountRequestsApi,
} from '../../services/api'
import {
  UserAccount,
  SHGGroup,
  SavingsTransaction,
  LoanRecord,
  GroupAnnouncement,
  AmountRequest,
  AmountRequestFilter,
} from '../../types'
import Modal from '../../components/Modal/Modal'
import ReceiptModal from '../../components/ReceiptModal/ReceiptModal'
import { SkeletonMetric, SkeletonCard } from '../../components/Skeleton/Skeleton'
import {
  Users,
  PiggyBank,
  Plus,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  CreditCard,
  Send,
  Bell,
  Activity,
  Filter,
  Search,
} from 'lucide-react'
import './GroupAdminDashboard.css'

interface GroupAdminDashboardProps {
  currentUser: UserAccount
  lang?: 'ta' | 'en'
}

export default function GroupAdminDashboard({
  currentUser,
  lang = 'ta',
}: GroupAdminDashboardProps) {
  const isTa = lang === 'ta'
  const [loading, setLoading] = useState(true)

  const [group, setGroup] = useState<SHGGroup | null>(null)
  const [members, setMembers] = useState<UserAccount[]>([])
  const [savings, setSavings] = useState<SavingsTransaction[]>([])
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [announcements, setAnnouncements] = useState<GroupAnnouncement[]>([])
  const [amountRequests, setAmountRequests] = useState<AmountRequest[]>([])

  // Amount request filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [methodFilter, setMethodFilter] = useState<string>('ALL')
  const [memberFilter, setMemberFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [reviewRequest, setReviewRequest] = useState<AmountRequest | null>(null)
  const [rejectModal, setRejectModal] = useState<AmountRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Transfer modal
  const [transferModal, setTransferModal] = useState<AmountRequest | null>(null)
  const [transferRef, setTransferRef] = useState('')
  const [transferReceiptNo, setTransferReceiptNo] = useState('')
  const [transferPayer, setTransferPayer] = useState('')
  const [transferMethod, setTransferMethod] = useState<'UPI' | 'CASH'>('UPI')

  // Savings collection modal
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depMemberId, setDepMemberId] = useState('')
  const [depAmount, setDepAmount] = useState('500')
  const [depMode, setDepMode] = useState<'CASH' | 'UPI'>('CASH')
  const [depRefNo, setDepRefNo] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)

  // Announcement modal
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')

  // Digital Receipt
  const [viewReceipt, setViewReceipt] = useState<SavingsTransaction | null>(null)
  const [viewTransferReceipt, setViewTransferReceipt] = useState<AmountRequest | null>(null)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'members' | 'savings' | 'ledger'>('requests')

  const loadData = useCallback(async () => {
    if (!currentUser.group_id) return
    setLoading(true)
    try {
      const g = await groupsApi.get(currentUser.group_id)
      setGroup(g)

      const allUsers = await usersApi.list('APPROVED')
      setMembers(allUsers.filter((u) => u.group_id === currentUser.group_id))

      const s = await savingsApi.list(currentUser.group_id)
      setSavings(s)

      const l = await loansApi.list(currentUser.group_id)
      setLoans(l)

      const a = await announcementsApi.list(currentUser.group_id)
      setAnnouncements(a)

      const reqs = await amountRequestsApi.list({ group_id: currentUser.group_id }, currentUser)
      setAmountRequests(reqs)
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }, [currentUser])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return amountRequests.filter((r) => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
      const matchMethod = methodFilter === 'ALL' || r.payment_method === methodFilter
      const matchMember = memberFilter === 'ALL' || r.member_id === memberFilter
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.member_name.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q)
      return matchStatus && matchMethod && matchMember && matchSearch
    })
  }, [amountRequests, statusFilter, methodFilter, memberFilter, searchQuery])

  // Approval action
  const handleApproveRequest = async (req: AmountRequest) => {
    setActionLoading(true)
    try {
      await amountRequestsApi.approve(req.id, currentUser)
      setReviewRequest(null)
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setActionLoading(false)
    }
  }

  // Rejection action
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModal || !rejectionReason.trim()) return

    setActionLoading(true)
    try {
      await amountRequestsApi.reject(rejectModal.id, rejectionReason.trim(), currentUser)
      setRejectModal(null)
      setRejectionReason('')
      setReviewRequest(null)
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setActionLoading(false)
    }
  }

  // Record Transfer
  const handleRecordTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferModal) return

    setActionLoading(true)
    try {
      await amountRequestsApi.recordTransfer(
        transferModal.id,
        {
          payment_method: transferMethod,
          transaction_ref: transferMethod === 'UPI' ? transferRef.trim() : undefined,
          cash_receipt_no: transferMethod === 'CASH' ? transferReceiptNo.trim() : undefined,
          payer_name: transferPayer.trim() || `${group?.name} Treasury`,
        },
        currentUser
      )
      setTransferModal(null)
      setTransferRef('')
      setTransferReceiptNo('')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setActionLoading(false)
    }
  }

  // Record Weekly Savings
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser.group_id || !depMemberId || !depAmount) return

    setDepositLoading(true)
    try {
      const tx = await savingsApi.recordDeposit({
        groupId: currentUser.group_id,
        memberId: depMemberId,
        amount: Number(depAmount),
        paymentMethod: depMode,
        referenceNumber: depRefNo || undefined,
        recordedBy: `${currentUser.full_name} (Group Admin)`,
      })
      setShowDepositModal(false)
      setDepAmount('500')
      setDepRefNo('')
      setViewReceipt(tx)
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setDepositLoading(false)
    }
  }

  // Publish Announcement
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noticeTitle.trim() || !noticeContent.trim() || !currentUser.group_id) return

    try {
      await announcementsApi.publish({
        group_id: currentUser.group_id,
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        published_by: `${currentUser.full_name} (Group Admin)`,
        category: 'MEETING_NOTICE',
      })
      setShowNoticeModal(false)
      setNoticeTitle('')
      setNoticeContent('')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const pendingApprovals = amountRequests.filter((r) => r.status === 'Pending approval')
  const pendingTransfers = amountRequests.filter((r) => r.status === 'Approved — transfer pending')
  const completedCount = amountRequests.filter((r) => r.status === 'Completed').length

  const health = group ? groupsApi.getFinancialHealth(group) : null

  return (
    <div className="group-admin-dash">
      {/* ── Group Header Card ── */}
      <div className="ga-header-card">
        <div className="ga-header-left">
          <span className="ga-badge font-mono">{group?.code}</span>
          <h1 className="ga-title tamil">{group?.name}</h1>
          <p className="ga-meta tamil">
            <span>{group?.village}, {group?.district}</span>
            <span>·</span>
            <span>{isTa ? 'கூட்டம்: ' : 'Meeting Day: '}{group?.meeting_day}</span>
            <span>·</span>
            <span>{members.length} {isTa ? 'உறுப்பினர்கள்' : 'Active Members'}</span>
            <span>·</span>
            <span>{isTa ? 'தலைவர்: ' : 'Designated Admin: '}<strong>{currentUser.full_name}</strong></span>
          </p>
        </div>

        <div className="ga-header-actions">
          <button
            className="btn btn-primary tamil"
            onClick={() => setShowDepositModal(true)}
          >
            <PiggyBank size={16} />
            <span>{isTa ? '+ வார சேமிப்பு பதிவு' : '+ Record Savings'}</span>
          </button>

          <button
            className="btn btn-secondary tamil"
            onClick={() => setShowNoticeModal(true)}
          >
            <Bell size={16} />
            <span>{isTa ? '+ அறிவிப்பு' : '+ Post Notice'}</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Summary ── */}
      {loading ? (
        <SkeletonMetric count={4} />
      ) : (
        <div className="ga-stats-grid">
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'கிடைக்கக்கூடிய நிதி இருப்பு' : 'Available Group Funds'}</span>
              <PiggyBank size={18} color="#15803d" />
            </div>
            <div className="stat-card__val font-mono">₹{(group?.available_funds || 0).toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">{isTa ? 'சேமிப்பு மொத்தம்: ' : 'Total Savings: '}₹{(group?.current_savings || 0).toLocaleString('en-IN')}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'ஒப்புதல் நிலுவை கோரிக்கைகள்' : 'Pending Approvals'}</span>
              <AlertTriangle size={18} color={pendingApprovals.length > 0 ? '#d97706' : '#6b7280'} />
            </div>
            <div className="stat-card__val font-mono">{pendingApprovals.length}</div>
            <div className="stat-card__sub tamil">
              ₹{pendingApprovals.reduce((s, r) => s + r.requested_amount, 0).toLocaleString('en-IN')} {isTa ? 'மதிப்பு' : 'amount'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'பரிவர்த்தனை நிலுவை' : 'Approved — Transfer Pending'}</span>
              <CreditCard size={18} color="#0284c7" />
            </div>
            <div className="stat-card__val font-mono">{pendingTransfers.length}</div>
            <div className="stat-card__sub tamil">
              ₹{pendingTransfers.reduce((s, r) => s + r.requested_amount, 0).toLocaleString('en-IN')} {isTa ? 'வழங்கப்பட வேண்டியது' : 'to disburse'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'குழு நிதி நலக் குறியீடு' : 'SHG Health Score'}</span>
              <Activity size={18} color="#166534" />
            </div>
            <div className="stat-card__val font-mono">{health?.total_score || 94}/100</div>
            <div className="stat-card__sub tamil">{health?.grade || 'EXCELLENT'}</div>
          </div>
        </div>
      )}

      {/* ── Sub Navigation Tabs ── */}
      <div className="member-tabs-bar">
        <button
          className={`member-tab-btn tamil ${activeTab === 'requests' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          {isTa ? 'தொகை கோரிக்கைகள் & ஒப்புதல்' : 'Amount Requests Queue'} ({amountRequests.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'members' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          {isTa ? 'குழு உறுப்பினர்கள்' : 'Group Members'} ({members.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'savings' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          {isTa ? 'சேமிப்பு வரவு பதிவுகள்' : 'Weekly Savings'} ({savings.length})
        </button>

        {group?.ledger_entries && (
          <button
            className={`member-tab-btn tamil ${activeTab === 'ledger' ? 'member-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            {isTa ? 'பொதுப் பேரேடு' : 'Transparent Ledger'} ({group.ledger_entries.length})
          </button>
        )}
      </div>

      {/* ── TAB 1: AMOUNT REQUESTS QUEUE ── */}
      {activeTab === 'requests' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'உறுப்பினர் தொகை கோரிக்கைகள்' : 'Amount Requests Review & Payout Queue'}</h3>
              <p className="pane-subtitle tamil">
                {isTa
                  ? 'உங்கள் குழு உறுப்பினர்களின் கடன் கோரிக்கைகளை ஆய்வு செய்து ஒப்புதல் வழங்கவும் அல்லது ரொக்கம்/UPI பரிவர்த்தனையை பதிவு செய்யவும்.'
                  : 'Review member borrowing requests, approve/reject with justification, and log verified UPI or cash disbursements.'}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="queue-filter-bar">
            <div className="filter-search-box" style={{ maxWidth: '300px' }}>
              <Search size={14} className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input tamil"
                placeholder={isTa ? 'உறுப்பினர் / நோக்கம்...' : 'Filter by member / purpose...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns-row">
              <select
                className="filter-select tamil"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து நிலைகள்' : 'All Statuses'}</option>
                <option value="Pending approval">{isTa ? 'ஒப்புதல் நிலுவை (Pending)' : 'Pending approval'}</option>
                <option value="Approved — transfer pending">{isTa ? 'வழங்கல் நிலுவை (Transfer Pending)' : 'Approved — transfer pending'}</option>
                <option value="Completed">{isTa ? 'நிறைவு (Completed)' : 'Completed'}</option>
                <option value="Rejected">{isTa ? 'நிராகரிக்கப்பட்டது (Rejected)' : 'Rejected'}</option>
              </select>

              <select
                className="filter-select tamil"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து முறைகள்' : 'All Methods'}</option>
                <option value="UPI">UPI</option>
                <option value="CASH">{isTa ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
              </select>

              <select
                className="filter-select tamil"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து உறுப்பினர்கள்' : 'All Members'}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p className="tamil">{isTa ? 'பொருத்தமான கோரிக்கைகள் ஏதும் இல்லை.' : 'No requests matching filters.'}</p>
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'கோரிக்கை எண்' : 'Req ID'}</th>
                    <th className="tamil">{isTa ? 'உறுப்பினர் பெயர்' : 'Member'}</th>
                    <th className="tamil">{isTa ? 'நோக்கம் & காரணம்' : 'Purpose & Reason'}</th>
                    <th className="tamil">{isTa ? 'முறை' : 'Method'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                    <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                    <th className="tamil">{isTa ? 'நிர்வாக செயல்' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-mono" style={{ fontWeight: 600 }}>{req.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.member_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{req.member_phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.purpose}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>{req.reason}</div>
                        {req.risk_alerts && req.risk_alerts.length > 0 && (
                          <div className="alert-badge-risk tamil">
                            ⚠️ {req.risk_alerts[0]}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="payment-tag">
                          {req.payment_method}
                          {req.upi_id && ` (${req.upi_id})`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                        ₹{req.requested_amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-pill status-pill--${req.status.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                          {req.status}
                        </span>
                        {req.rejection_reason && (
                          <div className="rejection-note tamil">{req.rejection_reason}</div>
                        )}
                      </td>
                      <td>
                        {req.status === 'Pending approval' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm tamil"
                              onClick={() => setReviewRequest(req)}
                            >
                              {isTa ? 'ஆய்வு & ஒப்புதல்' : 'Review'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm tamil"
                              onClick={() => {
                                setRejectModal(req)
                                setRejectionReason('')
                              }}
                            >
                              {isTa ? 'நிராகரி' : 'Reject'}
                            </button>
                          </div>
                        )}

                        {req.status === 'Approved — transfer pending' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm tamil"
                            onClick={() => {
                              setTransferModal(req)
                              setTransferMethod(req.payment_method)
                              setTransferRef('')
                              setTransferReceiptNo('')
                              setTransferPayer(`${group?.name} Treasury`)
                            }}
                          >
                            <CreditCard size={13} style={{ marginRight: '4px' }} />
                            <span>{isTa ? 'வழங்கலை பதிவு செய்' : 'Record Payout'}</span>
                          </button>
                        )}

                        {req.status === 'Completed' && req.transfer_details && (
                          <button
                            type="button"
                            className="btn-view-receipt tamil"
                            onClick={() => setViewTransferReceipt(req)}
                          >
                            <QrCode size={13} style={{ marginRight: '4px' }} />
                            <span>{isTa ? 'QR ரசீது' : 'Receipt'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MEMBERS LIST ── */}
      {activeTab === 'members' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'குழு உறுப்பினர்கள் பட்டியல்' : 'Assigned SHG Members'}</h3>
              <p className="pane-subtitle tamil">{members.length} {isTa ? 'செயலில் உள்ள உறுப்பினர்கள்' : 'verified members'}</p>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'பெயர்' : 'Name'}</th>
                  <th className="tamil">{isTa ? 'மொபைல் எண்' : 'Phone'}</th>
                  <th className="tamil">{isTa ? 'மின்னஞ்சல்' : 'Email'}</th>
                  <th className="tamil">{isTa ? 'பதவி' : 'Role'}</th>
                  <th className="tamil">{isTa ? 'இடம்' : 'Location'}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.full_name}</td>
                    <td className="font-mono">{m.phone_number}</td>
                    <td>{m.email}</td>
                    <td>
                      <span className="payment-tag">
                        {m.role === 'GROUP_ADMIN' ? (isTa ? 'குழு தலைவர்' : 'Group Admin') : (isTa ? 'உறுப்பினர்' : 'Member')}
                      </span>
                    </td>
                    <td>{m.district}, {m.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: WEEKLY SAVINGS ── */}
      {activeTab === 'savings' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'வாராந்திர சேமிப்பு பதிவுகள்' : 'Weekly Savings Collection Log'}</h3>
              <p className="pane-subtitle tamil">{savings.length} {isTa ? 'பரிவர்த்தனைகள்' : 'transactions recorded'}</p>
            </div>
            <button
              className="btn btn-primary btn-sm tamil"
              onClick={() => setShowDepositModal(true)}
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              <span>{isTa ? '+ வரவு பதிவு' : '+ Log Deposit'}</span>
            </button>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'ரசீது எண்' : 'Receipt No.'}</th>
                  <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                  <th className="tamil">{isTa ? 'உறுப்பினர்' : 'Member'}</th>
                  <th className="tamil">{isTa ? 'முறை' : 'Method'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                  <th className="tamil">{isTa ? 'ரசீது' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody>
                {savings.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{s.receipt_ref}</td>
                    <td>{s.transaction_date}</td>
                    <td>{s.member_name}</td>
                    <td><span className="payment-tag">{s.payment_method}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                      ₹{s.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-view-receipt tamil"
                        onClick={() => setViewReceipt(s)}
                      >
                        <QrCode size={13} style={{ marginRight: '4px' }} />
                        <span>{isTa ? 'ரசீது' : 'Receipt'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: GROUP LEDGER ── */}
      {activeTab === 'ledger' && group?.ledger_entries && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'குழு பொதுப் பேரேடு (Chronological Ledger)' : 'Chronological Group Ledger'}</h3>
              <p className="pane-subtitle tamil">{isTa ? 'அனைத்து பண வரவு மற்றும் செலவு விவரங்கள்.' : 'All historical collections, disbursements, and fund balance checks.'}</p>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                  <th className="tamil">{isTa ? 'பரிவர்த்தனை' : 'Transaction'}</th>
                  <th className="tamil">{isTa ? 'விளக்கம்' : 'Description'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'இருப்பு' : 'Balance'}</th>
                  <th className="tamil">{isTa ? 'ரசீது குறிப்பு' : 'Reference'}</th>
                </tr>
              </thead>
              <tbody>
                {group.ledger_entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td><span className="payment-tag">{entry.type}</span></td>
                    <td>{entry.description}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: entry.amount < 0 ? '#b91c1c' : '#15803d',
                      }}
                      className="font-mono"
                    >
                      {entry.amount < 0 ? `-₹${Math.abs(entry.amount).toLocaleString('en-IN')}` : `+₹${entry.amount.toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">
                      ₹{entry.balance_after.toLocaleString('en-IN')}
                    </td>
                    <td className="font-mono">{entry.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REVIEW REQUEST MODAL ── */}
      {reviewRequest && (
        <Modal
          isOpen={Boolean(reviewRequest)}
          onClose={() => setReviewRequest(null)}
          title={isTa ? 'கடன் கோரிக்கை விரிவான ஆய்வு' : 'Review Amount Request'}
          lang={lang}
        >
          <div className="review-modal-body">
            <div className="review-field-group">
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'கோரிக்கை எண்:' : 'Request ID:'}</span>
                <span className="review-val font-mono">{reviewRequest.id}</span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'உறுப்பினர் பெயர்:' : 'Member Name:'}</span>
                <span className="review-val tamil"><strong>{reviewRequest.member_name}</strong> ({reviewRequest.member_phone})</span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'கோரப்பட்ட தொகை:' : 'Requested Amount:'}</span>
                <span className="review-val font-mono" style={{ fontSize: '1.2rem', color: '#166534', fontWeight: 800 }}>
                  ₹{reviewRequest.requested_amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'நோக்கம் & காரணம்:' : 'Purpose & Details:'}</span>
                <span className="review-val tamil">
                  <strong>{reviewRequest.purpose}</strong> — {reviewRequest.reason}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'பரிவர்த்தனை முறை:' : 'Payment Method:'}</span>
                <span className="review-val">
                  {reviewRequest.payment_method} {reviewRequest.upi_id && `(UPI ID: ${reviewRequest.upi_id})`}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'தவணை கால அளவு:' : 'Repayment Period:'}</span>
                <span className="review-val">{reviewRequest.repayment_period}</span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'குழு கையிருப்பு நிதி:' : 'Available Group Funds:'}</span>
                <span className="review-val font-mono">₹{(group?.available_funds || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {reviewRequest.risk_alerts && reviewRequest.risk_alerts.length > 0 && (
              <div className="review-risk-alert tamil">
                <AlertTriangle size={16} />
                <span>{reviewRequest.risk_alerts.join(' ')}</span>
              </div>
            )}

            <div className="form__actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => {
                  setRejectModal(reviewRequest)
                  setRejectionReason('')
                }}
              >
                {isTa ? 'நிராகரி' : 'Reject Request'}
              </button>

              <button
                type="button"
                className="btn btn-primary tamil"
                disabled={actionLoading}
                onClick={() => handleApproveRequest(reviewRequest)}
              >
                {actionLoading ? (isTa ? 'பதிவாகிறது...' : 'Processing...') : (isTa ? 'ஒப்புதல் அளி (Approve)' : 'Approve Request')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── REJECT REASON MODAL ── */}
      {rejectModal && (
        <Modal
          isOpen={Boolean(rejectModal)}
          onClose={() => setRejectModal(null)}
          title={isTa ? 'கோரிக்கையை நிராகரிக்கும் காரணம்' : 'Reject Amount Request'}
          lang={lang}
        >
          <form onSubmit={handleConfirmReject} className="form">
            <p className="tamil" style={{ fontSize: '0.88rem', color: '#4b5563' }}>
              {isTa
                ? `${rejectModal.member_name} என்பவரின் ₹${rejectModal.requested_amount.toLocaleString('en-IN')} தொகை கோரிக்கையை நிராகரிக்க உரிய காரணத்தை உள்ளிடவும்.`
                : `Please provide a justification reason for rejecting ${rejectModal.member_name}'s request for ₹${rejectModal.requested_amount.toLocaleString('en-IN')}.`}
            </p>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'நிராகரிப்பு காரணம் *' : 'Rejection Reason *'}</label>
              <textarea
                rows={3}
                className="form__input tamil"
                placeholder={isTa ? 'எ.கா. குழு நிதி பற்றாக்குறை அல்லது கடன் வரம்பை விட அதிகம்...' : 'e.g. Insufficient group reserve funds...'}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setRejectModal(null)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-danger tamil"
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (isTa ? 'செயல்படுகிறது...' : 'Processing...') : (isTa ? 'நிராகரிப்பை உறுதிசெய்' : 'Confirm Rejection')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── RECORD TRANSFER MODAL (UPI / CASH) ── */}
      {transferModal && (
        <Modal
          isOpen={Boolean(transferModal)}
          onClose={() => setTransferModal(null)}
          title={isTa ? 'பரிவர்த்தனை வழங்கலை பதிவு செய்' : 'Record Payout Disbursement'}
          lang={lang}
        >
          <form onSubmit={handleRecordTransferSubmit} className="form">
            <div className="review-modal-body" style={{ marginBottom: '16px' }}>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'பெறுநர்:' : 'Recipient:'}</span>
                <span className="review-val tamil"><strong>{transferModal.member_name}</strong></span>
              </div>
              <div className="review-row">
                <span className="review-label tamil">{isTa ? 'வழங்கப்படும் தொகை:' : 'Disbursement Amount:'}</span>
                <span className="review-val font-mono" style={{ fontWeight: 800, color: '#166534', fontSize: '1.2rem' }}>
                  ₹{transferModal.requested_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'பரிவர்த்தனை முறை *' : 'Payment Method *'}</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gaTransferMethod"
                    value="UPI"
                    checked={transferMethod === 'UPI'}
                    onChange={() => setTransferMethod('UPI')}
                  />
                  <span>UPI Transfer</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gaTransferMethod"
                    value="CASH"
                    checked={transferMethod === 'CASH'}
                    onChange={() => setTransferMethod('CASH')}
                  />
                  <span>{isTa ? 'நேரடி ரொக்கம்' : 'Cash Payment'}</span>
                </label>
              </div>
            </div>

            {transferMethod === 'UPI' ? (
              <div className="form__field">
                <label className="form__label tamil" htmlFor="upi-ref">
                  {isTa ? 'UPI பரிவர்த்தனை குறிப்பு எண் (Ref No) *' : 'UPI Transaction Reference Number *'}
                </label>
                <input
                  id="upi-ref"
                  type="text"
                  className="form__input font-mono"
                  placeholder="e.g. UPI202603209841"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  required
                />
                <span className="field-hint tamil">
                  {isTa ? 'வங்கி செயலி அல்லது பாஸ்புக்கில் உள்ள 12 இலக்க குறிப்பு எண்.' : 'Enter the 12-digit UPI / UTR transaction reference.'}
                </span>
              </div>
            ) : (
              <div className="form__field">
                <label className="form__label tamil" htmlFor="cash-receipt">
                  {isTa ? 'ரொக்க ரசீது எண் (Receipt No) *' : 'Cash Receipt Voucher Number *'}
                </label>
                <input
                  id="cash-receipt"
                  type="text"
                  className="form__input font-mono"
                  placeholder="e.g. RCP-CASH-2026-08"
                  value={transferReceiptNo}
                  onChange={(e) => setTransferReceiptNo(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form__field">
              <label className="form__label tamil" htmlFor="payer-name">
                {isTa ? 'செலுத்துநர் பெயர்' : 'Disbursing Treasury Account'}
              </label>
              <input
                id="payer-name"
                type="text"
                className="form__input tamil"
                value={transferPayer}
                onChange={(e) => setTransferPayer(e.target.value)}
              />
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setTransferModal(null)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary tamil"
                disabled={actionLoading}
              >
                {actionLoading ? (isTa ? 'பதிவாகிறது...' : 'Processing...') : (isTa ? 'பரிவர்த்தனையை நிறைவு செய்' : 'Confirm & Complete Transfer')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── RECORD WEEKLY SAVINGS MODAL ── */}
      {showDepositModal && (
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title={isTa ? 'வாராந்திர சேமிப்பு பதிவு' : 'Record Weekly Savings'}
          lang={lang}
        >
          <form onSubmit={handleDepositSubmit} className="form">
            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'உறுப்பினர் பெயர் *' : 'Select Member *'}</label>
              <select
                className="form__input tamil"
                value={depMemberId}
                onChange={(e) => setDepMemberId(e.target.value)}
                required
              >
                <option value="">{isTa ? '— தேர்ந்தெடுக்கவும் —' : '— Select Member —'}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name} ({m.phone_number})</option>
                ))}
              </select>
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'சேமிப்பு தொகை (₹) *' : 'Amount (₹) *'}</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  className="form__input font-mono"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'செலுத்தும் முறை *' : 'Mode *'}</label>
                <select
                  className="form__input"
                  value={depMode}
                  onChange={(e) => setDepMode(e.target.value as any)}
                >
                  <option value="CASH">{isTa ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            {depMode === 'UPI' && (
              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'UPI பரிவர்த்தனை எண்' : 'UPI Ref Number'}</label>
                <input
                  type="text"
                  className="form__input font-mono"
                  placeholder="UPI..."
                  value={depRefNo}
                  onChange={(e) => setDepRefNo(e.target.value)}
                />
              </div>
            )}

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowDepositModal(false)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary tamil"
                disabled={depositLoading || !depMemberId}
              >
                {depositLoading ? (isTa ? 'பதிவாகிறது...' : 'Saving...') : (isTa ? 'ரசீதுடன் பதிவு செய்' : 'Save & Generate Receipt')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── POST NOTICE MODAL ── */}
      {showNoticeModal && (
        <Modal
          isOpen={showNoticeModal}
          onClose={() => setShowNoticeModal(false)}
          title={isTa ? 'குழுவிற்கு புதிய அறிவிப்பு' : 'Publish Group Notice'}
          lang={lang}
        >
          <form onSubmit={handleNoticeSubmit} className="form">
            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'அறிவிப்பு தலைப்பு *' : 'Notice Title *'}</label>
              <input
                type="text"
                className="form__input tamil"
                placeholder={isTa ? 'எ.கா. அடுத்த வார கூட்டம் மற்றும் கடன் விண்ணப்பம்' : 'Meeting date and venue update'}
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'விவரம் *' : 'Notice Content *'}</label>
              <textarea
                rows={4}
                className="form__input tamil"
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                required
              />
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowNoticeModal(false)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary tamil">
                {isTa ? 'வெளியிடு' : 'Publish Notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── TRANSFER RECEIPT MODAL ── */}
      {viewTransferReceipt && viewTransferReceipt.transfer_details && (
        <ReceiptModal
          isOpen={Boolean(viewTransferReceipt)}
          onClose={() => setViewTransferReceipt(null)}
          lang={lang}
          receipt={{
            id: viewTransferReceipt.id,
            receipt_ref: viewTransferReceipt.transfer_details.digital_receipt_ref,
            member_id: viewTransferReceipt.member_id,
            member_name: viewTransferReceipt.member_name,
            group_id: viewTransferReceipt.group_id,
            group_name: viewTransferReceipt.group_name,
            district: viewTransferReceipt.district,
            area: group?.area || 'Sulur',
            transaction_date: viewTransferReceipt.transfer_details.transferred_at.split('T')[0],
            amount: viewTransferReceipt.requested_amount,
            transaction_type: 'SPECIAL_CONTRIBUTION',
            payment_method: viewTransferReceipt.transfer_details.payment_method,
            reference_number: viewTransferReceipt.transfer_details.transaction_ref || viewTransferReceipt.transfer_details.cash_receipt_no,
            recorded_by: viewTransferReceipt.transfer_details.recorded_by,
            created_at: viewTransferReceipt.transfer_details.transferred_at,
            status: 'CONFIRMED',
          }}
        />
      )}

      {/* ── SAVINGS RECEIPT MODAL ── */}
      {viewReceipt && (
        <ReceiptModal
          isOpen={Boolean(viewReceipt)}
          onClose={() => setViewReceipt(null)}
          receipt={viewReceipt}
          lang={lang}
        />
      )}
    </div>
  )
}
