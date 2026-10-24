import React, { useState, useEffect } from 'react'
import './App.css'

import StatusBar from './components/StatusBar/StatusBar'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LandingPage from './pages/LandingPage/LandingPage'
import GroupsPage from './pages/GroupsPage/GroupsPage'
import MembersPage from './pages/MembersPage/MembersPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard/SuperAdminDashboard'
import MemberDashboard from './pages/MemberDashboard/MemberDashboard'
import GroupAdminDashboard from './pages/GroupAdminDashboard/GroupAdminDashboard'
import BankLocator from './components/MapsGrounding/BankLocator'

import { authApi } from './services/api'
import { SHGGroup, UserAccount } from './types'

export default function App() {
  const [lang, setLang] = useState<'ta' | 'en'>('ta')
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [activePage, setActivePage] = useState<
    'home' | 'groups' | 'members' | 'superadmin' | 'member' | 'groupadmin' | 'locator'
  >('home')
  const [landingAuthTab, setLandingAuthTab] = useState<'login' | 'register' | 'admin'>('login')
  const [activeGroup, setActiveGroup] = useState<SHGGroup | null>(null)

  useEffect(() => {
    const user = authApi.getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  const toggleLang = () => setLang((prev) => (prev === 'ta' ? 'en' : 'ta'))
  const isTa = lang === 'ta'

  // Automatic routing on login or registration
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user)

    // Route to appropriate dashboard based on role
    if (user.role === 'SUPER_ADMIN') {
      setActivePage('superadmin')
    } else if (user.role === 'GROUP_ADMIN') {
      setActivePage('groupadmin')
    } else {
      setActivePage('member')
    }
  }

  const handleLogout = async () => {
    await authApi.logout()
    setCurrentUser(null)
    setActivePage('home')
    setLandingAuthTab('login')
  }

  const goToMembers = (group: SHGGroup) => {
    setActiveGroup(group)
    setActivePage('members')
  }

  const goToGroups = () => {
    setActiveGroup(null)
    setActivePage('groups')
  }

  const goToHome = () => {
    setActiveGroup(null)
    setActivePage('home')
  }

  const handleNavAuth = (tab: 'login' | 'register' | 'admin') => {
    setActivePage('home')
    setLandingAuthTab(tab)
    setTimeout(() => {
      const el = document.getElementById('login-card-anchor')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleScrollToHowItWorks = () => {
    if (activePage !== 'home') {
      setActivePage('home')
      setTimeout(() => {
        const el = document.getElementById('how-it-works')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } else {
      const el = document.getElementById('how-it-works')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app" lang={lang}>
      {/* ── Connectivity notice ── */}
      <StatusBar />

      {/* ── Site header ── */}
      <Header
        lang={lang}
        currentUser={currentUser}
        onLangToggle={toggleLang}
        onLogoClick={goToHome}
        onLoginClick={(tab = 'login') => handleNavAuth(tab)}
        onLogoutClick={handleLogout}
        onHowItWorksClick={handleScrollToHowItWorks}
      />

      {/* ── Main Navigation Bar ── */}
      <nav className="tab-nav" aria-label="Main navigation">
        <div className="container" style={{ display: 'flex', overflowX: 'auto', gap: '4px' }}>
          <button
            id="nav-home"
            className={`tab-nav__item tamil ${activePage === 'home' ? 'tab-nav__item--active' : ''}`}
            onClick={goToHome}
          >
            {isTa ? 'முகப்பு' : 'Home'}
          </button>

          {!currentUser ? (
            <>
              <button
                id="nav-user-login"
                className={`tab-nav__item tamil ${activePage === 'home' && landingAuthTab === 'login' ? 'tab-nav__item--highlight' : ''}`}
                onClick={() => handleNavAuth('login')}
              >
                {isTa ? 'உறுப்பினர் உள்நுழைவு' : 'User Login'}
              </button>

              <button
                id="nav-user-register"
                className={`tab-nav__item tamil ${activePage === 'home' && landingAuthTab === 'register' ? 'tab-nav__item--highlight' : ''}`}
                onClick={() => handleNavAuth('register')}
              >
                {isTa ? 'புதிய பதிவு' : 'User Registration'}
              </button>

              <button
                id="nav-admin-login"
                className={`tab-nav__item tamil ${activePage === 'home' && landingAuthTab === 'admin' ? 'tab-nav__item--highlight' : ''}`}
                onClick={() => handleNavAuth('admin')}
              >
                🔒 {isTa ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}
              </button>
            </>
          ) : (
            <>
              {currentUser.role !== 'SUPER_ADMIN' && (
                <button
                  id="nav-member-dash"
                  className={`tab-nav__item tamil ${activePage === 'member' ? 'tab-nav__item--active' : ''}`}
                  onClick={() => setActivePage('member')}
                >
                  {isTa ? 'எனது கணக்கு' : 'My Dashboard'}
                </button>
              )}

              {currentUser.role === 'GROUP_ADMIN' && (
                <button
                  id="nav-ga-dash"
                  className={`tab-nav__item tamil ${activePage === 'groupadmin' ? 'tab-nav__item--active' : ''}`}
                  onClick={() => setActivePage('groupadmin')}
                >
                  {isTa ? 'குழு நிர்வாகம்' : 'Group Admin'}
                </button>
              )}

              {currentUser.role === 'SUPER_ADMIN' && (
                <button
                  id="nav-admin-dash"
                  className={`tab-nav__item tamil ${activePage === 'superadmin' ? 'tab-nav__item--active' : ''}`}
                  onClick={() => setActivePage('superadmin')}
                >
                  {isTa ? 'மாநில தலைமை பலகை' : 'Super Admin Portal'}
                </button>
              )}
            </>
          )}

          <button
            id="nav-how-it-works"
            className="tab-nav__item tamil"
            onClick={handleScrollToHowItWorks}
          >
            {isTa ? 'செயல்முறை' : 'How It Works'}
          </button>

          <button
            id="nav-groups"
            className={`tab-nav__item tamil ${
              activePage === 'groups' || activePage === 'members' ? 'tab-nav__item--active' : ''
            }`}
            onClick={goToGroups}
          >
            {isTa ? 'சுய உதவிக் குழுக்கள்' : 'SHG Groups'}
          </button>

          <button
            id="nav-locator"
            className={`tab-nav__item tamil ${activePage === 'locator' ? 'tab-nav__item--active' : ''}`}
            onClick={() => setActivePage('locator')}
          >
            📍 {isTa ? 'வங்கி / இ-சேவை' : 'Bank & CSC Locator'}
          </button>
        </div>
      </nav>

      {/* ── Skip-to-content link ── */}
      <a href="#main-content" className="skip-link">
        {isTa ? 'முக்கிய உள்ளடக்கத்திற்கு செல்' : 'Skip to main content'}
      </a>

      {/* ── Page content ── */}
      <main id="main-content" className="container main-content">
        {activePage === 'home' && (
          <LandingPage
            lang={lang}
            activeAuthTab={landingAuthTab}
            onAuthSuccess={handleAuthSuccess}
            onNavigateToHowItWorks={handleScrollToHowItWorks}
            onNavigateToGroups={goToGroups}
          />
        )}

        {activePage === 'groups' && (
          <GroupsPage
            lang={lang}
            currentUser={currentUser}
            onSelectGroup={goToMembers}
          />
        )}

        {activePage === 'members' && (
          <MembersPage
            lang={lang}
            group={activeGroup}
            onBack={goToGroups}
          />
        )}

        {activePage === 'superadmin' && (
          currentUser?.role === 'SUPER_ADMIN' ? (
            <SuperAdminDashboard lang={lang} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 className="tamil">{isTa ? 'நிர்வாகி அனுமதி தேவை' : 'Super Admin Authentication Required'}</h2>
              <p className="tamil" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                {isTa
                  ? 'மாநில தலைமை பலகையை பார்வையிட நிர்வாகி உள்நுழைவு செய்யவும்.'
                  : 'Please authenticate with Super Admin credentials to access the administrative dashboard.'}
              </p>
              <button className="btn btn-primary" onClick={() => handleNavAuth('admin')}>
                {isTa ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}
              </button>
            </div>
          )
        )}

        {activePage === 'member' && (
          currentUser ? (
            <MemberDashboard currentUser={currentUser} lang={lang} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 className="tamil">{isTa ? 'உறுப்பினர் உள்நுழைவு தேவை' : 'Member Sign-In Required'}</h2>
              <button className="btn btn-primary" onClick={() => handleNavAuth('login')}>
                {isTa ? 'உள்நுழையவும்' : 'Sign In'}
              </button>
            </div>
          )
        )}

        {activePage === 'groupadmin' && (
          currentUser && currentUser.role === 'GROUP_ADMIN' ? (
            <GroupAdminDashboard currentUser={currentUser} lang={lang} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 className="tamil">{isTa ? 'குழு நிர்வாகி அனுமதி தேவை' : 'Group Admin Role Required'}</h2>
              <button className="btn btn-primary" onClick={() => handleNavAuth('login')}>
                {isTa ? 'உள்நுழையவும்' : 'Sign In'}
              </button>
            </div>
          )
        )}

        {activePage === 'locator' && <BankLocator lang={lang} />}
      </main>

      {/* ── Footer Component (includes app name, contact information, copyright notice) ── */}
      <Footer lang={lang} />
    </div>
  )
}
