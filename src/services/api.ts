import { shgStore, TN_DISTRICTS, ALL_INDIAN_STATES, OTHER_MAJOR_DISTRICTS } from './storage'
import {
  UserAccount,
  SHGGroup,
  GroupCreateInput,
  GroupUpdateInput,
  District,
  Area,
  SavingsTransaction,
  LoanRecord,
  LoanRepayment,
  MeetingRecord,
  GroupAnnouncement,
  LoginSession,
  AuditLog,
  MemberSummary,
  MemberAddInput,
  AmountRequest,
  AmountRequestCreateInput,
  AmountRequestFilter,
  GrievanceRecord,
  FinancialHealthBreakdown,
} from '../types'

export const authApi = {
  loginSuperAdmin: async (username: string, password: string): Promise<UserAccount> => {
    return await shgStore.loginSuperAdmin(username, password)
  },
  changeAdminPassword: async (oldPass: string, newPass: string): Promise<boolean> => {
    return await shgStore.changeAdminPassword(oldPass, newPass)
  },
  loginUser: async (identifier: string, password?: string): Promise<UserAccount> => {
    return await shgStore.loginUser(identifier, password)
  },
  logout: async (): Promise<void> => {
    await shgStore.logout()
  },
  getCurrentUser: (): UserAccount | null => {
    return shgStore.currentUser
  },
}

export const usersApi = {
  list: async (statusFilter?: string): Promise<UserAccount[]> => {
    if (!statusFilter || statusFilter === 'ALL') {
      return [...shgStore.users]
    }
    return shgStore.users.filter((u) => u.status === statusFilter)
  },
  register: async (data: {
    fullName: string
    phoneNumber: string
    email: string
    district: string
    state?: string
    location: string
    password?: string
    notes?: string
  }): Promise<UserAccount> => {
    return await shgStore.registerUser(data)
  },
  create: async (data: {
    full_name: string
    phone_number: string
    email?: string | null
    district?: string
    state?: string
    notes?: string | null
  }): Promise<UserAccount> => {
    return await shgStore.registerUser({
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      email: data.email || `${data.phone_number.replace(/\D/g, '')}@shg.local`,
      district: data.district || 'Coimbatore',
      state: data.state || 'Tamil Nadu',
      location: 'Rural Area',
      notes: data.notes || undefined,
    })
  },
  approve: async (userId: string, adminName = 'State Mission Director'): Promise<UserAccount> => {
    return await shgStore.approveRegistration(userId, adminName)
  },
  reject: async (userId: string, reason: string, adminName = 'State Mission Director'): Promise<UserAccount> => {
    return await shgStore.rejectRegistration(userId, reason, adminName)
  },
  assignGroup: async (userId: string, groupId: string, adminName = 'State Mission Director'): Promise<UserAccount> => {
    return await shgStore.assignMemberGroup(userId, groupId, adminName)
  },
  activate: async (userId: string, adminName = 'State Mission Director'): Promise<UserAccount> => {
    return await shgStore.activateMember(userId, adminName)
  },
  approveAndAssign: async (
    userId: string,
    groupId: string,
    adminName = 'State Mission Director'
  ): Promise<UserAccount> => {
    return await shgStore.approveAndAssignUser(userId, groupId, adminName)
  },
  suspend: async (userId: string, adminName: string): Promise<UserAccount> => {
    const user = shgStore.users.find((u) => u.id === userId)
    if (!user) throw new Error(`User '${userId}' not found.`)
    user.status = 'SUSPENDED'
    shgStore.logAudit(adminName, 'SUPER_ADMIN', 'SUSPEND_USER', `Suspended user ${user.full_name}`, 'UserAccount', user.id)
    shgStore.save()
    return user
  },
  reactivate: async (userId: string, adminName: string): Promise<UserAccount> => {
    const user = shgStore.users.find((u) => u.id === userId)
    if (!user) throw new Error(`User '${userId}' not found.`)
    user.status = 'APPROVED'
    shgStore.logAudit(adminName, 'SUPER_ADMIN', 'REACTIVATE_USER', `Reactivated user ${user.full_name}`, 'UserAccount', user.id)
    shgStore.save()
    return user
  },
}

export const groupsApi = {
  list: async (filters?: { search?: string; district?: string; area?: string }): Promise<SHGGroup[]> => {
    let list = [...shgStore.groups]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.code.toLowerCase().includes(q) ||
          g.village.toLowerCase().includes(q) ||
          g.district.toLowerCase().includes(q)
      )
    }
    if (filters?.district && filters.district !== 'ALL') {
      list = list.filter((g) => g.district.toLowerCase() === filters.district!.toLowerCase())
    }
    if (filters?.area && filters.area !== 'ALL') {
      list = list.filter((g) => g.area.toLowerCase() === filters.area!.toLowerCase())
    }
    return list
  },
  get: async (id: string): Promise<SHGGroup> => {
    const group = shgStore.groups.find((g) => g.id === id)
    if (!group) throw new Error(`Group '${id}' not found.`)
    return group
  },
  create: async (data: GroupCreateInput, adminName = 'State Mission Director'): Promise<SHGGroup> => {
    return await shgStore.createGroup(data, adminName)
  },
  update: async (id: string, data: GroupUpdateInput, adminName = 'State Mission Director'): Promise<SHGGroup> => {
    return await shgStore.updateGroup(id, data, adminName)
  },
  assignAdmin: async (groupId: string, userId: string, adminName = 'State Mission Director'): Promise<SHGGroup> => {
    return await shgStore.assignGroupAdmin(groupId, userId, adminName)
  },
  getAvailableMembers: (district: string, _area?: string): UserAccount[] => {
    return shgStore.users.filter(
      (u) =>
        u.status === 'APPROVED' &&
        u.role !== 'SUPER_ADMIN' &&
        !u.group_id &&
        (!district || u.district.toLowerCase() === district.toLowerCase())
    )
  },
  getFinancialHealth: (group: SHGGroup): FinancialHealthBreakdown => {
    return shgStore.getFinancialHealth(group)
  },
}

export const membersApi = {
  list: async (groupId: string): Promise<MemberSummary[]> => {
    return shgStore.users
      .filter((u) => u.group_id === groupId && u.status === 'APPROVED')
      .map((u) => ({
        id: u.id,
        user_id: u.id,
        full_name: u.full_name,
        phone_number: u.phone_number,
        role: u.role,
        status: 'ACTIVE',
        joined_date: u.approved_at?.split('T')[0] || u.created_at.split('T')[0],
      }))
  },
  add: async (groupId: string, data: MemberAddInput, adminName = 'Administrator'): Promise<MemberSummary> => {
    const user = await shgStore.addMemberToGroup(groupId, data.user_id, data.role, adminName)
    return {
      id: user.id,
      user_id: user.id,
      full_name: user.full_name,
      phone_number: user.phone_number,
      role: user.role,
      status: 'ACTIVE',
      joined_date: data.joined_date || new Date().toISOString().split('T')[0],
    }
  },
  remove: async (groupId: string, memberId: string, adminName = 'Administrator'): Promise<void> => {
    await shgStore.removeMemberFromGroup(groupId, memberId, adminName)
  },
}

export const amountRequestsApi = {
  create: async (data: AmountRequestCreateInput, user: UserAccount): Promise<AmountRequest> => {
    return await shgStore.createAmountRequest(data, user)
  },
  cancel: async (requestId: string, user: UserAccount): Promise<AmountRequest> => {
    return await shgStore.cancelAmountRequest(requestId, user)
  },
  approve: async (requestId: string, adminUser: UserAccount): Promise<AmountRequest> => {
    return await shgStore.approveAmountRequest(requestId, adminUser)
  },
  reject: async (requestId: string, reason: string, adminUser: UserAccount): Promise<AmountRequest> => {
    return await shgStore.rejectAmountRequest(requestId, reason, adminUser)
  },
  recordTransfer: async (
    requestId: string,
    transferData: {
      payment_method: 'UPI' | 'CASH'
      transaction_ref?: string
      cash_receipt_no?: string
      payer_name?: string
      recipient_name?: string
    },
    adminUser: UserAccount
  ): Promise<AmountRequest> => {
    return await shgStore.recordTransfer(requestId, transferData, adminUser)
  },
  list: async (filter: AmountRequestFilter = {}, user?: UserAccount | null): Promise<AmountRequest[]> => {
    return shgStore.listAmountRequests(filter, user)
  },
}

export const grievancesApi = {
  submit: async (
    data: {
      category: GrievanceRecord['category']
      subject: string
      description: string
      is_confidential: boolean
    },
    user: UserAccount
  ): Promise<GrievanceRecord> => {
    return await shgStore.submitGrievance(data, user)
  },
  list: async (user?: UserAccount | null): Promise<GrievanceRecord[]> => {
    return shgStore.listGrievances(user)
  },
  resolve: async (id: string, notes: string, adminName = 'Administrator'): Promise<GrievanceRecord> => {
    return await shgStore.resolveGrievance(id, notes, adminName)
  },
}

export const districtsApi = {
  list: async (): Promise<District[]> => {
    return [...shgStore.districts]
  },
  getSuggestions: (query: string): string[] => {
    return shgStore.getDistrictSuggestions(query)
  },
  getAllDistricts: (): string[] => {
    return TN_DISTRICTS
  },
  getAllStates: (): string[] => {
    return ALL_INDIAN_STATES
  },
}

export const savingsApi = {
  list: async (groupId?: string): Promise<SavingsTransaction[]> => {
    if (!groupId) return [...shgStore.savings]
    return shgStore.savings.filter((s) => s.group_id === groupId)
  },
  recordDeposit: async (data: {
    groupId: string
    memberId: string
    amount: number
    paymentMethod: 'CASH' | 'UPI'
    referenceNumber?: string
    recordedBy: string
  }): Promise<SavingsTransaction> => {
    return await shgStore.recordSavingsDeposit(data)
  },
}

export const loansApi = {
  list: async (groupId?: string): Promise<LoanRecord[]> => {
    if (!groupId) return [...shgStore.loans]
    return shgStore.loans.filter((l) => l.group_id === groupId)
  },
  listRepayments: async (loanId?: string): Promise<LoanRepayment[]> => {
    if (!loanId) return [...shgStore.repayments]
    return shgStore.repayments.filter((r) => r.loan_id === loanId)
  },
}

export const announcementsApi = {
  list: async (groupId?: string | null): Promise<GroupAnnouncement[]> => {
    if (!groupId) return [...shgStore.announcements]
    return shgStore.announcements.filter((a) => !a.group_id || a.group_id === groupId)
  },
  publish: async (data: Omit<GroupAnnouncement, 'id' | 'date'>): Promise<GroupAnnouncement> => {
    const entry: GroupAnnouncement = {
      id: 'anc-' + Math.random().toString(36).substring(2, 9),
      ...data,
      date: new Date().toISOString().split('T')[0],
    }
    shgStore.announcements.unshift(entry)
    shgStore.save()
    return entry
  },
}

export const auditApi = {
  list: async (): Promise<AuditLog[]> => {
    return [...shgStore.auditLogs]
  },
}

export const sessionsApi = {
  list: async (): Promise<LoginSession[]> => {
    return [...shgStore.sessions]
  },
}
