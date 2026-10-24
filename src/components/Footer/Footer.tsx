/**
 * src/components/Footer/Footer.tsx
 * ----------------------------------
 * Application footer with App Name, Contact Information, and Copyright Notice,
 * supporting bilingual Tamil and English copy.
 */

import React from 'react'
import { Phone, Mail, MapPin, ShieldCheck, ExternalLink } from 'lucide-react'
import './Footer.css'

interface FooterProps {
  lang?: 'ta' | 'en'
}

export default function Footer({ lang = 'ta' }: FooterProps) {
  const isTa = lang === 'ta'

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="site-footer__grid">
          {/* Column 1: App Name & Mission */}
          <div className="site-footer__brand-col">
            <div className="site-footer__logo-lockup">
              <svg
                className="site-footer__logo-icon"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
                  fill="url(#footerShieldGrad)"
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
                    id="footerShieldGrad"
                    x1="5"
                    y1="3"
                    x2="35"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#22c55e" />
                    <stop offset="1" stopColor="#143e22" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <div className="site-footer__title">
                  {isTa
                    ? 'மகளிர் சுய உதவிக் குழு மேலாண்மை'
                    : "Built for Rural Women's Self-Help Groups"}
                </div>
                <div className="site-footer__subtitle">
                  TrustPass SHG Digital Platform
                </div>
              </div>
            </div>

            <p className="site-footer__desc tamil">
              {isTa
                ? 'கிராமப்புற மகளிர் சுய உதவிக் குழுக்களின் நிதி சேமிப்பு, கடன் பதிவேடு, மற்றும் வரவு செலவுகளை வெளிப்படையாகவும் பாதுகாப்பாகவும் நிர்வகிக்கும் டிஜிட்டல் தளம்.'
                : 'A secure, offline-first digital savings, loan tracking, and bookkeeping platform engineered specifically for rural women Self-Help Groups in Tamil Nadu.'}
            </p>

            <div className="site-footer__trust-badge">
              <ShieldCheck size={16} />
              <span>
                {isTa
                  ? 'பாதுகாப்பான நிதி பதிவுகள் & ஆடிட் தணிக்கை'
                  : 'Tamper-Evident Ledger & Audit Verifiable'}
              </span>
            </div>
          </div>

          {/* Column 2: Government & Scheme Links */}
          <div>
            <h3 className="site-footer__heading tamil">
              {isTa ? 'அரசு திட்டங்கள்' : 'Schemes & Portals'}
            </h3>
            <ul className="site-footer__links">
              <li>
                <a
                  href="https://www.mathi.tn.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link tamil"
                >
                  {isTa ? 'மதி மகளிர் இயக்கம் (TNSRLM)' : 'Mathi (TNSRLM) Portal'}
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nabard.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link tamil"
                >
                  {isTa ? 'நபார்டு வங்கி இணைப்பு திட்டம்' : 'NABARD SHG-Bank Linkage'}
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://nrlm.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link tamil"
                >
                  {isTa ? 'தேசிய ஊரக வாழ்வாதார இயக்கம்' : 'National Livelihood Mission'}
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="#schemes" className="site-footer__link tamil">
                  {isTa ? 'கடன் வட்டி மானிய வழிகாட்டி' : 'Interest Subvention Guide'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="site-footer__heading tamil">
              {isTa ? 'தொடர்பு தகவல்' : 'Contact Information'}
            </h3>
            <ul className="site-footer__contact-list">
              <li className="site-footer__contact-item">
                <Phone className="site-footer__contact-icon" />
                <div>
                  <div style={{ color: '#8da496', fontSize: '11px' }}>
                    {isTa ? 'கட்டணமில்லா உதவி எண்' : 'Toll-Free Helpline'}
                  </div>
                  <a href="tel:18004254673" className="font-mono">
                    1800-425-4673
                  </a>
                </div>
              </li>
              <li className="site-footer__contact-item">
                <Phone className="site-footer__contact-icon" />
                <div>
                  <div style={{ color: '#8da496', fontSize: '11px' }}>
                    {isTa ? 'சென்னை தலைமை அலுவலகம்' : 'Chennai Head Office'}
                  </div>
                  <a href="tel:+914424321768" className="font-mono">
                    +91 44 2432 1768
                  </a>
                </div>
              </li>
              <li className="site-footer__contact-item">
                <Mail className="site-footer__contact-icon" />
                <div>
                  <div style={{ color: '#8da496', fontSize: '11px' }}>
                    {isTa ? 'மின்னஞ்சல் முகவரி' : 'Support Desk'}
                  </div>
                  <a href="mailto:support.shg@tn.gov.in" className="font-mono">
                    support.shg@tn.gov.in
                  </a>
                </div>
              </li>
              <li className="site-footer__contact-item">
                <MapPin className="site-footer__contact-icon" />
                <div className="tamil" style={{ color: '#c2d6ca' }}>
                  {isTa
                    ? 'ஊரக வளர்ச்சி & பஞ்சாயத்து ராஜ் இயக்ககம், பனகல் மாளிகை, சைதாப்பேட்டை, சென்னை - 600015.'
                    : 'Directorate of Rural Development & Panchayat Raj, Panagal Building, Saidapet, Chennai - 600015.'}
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Assistance */}
          <div>
            <h3 className="site-footer__heading tamil">
              {isTa ? 'உதவி & ஆதரவு' : 'Support & Rights'}
            </h3>
            <ul className="site-footer__links">
              <li>
                <span className="site-footer__link tamil">
                  {isTa ? 'ஆதார்/வங்கி இணைப்பு உதவி' : 'Aadhaar / Bank Seeding'}
                </span>
              </li>
              <li>
                <span className="site-footer__link tamil">
                  {isTa ? 'குழு குறைதீர்ப்பு பிரிவு' : 'Grievance Redressal Desk'}
                </span>
              </li>
              <li>
                <span className="site-footer__link tamil">
                  {isTa ? 'தனிநபர் தகவல் பாதுகாப்பு' : 'Member Privacy Rights'}
                </span>
              </li>
              <li>
                <span className="site-footer__link tamil">
                  {isTa ? 'ஆஃப்லைன் ஒத்திசைவு கையேடு' : 'Offline Sync Guide'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice and legal disclaimer */}
        <div className="site-footer__bottom">
          <div className="tamil">
            © 2026 Built for Rural Women's Self-Help Groups (TrustPass SHG).{' '}
            {isTa
              ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. கிராமப்புற மகளிர் முன்னேற்றத்திற்காக உருவாக்கப்பட்டது.'
              : 'All rights reserved. Dedicated to rural women empowerment in Tamil Nadu and across India.'}
          </div>
          <ul className="site-footer__bottom-links">
            <li>
              <a href="#privacy">{isTa ? 'தனியுரிமை' : 'Privacy Policy'}</a>
            </li>
            <li>
              <a href="#terms">{isTa ? 'விதிமுறைகள்' : 'Terms of Use'}</a>
            </li>
            <li>
              <a href="#security">{isTa ? 'பாதுகாப்பு' : 'Security Standards'}</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
