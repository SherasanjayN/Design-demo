import React, { useState } from 'react'
import Modal from '../Modal/Modal'
import { usersApi } from '../../services/api'
import { User } from '../../types'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  lang: 'ta' | 'en'
  onUserCreated: (user: User) => void
}

const labels = {
  ta: {
    title: 'புதிய பயனரை பதிவு செய்',
    name: 'முழு பெயர் *',
    namePlaceholder: 'எ.கா. கவிதா முருகன்',
    phone: 'தொலைபேசி எண் * (+91 உடன்)',
    phonePlaceholder: '+919876543210',
    email: 'மின்னஞ்சல் (விருப்பத்தேர்வு)',
    notes: 'குறிப்புகள் (விருப்பத்தேர்வு)',
    save: 'பதிவு செய்',
    cancel: 'ரத்து செய்',
    errName: 'முழு பெயர் தேவை.',
    errPhone: 'செல்லுபடியாகும் தொலைபேசி எண் தேவை (+91...).',
  },
  en: {
    title: 'Register New User',
    name: 'Full Name *',
    namePlaceholder: 'e.g. Kavitha Murugan',
    phone: 'Phone Number * (with +91)',
    phonePlaceholder: '+919876543210',
    email: 'Email (Optional)',
    notes: 'Notes (Optional)',
    save: 'Register User',
    cancel: 'Cancel',
    errName: 'Full name is required.',
    errPhone: 'Valid phone number is required (e.g. +919876543210).',
  },
}

export default function UserModal({ isOpen, onClose, lang, onUserCreated }: UserModalProps) {
  const t = labels[lang]
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('+91')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError(t.errName)
      return
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError(t.errPhone)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const newUser = await usersApi.create({
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        email: email.trim() || null,
        notes: notes.trim() || null,
      })
      onUserCreated(newUser)
      setFullName('')
      setPhone('+91')
      setEmail('')
      setNotes('')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.title}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && <p className="form__error">{error}</p>}

        <div className="form__field">
          <label className="form__label tamil" htmlFor="new-user-name">
            {t.name}
          </label>
          <input
            id="new-user-name"
            className="form__input tamil"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t.namePlaceholder}
            required
          />
        </div>

        <div className="form__field">
          <label className="form__label tamil" htmlFor="new-user-phone">
            {t.phone}
          </label>
          <input
            id="new-user-phone"
            className="form__input font-mono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            required
          />
        </div>

        <div className="form__field">
          <label className="form__label tamil" htmlFor="new-user-email">
            {t.email}
          </label>
          <input
            id="new-user-email"
            type="email"
            className="form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
          />
        </div>

        <div className="form__field">
          <label className="form__label tamil" htmlFor="new-user-notes">
            {t.notes}
          </label>
          <input
            id="new-user-notes"
            className="form__input tamil"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Self-Help Group animator / dairy lead"
          />
        </div>

        <div className="form__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            id="save-new-user-btn"
          >
            {saving ? '…' : t.save}
          </button>
        </div>
      </form>
    </Modal>
  )
}
