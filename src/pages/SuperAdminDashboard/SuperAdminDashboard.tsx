import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  authApi,
  usersApi,
  groupsApi,
  membersApi,
  districtsApi,
  savingsApi,
  loansApi,
  amountRequestsApi,
  grievancesApi,
  auditApi,
  sessionsApi,
} from '../../services/api'
import {
  UserAccount,
  SHGGroup,
  District,
  SavingsTransaction,
  LoanRecord,
  LoginSession,
  AuditLog,
  GroupCreateInput,
  AmountRequest,
  GrievanceRecord,
} from '../../types'
import Modal from '../../components/Modal/Modal'
import ReceiptModal from '../../components/ReceiptModal/ReceiptModal'
import { SkeletonMetric, SkeletonTable } from '../../components/Skeleton/Skeleton'
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Shield,
  PiggyBank,
  HandCoins,
  Receipt,
  FileSpreadsheet,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  RefreshCw,
  KeyRound,
  CreditCard,
  LifeBuoy,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import './SuperAdminDashboard.css'

interface SuperAdminDashboardProps {
  lang?: 'ta' | 'en'
}

export default function SuperAdminDashboard({ lang = 'ta' }: SuperAdminDashboardProps) {
  const isTa = lang === 'ta'

  const [activeTab, setActiveTab] = useState<
    'overview' | 'requests' | 'groups' | 'users' | 'grievances' | 'security' | 'audit'
  >('overview')

  const [users, setUsers] = useState<UserAccount[]>([])
  const [groups, setGroups] = useState<SHGGroup[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [savings, setSavings] = useState<SavingsTransaction[]>([])
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [amountRequests, setAmountRequests] = useState<AmountRequest[]>([])
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Password reset state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwMessage, setPwMessage] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  // Amount requests filter state
  const [reqStatusFilter, setReqStatusFilter] = useState('ALL')
  const [reqMethodFilter, setReqMethodFilter] = useState('ALL')
  const [reqDistrictFilter, setReqDistrictFilter] = useState('ALL')
  const [reqSearch, setReqSearch] = useState('')

  // Modals
  const [showRejectModal, setShowRejectModal] = useState<UserAccount | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState<SavingsTransaction | null>(null)
  const [resolveGrievanceModal, setResolveGrievanceModal] = useState<GrievanceRecord | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Smart Allocation & Member Assignment state
  const [allocDistrict, setAllocDistrict] = useState('Coimbatore')
  const [allocGroupId, setAllocGroupId] = useState('')
  const [selectedAllocUserIds, setSelectedAllocUserIds] = useState<string[]>([])
  const [allocMessage, setAllocMessage] = useState<string | null>(null)

  // Group Admin assignment state
  const [assignGroupId, setAssignGroupId] = useState('')
  const [assignUserId, setAssignUserId] = useState('')

  // User Filter state
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('ALL')

  // New Group Form
  const [newGroupForm, setNewGroupForm] = useState<GroupCreateInput>({
    name: '',
    code: '',
    registration_number: '',
    district: 'Coimbatore',
    area: 'Sulur',
    village: 'Sulur North',
    meeting_day: 'Monday',
    description: '',
    group_limit: 50000,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [u, g, d, s, l, reqs, grvs, sess, aud] = await Promise.all([
        usersApi.list(),
        groupsApi.list(),
        districtsApi.list(),
        savingsApi.list(),
        loansApi.list(),
        amountRequestsApi.list({}, { role: 'SUPER_ADMIN' } as any),
        grievancesApi.list({ role: 'SUPER_ADMIN' } as any),
        sessionsApi.list(),
        auditApi.list(),
      ])

      setUsers(u)
      setGroups(g)
      setDistricts(d)
      setSavings(s)
      setLoans(l)
      setAmountRequests(reqs)
      setGrievances(grvs)
      setSessions(sess)
      setAuditLogs(aud)

      if (g.length > 0) {
        if (!allocGroupId) setAllocGroupId(g[0].id)
        if (!assignGroupId) setAssignGroupId(g[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }, [allocGroupId, assignGroupId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Overview KPIs
  const totalUsers = users.length
  const activeMembers = users.filter((u) => u.status === 'APPROVED' && u.role === 'MEMBER').length
  const totalGroups = groups.length
  const totalGroupAdmins = users.filter((u) => u.role === 'GROUP_ADMIN').length
  const pendingRequests = amountRequests.filter((r) => r.status === 'Pending approval').length
  const approvedRequests = amountRequests.filter((r) => r.status === 'Approved — transfer pending').length
  const rejectedRequests = amountRequests.filter((r) => r.status === 'Rejected').length
  const completedTransfers = amountRequests.filter((r) => r.status === 'Completed').length

  const totalAmountRequested = amountRequests.reduce((s, r) => s + r.requested_amount, 0)
  const totalAmountTransferred = amountRequests
    .filter((r) => r.status === 'Completed')
    .reduce((s, r) => s + r.requested_amount, 0)
  const totalPendingTransferAmount = amountRequests
    .filter((r) => r.status === 'Approved — transfer pending')
    .reduce((s, r) => s + r.requested_amount, 0)

  const upiCount = amountRequests.filter((r) => r.payment_method === 'UPI').length
  const cashCount = amountRequests.filter((r) => r.payment_method === 'CASH').length

  // Filtered Amount Requests
  const filteredAmountRequests = useMemo(() => {
    return amountRequests.filter((r) => {
      const matchStatus = reqStatusFilter === 'ALL' || r.status === reqStatusFilter
      const matchMethod = reqMethodFilter === 'ALL' || r.payment_method === reqMethodFilter
      const matchDistrict = reqDistrictFilter === 'ALL' || r.district.toLowerCase() === reqDistrictFilter.toLowerCase()
      const q = reqSearch.trim().toLowerCase()
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.member_name.toLowerCase().includes(q) ||
        r.group_name.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q)
      return matchStatus && matchMethod && matchDistrict && matchSearch
    })
  }, [amountRequests, reqStatusFilter, reqMethodFilter, reqDistrictFilter, reqSearch])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter
      const q = userSearch.trim().toLowerCase()
      const matchSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.phone_number.includes(q) ||
        u.district.toLowerCase().includes(q) ||
        (u.group_name && u.group_name.toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [users, userStatusFilter, userSearch])

  // District wise stats
  const districtStats = useMemo(() => {
    const map: Record<string, { members: number; groups: number; savings: number }> = {}
    users.forEach((u) => {
      if (u.district && u.district !== 'Statewide') {
        if (!map[u.district]) map[u.district] = { members: 0, groups: 0, savings: 0 }
        map[u.district].members += 1
      }
    })
    groups.forEach((g) => {
      if (!map[g.district]) map[g.district] = { members: 0, groups: 0, savings: 0 }
      map[g.district].groups += 1
      map[g.district].savings += g.current_savings || 0
    })
    return Object.entries(map).map(([name, data]) => ({ name, ...data }))
  }, [users, groups])

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwMessage(null)

    if (newPassword !== confirmNewPassword) {
      setPwError(isTa ? 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை.' : 'New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setPwError(isTa ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.' : 'Password must be at least 6 characters.')
      return
    }

    setPwLoading(true)
    try {
      await authApi.changeAdminPassword(oldPassword, newPassword)
      setPwMessage(isTa ? 'நிர்வாகி கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!' : 'Administrator password updated successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : String(err))
    } finally {
      setPwLoading(false)
    }
  }

  // Handle user approval
  const handleApproveUser = async (u: UserAccount) => {
    try {
      await usersApi.approve(u.id, 'State Mission Director')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Handle user rejection
  const handleConfirmRejectUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showRejectModal || !rejectionReason.trim()) return

    try {
      await usersApi.reject(showRejectModal.id, rejectionReason.trim(), 'State Mission Director')
      setShowRejectModal(null)
      setRejectionReason('')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupForm.name.trim()) return

    try {
      await groupsApi.create(newGroupForm, 'State Mission Director')
      setShowCreateGroupModal(false)
      setNewGroupForm({
        name: '',
        code: '',
        registration_number: '',
        district: 'Coimbatore',
        area: 'Sulur',
        village: 'Sulur North',
        meeting_day: 'Monday',
        description: '',
        group_limit: 50000,
      })
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Assign Group Admin
  const handleAssignAdmin = async () => {
    if (!assignGroupId || !assignUserId) {
      alert(isTa ? 'குழு மற்றும் உறுப்பினரை தேர்ந்தெடுக்கவும்.' : 'Please select both group and member.')
      return
    }
    try {
      await groupsApi.assignAdmin(assignGroupId, assignUserId, 'State Mission Director')
      alert(isTa ? 'குழு நிர்வாகி வெற்றிகரமாக நியமிக்கப்பட்டார்!' : 'Group Admin designated successfully!')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Allocate members to group
  const handleExecuteAllocation = async () => {
    if (!allocGroupId || selectedAllocUserIds.length === 0) return
    try {
      for (const uid of selectedAllocUserIds) {
        await membersApi.add(allocGroupId, { user_id: uid, role: 'MEMBER' }, 'State Mission Director')
      }
      setSelectedAllocUserIds([])
      setAllocMessage(isTa ? 'உறுப்பினர்கள் குழுவில் வெற்றிகரமாக சேர்க்கப்பட்டனர்!' : 'Members allocated to group successfully!')
      setTimeout(() => setAllocMessage(null), 3000)
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // Resolve Grievance
  const handleResolveGrievance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveGrievanceModal || !resolutionNotes.trim()) return

    try {
      await grievancesApi.resolve(resolveGrievanceModal.id, resolutionNotes.trim(), 'State Mission Director')
      setResolveGrievanceModal(null)
      setResolutionNotes('')
      loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Request ID', 'Member', 'Phone', 'Group', 'District', 'Amount (INR)', 'Payment Method', 'Status', 'Date']
    const rows = amountRequests.map((r) => [
      r.id,
      `"${r.member_name}"`,
      r.member_phone,
      `"${r.group_name}"`,
      r.district,
      r.requested_amount,
      r.payment_method,
      `"${r.status}"`,
      r.request_date,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `shg_amount_requests_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const unallocatedMembers = users.filter((u) => u.status === 'APPROVED' && u.role !== 'SUPER_ADMIN' && !u.group_id)

  return (
    <div className="super-admin-dash">
      {/* ── Top Header ── */}
      <div className="sa-header">
        <div>
          <span className="sa-pre-tag tamil">
            {isTa ? 'தமிழ்நாடு அரசு — மாநில தலைமை மேலாண்மை பலகை' : 'State Administrative Portal'}
          </span>
          <h1 className="sa-title tamil">
            {isTa ? 'மாநில தலைமை நிர்வாக மையம்' : 'SHG Master Management Console'}
          </h1>
          <p className="sa-subtitle tamil">
            {isTa
              ? 'சுய உதவிக் குழுக்கள், தொகை கோரிக்கைகள், நிதி வழங்கல் மற்றும் தணிக்கை மேற்பார்வை.'
              : 'Complete statewide governance of Self-Help Groups, amount requests, approvals, payouts, and compliance.'}
          </p>
        </div>

        <div className="sa-header-actions">
          <button
            type="button"
            className="btn btn-secondary tamil"
            onClick={handleExportCSV}
            title="Download CSV report"
          >
            <FileSpreadsheet size={15} />
            <span>{isTa ? 'CSV அறிக்கை' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary tamil"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <Plus size={15} />
            <span>{isTa ? '+ புதிய குழு உருவாக்கு' : '+ Create Group'}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="member-tabs-bar">
        <button
          className={`member-tab-btn tamil ${activeTab === 'overview' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {isTa ? 'சுருக்கம் (Overview)' : 'Overview'}
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'requests' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          {isTa ? 'தொகை கோரிக்கைகள்' : 'Amount Requests'} ({amountRequests.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'groups' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          {isTa ? 'குழுக்கள் & நிர்வாகிகள்' : 'Groups & Admins'} ({groups.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'users' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {isTa ? 'உறுப்பினர்கள்' : 'Users Directory'} ({users.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'grievances' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          {isTa ? 'குறைகேட்பு மனுக்கள்' : 'Grievances'} ({grievances.length})
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'security' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          {isTa ? 'கடவுச்சொல் & பாதுகாப்பு' : 'Security Settings'}
        </button>

        <button
          className={`member-tab-btn tamil ${activeTab === 'audit' ? 'member-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          {isTa ? 'தணிக்கை பதிவு' : 'Audit Logs'} ({auditLogs.length})
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW METRICS ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <SkeletonMetric count={6} />
          ) : (
            <div className="sa-stats-grid">
              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'மொத்த பயனர்கள்' : 'Total Users'}</span>
                  <Users size={18} color="#166534" />
                </div>
                <div className="stat-card__val font-mono">{totalUsers}</div>
                <div className="stat-card__sub tamil">{activeMembers} {isTa ? 'செயலில் உள்ள உறுப்பினர்கள்' : 'active members'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'செயலில் உள்ள குழுக்கள்' : 'Total SHG Groups'}</span>
                  <Building2 size={18} color="#15803d" />
                </div>
                <div className="stat-card__val font-mono">{totalGroups}</div>
                <div className="stat-card__sub tamil">{totalGroupAdmins} {isTa ? 'நியமிக்கப்பட்ட குழு தலைவர்கள்' : 'designated group admins'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'ஒப்புதல் நிலுவை கோரிக்கைகள்' : 'Pending Requests'}</span>
                  <Clock size={18} color="#d97706" />
                </div>
                <div className="stat-card__val font-mono">{pendingRequests}</div>
                <div className="stat-card__sub tamil">{approvedRequests} {isTa ? 'வழங்கலுக்கு காத்திருப்பு' : 'approved pending transfer'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'நிறைவு பரிவர்த்தனைகள்' : 'Completed Transfers'}</span>
                  <CheckCircle size={18} color="#15803d" />
                </div>
                <div className="stat-card__val font-mono">{completedTransfers}</div>
                <div className="stat-card__sub tamil">{rejectedRequests} {isTa ? 'நிராகரிக்கப்பட்ட கோரிக்கைகள்' : 'rejected requests'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'வழங்கப்பட்ட மொத்த நிதி' : 'Total Transferred'}</span>
                  <CreditCard size={18} color="#0d9488" />
                </div>
                <div className="stat-card__val font-mono">₹{totalAmountTransferred.toLocaleString('en-IN')}</div>
                <div className="stat-card__sub tamil">
                  ₹{totalPendingTransferAmount.toLocaleString('en-IN')} {isTa ? 'வழங்கப்பட வேண்டியது' : 'transfer pending'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card__head">
                  <span className="stat-card__title tamil">{isTa ? 'பரிவர்த்தனை முறை விபரம்' : 'UPI vs Cash'}</span>
                  <TrendingUp size={18} color="#166534" />
                </div>
                <div className="stat-card__val font-mono">{upiCount} : {cashCount}</div>
                <div className="stat-card__sub tamil">{upiCount} UPI · {cashCount} {isTa ? 'ரொக்கம்' : 'Cash'}</div>
              </div>
            </div>
          )}

          {/* District Wise Statistics */}
          <div className="tab-pane">
            <h3 className="pane-title tamil" style={{ marginBottom: '16px' }}>
              {isTa ? 'மாவட்ட வாரியான உறுப்பினர் & குழு புள்ளிவிவரங்கள்' : 'District-Wise SHG Distribution & Statistics'}
            </h3>
            <div className="requests-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="tamil">{isTa ? 'மாவட்டம்' : 'District'}</th>
                    <th className="tamil">{isTa ? 'உறுப்பினர்கள்' : 'Members'}</th>
                    <th className="tamil">{isTa ? 'குழுக்கள்' : 'SHG Groups'}</th>
                    <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'மொத்த சேமிப்பு' : 'Total Savings'}</th>
                  </tr>
                </thead>
                <tbody>
                  {districtStats.map((st) => (
                    <tr key={st.name}>
                      <td style={{ fontWeight: 600 }}>{st.name}</td>
                      <td>{st.members}</td>
                      <td>{st.groups}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                        ₹{st.savings.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: AMOUNT REQUESTS QUEUE ── */}
      {activeTab === 'requests' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'மாநில அளவிலான தொகை கோரிக்கைகள்' : 'Statewide Amount Requests Monitor'}</h3>
              <p className="pane-subtitle tamil">
                {isTa ? 'அனைத்து மாவட்டங்களின் கடன் விண்ணப்பங்கள், ஒப்புதல்கள் மற்றும் பரிவர்த்தனை நிலை.' : 'Monitor all borrower requests, approvals, transfer verifications, and digital receipts.'}
              </p>
            </div>
          </div>

          <div className="queue-filter-bar">
            <div className="filter-search-box" style={{ maxWidth: '280px' }}>
              <Search size={14} className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input tamil"
                placeholder={isTa ? 'உறுப்பினர் / குழு...' : 'Search member / group...'}
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns-row">
              <select
                className="filter-select tamil"
                value={reqStatusFilter}
                onChange={(e) => setReqStatusFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து நிலைகள்' : 'All Statuses'}</option>
                <option value="Pending approval">Pending approval</option>
                <option value="Approved — transfer pending">Approved — transfer pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                className="filter-select tamil"
                value={reqMethodFilter}
                onChange={(e) => setReqMethodFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து முறைகள்' : 'All Methods'}</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>

              <select
                className="filter-select tamil"
                value={reqDistrictFilter}
                onChange={(e) => setReqDistrictFilter(e.target.value)}
              >
                <option value="ALL">{isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
                {districtsApi.getAllDistricts().slice(0, 15).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'கோரிக்கை எண்' : 'Req ID'}</th>
                  <th className="tamil">{isTa ? 'உறுப்பினர்' : 'Member'}</th>
                  <th className="tamil">{isTa ? 'குழு & மாவட்டம்' : 'Group & District'}</th>
                  <th className="tamil">{isTa ? 'நோக்கம்' : 'Purpose'}</th>
                  <th className="tamil">{isTa ? 'முறை' : 'Method'}</th>
                  <th className="tamil" style={{ textAlign: 'right' }}>{isTa ? 'தொகை' : 'Amount'}</th>
                  <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                  <th className="tamil">{isTa ? 'ஒப்புதல் அளித்தவர்' : 'Approved By'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmountRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.member_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{req.member_phone}</div>
                    </td>
                    <td>
                      <div>{req.group_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{req.district}</div>
                    </td>
                    <td>{req.purpose}</td>
                    <td><span className="payment-tag">{req.payment_method}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="font-mono">
                      ₹{req.requested_amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-pill status-pill--${req.status.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.approved_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GROUPS & ADMIN ALLOCATION ── */}
      {activeTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Smart Allocation Assistant Box */}
          <div className="allocation-assistant-box">
            <h3 className="pane-title tamil" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#166534" />
              <span>{isTa ? 'ஸ்மார்ட் உறுப்பினர் ஒதுக்கீட்டு உதவியாளர்' : 'Smart Group Member Allocation Assistant'}</span>
            </h3>
            <p className="pane-subtitle tamil" style={{ marginBottom: '16px' }}>
              {isTa
                ? 'அங்கீகரிக்கப்பட்டு இன்னும் குழு ஒதுக்கப்படாத உறுப்பினர்களை எளிதாக கண்டறிந்து குழுவில் சேர்க்கவும்.'
                : 'Match verified unallocated applicants in each district into balanced neighborhood Self-Help Groups.'}
            </p>

            {allocMessage && (
              <div className="auth-alert auth-alert--success tamil">{allocMessage}</div>
            )}

            <div className="allocation-controls-grid">
              <div>
                <label className="auth-label tamil">{isTa ? 'சேர்க்க வேண்டிய குழு:' : 'Target SHG Group:'}</label>
                <select
                  className="auth-input tamil"
                  value={allocGroupId}
                  onChange={(e) => setAllocGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.district} / {g.area}) · {g.member_count} members
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="auth-label tamil">{isTa ? 'ஒதுக்கப்படாத உறுப்பினர்கள்:' : 'Available Unallocated Members:'}</label>
                <div className="unallocated-select-list">
                  {unallocatedMembers.length === 0 ? (
                    <p className="tamil" style={{ fontSize: '0.82rem', color: '#6b7280', margin: '8px 0' }}>
                      {isTa ? 'ஒதுக்கீடு செய்யப்படாத உறுப்பினர்கள் எவரும் இல்லை.' : 'All approved members are currently allocated to groups.'}
                    </p>
                  ) : (
                    unallocatedMembers.map((u) => (
                      <label key={u.id} className="alloc-member-item">
                        <input
                          type="checkbox"
                          checked={selectedAllocUserIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAllocUserIds([...selectedAllocUserIds, u.id])
                            } else {
                              setSelectedAllocUserIds(selectedAllocUserIds.filter((id) => id !== u.id))
                            }
                          }}
                        />
                        <span className="tamil">{u.full_name} ({u.district})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary tamil"
              disabled={selectedAllocUserIds.length === 0 || !allocGroupId}
              onClick={handleExecuteAllocation}
              style={{ marginTop: '16px' }}
            >
              {isTa
                ? `தேர்ந்தெடுக்கப்பட்ட ${selectedAllocUserIds.length} உறுப்பினர்களை குழுவில் சேர்க்க`
                : `Allocate ${selectedAllocUserIds.length} Members to Group`}
            </button>
          </div>

          {/* Group Admin Designation Box */}
          <div className="allocation-assistant-box">
            <h3 className="pane-title tamil" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#166534" />
              <span>{isTa ? 'குழு தலைவர் / நிர்வாகி நியமனம்' : 'Designate Group Admin'}</span>
            </h3>
            <p className="pane-subtitle tamil" style={{ marginBottom: '16px' }}>
              {isTa
                ? 'ஒவ்வொரு பகுதி குழுவிற்கும் ஒரு தகுதியான உறுப்பினரை குழு தலைவராக நியமிக்கலாம்.'
                : 'Appoint or reassign exactly one designated Group Admin to oversee collections and review requests.'}
            </p>

            <div className="allocation-controls-grid">
              <div>
                <label className="auth-label tamil">{isTa ? 'குழு:' : 'SHG Group:'}</label>
                <select
                  className="auth-input tamil"
                  value={assignGroupId}
                  onChange={(e) => setAssignGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Current Admin: {g.group_admin_name || 'None'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="auth-label tamil">{isTa ? 'குழு நிர்வாகியாக நியமிக்கப்பட வேண்டிய உறுப்பினர்:' : 'Designate as Group Admin:'}</label>
                <select
                  className="auth-input tamil"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                >
                  <option value="">{isTa ? '— உறுப்பினரை தேர்ந்தெடுக்கவும் —' : '— Select Member —'}</option>
                  {users
                    .filter((u) => u.status === 'APPROVED' && u.group_id === assignGroupId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.phone_number})</option>
                    ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary tamil"
              disabled={!assignGroupId || !assignUserId}
              onClick={handleAssignAdmin}
              style={{ marginTop: '16px' }}
            >
              {isTa ? 'குழு தலைவராக நியமிக்க' : 'Confirm Group Admin Appointment'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: USERS DIRECTORY ── */}
      {activeTab === 'users' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'அனைத்து பதிவு செய்யப்பட்ட உறுப்பினர்கள்' : 'Registered Users Directory'}</h3>
              <p className="pane-subtitle tamil">{users.length} {isTa ? 'மொத்த பயனர்கள்' : 'registered accounts'}</p>
            </div>
          </div>

          <div className="queue-filter-bar">
            <div className="filter-search-box" style={{ maxWidth: '300px' }}>
              <Search size={14} className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input tamil"
                placeholder={isTa ? 'பெயர் / தொலைபேசி எண்...' : 'Search by name / phone...'}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select tamil"
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
            >
              <option value="ALL">{isTa ? 'அனைத்து நிலைகள்' : 'All Statuses'}</option>
              <option value="APPROVED">{isTa ? 'அங்கீகரிக்கப்பட்டது' : 'Approved'}</option>
              <option value="PENDING_APPROVAL">{isTa ? 'ஒப்புதல் நிலுவை' : 'Pending Approval'}</option>
              <option value="REJECTED">{isTa ? 'நிராகரிக்கப்பட்டது' : 'Rejected'}</option>
            </select>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'பெயர்' : 'Name'}</th>
                  <th className="tamil">{isTa ? 'மொபைல்' : 'Phone'}</th>
                  <th className="tamil">{isTa ? 'மாவட்டம்' : 'District'}</th>
                  <th className="tamil">{isTa ? 'குழு' : 'Assigned Group'}</th>
                  <th className="tamil">{isTa ? 'பதவி' : 'Role'}</th>
                  <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                  <th className="tamil">{isTa ? 'செயல்' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td className="font-mono">{u.phone_number}</td>
                    <td>{u.district}</td>
                    <td>{u.group_name || <span style={{ color: '#9ca3af' }}>{isTa ? 'ஒதுக்கீடு நிலுவை' : 'Unallocated'}</span>}</td>
                    <td><span className="payment-tag">{u.role}</span></td>
                    <td>
                      <span className={`status-pill status-pill--${u.status.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.status === 'PENDING_APPROVAL' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm tamil"
                            onClick={() => handleApproveUser(u)}
                          >
                            {isTa ? 'அங்கீகரி' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm tamil"
                            onClick={() => {
                              setShowRejectModal(u)
                              setRejectionReason('')
                            }}
                          >
                            {isTa ? 'நிராகரி' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: GRIEVANCES ── */}
      {activeTab === 'grievances' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'உறுப்பினர் குறைகேட்பு மேலாண்மை' : 'Member Grievances Redressal'}</h3>
              <p className="pane-subtitle tamil">{grievances.length} {isTa ? 'மனுக்கள் பதிவு செய்யப்பட்டுள்ளன.' : 'grievances on file.'}</p>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'எண்' : 'ID'}</th>
                  <th className="tamil">{isTa ? 'உறுப்பினர்' : 'Member'}</th>
                  <th className="tamil">{isTa ? 'வகை' : 'Category'}</th>
                  <th className="tamil">{isTa ? 'பொருள் & விளக்கம்' : 'Subject & Description'}</th>
                  <th className="tamil">{isTa ? 'நிலை' : 'Status'}</th>
                  <th className="tamil">{isTa ? 'செயல்' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id}>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{g.id}</td>
                    <td>
                      <div><strong>{g.member_name}</strong></div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{g.group_name}</div>
                    </td>
                    <td><span className="payment-tag">{g.category}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{g.subject}</div>
                      <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>{g.description}</div>
                    </td>
                    <td>
                      <span className={`status-pill status-pill--${g.status.toLowerCase()}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>
                      {g.status === 'OPEN' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm tamil"
                          onClick={() => {
                            setResolveGrievanceModal(g)
                            setResolutionNotes('')
                          }}
                        >
                          {isTa ? 'தீர்வு அளி' : 'Resolve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: SECURITY & PASSWORD CHANGE ── */}
      {activeTab === 'security' && (
        <div className="tab-pane" style={{ maxWidth: '580px' }}>
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#166534" />
                <span>{isTa ? 'நிர்வாகி கடவுச்சொல் மாற்றம்' : 'Administrator Password Reset'}</span>
              </h3>
              <p className="pane-subtitle tamil">
                {isTa
                  ? 'பாதுகாப்பு விதிகளின்படி நிர்வாகி கடவுச்சொல்லை மாற்றி வைக்கவும்.'
                  : 'Change or reset the master administrator credentials securely.'}
              </p>
            </div>
          </div>

          {pwError && <div className="form__error tamil">{pwError}</div>}
          {pwMessage && <div className="auth-alert auth-alert--success tamil">{pwMessage}</div>}

          <form onSubmit={handleChangePassword} className="form" autoComplete="off">
            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'தற்போதைய கடவுச்சொல் *' : 'Current Admin Password *'}</label>
              <input
                type="password"
                className="form__input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'புதிய கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்) *' : 'New Password (min 6 characters) *'}</label>
              <input
                type="password"
                className="form__input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'புதிய கடவுச்சொல் உறுதிப்படுத்தல் *' : 'Confirm New Password *'}</label>
              <input
                type="password"
                className="form__input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary tamil"
              disabled={pwLoading}
              style={{ marginTop: '12px' }}
            >
              {pwLoading ? (isTa ? 'மாற்றப்படுகிறது...' : 'Updating...') : (isTa ? 'கடவுச்சொல்லை மாற்று' : 'Update Master Password')}
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 7: AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div className="tab-pane">
          <div className="pane-header">
            <div>
              <h3 className="pane-title tamil">{isTa ? 'கணினி தணிக்கை & செயல்பாட்டு பதிவுகள்' : 'System Audit Trail & Sessions'}</h3>
              <p className="pane-subtitle tamil">{auditLogs.length} {isTa ? 'நிகழ்வுகள் பதிவு செய்யப்பட்டுள்ளன.' : 'historical events logged.'}</p>
            </div>
          </div>

          <div className="requests-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="tamil">{isTa ? 'நேரம்' : 'Timestamp'}</th>
                  <th className="tamil">{isTa ? 'செயல் புரிந்தவர்' : 'Actor'}</th>
                  <th className="tamil">{isTa ? 'செயல் வகை' : 'Action'}</th>
                  <th className="tamil">{isTa ? 'விவரம்' : 'Details'}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 30).map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono" style={{ fontSize: '0.78rem' }}>{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td>
                      <div><strong>{log.actor_name}</strong></div>
                      <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>{log.actor_role}</div>
                    </td>
                    <td><span className="payment-tag">{log.action}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE GROUP MODAL ── */}
      {showCreateGroupModal && (
        <Modal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          title={isTa ? 'புதிய மகளிர் சுய உதவிக் குழு உருவாக்கு' : 'Create SHG Group'}
          lang={lang}
        >
          <form onSubmit={handleCreateGroup} className="form">
            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'குழு பெயர் *' : 'Group Name *'}</label>
              <input
                type="text"
                className="form__input tamil"
                value={newGroupForm.name}
                onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'மாவட்டம் *' : 'District *'}</label>
                <input
                  type="text"
                  className="form__input tamil"
                  value={newGroupForm.district || ''}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, district: e.target.value })}
                  required
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'வட்டார பகுதி *' : 'Area / Block *'}</label>
                <input
                  type="text"
                  className="form__input tamil"
                  value={newGroupForm.area || ''}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, area: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'கிராமம் *' : 'Village Name *'}</label>
                <input
                  type="text"
                  className="form__input tamil"
                  value={newGroupForm.village || ''}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, village: e.target.value })}
                  required
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil">{isTa ? 'கூட்ட நாள் *' : 'Meeting Day *'}</label>
                <select
                  className="form__input"
                  value={newGroupForm.meeting_day || 'Monday'}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, meeting_day: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowCreateGroupModal(false)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary tamil">
                {isTa ? 'குழுவை உருவாக்கு' : 'Create Group'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── RESOLVE GRIEVANCE MODAL ── */}
      {resolveGrievanceModal && (
        <Modal
          isOpen={Boolean(resolveGrievanceModal)}
          onClose={() => setResolveGrievanceModal(null)}
          title={isTa ? 'குறைதீர்ப்பு தீர்வு வழங்குதல்' : 'Resolve Member Grievance'}
          lang={lang}
        >
          <form onSubmit={handleResolveGrievance} className="form">
            <div className="review-modal-body" style={{ marginBottom: '16px' }}>
              <div><strong>{resolveGrievanceModal.subject}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '4px' }}>{resolveGrievanceModal.description}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '8px' }}>
                {resolveGrievanceModal.member_name} ({resolveGrievanceModal.group_name})
              </div>
            </div>

            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'நிர்வாகியின் தீர்வு குறிப்பு *' : 'Resolution Action Notes *'}</label>
              <textarea
                rows={3}
                className="form__input tamil"
                placeholder={isTa ? 'எடுக்கப்பட்ட நடவடிக்கை மற்றும் தீர்வு குறிப்புகள்...' : 'Document resolution actions taken...'}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
              />
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setResolveGrievanceModal(null)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary tamil">
                {isTa ? 'தீர்வு உறுதிசெய்' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── REJECT USER MODAL ── */}
      {showRejectModal && (
        <Modal
          isOpen={Boolean(showRejectModal)}
          onClose={() => setShowRejectModal(null)}
          title={isTa ? 'பதிவை நிராகரித்தல்' : 'Reject Applicant'}
          lang={lang}
        >
          <form onSubmit={handleConfirmRejectUser} className="form">
            <p className="tamil" style={{ fontSize: '0.88rem' }}>
              {showRejectModal.full_name} ({showRejectModal.district})
            </p>
            <div className="form__field">
              <label className="form__label tamil">{isTa ? 'நிராகரிப்பு காரணம் *' : 'Rejection Reason *'}</label>
              <textarea
                rows={3}
                className="form__input tamil"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={() => setShowRejectModal(null)}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-danger tamil">
                {isTa ? 'நிராகரிப்பை உறுதிசெய்' : 'Confirm Reject'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
