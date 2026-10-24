import React, { useState, useEffect, useCallback } from 'react'
import {
  savingsApi,
  loansApi,
  groupsApi,
  announcementsApi,
  amountRequestsApi,
  grievancesApi,
} from '../../services/api'
import {
  UserAccount,
  SHGGroup,
  SavingsTransaction,
  LoanRecord,
  LoanRepayment,
  GroupAnnouncement,
  AmountRequest,
  AmountRequestCreateInput,
  GrievanceRecord,
} from '../../types'
import Modal from '../../components/Modal/Modal'
import ReceiptModal from '../../components/ReceiptModal/ReceiptModal'
import { SkeletonMetric, SkeletonCard } from '../../components/Skeleton/Skeleton'
import {
  PiggyBank,
  HandCoins,
  Calendar,
  AlertCircle,
  Bell,
  Volume2,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  FileText,
  LifeBuoy,
  Plus,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  Info,
} from 'lucide-react'
import './MemberDashboard.css'

interface MemberDashboardProps {
  currentUser: UserAccount
  lang?: 'ta' | 'en'
}

const COMMON_PURPOSES = [
  'Agriculture & Seed Purchase',
  'Livestock & Dairy Farming',
  'Small Business & Tailoring',
  'Children Education & School Fees',
  'Medical Emergency & Health Treatment',
  'House Repair & Sanitation',
  'Festival & Family Event',
  'Cottage Handicrafts & Weaving',
]

const REPAYMENT_PERIODS = [
  '3 Months',
  '6 Months',
  '9 Months',
  '12 Months',
  '18 Months',
  '24 Months',
]

export default function MemberDashboard({
  currentUser,
  lang = 'ta',
}: MemberDashboardProps) {
  const isTa = lang === 'ta'
  const [loading, setLoading] = useState(true)

  const [group, setGroup] = useState<SHGGroup | null>(null)
  const [savings, setSavings] = useState<SavingsTransaction[]>([])
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [repayments, setRepayments] = useState<LoanRepayment[]>([])
  const [announcements, setAnnouncements] = useState<GroupAnnouncement[]>([])
  const [amountRequests, setAmountRequests] = useState<AmountRequest[]>([])
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([])

  const [selectedReceipt, setSelectedReceipt] = useState<SavingsTransaction | null>(null)
  const [selectedTransferReceipt, setSelectedTransferReceipt] = useState<AmountRequest | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Amount Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [reqAmount, setReqAmount] = useState('')
  const [reqPurpose, setReqPurpose] = useState(COMMON_PURPOSES[0])
  const [reqReason, setReqReason] = useState('')
  const [reqMethod, setReqMethod] = useState<'UPI' | 'CASH'>('UPI')
  const [reqUpiId, setReqUpiId] = useState(currentUser.upi_id || '')
  const [reqPeriod, setReqPeriod] = useState(REPAYMENT_PERIODS[1])
  const [reqDocNote, setReqDocNote] = useState('')
  const [reqSubmitting, setReqSubmitting] = useState(false)
  const [reqError, setReqError] = useState<string | null>(null)
  const [reqSuccess, setReqSuccess] = useState<string | null>(null)

  // Offline Draft Feature
  const [hasDraft, setHasDraft] = useState(false)

  // Grievance Modal
  const [showGrievanceModal, setShowGrievanceModal] = useState(false)
  const [grvCategory, setGrvCategory] = useState<GrievanceRecord['category']>('PAYMENT_ISSUE')
  const [grvSubject, setGrvSubject] = useState('')
  const [grvDesc, setGrvDesc] = useState('')
  const [grvConfidential, setGrvConfidential] = useState(true)
  const [grvSubmitting, setGrvSubmitting] = useState(false)
  const [grvMessage, setGrvMessage] = useState<string | null>(null)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'savings' | 'loans' | 'ledger' | 'grievances'>('requests')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (currentUser.group_id) {
        const grp = await groupsApi.get(currentUser.group_id).catch(() => null)
        setGroup(grp)

        const allSavings = await savingsApi.list(currentUser.group_id)
        setSavings(allSavings.filter((s) => s.member_id === currentUser.id))

        const allLoans = await loansApi.list(currentUser.group_id)
        const myLoans = allLoans.filter((l) => l.member_id === currentUser.id)
        setLoans(myLoans)
        if (myLoans.length > 0) {
          loansApi.listRepayments(myLoans[0].id).then(setRepayments)
        }

        const ann = await announcementsApi.list(currentUser.group_id)
        setAnnouncements(ann)
      } else {
        const ann = await announcementsApi.list()
        setAnnouncements(ann)
      }

      // Load member amount requests (filtered for this user)
      const reqs = await amountRequestsApi.list({ member_id: currentUser.id }, currentUser)
      setAmountRequests(reqs)

      // Load member grievances
      const grvs = await grievancesApi.list(currentUser)
      setGrievances(grvs)
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }, [currentUser])

  useEffect(() => {
    loadData()

    // Check offline draft
    try {
      const draft = localStorage.getItem(`shg_draft_req_${currentUser.id}`)
      if (draft) setHasDraft(true)
    } catch {
      // Ignored
    }
  }, [loadData, currentUser.id])

  const myTotalSavings = savings.reduce((acc, s) => acc + s.amount, 0)
  const myActiveLoan = loans.find((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
  const outstandingLoanBalance = myActiveLoan ? myActiveLoan.outstanding_principal : 0

  // Amount request stats
  const totalAmountRequested = amountRequests.reduce((sum, r) => sum + r.requested_amount, 0)
  const totalAmountApproved = amountRequests
    .filter((r) => r.status === 'Approved — transfer pending' || r.status === 'Completed')
    .reduce((sum, r) => sum + r.requested_amount, 0)
  const totalAmountReceived = amountRequests
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + r.requested_amount, 0)

  const pendingRequestsCount = amountRequests.filter(
    (r) => r.status === 'Pending approval' || r.status === 'Approved — transfer pending'
  ).length
  const rejectedRequestsCount = amountRequests.filter((r) => r.status === 'Rejected').length
  const completedRequestsCount = amountRequests.filter((r) => r.status === 'Completed').length

  // Voice Guidance (Speech Synthesis)
  const handleVoiceGuidance = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(isTa ? 'உங்கள் உலாவியில் குரல் உதவி வசதி இல்லை.' : 'Speech synthesis not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = isTa
      ? `வணக்கம் ${currentUser.full_name}. உங்கள் மொத்த சேமிப்பு இருப்பு ${myTotalSavings} ரூபாய். ${
          pendingRequestsCount > 0
            ? `உங்களுக்கு ${pendingRequestsCount} கடன் கோரிக்கைகள் பரிசீலனையில் உள்ளன.`
            : ''
        } ${
          myActiveLoan
            ? `உங்கள் கடன் நிலுவை ${outstandingLoanBalance} ரூபாய்.`
            : 'உங்களுக்கு தற்போது நிலுவை கடன் ஏதுமில்லை.'
        } குழு கூட்ட நாள்: ${group ? group.meeting_day : 'திங்கட்கிழமை'}.`
      : `Welcome ${currentUser.full_name}. Your total savings balance is ${myTotalSavings} Rupees. ${
          pendingRequestsCount > 0
            ? `You have ${pendingRequestsCount} amount requests under review.`
            : ''
        } ${
          myActiveLoan
            ? `Your active loan outstanding balance is ${outstandingLoanBalance} Rupees.`
            : 'You have no outstanding loans.'
        } Weekly meeting day is ${group ? group.meeting_day : 'Monday'}.`

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = isTa ? 'ta-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  // Handle Amount Request submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setReqError(null)
    setReqSuccess(null)

    const amount = Number(reqAmount)
    if (!amount || amount <= 0) {
      setReqError(isTa ? 'செல்லுபடியாகும் தொகையை உள்ளிடவும்.' : 'Please enter a valid positive amount.')
      return
    }

    const limit = group?.group_limit || 50000
    if (amount > limit) {
      setReqError(
        isTa
          ? `கோரப்பட்ட தொகை குழு உச்ச வரம்பை (₹${limit.toLocaleString('en-IN')}) விட அதிகமாக உள்ளது.`
          : `Requested amount exceeds group limit of ₹${limit.toLocaleString('en-IN')}.`
      )
      return
    }

    if (!reqReason.trim()) {
      setReqError(isTa ? 'தேவைக்கான காரணத்தை விரிவாக உள்ளிடவும்.' : 'Please provide detailed reason/purpose.')
      return
    }

    if (reqMethod === 'UPI' && !reqUpiId.trim()) {
      setReqError(isTa ? 'UPI ஐடியை உள்ளிடவும் (எ.கா. name@bank).' : 'Please enter your UPI ID.')
      return
    }

    setReqSubmitting(true)
    try {
      await amountRequestsApi.create(
        {
          requested_amount: amount,
          purpose: reqPurpose,
          reason: reqReason.trim(),
          payment_method: reqMethod,
          upi_id: reqMethod === 'UPI' ? reqUpiId.trim() : undefined,
          repayment_period: reqPeriod,
          supporting_doc: reqDocNote.trim() || undefined,
        },
        currentUser
      )

      // Clear draft
      localStorage.removeItem(`shg_draft_req_${currentUser.id}`)
      setHasDraft(false)

      setReqSuccess(
        isTa
          ? 'தொகை கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! குழு நிர்வாகிக்கு அறிவிக்கப்பட்டுள்ளது.'
          : 'Amount request submitted successfully! Notified designated Group Admin.'
      )
      setTimeout(() => {
        setShowRequestModal(false)
        setReqAmount('')
        setReqReason('')
        setReqDocNote('')
        setReqSuccess(null)
        loadData()
      }, 1000)
    } catch (err: unknown) {
      setReqError(err instanceof Error ? err.message : String(err))
    } finally {
      setReqSubmitting(false)
    }
  }

  // Save Offline Draft
  const handleSaveDraft = () => {
    const draftData = {
      amount: reqAmount,
      purpose: reqPurpose,
      reason: reqReason,
      method: reqMethod,
      upiId: reqUpiId,
      period: reqPeriod,
      docNote: reqDocNote,
    }
    localStorage.setItem(`shg_draft_req_${currentUser.id}`, JSON.stringify(draftData))
    setHasDraft(true)
    alert(isTa ? 'கோரிக்கை வரைவு சேமிக்கப்பட்டது! இணையம் வந்ததும் சமர்ப்பிக்கலாம்.' : 'Draft saved locally! You can submit whenever ready.')
  }

  // Load Offline Draft
  const handleLoadDraft = () => {
    try {
      const raw = localStorage.getItem(`shg_draft_req_${currentUser.id}`)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.amount) setReqAmount(d.amount)
        if (d.purpose) setReqPurpose(d.purpose)
        if (d.reason) setReqReason(d.reason)
        if (d.method) setReqMethod(d.method)
        if (d.upiId) setReqUpiId(d.upiId)
        if (d.period) setReqPeriod(d.period)
        if (d.docNote) setReqDocNote(d.docNote)
        setShowRequestModal(true)
      }
    } catch {
      // Ignored
    }
  }

  // Cancel Pending Request
  const handleCancelRequest = async (reqId: string) => {
    if (!confirm(isTa ? 'இந்த கோரிக்கையை ரத்து செய்ய விரும்புகிறீர்களா?' : 'Are you sure you want to cancel this request?')) {
      return
    }
    try {
      await amountRequestsApi.cancel(reqId, currentUser)
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Submit Grievance
  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grvSubject.trim() || !grvDesc.trim()) return

    setGrvSubmitting(true)
    try {
      await grievancesApi.submit(
        {
          category: grvCategory,
          subject: grvSubject.trim(),
          description: grvDesc.trim(),
          is_confidential: grvConfidential,
        },
        currentUser
      )
      setGrvMessage(isTa ? 'உங்கள் புகார் ரகசியமாக சமர்ப்பிக்கப்பட்டது!' : 'Grievance submitted securely to administration.')
      setTimeout(() => {
        setShowGrievanceModal(false)
        setGrvSubject('')
        setGrvDesc('')
        setGrvMessage(null)
        loadData()
      }, 1000)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setGrvSubmitting(false)
    }
  }

  return (
    <div className="member-dash">
      {/* ── Welcome Profile Header ── */}
      <div className="member-hero-card">
        <div className="member-hero-left">
          <div className="member-avatar">
            {currentUser.full_name.charAt(0)}
          </div>
          <div>
            <div className="member-greeting-tag tamil">
              {isTa ? 'வணக்கம் / நல்வரவு' : 'Welcome'}
            </div>
            <h1 className="member-name tamil">{currentUser.full_name}</h1>
            <p className="member-meta-info tamil">
              <span>{currentUser.phone_number}</span>
              <span>·</span>
              <span>{currentUser.district}, {currentUser.location}</span>
            </p>
          </div>
        </div>

        <div className="member-hero-actions">
          {/* Voice Guide Button */}
          <button
            className={`btn-voice-guide tamil ${isSpeaking ? 'btn-voice-guide--active' : ''}`}
            onClick={handleVoiceGuidance}
            title={isTa ? 'குரல் மூலம் சுருக்கத்தை கேட்க' : 'Listen to voice summary'}
          >
            <Volume2 size={18} />
            <span>{isSpeaking ? (isTa ? 'நிறுத்து' : 'Stop Audio') : (isTa ? 'குரல் உதவி' : 'Voice Guide')}</span>
          </button>

          {/* Request Amount Primary Action Button */}
          {currentUser.group_id && (
            <button
              className="btn btn-primary btn-request-action tamil"
              onClick={() => {
                setReqError(null)
                setShowRequestModal(true)
              }}
              id="btn-open-request-amount"
            >
              <Plus size={16} />
              <span>{isTa ? 'கடன் / தொகை கோரிக்கை' : 'Request Amount'}</span>
            </button>
          )}

          {/* Grievance Button */}
          <button
            className="btn btn-secondary btn-sm tamil"
            onClick={() => setShowGrievanceModal(true)}
            title={isTa ? 'குறைதீர்ப்பு / புகார்' : 'File Grievance'}
          >
            <LifeBuoy size={14} style={{ marginRight: '4px' }} />
            <span>{isTa ? 'குறைதீர்ப்பு' : 'Grievance'}</span>
          </button>
        </div>
      </div>

      {/* ── UNALLOCATED MEMBER NOTICE (If no group assigned) ── */}
      {!currentUser.group_id && (
        <div className="unallocated-banner" role="status">
          <div className="unallocated-banner__content">
            <Info size={22} className="unallocated-banner__icon" />
            <div>
              <h3 className="unallocated-banner__title tamil">
                {isTa
                  ? 'உங்கள் கணக்கு அங்கீகரிக்கப்பட்டுள்ளது. குழு ஒதுக்கீடு நிலுவையில் உள்ளது.'
                  : 'Your account is approved. Group allocation is pending.'}
              </h3>
              <p className="unallocated-banner__desc tamil">
                {isTa
                  ? `உங்கள் மாவட்டம் (${currentUser.district}) தலைமை நிர்வாகி உங்கள் அருகிலுள்ள கிராம சுய உதவிக் குழுவை விரைவில் ஒதுக்குவார். ஒதுக்கப்பட்டதும் உங்கள் குழு விவரங்கள் இங்கே தோன்றும்.`
                  : `Your District Administrator in ${currentUser.district} will allocate you to an active local SHG cluster shortly. Once assigned, your group information and amount request capabilities will be unlocked.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGNED GROUP BANNER (If group assigned) ── */}
      {group && (
        <div className="assigned-group-banner">
          <div className="group-banner-info">
            <span className="group-banner-code font-mono">{group.code}</span>
            <h2 className="group-banner-name tamil">{group.name}</h2>
            <div className="group-banner-meta tamil">
              <span>{group.village}, {group.district}</span>
              <span>·</span>
              <span>{group.member_count} {isTa ? 'உறுப்பினர்கள்' : 'Members'}</span>
              <span>·</span>
              <span>{isTa ? 'கூட்டம்: ' : 'Meeting: '}{group.meeting_day}</span>
              {group.group_admin_name && (
                <>
                  <span>·</span>
                  <span className="group-leader-chip">
                    {isTa ? 'குழு தலைவர்: ' : 'Group Admin: '}
                    <strong>{group.group_admin_name}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Financial Health Score preview */}
          {group.financial_health_details && (
            <div className="group-health-badge" title={group.financial_health_details.explanation}>
              <TrendingUp size={16} />
              <div>
                <div className="health-num font-mono">{group.financial_health_details.total_score}/100</div>
                <div className="health-text tamil">{isTa ? 'நிதி நலம்' : 'Health Score'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline Draft Banner */}
      {hasDraft && (
        <div className="draft-alert-banner">
          <FileText size={18} color="#166534" />
          <span className="tamil">
            {isTa
              ? 'உங்களிடம் சேமிக்கப்பட்ட தொகை கோரிக்கை வரைவு உள்ளது.'
              : 'You have an unsent amount request draft saved locally.'}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm tamil"
            onClick={handleLoadDraft}
          >
            {isTa ? 'வரைவைத் திறக்க' : 'Open Draft'}
          </button>
        </div>
      )}

      {/* ── Loading Skeleton / Real Stats Grid ── */}
      {loading ? (
        <SkeletonMetric count={5} />
      ) : (
        <div className="member-stats-grid">
          {/* Card 1: Total Savings */}
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'மொத்த சேமிப்பு' : 'Total Savings'}</span>
              <PiggyBank size={18} color="#15803d" />
            </div>
            <div className="stat-card__val font-mono">₹{myTotalSavings.toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">{savings.length} {isTa ? 'வாராந்திர தவணைகள்' : 'Weekly deposits'}</div>
          </div>

          {/* Card 2: Requested Amount */}
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'கோரப்பட்ட தொகை' : 'Total Requested'}</span>
              <HandCoins size={18} color="#166534" />
            </div>
            <div className="stat-card__val font-mono">₹{totalAmountRequested.toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">{amountRequests.length} {isTa ? 'கோரிக்கைகள்' : 'Total requests'}</div>
          </div>

          {/* Card 3: Total Approved */}
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'ஒப்புதல் பெற்ற தொகை' : 'Total Approved'}</span>
              <CheckCircle2 size={18} color="#16a34a" />
            </div>
            <div className="stat-card__val font-mono">₹{totalAmountApproved.toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">
              {pendingRequestsCount > 0 ? `${pendingRequestsCount} ${isTa ? 'பரிசீலனையில்' : 'pending'}` : isTa ? 'நிலுவை இல்லை' : 'Up to date'}
            </div>
          </div>

          {/* Card 4: Total Received */}
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'பெற்ற தொகை (Disbursed)' : 'Amount Received'}</span>
              <CreditCard size={18} color="#0d9488" />
            </div>
            <div className="stat-card__val font-mono">₹{totalAmountReceived.toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">{completedRequestsCount} {isTa ? 'நிறைவு பரிவர்த்தனை' : 'Completed transfers'}</div>
          </div>

          {/* Card 5: Active Loan Outstanding */}
          <div className="stat-card">
            <div className="stat-card__head">
              <span className="stat-card__title tamil">{isTa ? 'கடன் நிலுவை' : 'Loan Outstanding'}</span>
              <AlertCircle size={18} color={outstandingLoanBalance > 0 ? '#d97706' : '#6b7280'} />
            </div>
            <div className="stat-card__val font-mono">₹{outstandingLoanBalance.toLocaleString('en-IN')}</div>
            <div className="stat-card__sub tamil">
              {myActiveLoan ? `${isTa ? 'தவணை நாள்: ' : 'Due: '}${myActiveLoan.next_due_date}` : isTa ? 'கடன் இல்லை' : 'Zero debt'}
            </div>
          </div>
        </div>
      )}

      {/* ── Sub Navigation Tabs ── */}
      <div className="member-tabs-bar">
        <button
          className={`member-tab-btn tamil ${activeTab === 'requests' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          {isTa ? 'தொகை கோரிக்கைகள்' : 'Amount Requests'} ({amountRequests.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'savings' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          {isTa ? 'சேமிப்பு ரசீதுகள்' : 'Savings History'} ({savings.length})
        </button>

        {loans.length > 0 && (
          <button
            className={`member-tab-btn tamil ${activeTab === 'loans' ? 'member-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            {isTa ? 'கடன் திருப்பிச் செலுத்துதல்' : 'Loan Repayments'} ({repayments.length})
          </button>
        )}

        {group?.ledger_entries && group.ledger_entries.length > 0 && (
          <button
            className={`member-tab-btn tamil ${activeTab === 'ledger' ? 'member-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            {isTa ? 'குழு பொதுப் பேரேடு' : 'Transparent Ledger'}
          </button>
        )}

        <button
          className={`member-tab-btn tamil ${activeTab === 'grievances' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          {isTa ? 'என் குறைகள்' : 'My Grievances'} ({grievances.length})
        </button>
      </div>

      {/* ── TAB 1: AMOUNT REQUESTS LIST ── */}
      {activeTab === 'requests' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">
                {isTa ? 'தொகை கோரிக்கை பட்டியல்' : 'Amount Requests & Disbursements'}
              </h3>
              <p className="pane-subtitle tamil">
                {isTa
                  ? 'உங்கள் குழு நிர்வாகியால் ஆய்வு செய்யப்படும் கடன் கோரிக்கைகள் மற்றும் பணப் பரிவர்த்தனை நிலைகள்.'
                  : 'Track your amount request approvals, UPI/cash disbursements, and verifiable receipts.'}
              </p>
            </div>

            {currentUser.group_id && (
              <button
                className="btn btn-primary btn-sm tamil"
                onClick={() => setShowRequestModal(true)}
              >
                <Plus size={14} style={{ marginRight: '4px' }} />
                <span>{isTa ? '+ புதிய கோரிக்கை' : '+ New Request'}</span>
              </button>
            )}
          </div>

          {amountRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📄</div>
              <p className="tamil">
                {isTa
                  ? 'நீங்கள் இன்னும் எந்த தொகை கோரிக்கையும் சமர்ப்பிக்கவில்லை.'
                  : 'You have not submitted any amount requests yet.'}
              </p>
              {currentUser.group_id && (
                <button
                  className="btn btn-primary tamil"
                  style={{ marginTop: '12px' }}
                  onClick={() => setShowRequestModal(true)}
                >
                  {isTa ? 'முதல் கோரிக்கையை சமர்ப்பிக்க' : 'Submit First Request'}
                </button>
              )}
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'கோரிக்கை எண்' : 'Req ID'}</th>
                    <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                    <th className="tamil">{isTa ? 'நோக்கம்' : 'Purpose'}</th>
                    <th className="tamil">{isTa ? 'முறை' : 'Method'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                    <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                    <th className="tamil">{isTa ? 'செயல்' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {amountRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-mono" style={{ fontWeight: 600 }}>{req.id}</td>
                      <td>{req.request_date}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.purpose}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{req.reason}</div>
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
                          <div className="rejection-note tamil">
                            {isTa ? 'காரணம்: ' : 'Reason: '}{req.rejection_reason}
                          </div>
                        )}
                        {req.approved_by && req.status !== 'Rejected' && (
                          <div className="approver-note">
                            {req.approved_by}
                          </div>
                        )}
                      </td>
                      <td>
                        {req.status === 'Pending approval' && (
                          <button
                            type="button"
                            className="btn-cancel-req tamil"
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            {isTa ? 'ரத்து செய்' : 'Cancel'}
                          </button>
                        )}

                        {req.status === 'Completed' && req.transfer_details && (
                          <button
                            type="button"
                            className="btn-view-receipt tamil"
                            onClick={() => setSelectedTransferReceipt(req)}
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

      {/* ── TAB 2: SAVINGS HISTORY ── */}
      {activeTab === 'savings' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'சேமிப்பு பரிவர்த்தனைகள்' : 'Savings History'}</h3>
              <p className="pane-subtitle tamil">
                {isTa ? 'ஒவ்வொரு வாரமும் உங்கள் குழு கூட்டத்தில் பதிவு செய்யப்பட்ட சேமிப்பு ரசீதுகள்.' : 'All verified weekly deposits and digital passbook receipts.'}
              </p>
            </div>
          </div>

          {savings.length === 0 ? (
            <div className="empty-state">
              <p className="tamil">{isTa ? 'சேமிப்பு பரிவர்த்தனைகள் ஏதும் இல்லை.' : 'No savings recorded yet.'}</p>
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'ரசீது எண்' : 'Receipt No.'}</th>
                    <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                    <th className="tamil">{isTa ? 'செலுத்தும் முறை' : 'Method'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                    <th className="tamil">{isTa ? 'பதிவு செய்தவர்' : 'Recorded By'}</th>
                    <th className="tamil">{isTa ? 'ரசீது' : 'Receipt'}</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono" style={{ fontWeight: 600 }}>{s.receipt_ref}</td>
                      <td>{s.transaction_date}</td>
                      <td>
                        <span className="payment-tag">{s.payment_method}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                        ₹{s.amount.toLocaleString('en-IN')}
                      </td>
                      <td>{s.recorded_by}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-view-receipt tamil"
                          onClick={() => setSelectedReceipt(s)}
                        >
                          <QrCode size={13} style={{ marginRight: '4px' }} />
                          <span>{isTa ? 'ரசீது காண்' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LOAN REPAYMENTS ── */}
      {activeTab === 'loans' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'கடன் திருப்பிச் செலுத்துதல்' : 'Loan Installments'}</h3>
              <p className="pane-subtitle tamil">
                {myActiveLoan && `${myActiveLoan.loan_account_no} · ${myActiveLoan.loan_purpose}`}
              </p>
            </div>
          </div>

          {repayments.length === 0 ? (
            <div className="empty-state">
              <p className="tamil">{isTa ? 'தவணை செலுத்துதல் ஏதும் பதிவு செய்யப்படவில்லை.' : 'No repayments logged.'}</p>
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'ரசீது எண்' : 'Receipt'}</th>
                    <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'அசல்' : 'Principal'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'வட்டி' : 'Interest'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'மொத்தம்' : 'Total'}</th>
                    <th className="tamil">{isTa ? 'முறை' : 'Method'}</th>
                  </tr>
                </thead>
                <tbody>
                  {repayments.map((rep) => (
                    <tr key={rep.id}>
                      <td className="font-mono">{rep.receipt_ref}</td>
                      <td>{rep.repayment_date}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono">₹{rep.principal_component}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono">₹{rep.interest_component}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                        ₹{rep.amount_paid.toLocaleString('en-IN')}
                      </td>
                      <td><span className="payment-tag">{rep.payment_method}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: TRANSPARENT GROUP LEDGER ── */}
      {activeTab === 'ledger' && group?.ledger_entries && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'குழு பொதுப் பேரேடு (Ledger)' : 'Transparent Group Ledger'}</h3>
              <p className="pane-subtitle tamil">
                {isTa
                  ? 'குழுவின் அனைத்து நிதிப் பரிவர்த்தனைகள், பங்களிப்புகள் மற்றும் இருப்பு விபரங்கள்.'
                  : 'Chronological transparent record of all group receipts, disbursements, and fund balances.'}
              </p>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'தேதி' : 'Date'}</th>
                  <th className="tamil">{isTa ? 'பரிவர்த்தனை வகை' : 'Type'}</th>
                  <th className="tamil">{isTa ? 'விளக்கம்' : 'Description'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'இருப்பு' : 'Balance'}</th>
                  <th className="tamil">{isTa ? 'குறிப்பு எண்' : 'Reference'}</th>
                </tr>
              </thead>
              <tbody>
                {group.ledger_entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>
                      <span className="payment-tag">{entry.type}</span>
                    </td>
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

      {/* ── TAB 5: MY GRIEVANCES ── */}
      {activeTab === 'grievances' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'ரகசிய குறைகேட்பு விவரங்கள்' : 'My Grievances'}</h3>
              <p className="pane-subtitle tamil">
                {isTa
                  ? 'நீங்கள் நிர்வாகத்திற்கு அனுப்பிய குறைகள் மற்றும் அவற்றின் தீர்வு நிலைகள்.'
                  : 'Confidential complaints submitted directly to administrative authorities.'}
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm tamil"
              onClick={() => setShowGrievanceModal(true)}
            >
              {isTa ? '+ புதிய குறை சமர்ப்பிக்க' : '+ Raise Grievance'}
            </button>
          </div>

          {grievances.length === 0 ? (
            <div className="empty-state">
              <p className="tamil">{isTa ? 'குறைகள் எதுவும் சமர்ப்பிக்கப்படவில்லை.' : 'No grievances on record.'}</p>
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'குறை எண்' : 'ID'}</th>
                    <th className="tamil">{isTa ? 'வகை' : 'Category'}</th>
                    <th className="tamil">{isTa ? 'பொருள்' : 'Subject'}</th>
                    <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                    <th className="tamil">{isTa ? 'தீர்வு குறிப்பு' : 'Resolution'}</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((g) => (
                    <tr key={g.id}>
                      <td className="font-mono">{g.id}</td>
                      <td><span className="payment-tag">{g.category}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{g.subject}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{g.description}</div>
                      </td>
                      <td>
                        <span className={`status-pill status-pill--${g.status.toLowerCase()}`}>
                          {g.status}
                        </span>
                      </td>
                      <td>{g.resolution_notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AMOUNT REQUEST MODAL ── */}
      {showRequestModal && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title={isTa ? 'கடன் / நிதித் தொகை கோரிக்கை' : 'Request Amount'}
          lang={lang}
        >
          <form onSubmit={handleSubmitRequest} className="form">
            {reqError && (
              <div className="form__error tamil" role="alert">
                {reqError}
              </div>
            )}
            {reqSuccess && (
              <div className="auth-alert auth-alert--success tamil" role="alert">
                {reqSuccess}
              </div>
            )}

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil" htmlFor="req-amount">
                  {isTa ? 'கோரப்படும் தொகை (₹) *' : 'Requested Amount (₹) *'}
                </label>
                <input
                  id="req-amount"
                  type="number"
                  min="500"
                  max={group?.group_limit || 50000}
                  className="form__input font-mono"
                  placeholder="25000"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  required
                />
                <span className="field-hint tamil">
                  {isTa
                    ? `அதிகபட்ச கடன் வரம்பு: ₹${(group?.group_limit || 50000).toLocaleString('en-IN')}`
                    : `Max allowed limit: ₹${(group?.group_limit || 50000).toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="form__field">
                <label className="form__label tamil" htmlFor="req-purpose">
                  {isTa ? 'தொகை பயன்பாட்டு நோக்கம் *' : 'Purpose of Amount *'}
                </label>
                <select
                  id="req-purpose"
                  className="form__input tamil"
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                >
                  {COMMON_PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form__field">
              <label className="form__label tamil" htmlFor="req-reason">
                {isTa ? 'விரிவான காரணம் / திட்ட விளக்கம் *' : 'Detailed Reason & Justification *'}
              </label>
              <textarea
                id="req-reason"
                rows={3}
                className="form__input tamil"
                placeholder={
                  isTa
                    ? 'தொகை எதற்காக செலவிடப்படும் என்பதை விளக்குக...'
                    : 'Provide detailed explanation of how the funds will be utilized...'
                }
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                required
              />
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'விருப்பமான பரிவர்த்தனை முறை *' : 'Preferred Payment Method *'}</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={reqMethod === 'UPI'}
                      onChange={() => setReqMethod('UPI')}
                    />
                    <span className="tamil">{isTa ? 'UPI நேரடி வங்கி' : 'UPI (Bank Transfer)'}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={reqMethod === 'CASH'}
                      onChange={() => setReqMethod('CASH')}
                    />
                    <span className="tamil">{isTa ? 'நேரடி ரொக்கம்' : 'Cash (In-person)'}</span>
                  </label>
                </div>
              </div>

              {reqMethod === 'UPI' && (
                <div className="form__field">
                  <label className="form__label tamil" htmlFor="req-upi">
                    {isTa ? 'உங்கள் UPI ஐடி *' : 'Recipient UPI ID *'}
                  </label>
                  <input
                    id="req-upi"
                    type="text"
                    className="form__input font-mono"
                    placeholder="name@okhdfcbank"
                    value={reqUpiId}
                    onChange={(e) => setReqUpiId(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil" htmlFor="req-period">
                  {isTa ? 'திருப்பிச் செலுத்தும் கால அளவு *' : 'Proposed Repayment Period *'}
                </label>
                <select
                  id="req-period"
                  className="form__input tamil"
                  value={reqPeriod}
                  onChange={(e) => setReqPeriod(e.target.value)}
                >
                  {REPAYMENT_PERIODS.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>

              <div className="form__field">
                <label className="form__label tamil" htmlFor="req-doc">
                  {isTa ? 'ஆவணக் குறிப்பு (விருப்பத்தேர்வு)' : 'Supporting Doc Notes (Optional)'}
                </label>
                <input
                  id="req-doc"
                  type="text"
                  className="form__input tamil"
                  placeholder="e.g. Quotation ref / Dairy Passbook"
                  value={reqDocNote}
                  onChange={(e) => setReqDocNote(e.target.value)}
                />
              </div>
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={handleSaveDraft}
                title="Save draft on device"
              >
                {isTa ? 'வரைவாக சேமி' : 'Save Draft'}
              </button>

              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowRequestModal(false)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="btn btn-primary tamil"
                disabled={reqSubmitting}
              >
                {reqSubmitting ? (isTa ? 'சமர்ப்பிக்கிறது...' : 'Submitting...') : (isTa ? 'கோரிக்கையை அனுப்பு' : 'Submit Request')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── GRIEVANCE MODAL ── */}
      {showGrievanceModal && (
        <Modal
          isOpen={showGrievanceModal}
          onClose={() => setShowGrievanceModal(false)}
          title={isTa ? 'ரகசிய குறைகேட்பு மனு' : 'Confidential Grievance Redressal'}
          lang={lang}
        >
          <form onSubmit={handleSubmitGrievance} className="form">
            {grvMessage && (
              <div className="auth-alert auth-alert--success tamil">{grvMessage}</div>
            )}

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'குறை வகை *' : 'Grievance Category *'}</label>
              <select
                className="form__input tamil"
                value={grvCategory}
                onChange={(e) => setGrvCategory(e.target.value as any)}
              >
                <option value="PAYMENT_ISSUE">{isTa ? 'பரிவர்த்தனை / ரசீது சிக்கல்' : 'Payment / Receipt Issue'}</option>
                <option value="REQUEST_DELAY">{isTa ? 'தொகை கோரிக்கை தாமதம்' : 'Amount Request Delay'}</option>
                <option value="GROUP_MANAGEMENT">{isTa ? 'குழு நிர்வாக சிக்கல்' : 'Group Governance Dispute'}</option>
                <option value="DISCRIMINATION">{isTa ? 'பாகுபாடு / சமத்துவமின்மை' : 'Discrimination Complaint'}</option>
                <option value="OTHER">{isTa ? 'இதர காரணங்கள்' : 'Other'}</option>
              </select>
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'புகாரின் தலைப்பு *' : 'Subject *'}</label>
              <input
                type="text"
                className="form__input tamil"
                placeholder={isTa ? 'சுருக்கமான தலைப்பு' : 'Brief subject line'}
                value={grvSubject}
                onChange={(e) => setGrvSubject(e.target.value)}
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'விளக்கம் *' : 'Full Description *'}</label>
              <textarea
                rows={4}
                className="form__input tamil"
                placeholder={isTa ? 'உங்கள் புகாரை தெளிவாக எழுதுங்கள்...' : 'Explain the issue in detail...'}
                value={grvDesc}
                onChange={(e) => setGrvDesc(e.target.value)}
                required
              />
            </div>

            <div className="auth-checkbox-wrap">
              <input
                type="checkbox"
                id="confidential-chk"
                className="auth-checkbox"
                checked={grvConfidential}
                onChange={(e) => setGrvConfidential(e.target.checked)}
              />
              <label htmlFor="confidential-chk" className="auth-checkbox-label tamil">
                {isTa
                  ? 'மனுவை மாநில தலைமை நிர்வாகிக்கு மட்டும் ரகசியமாக அனுப்பவும்.'
                  : 'Submit confidentially directly to State Super Admin (hidden from Group Admin).'}
              </label>
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowGrievanceModal(false)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary tamil"
                disabled={grvSubmitting}
              >
                {grvSubmitting ? (isTa ? 'அனுப்பப்படுகிறது...' : 'Sending...') : (isTa ? 'மனுவை அனுப்பு' : 'Submit Grievance')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── TRANSFER DIGITAL RECEIPT MODAL ── */}
      {selectedTransferReceipt && selectedTransferReceipt.transfer_details && (
        <ReceiptModal
          isOpen={Boolean(selectedTransferReceipt)}
          onClose={() => setSelectedTransferReceipt(null)}
          lang={lang}
          receipt={{
            id: selectedTransferReceipt.id,
            receipt_ref: selectedTransferReceipt.transfer_details.digital_receipt_ref,
            member_id: selectedTransferReceipt.member_id,
            member_name: selectedTransferReceipt.member_name,
            group_id: selectedTransferReceipt.group_id,
            group_name: selectedTransferReceipt.group_name,
            district: selectedTransferReceipt.district,
            area: group?.area || 'Sulur',
            transaction_date: selectedTransferReceipt.transfer_details.transferred_at.split('T')[0],
            amount: selectedTransferReceipt.requested_amount,
            transaction_type: 'SPECIAL_CONTRIBUTION',
            payment_method: selectedTransferReceipt.transfer_details.payment_method,
            reference_number: selectedTransferReceipt.transfer_details.transaction_ref || selectedTransferReceipt.transfer_details.cash_receipt_no,
            recorded_by: selectedTransferReceipt.transfer_details.recorded_by,
            created_at: selectedTransferReceipt.transfer_details.transferred_at,
            status: 'CONFIRMED',
          }}
        />
      )}

      {/* ── SAVINGS RECEIPT MODAL ── */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
          lang={lang}
        />
      )}
    </div>
  )
}
