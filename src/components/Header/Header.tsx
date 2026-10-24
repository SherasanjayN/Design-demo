import React from 'react'
import { UserAccount } from '../../types'
import { Shield, User, LogOut, LogIn, UserPlus, Lock } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  lang: 'ta' | 'en'
  currentUser: UserAccount | null
  onLangToggle: () => void
  onLogoClick?: () => void
  onLoginClick: (tab?: 'login' | 'register' | 'admin') => void
  onLogoutClick: () => void
  onHowItWorksClick?: () => void
}

export default function Header({
  lang,
  currentUser,
  onLangToggle,
  onLogoClick,
  onLoginClick,
  onLogoutClick,
  onHowItWorksClick,
}: HeaderProps) {
  const isTa = lang === 'ta'

  return (
    <header className="header" role="banner">
      <div className="container header__inner">
        {/* ── Brand ── */}
        <button
          className="header__brand"
          onClick={onLogoClick}
          aria-label="TrustPass SHG — Home"
        >
          <svg
            className="header__logo-icon"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
              fill="url(#shieldGrad)"
            />
            <path
              d="M20 12v10M15 17l5-5 5 5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="shieldGrad"
                x1="5"
                y1="3"
                x2="35"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#22c55e" />
                <stop offset="1" stopColor="#14532d" />
              </linearGradient>
            </defs>
          </svg>

          <span className="header__brand-text">
            <span className="header__brand-name">
              {isTa ? 'மகளிர் சுய உதவிக் குழு இயக்கம்' : "Built for Rural Women's SHG"}
            </span>
            <span className="header__brand-tagline tamil">
              TrustPass Digital Savings & Loan Management
            </span>
          </span>
        </button>

        {/* ── Right side controls ── */}
        <div className="header__controls">
          {/* User state */}
          {currentUser ? (
            <div className="header__user-state">
              <div className="header__user-pill">
                {currentUser.role === 'SUPER_ADMIN' ? (
                  <Shield size={14} color="#15803d" />
                ) : (
                  <User size={14} color="#15803d" />
                )}
                <div style={{ lineHeight: 1.15 }}>
                  <div className="header__user-name tamil">{currentUser.full_name}</div>
                  <div className="header__user-role">
                    {currentUser.role === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : currentUser.role === 'GROUP_ADMIN'
                      ? 'Group Admin'
                      : 'Member'}
                    {currentUser.group_name && ` · ${currentUser.group_name}`}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary header__btn-logout tamil"
                onClick={onLogoutClick}
                title={isTa ? 'வெளியேறு' : 'Log Out'}
              >
                <LogOut size={14} />
                <span>{isTa ? 'வெளியேறு' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="header__auth-actions">
              <button
                className="header__auth-link tamil"
                onClick={() => onLoginClick('login')}
                id="header-user-login-btn"
              >
                <LogIn size={14} />
                <span>{isTa ? 'உள்நுழைவு' : 'User Login'}</span>
              </button>

              <button
                className="header__auth-link header__auth-link--highlight tamil"
                onClick={() => onLoginClick('register')}
                id="header-user-register-btn"
              >
                <UserPlus size={14} />
                <span>{isTa ? 'புதிய பதிவு' : 'User Registration'}</span>
              </button>

              <button
                className="header__auth-link tamil"
                onClick={() => onLoginClick('admin')}
                id="header-admin-login-btn"
              >
                <Lock size={13} />
                <span>{isTa ? 'நிர்வாகி' : 'Admin Login'}</span>
              </button>
            </div>
          )}

          {/* Language switcher */}
          <button
            className="lang-toggle"
            onClick={onLangToggle}
            aria-label="Toggle language between Tamil and English"
            title="Switch Language / மொழியை மாற்றவும்"
          >
            <span className={isTa ? 'lang-toggle__active' : 'lang-toggle__inactive'}>
              தமிழ்
            </span>
            <span className="lang-toggle__sep">|</span>
            <span className={!isTa ? 'lang-toggle__active' : 'lang-toggle__inactive'}>
              EN
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
