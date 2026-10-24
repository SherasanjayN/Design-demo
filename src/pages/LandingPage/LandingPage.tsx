import React, { useState, useEffect, useRef } from 'react'
import { authApi, usersApi, districtsApi } from '../../services/api'
import { UserAccount } from '../../types'
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  FileText,
  HelpCircle,
  AlertCircle,
  Building2,
  Users2,
  Check,
} from 'lucide-react'
import './LandingPage.css'

interface LandingPageProps {
  lang?: 'ta' | 'en'
  onAuthSuccess: (user: UserAccount) => void
  onNavigateToHowItWorks?: () => void
  onNavigateToGroups?: () => void
  activeAuthTab?: 'login' | 'register' | 'admin'
}

export default function LandingPage({
  lang = 'ta',
  onAuthSuccess,
  onNavigateToGroups,
  activeAuthTab = 'login',
}: LandingPageProps) {
  const isTa = lang === 'ta'
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'admin'>(activeAuthTab)

  useEffect(() => {
    setAuthTab(activeAuthTab)
  }, [activeAuthTab])

  // ── District Suggestions ──
  const [districtQuery, setDistrictQuery] = useState('')
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const allStates = districtsApi.getAllStates()
  const suggestionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (districtQuery.trim().length > 0) {
      const results = districtsApi.getSuggestions(districtQuery)
      setDistrictSuggestions(results)
    } else {
      setDistrictSuggestions(districtsApi.getAllDistricts().slice(0, 8))
    }
  }, [districtQuery])

  // Click outside to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Form States (All initially completely blank, no autofill) ──
  // User Login
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // User Registration
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regDistrict, setRegDistrict] = useState('')
  const [regState, setRegState] = useState('Tamil Nadu')
  const [regLocation, setRegLocation] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [regConsent, setRegConsent] = useState(false)

  // Admin Login
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  // Status & Notification states
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [forgotModal, setForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const clearMessages = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  // ── Handlers ──

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!loginIdentifier.trim()) {
      setErrorMessage(
        isTa
          ? 'மொபைல் எண் அல்லது மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter your mobile number or email address.'
      )
      return
    }

    if (!loginPassword) {
      setErrorMessage(isTa ? 'கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const user = await authApi.loginUser(loginIdentifier.trim(), loginPassword)
      setSuccessMessage(
        isTa
          ? `வரவேற்கிறோம், ${user.full_name}! உங்கள் பலகைக்கு செல்லப்படுகிறது...`
          : `Welcome back, ${user.full_name}! Redirecting to dashboard...`
      )
      setTimeout(() => {
        onAuthSuccess(user)
      }, 600)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!regFullName.trim()) {
      setErrorMessage(isTa ? 'முழு பெயரை உள்ளிடவும்.' : 'Full name is required.')
      return
    }

    const cleanMobile = regMobile.trim().replace(/\D/g, '')
    if (cleanMobile.length < 10) {
      setErrorMessage(
        isTa
          ? 'சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit Indian mobile number.'
      )
      return
    }

    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage(
        isTa ? 'செல்லுபடியாகும் மின்னஞ்சல் முகவரி தேவை.' : 'Valid email address is required.'
      )
      return
    }

    if (!regDistrict.trim()) {
      setErrorMessage(isTa ? 'மாவட்டத்தை தேர்ந்தெடுக்கவும்.' : 'Please select or enter your district.')
      return
    }

    if (regPassword.length < 6) {
      setErrorMessage(
        isTa
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.'
          : 'Password must be at least 6 characters long.'
      )
      return
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(isTa ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.')
      return
    }

    if (!regConsent) {
      setErrorMessage(
        isTa
          ? 'தனியுரிமை கொள்கை மற்றும் SHG விதிமுறைகளை ஏற்க வேண்டும்.'
          : 'Please consent to the privacy policy and terms.'
      )
      return
    }

    setLoading(true)
    try {
      await usersApi.register({
        fullName: regFullName.trim(),
        phoneNumber: cleanMobile,
        email: regEmail.trim(),
        district: regDistrict.trim(),
        state: 'Tamil Nadu',
        location: regLocation.trim() || 'Rural Area',
        password: regPassword,
      })

      const exactMsg = isTa
        ? 'பதிவு வெற்றிகரமாக முடிந்தது! உங்கள் கணக்கு நிர்வாகியின் அனுமதிக்காக காத்திருக்கிறது. உங்கள் கணக்கு அங்கீகரிக்கப்பட்டு SHG குழுவில் ஒதுக்கப்பட்ட பிறகு நீங்கள் உள்நுழைய முடியும்.'
        : 'Registration successful! Your account is awaiting administrator approval. You will be able to log in after your account is approved and assigned to an SHG group.'

      setSuccessMessage(exactMsg)

      // Clear the registration inputs
      setRegFullName('')
      setRegEmail('')
      setRegMobile('')
      setRegDistrict('')
      setRegLocation('')
      setRegPassword('')
      setRegConfirmPassword('')
      setRegConsent(false)

      // Switch to login tab so user can log in after admin approves
      setAuthTab('login')
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!adminUsername.trim()) {
      setErrorMessage(
        isTa ? 'நிர்வாகி பயனர் பெயரை உள்ளிடவும்.' : 'Please enter administrator username.'
      )
      return
    }

    if (!adminPassword) {
      setErrorMessage(
        isTa ? 'நிர்வாகி கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter administrator password.'
      )
      return
    }

    setLoading(true)
    try {
      const admin = await authApi.loginSuperAdmin(adminUsername.trim(), adminPassword)
      setSuccessMessage(
        isTa
          ? 'நிர்வாகி அனுமதி உறுதிசெய்யப்பட்டது. தலைமை பலகைக்கு செல்லப்படுகிறது...'
          : 'Administrator authenticated. Redirecting to Master Console...'
      )
      setTimeout(() => {
        onAuthSuccess(admin)
      }, 600)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotSent(true)
    setTimeout(() => {
      setForgotModal(false)
      setForgotSent(false)
      setForgotEmail('')
    }, 2500)
  }

  return (
    <div className="landing-page-clean">
      {/* ── Top Hero Banner (White-and-Green) ── */}
      <section className="clean-hero-section">
        <div className="clean-hero-header">
          <span className="clean-badge">
            <ShieldCheck size={14} className="clean-badge__icon" />
            {isTa ? 'தமிழ்நாடு ஊரக வாழ்வாதார இயக்கம் — டிஜிட்டல் தளம்' : 'Tamil Nadu Rural Livelihood Mission — SHG Digital Platform'}
          </span>
          <h1 className="clean-hero-title tamil">
            {isTa
              ? 'கிராமப்புற மகளிர் சுய உதவிக் குழு மேலாண்மை அமைப்பு'
              : "Built for Rural Women's Self-Help Groups"}
          </h1>
          <p className="clean-hero-desc tamil">
            {isTa
              ? 'காகிதப் பதிவேடுகளை மாற்றி, வெளிப்படையான சேமிப்பு, கடன் கோரிக்கை, குழு நிர்வாகி ஒப்புதல், உடனடி டிஜிட்டல் ரசீதுகள் மற்றும் நேரடி வங்கி பரிவர்த்தனை.'
              : 'Replace paper notebooks with transparent digital savings, member amount requests, group admin approval workflow, digital receipts, and auditable financial ledgers.'}
          </p>
        </div>

        {/* ── Centered Main Authentication Card ── */}
        <div className="auth-center-container" id="login-card-anchor">
          <div className="auth-card-panel">
            {/* Nav Tabs within Card */}
            <div className="auth-tab-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={authTab === 'login'}
                className={`auth-tab-btn tamil ${authTab === 'login' ? 'auth-tab-btn--active' : ''}`}
                onClick={() => {
                  setAuthTab('login')
                  clearMessages()
                }}
                id="tab-user-login"
              >
                {isTa ? 'உறுப்பினர் உள்நுழைவு' : 'User Login'}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={authTab === 'register'}
                className={`auth-tab-btn tamil ${authTab === 'register' ? 'auth-tab-btn--active' : ''}`}
                onClick={() => {
                  setAuthTab('register')
                  clearMessages()
                }}
                id="tab-user-register"
              >
                {isTa ? 'புதிய பதிவு' : 'User Registration'}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={authTab === 'admin'}
                className={`auth-tab-btn tamil ${authTab === 'admin' ? 'auth-tab-btn--active' : ''}`}
                onClick={() => {
                  setAuthTab('admin')
                  clearMessages()
                }}
                id="tab-admin-login"
              >
                <Lock size={13} style={{ marginRight: '4px' }} />
                {isTa ? 'நிர்வாகி' : 'Admin Login'}
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="auth-alert auth-alert--error" role="alert">
                <AlertCircle size={18} className="auth-alert__icon" />
                <span className="tamil">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-alert auth-alert--success" role="alert">
                <CheckCircle2 size={18} className="auth-alert__icon" />
                <span className="tamil">{successMessage}</span>
              </div>
            )}

            {/* TAB 1: USER LOGIN */}
            {authTab === 'login' && (
              <form onSubmit={handleUserLogin} className="auth-form" autoComplete="off">
                <div className="auth-field">
                  <label className="auth-label tamil" htmlFor="login-identifier">
                    {isTa ? 'மொபைல் எண் அல்லது மின்னஞ்சல் *' : 'Indian Mobile Number or Email *'}
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    className="auth-input font-mono"
                    placeholder={isTa ? 'எ.கா. 9842100002 அல்லது email@example.com' : 'e.g. 9842100002 or name@example.com'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label tamil" htmlFor="login-password">
                      {isTa ? 'கடவுச்சொல் *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      className="auth-link-btn tamil"
                      onClick={() => setForgotModal(true)}
                    >
                      {isTa ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="password-input-wrap">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn tamil"
                  disabled={loading}
                  id="btn-login-submit"
                >
                  {loading ? (
                    <span className="btn-spinner-content">
                      <span className="mini-spinner" />
                      {isTa ? 'சரிபார்க்கிறது...' : 'Authenticating...'}
                    </span>
                  ) : (
                    <>
                      {isTa ? 'உள்நுழையவும்' : 'Sign In to Dashboard'}
                      <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                    </>
                  )}
                </button>

                <div className="auth-footer-prompt">
                  <span className="tamil">{isTa ? 'கணக்கு இல்லையா?' : "Don't have an account?"}</span>
                  <button
                    type="button"
                    className="auth-link-bold tamil"
                    onClick={() => {
                      setAuthTab('register')
                      clearMessages()
                    }}
                  >
                    {isTa ? 'புதிய கணக்கு பதிவு செய்யவும்' : 'Register New Account'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: USER REGISTRATION (Auto login on submit) */}
            {authTab === 'register' && (
              <form onSubmit={handleUserRegister} className="auth-form" autoComplete="off">
                <div className="auth-field">
                  <label className="auth-label tamil" htmlFor="reg-fullname">
                    {isTa ? 'முழு பெயர் *' : 'Full Name (as per Aadhaar / ID) *'}
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    className="auth-input tamil"
                    placeholder={isTa ? 'எ.கா. கவிதா முருகன்' : 'e.g. Kavitha Murugan'}
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="auth-row-2">
                  <div className="auth-field">
                    <label className="auth-label tamil" htmlFor="reg-mobile">
                      {isTa ? 'இந்திய மொபைல் எண் *' : 'Indian Mobile (+91) *'}
                    </label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">+91</span>
                      <input
                        id="reg-mobile"
                        type="tel"
                        maxLength={10}
                        className="auth-input font-mono"
                        placeholder="9876543210"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label tamil" htmlFor="reg-email">
                      {isTa ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="auth-input"
                      placeholder="kavitha@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="auth-row-2">
                  {/* District with Autocomplete & Manual Entry */}
                  <div className="auth-field" style={{ position: 'relative' }} ref={suggestionRef}>
                    <label className="auth-label tamil" htmlFor="reg-district">
                      {isTa ? 'மாவட்டம் (District) *' : 'District (Autocomplete) *'}
                    </label>
                    <input
                      id="reg-district"
                      type="text"
                      className="auth-input tamil"
                      placeholder={isTa ? 'தட்டச்சு செய்து தேர்வு செய்க' : 'Type to search district...'}
                      value={regDistrict}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setRegDistrict(e.target.value)
                        setDistrictQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      autoComplete="off"
                      required
                    />

                    {showSuggestions && (
                      <div className="district-dropdown-suggestions">
                        <div className="suggestions-header">
                          {isTa ? 'பரிந்துரைக்கப்பட்ட மாவட்டங்கள்' : 'Suggested Districts'}
                        </div>
                        {districtSuggestions.map((d) => (
                          <button
                            type="button"
                            key={d}
                            className="suggestion-item"
                            onClick={() => {
                              setRegDistrict(d)
                              setShowSuggestions(false)
                            }}
                          >
                            <span className="suggestion-name">{d}</span>
                            {regDistrict.toLowerCase() === d.toLowerCase() && <Check size={14} color="#166534" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label tamil" htmlFor="reg-state">
                      {isTa ? 'மாநிலம் (State) *' : 'State (Tamil Nadu Only) *'}
                    </label>
                    <select
                      id="reg-state"
                      className="auth-input tamil"
                      value="Tamil Nadu"
                      disabled
                      aria-readonly="true"
                    >
                      <option value="Tamil Nadu">
                        {isTa ? 'தமிழ்நாடு (Tamil Nadu)' : 'Tamil Nadu'}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label tamil" htmlFor="reg-location">
                    {isTa ? 'கிராமம் / வட்டார பகுதி (Village / Area) *' : 'Village / Ward / Area *'}
                  </label>
                  <input
                    id="reg-location"
                    type="text"
                    className="auth-input tamil"
                    placeholder={isTa ? 'எ.கா. சூலூர் தெற்கு, பல்லடம் ரோடு' : 'e.g. Sulur South, Palladam Road'}
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="auth-row-2">
                  <div className="auth-field">
                    <label className="auth-label tamil" htmlFor="reg-password">
                      {isTa ? 'கடவுச்சொல் *' : 'Password (min 6 chars) *'}
                    </label>
                    <div className="password-input-wrap">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label tamil" htmlFor="reg-confirm-password">
                      {isTa ? 'கடவுச்சொல் உறுதிப்படுத்தல் *' : 'Confirm Password *'}
                    </label>
                    <div className="password-input-wrap">
                      <input
                        id="reg-confirm-password"
                        type={showRegConfirm ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegConfirm(!showRegConfirm)}
                        aria-label="Toggle password confirmation visibility"
                      >
                        {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="auth-checkbox-wrap">
                  <input
                    type="checkbox"
                    id="reg-consent"
                    className="auth-checkbox"
                    checked={regConsent}
                    onChange={(e) => setRegConsent(e.target.checked)}
                    required
                  />
                  <label htmlFor="reg-consent" className="auth-checkbox-label tamil">
                    {isTa
                      ? 'சுய உதவிக் குழு சேமிப்பு விதிகள் மற்றும் தனியுரிமை கொள்கையை ஏற்கிறேன்.'
                      : 'I consent to the SHG financial regulations and privacy terms.'}
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn tamil"
                  disabled={loading}
                  id="btn-register-submit"
                >
                  {loading ? (
                    <span className="btn-spinner-content">
                      <span className="mini-spinner" />
                      {isTa ? 'பதிவு செய்யப்படுகிறது...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>
                      {isTa ? 'பதிவு செய்து பலகைக்கு செல்க' : 'Register & Access Dashboard'}
                      <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                    </>
                  )}
                </button>

                <div className="auth-footer-prompt">
                  <span className="tamil">{isTa ? 'ஏற்கனவே உறுப்பினரா?' : 'Already registered?'}</span>
                  <button
                    type="button"
                    className="auth-link-bold tamil"
                    onClick={() => {
                      setAuthTab('login')
                      clearMessages()
                    }}
                  >
                    {isTa ? 'உள்நுழையவும்' : 'Sign In'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: ADMIN LOGIN (Secure, no default credentials shown) */}
            {authTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="auth-form" autoComplete="off">
                <div className="admin-login-callout">
                  <ShieldCheck size={20} color="#166534" />
                  <p className="admin-login-callout__text tamil">
                    {isTa
                      ? 'அங்கீகரிக்கப்பட்ட மாநில மற்றும் மாவட்ட தலைமை நிர்வாகிகளுக்கான பாதுகாப்பான நுழைவுப் பகுதி.'
                      : 'Authorized administrative access for State & District SHG Nodal Officers.'}
                  </p>
                </div>

                <div className="auth-field">
                  <label className="auth-label tamil" htmlFor="admin-username">
                    {isTa ? 'நிர்வாகி பயனர் பெயர் *' : 'Administrator Username *'}
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    className="auth-input font-mono"
                    placeholder={isTa ? 'நிர்வாகி பயனர் பெயர் உள்ளிடவும்' : 'Enter admin username'}
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label tamil" htmlFor="admin-password">
                    {isTa ? 'நிர்வாகி கடவுச்சொல் *' : 'Master Password *'}
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="admin-password"
                      type={showAdminPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn auth-submit-btn--admin tamil"
                  disabled={loading}
                  id="btn-admin-submit"
                >
                  {loading ? (
                    <span className="btn-spinner-content">
                      <span className="mini-spinner" />
                      {isTa ? 'சரிபார்க்கிறது...' : 'Verifying Credentials...'}
                    </span>
                  ) : (
                    <>
                      <Lock size={15} style={{ marginRight: '6px' }} />
                      {isTa ? 'தலைமை நிர்வாக பலகைக்கு செல்' : 'Access Super Admin Console'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="clean-section how-it-works-section" id="how-it-works">
        <div className="section-head-wrap">
          <span className="clean-section-tag tamil">
            {isTa ? 'எளிய வழிமுறைகள்' : 'Streamlined Workflow'}
          </span>
          <h2 className="clean-section-title tamil">
            {isTa ? 'சுய உதவிக் குழு இயங்கும் முறை' : 'How TrustPass SHG Works'}
          </h2>
          <p className="clean-section-desc tamil">
            {isTa
              ? 'பதிவு முதல் கடன் வழங்கல் வரை 5 எளிய வெளிப்படையான நிலைகள்'
              : 'Five transparent stages from member onboarding to digital disbursement and verifiable receipts.'}
          </p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 className="step-title tamil">
              {isTa ? 'உறுப்பினர் பதிவு' : '1. Member Registration'}
            </h3>
            <p className="step-text tamil">
              {isTa
                ? 'மொபைல் எண், மின்னஞ்சல் மற்றும் மாவட்டத்தை உள்ளிட்டு சுலபமாக பதிவு செய்து உடனே உங்கள் கணக்கை பார்வையிடலாம்.'
                : 'Members register with Indian mobile number, email, and district autocomplete, instantly gaining access to their member dashboard.'}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3 className="step-title tamil">
              {isTa ? 'குழு ஒதுக்கீடு' : '2. Village Group Allocation'}
            </h3>
            <p className="step-text tamil">
              {isTa
                ? 'மாநில நிர்வாகி உங்கள் பகுதிக்குட்பட்ட மகளிர் குழுவில் உங்களை இணைத்து, தகுதியான குழு நிர்வாகியை நியமிக்கிறார்.'
                : 'Super Admin assigns approved members to neighborhood SHG clusters and appoints designated Group Admins.'}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3 className="step-title tamil">
              {isTa ? 'வாராந்திர சேமிப்பு' : '3. Weekly Savings & Ledger'}
            </h3>
            <p className="step-text tamil">
              {isTa
                ? 'கூட்டத்தில் செலுத்தப்படும் சேமிப்புத் தொகை டிஜிட்டல் முறையில் பதிவாகி, குழு நிதி இருப்பு உடனுக்குடன் புதுப்பிக்கப்படும்.'
                : 'Weekly meeting deposits are recorded digitally with transparent group ledgers and verifiable passbook balances.'}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h3 className="step-title tamil">
              {isTa ? 'தொகை கோரிக்கை & ஒப்புதல்' : '4. Amount Request & Approval'}
            </h3>
            <p className="step-text tamil">
              {isTa
                ? 'விவசாயம், தையல், கால்நடை போன்ற தேவைகளுக்கு UPI அல்லது ரொக்கம் மூலம் கடன் கோரலாம். குழு நிர்வாகி ஆய்வு செய்து ஒப்புதல் தருவார்.'
                : 'Members submit amount requests for agriculture, livestock, or business. The Group Admin reviews and approves.'}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">05</div>
            <h3 className="step-title tamil">
              {isTa ? 'பரிவர்த்தனை & QR ரசீது' : '5. Disbursement & QR Receipt'}
            </h3>
            <p className="step-text tamil">
              {isTa
                ? 'UPI பரிவர்த்தனை குறிப்பு எண் அல்லது ரொக்க ரசீது பதிவு செய்யப்பட்டு, தனித்துவமான QR சரிபார்ப்பு ரசீது உடனே உருவாக்கப்படும்.'
                : 'UPI transaction references or cash receipts are confirmed, instantly issuing a verifiable digital receipt with QR code.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES & FINANCIAL HEALTH ── */}
      <section className="clean-section features-section">
        <div className="section-head-wrap">
          <span className="clean-section-tag tamil">
            {isTa ? 'நம்பகமான அம்சங்கள்' : 'Enterprise Capabilities'}
          </span>
          <h2 className="clean-section-title tamil">
            {isTa ? 'முக்கிய தொழில்நுட்ப அம்சங்கள்' : 'Key Platform Capabilities'}
          </h2>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrap">
              <TrendingUp size={24} color="#166534" />
            </div>
            <h3 className="feature-box-title tamil">
              {isTa ? 'குழு நிதி நலக் குறியீடு (Financial Health Score)' : 'SHG Financial Health Score'}
            </h3>
            <p className="feature-box-text tamil">
              {isTa
                ? 'சேமிப்பு வேகம், குறித்த நேரத்தில் திருப்பிச் செலுத்துதல் மற்றும் இருப்பு நிதியை கணக்கிட்டு வெளிப்படையான 0-100 குறியீடு வழங்கப்படுகிறது.'
                : 'Transparent 0–100 score measuring savings velocity, repayment consistency, and reserve capital cushion.'}
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <CreditCard size={24} color="#166534" />
            </div>
            <h3 className="feature-box-title tamil">
              {isTa ? 'UPI & நேரடி ரொக்கப் பதிவு' : 'UPI & Cash Transfer Tracking'}
            </h3>
            <p className="feature-box-text tamil">
              {isTa
                ? 'UPI ID சரிபார்ப்பு, பரிவர்த்தனை குறிப்பு பதிவு மற்றும் ரொக்க ரசீது எண்களைக் கொண்டு போலி பரிவர்த்தனைகள் தடுக்கப்படுகின்றன.'
                : 'Strict validation for UPI IDs and cash receipts, maintaining an auditable digital trail with zero duplicate payouts.'}
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <FileText size={24} color="#166534" />
            </div>
            <h3 className="feature-box-title tamil">
              {isTa ? 'டிஜிட்டல் QR ரசீதுகள்' : 'Digital QR Receipts'}
            </h3>
            <p className="feature-box-text tamil">
              {isTa
                ? 'ஒவ்வொரு பரிவர்த்தனைக்கும் தனிப்பட்ட ரசீது எண் மற்றும் சரிபார்க்கக்கூடிய QR குறியீட்டுடன் அச்சிடும் வசதி.'
                : 'Instant generation of verifiable digital receipts with unique references and offline-compatible QR codes.'}
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrap">
              <HelpCircle size={24} color="#166534" />
            </div>
            <h3 className="feature-box-title tamil">
              {isTa ? 'ரகசிய குறைகேட்பு வசதி' : 'Member Grievance Redressal'}
            </h3>
            <p className="feature-box-text tamil">
              {isTa
                ? 'பரிவர்த்தனை தாமதம் அல்லது குழு நிர்வாக குறைபாடுகள் பற்றி மாவட்ட தலைமை நிர்வாகிக்கு ரகசிய புகார் அனுப்பும் வசதி.'
                : 'Confidential channel for members to submit grievances directly to administrative authorities for prompt resolution.'}
            </p>
          </div>
        </div>

        {/* Action Button to Browse Groups */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            type="button"
            className="btn btn-secondary tamil"
            onClick={onNavigateToGroups}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Users2 size={16} style={{ marginRight: '8px' }} />
            {isTa ? 'சுய உதவிக் குழுக்களை தேடவும்' : 'Explore Self-Help Groups'}
          </button>
        </div>
      </section>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {forgotModal && (
        <div className="modal-backdrop" onClick={() => setForgotModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title tamil">
                {isTa ? 'கடவுச்சொல் மீட்டெடுப்பு' : 'Reset Password'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setForgotModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={40} color="#166534" style={{ margin: '0 auto 12px' }} />
                  <p className="tamil" style={{ fontWeight: 600 }}>
                    {isTa
                      ? 'கடவுச்சொல் மீட்டெடுக்கும் வழிமுறைகள் உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல்/மொபைலுக்கு அனுப்பப்பட்டுள்ளன.'
                      : 'Password reset instructions have been sent to your registered address.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p className="tamil" style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    {isTa
                      ? 'உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியை உள்ளிடவும். கடவுச்சொல் மீட்டெடுக்கும் இணைப்பு உடனே அனுப்பப்படும்.'
                      : 'Enter your registered email address to receive password recovery instructions.'}
                  </p>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="forgot-email">
                      {isTa ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      className="auth-input"
                      placeholder="kavitha@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setForgotModal(false)}
                    >
                      {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isTa ? 'அனுப்பவும்' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
