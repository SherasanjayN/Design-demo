import React, { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import { authApi, usersApi, districtsApi } from '../../services/api'
import { UserAccount, District } from '../../types'
import { Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  lang?: 'ta' | 'en'
  initialTab?: 'login' | 'register' | 'superadmin'
  onSuccess: (user: UserAccount) => void
}

export default function AuthModal({
  isOpen,
  onClose,
  lang = 'ta',
  initialTab = 'login',
  onSuccess,
}: AuthModalProps) {
  const isTa = lang === 'ta'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'superadmin'>(
    initialTab
  )

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const [districts, setDistricts] = useState<District[]>([])
  useEffect(() => {
    districtsApi.list().then(setDistricts)
  }, [])

  // Registration form states (initially completely blank)
  const [regFullName, setRegFullName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regDistrict, setRegDistrict] = useState('')
  const [regLocation, setRegLocation] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regConsent, setRegConsent] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [registeredPendingUser, setRegisteredPendingUser] =
    useState<UserAccount | null>(null)

  // Login form states (initially completely blank)
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Super Admin login states
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForms = () => {
    setError(null)
    setRegisteredPendingUser(null)
    setRegFullName('')
    setRegPhone('')
    setRegEmail('')
    setRegDistrict('')
    setRegLocation('')
    setRegPassword('')
    setRegConfirmPassword('')
    setRegConsent(false)
    setLoginIdentifier('')
    setLoginPassword('')
    setAdminUsername('')
    setAdminPassword('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!regFullName.trim()) {
      setError(isTa ? 'முழு பெயர் உள்ளிடவும்.' : 'Please enter full name.')
      return
    }

    if (!regPhone.trim() || regPhone.trim().length < 10) {
      setError(
        isTa
          ? 'செல்லுபடியாகும் 10 இலக்க தொலைபேசி எண் தேவை.'
          : 'Valid phone number with country code/10 digits is required.'
      )
      return
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError(
        isTa
          ? 'செல்லுபடியாகும் மின்னஞ்சல் முகவரி தேவை.'
          : 'Valid email address is required.'
      )
      return
    }

    if (!regDistrict) {
      setError(isTa ? 'மாவட்டத்தை தேர்ந்தெடுக்கவும்.' : 'Please select a district.')
      return
    }

    if (!regLocation.trim()) {
      setError(
        isTa
          ? 'கிராமம் அல்லது பகுதி பெயரை உள்ளிடவும்.'
          : 'Please enter location / village / area.'
      )
      return
    }

    if (regPassword.length < 6) {
      setError(
        isTa
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.'
          : 'Password must be at least 6 characters.'
      )
      return
    }

    if (regPassword !== regConfirmPassword) {
      setError(
        isTa
          ? 'கடவுச்சொற்கள் பொருந்தவில்லை.'
          : 'Passwords do not match.'
      )
      return
    }

    if (!regConsent) {
      setError(
        isTa
          ? 'தனியுரிமை கொள்கையை ஏற்க வேண்டும்.'
          : 'Please consent to the privacy policy.'
      )
      return
    }

    setLoading(true)
    try {
      const user = await usersApi.register({
        fullName: regFullName.trim(),
        phoneNumber: regPhone.trim().startsWith('+') ? regPhone.trim() : `+91${regPhone.trim()}`,
        email: regEmail.trim(),
        district: regDistrict,
        location: regLocation.trim(),
        notes: 'Self-registered applicant via Web Portal',
      })
      setRegisteredPendingUser(user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!loginIdentifier.trim()) {
      setError(
        isTa
          ? 'தொலைபேசி எண் அல்லது மின்னஞ்சல் தேவை.'
          : 'Phone number or email is required.'
      )
      return
    }
    if (!loginPassword) {
      setError(isTa ? 'கடவுச்சொல் தேவை.' : 'Password is required.')
      return
    }

    setLoading(true)
    try {
      const user = await authApi.loginUser(loginIdentifier.trim(), loginPassword)
      onSuccess(user)
      onClose()
      resetForms()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError(
        isTa
          ? 'நிர்வாகி பயனர் பெயர் மற்றும் கடவுச்சொல் உள்ளிடவும்.'
          : 'Please enter admin username and password.'
      )
      return
    }
    setLoading(true)
    try {
      const user = await authApi.loginSuperAdmin(adminUsername.trim(), adminPassword)
      onSuccess(user)
      onClose()
      resetForms()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const getDistrictAreas = () => {
    const d = districts.find((dist) => dist.name === regDistrict)
    return d ? d.areas : []
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForms()
        onClose()
      }}
      title={
        isTa
          ? 'உள்நுழைவு & உறுப்பினர் பதிவு'
          : 'Authentication & Member Registration'
      }
    >
      <div className="auth-modal">
        {/* Navigation Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('login')
              setError(null)
            }}
          >
            {isTa ? 'உறுப்பினர் உள்நுழைவு' : 'Member Login'}
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('register')
              setError(null)
            }}
          >
            {isTa ? 'புதிய பதிவு' : 'New Registration'}
          </button>
          <button
            className={`auth-tab ${activeTab === 'superadmin' ? 'auth-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('superadmin')
              setError(null)
            }}
          >
            {isTa ? 'நிர்வாகி (Admin)' : 'Super Admin'}
          </button>
        </div>

        {error && <div className="form__error">{error}</div>}

        {/* ── TAB 1: MEMBER LOGIN ── */}
        {activeTab === 'login' && (
          <form className="form" onSubmit={handleUserLogin} noValidate autoComplete="off">

            <div className="form__field">
              <label className="form__label tamil" htmlFor="login-id">
                {isTa ? 'மின்னஞ்சல் அல்லது தொலைபேசி எண்' : 'Email Address or Phone Number'}
              </label>
              <input
                id="login-id"
                type="text"
                className="form__input"
                autoComplete="off"
                placeholder={isTa ? 'எ.கா. priya.selvan@example.com / +919842100002' : 'e.g. member@example.com / +919842100002'}
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil" htmlFor="login-pwd">
                {isTa ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-pwd"
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form__input"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form__actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-text tamil text-secondary"
                style={{ fontSize: '12px' }}
                onClick={() => alert(isTa ? 'கடவுச்சொல் மீட்பு கோரிக்கை பதிவு செய்யப்பட்டுள்ளது.' : 'Password reset link sent to your registered contact.')}
              >
                {isTa ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '…' : isTa ? 'உள்நுழைக' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 2: USER REGISTRATION ── */}
        {activeTab === 'register' && (
          <>
            {registeredPendingUser ? (
              <div className="auth-success-screen">
                <div className="auth-success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="tamil" style={{ color: 'var(--color-primary-800)', margin: 0 }}>
                  {isTa ? 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Application Submitted Successfully!'}
                </h3>
                <div className="auth-notice-box tamil">
                  <strong>{isTa ? 'நிலை: ஒப்புதல் நிலுவையில் உள்ளது' : 'Status: Pending Approval'}</strong>
                  <p style={{ margin: '6px 0 0' }}>
                    {isTa
                      ? 'உங்கள் சுய உதவிக் குழு உறுப்பினர் பதிவு வெற்றிகரமாக பெறப்பட்டது. மாவட்ட நிர்வாகி அல்லது மகளிர் திட்ட அதிகாரி சரிபார்த்து ஒப்புதல் அளித்த பின் உங்கள் கணக்கு இயக்கப்படும்.'
                      : 'Your application has been received and is pending administrative approval. An administrator must verify and approve your registration before you can access the member dashboard.'}
                  </p>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  {isTa ? 'விண்ணப்ப குறிப்பு எண்:' : 'Reference ID:'}{' '}
                  <span className="font-mono" style={{ fontWeight: 600 }}>{registeredPendingUser.id}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    resetForms()
                    setActiveTab('login')
                  }}
                  style={{ marginTop: '12px' }}
                >
                  {isTa ? 'உள்நுழைவு பக்கத்திற்கு செல்' : 'Return to Login'}
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={handleRegister} noValidate autoComplete="off">
                <div className="form__field">
                  <label className="form__label tamil" htmlFor="reg-name">
                    {isTa ? 'முழு பெயர் *' : 'Full Name *'}
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form__input tamil"
                    autoComplete="off"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={isTa ? 'ஆதார் அட்டையில் உள்ளவாறு' : 'As per Aadhaar card'}
                    required
                  />
                </div>

                <div className="form__row">
                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-phone">
                      {isTa ? 'தொலைபேசி எண் *' : 'Phone Number *'}
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      className="form__input font-mono"
                      autoComplete="off"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+919876543210"
                      required
                    />
                  </div>

                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-email">
                      {isTa ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="form__input"
                      autoComplete="off"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form__row">
                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-district">
                      {isTa ? 'மாவட்டம் *' : 'District *'}
                    </label>
                    <select
                      id="reg-district"
                      className="form__input tamil"
                      value={regDistrict}
                      onChange={(e) => {
                        setRegDistrict(e.target.value)
                        setRegLocation('')
                      }}
                      required
                    >
                      <option value="">{isTa ? '— தேர்ந்தெடுக்கவும் —' : '— Select District —'}</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-location">
                      {isTa ? 'கிராமம் / பகுதி *' : 'Location / Village / Area *'}
                    </label>
                    {getDistrictAreas().length > 0 ? (
                      <select
                        id="reg-location"
                        className="form__input tamil"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        required
                      >
                        <option value="">{isTa ? '— தேர்ந்தெடுக்கவும் —' : '— Select Area —'}</option>
                        {getDistrictAreas().map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name} ({a.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="reg-location"
                        type="text"
                        className="form__input tamil"
                        autoComplete="off"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder={isTa ? 'கிராமம் / வசிக்கும் பகுதி' : 'Village / Area'}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="form__row">
                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-pwd">
                      {isTa ? 'கடவுச்சொல் *' : 'Password *'}
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="reg-pwd"
                        type={showRegPassword ? 'text' : 'password'}
                        className="form__input"
                        autoComplete="off"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                      >
                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form__field">
                    <label className="form__label tamil" htmlFor="reg-confirm">
                      {isTa ? 'கடவுச்சொல் உறுதிப்படுத்தல் *' : 'Confirm Password *'}
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="reg-confirm"
                        type={showRegConfirm ? 'text' : 'password'}
                        className="form__input"
                        autoComplete="off"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegConfirm(!showRegConfirm)}
                      >
                        {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="auth-terms-label tamil">
                  <input
                    type="checkbox"
                    checked={regConsent}
                    onChange={(e) => setRegConsent(e.target.checked)}
                    required
                  />
                  <span>
                    {isTa
                      ? 'எனது தகவல்கள் சுய உதவிக் குழு சேமிப்பு மற்றும் அரசு திட்ட சரிபார்ப்புக்கு பயன்படுத்த ஒப்புக்கொள்கிறேன்.'
                      : 'I consent to the collection and verification of my details for rural SHG savings and welfare scheme records.'}
                  </span>
                </label>

                <div className="form__actions">
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? '…' : isTa ? 'பதிவு செய்க (Register)' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── TAB 3: SUPER ADMIN LOGIN ── */}
        {activeTab === 'superadmin' && (
          <form className="form" onSubmit={handleAdminLogin} noValidate autoComplete="off">
            <div className="auth-notice-box tamil" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{isTa ? 'மாநில திட்ட கண்காணிப்பு & நிர்வாக போர்டல்' : 'Protected State Administrator Gateway'}</strong>
                <p style={{ margin: '4px 0 0' }}>
                  {isTa
                    ? 'சுய உதவிக் குழுக்கள் உருவாக்கம், மாவட்ட பகுதிகள், மற்றும் உறுப்பினர் அனுமதி மேலாண்மை.'
                    : 'Restricted administrative access for user approvals, group creations, and financial audit.'}
                </p>
              </div>
            </div>

            <div className="form__field">
              <label className="form__label tamil" htmlFor="admin-user">
                {isTa ? 'நிர்வாகி பயனர் பெயர் *' : 'Admin Username *'}
              </label>
              <input
                id="admin-user"
                type="text"
                className="form__input font-mono"
                autoComplete="off"
                placeholder={isTa ? 'நிர்வாக பயனர் பெயர்' : 'Admin username'}
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
            </div>

            <div className="form__field">
              <label className="form__label tamil" htmlFor="admin-pwd">
                {isTa ? 'கடவுச்சொல் *' : 'Password *'}
              </label>
              <div className="password-input-wrapper">
                <input
                  id="admin-pwd"
                  type={showAdminPassword ? 'text' : 'password'}
                  className="form__input"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form__actions">
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? '…' : isTa ? 'நிர்வாகி உள்நுழைவு' : 'Super Admin Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
