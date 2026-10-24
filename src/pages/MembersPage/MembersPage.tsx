/**
 * src/pages/MembersPage/MembersPage.tsx
 * ----------------------------------------
 * Page that shows members of one selected SHG Group.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { membersApi, usersApi } from '../../services/api'
import Modal from '../../components/Modal/Modal'
import UserModal from '../../components/UserModal/UserModal'
import { SHGGroup, MemberSummary, User, UserRole } from '../../types'
import './MembersPage.css'

interface MembersPageProps {
  group: SHGGroup | null
  lang?: 'ta' | 'en'
  onBack: () => void
}

const labels = {
  ta: {
    back: '← குழுக்கள்',
    subtitle: 'உறுப்பினர்கள்',
    addBtn: '+ உறுப்பினர் சேர்',
    registerUserBtn: '+ புதிய பயனர்',
    name: 'பெயர்',
    phone: 'தொலைபேசி',
    role: 'பதவி',
    joined: 'சேர்ந்த தேதி',
    status: 'நிலை',
    actions: 'செயல்கள்',
    remove: 'நீக்கு',
    active: 'செயலில்',
    loading: 'ஏற்றுகிறது…',
    empty: 'இன்னும் உறுப்பினர்கள் இல்லை.',
    modalTitle: 'உறுப்பினர் சேர்',
    selectUser: 'பயனரை தேர்ந்தெடுக்கவும் *',
    selectRole: 'பதவி *',
    saveBtn: 'சேமி',
    cancelBtn: 'ரத்து',
    noUsers: 'பயனர்கள் இல்லை. முதலில் பயனர்களை பதிவு செய்யுங்கள்.',
    quickRegister: 'புதிய பயனரை சேர்க்க இங்கே கிளிக் செய்யவும்',
    confirmRemoveTitle: 'உறுப்பினரை நீக்கவா?',
    confirmRemoveMsg: 'இந்த உறுப்பினரை குழுவில் இருந்து நீக்க விரும்புகிறீர்களா?',
    confirmBtn: 'நீக்கு',
  },
  en: {
    back: '← Groups',
    subtitle: 'Members',
    addBtn: '+ Add Member',
    registerUserBtn: '+ New User',
    name: 'Name',
    phone: 'Phone',
    role: 'Role',
    joined: 'Joined',
    status: 'Status',
    actions: 'Actions',
    remove: 'Remove',
    active: 'Active',
    loading: 'Loading…',
    empty: 'No members yet.',
    modalTitle: 'Add Member',
    selectUser: 'Select User *',
    selectRole: 'Role *',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    noUsers: 'No users found. Please register users first.',
    quickRegister: 'Click here to register a new user',
    confirmRemoveTitle: 'Remove Member?',
    confirmRemoveMsg:
      'Are you sure you want to deactivate this member from the group?',
    confirmBtn: 'Remove',
  },
}

const ROLES: UserRole[] = ['MEMBER', 'TREASURER', 'PRESIDENT', 'ADMIN', 'GROUP_ADMIN']
const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: 'உறுப்பினர் / Member',
  TREASURER: 'பொருளாளர் / Treasurer',
  PRESIDENT: 'தலைவர் / President',
  ADMIN: 'நிர்வாகி / Admin',
  GROUP_ADMIN: 'குழு நிர்வாகி / Group Admin',
  SUPER_ADMIN: 'முதன்மை நிர்வாகி / Super Admin',
}

export default function MembersPage({
  group,
  lang = 'ta',
  onBack,
}: MembersPageProps) {
  const t = labels[lang]
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add Member Modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<{ user_id: string; role: UserRole }>({
    user_id: '',
    role: 'MEMBER',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Quick Register User Modal
  const [showUserModal, setShowUserModal] = useState(false)

  // Remove confirmation modal
  const [memberToRemove, setMemberToRemove] = useState<MemberSummary | null>(
    null
  )
  const [removing, setRemoving] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!group?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await membersApi.list(group.id)
      setMembers(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [group?.id])

  const loadUsers = useCallback(async () => {
    try {
      const data = await usersApi.list()
      setUsers(data)
    } catch {
      // Ignored
    }
  }, [])

  useEffect(() => {
    loadMembers()
    loadUsers()
  }, [loadMembers, loadUsers])

  const openModal = () => {
    setForm({ user_id: '', role: 'MEMBER' })
    setFormError(null)
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group?.id) return
    if (!form.user_id) {
      setFormError(
        lang === 'ta' ? 'பயனரை தேர்ந்தெடுக்கவும்.' : 'Please select a user.'
      )
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await membersApi.add(group.id, form)
      closeModal()
      loadMembers()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmRemove = async () => {
    if (!group?.id || !memberToRemove) return
    setRemoving(true)
    try {
      await membersApi.remove(group.id, memberToRemove.id)
      setMemberToRemove(null)
      loadMembers()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRemoving(false)
    }
  }

  const handleUserCreated = (newUser: User) => {
    setUsers((prev) => [...prev, newUser])
    setForm((f) => ({ ...f, user_id: newUser.id }))
  }

  if (!group) return null

  return (
    <div className="members-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <button className="btn-text back-btn tamil" onClick={onBack}>
            {t.back}
          </button>
          <h1 className="page-title tamil">{group.name}</h1>
          <p className="page-subtitle tamil">
            {members.length} {t.subtitle}
          </p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowUserModal(true)}
            id="register-user-btn"
          >
            {t.registerUserBtn}
          </button>
          <button
            className="btn btn-primary"
            onClick={openModal}
            id="add-member-btn"
          >
            {t.addBtn}
          </button>
        </div>
      </div>

      {loading && <p className="state-msg tamil">{t.loading}</p>}
      {error && <p className="state-msg state-msg--error">{error}</p>}

      {!loading && !error && members.length === 0 && (
        <div className="empty-state">
          <span className="empty-state__icon">👥</span>
          <p className="tamil">{t.empty}</p>
        </div>
      )}

      {/* ── Members table ── */}
      {members.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" id="members-table">
            <thead>
              <tr>
                <th className="tamil">{t.name}</th>
                <th className="tamil">{t.phone}</th>
                <th className="tamil">{t.role}</th>
                <th className="tamil">{t.joined}</th>
                <th className="tamil">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="tamil fw-medium">{m.full_name}</td>
                  <td className="font-mono">{m.phone_number}</td>
                  <td>
                    <span
                      className={`role-badge role-badge--${m.role.toLowerCase()}`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="text-secondary">{m.joined_date || '—'}</td>
                  <td>
                    <button
                      className="btn-danger-sm"
                      onClick={() => setMemberToRemove(m)}
                      id={`remove-member-${m.id}`}
                      title={t.remove}
                    >
                      {t.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Member Modal ── */}
      <Modal isOpen={showModal} onClose={closeModal} title={t.modalTitle}>
        <form className="form" onSubmit={handleSubmit} noValidate>
          {formError && <p className="form__error">{formError}</p>}

          <div className="form__field">
            <label className="form__label tamil" htmlFor="mem-user">
              {t.selectUser}
            </label>
            {users.length === 0 ? (
              <div>
                <p
                  className="text-secondary tamil"
                  style={{ fontSize: 'var(--text-sm)', marginBottom: '8px' }}
                >
                  {t.noUsers}
                </p>
                <button
                  type="button"
                  className="btn-link tamil"
                  onClick={() => {
                    closeModal()
                    setShowUserModal(true)
                  }}
                >
                  {t.quickRegister}
                </button>
              </div>
            ) : (
              <div>
                <select
                  id="mem-user"
                  className="form__input tamil"
                  value={form.user_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, user_id: e.target.value }))
                  }
                >
                  <option value="">—</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.phone_number})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-link tamil"
                  onClick={() => {
                    closeModal()
                    setShowUserModal(true)
                  }}
                >
                  + {t.quickRegister}
                </button>
              </div>
            )}
          </div>

          <div className="form__field">
            <label className="form__label tamil" htmlFor="mem-role">
              {t.selectRole}
            </label>
            <select
              id="mem-role"
              className="form__input"
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as UserRole,
                }))
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="form__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-member-btn"
            >
              {saving ? '…' : t.saveBtn}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Quick Register User Modal ── */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        lang={lang}
        onUserCreated={handleUserCreated}
      />

      {/* ── Confirm Remove Dialog ── */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title={t.confirmRemoveTitle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="tamil" style={{ color: 'var(--color-text-primary)' }}>
            {t.confirmRemoveMsg}
          </p>
          {memberToRemove && (
            <p
              style={{
                background: 'var(--color-gray-100)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
              }}
            >
              {memberToRemove.full_name} ({memberToRemove.phone_number}) —{' '}
              {memberToRemove.role}
            </p>
          )}
          <div className="form__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMemberToRemove(null)}
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'var(--color-error-500)' }}
              disabled={removing}
              onClick={handleConfirmRemove}
            >
              {removing ? '…' : t.confirmBtn}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
