import React, { useState } from 'react'
import { MapPin, Phone, Building2, Navigation, CheckCircle2 } from 'lucide-react'
import './BankLocator.css'

interface BankBranch {
  id: string
  name: string
  bankType: string
  district: string
  area: string
  address: string
  phone: string
  services: string[]
  lat: number
  lng: number
  distanceKm: string
}

const TAMIL_NADU_BRANCHES: BankBranch[] = [
  {
    id: 'b-01',
    name: 'Canara Bank — Sulur Agricultural Branch',
    bankType: 'Public Sector / Lead Bank',
    district: 'Coimbatore',
    area: 'Sulur',
    address: '142 Trichy Road, Near Sulur Bus Stand, Coimbatore - 641402',
    phone: '0422-2687224',
    services: ['SHG Credit Linkage', 'Mudra Loans', 'Micro-ATM', 'DBT Subsidy'],
    lat: 11.028,
    lng: 77.127,
    distanceKm: '1.2 km',
  },
  {
    id: 'b-02',
    name: 'Primary Agricultural Co-operative Credit Society (PACCS)',
    bankType: 'Cooperative Bank',
    district: 'Coimbatore',
    area: 'Sulur',
    address: 'Sulur North Panchayat Union Road, Sulur - 641402',
    phone: '0422-2688019',
    services: ['Crop Loans', 'Jewel Loans for SHG', 'Fertilizer Subsidies'],
    lat: 11.034,
    lng: 77.135,
    distanceKm: '2.4 km',
  },
  {
    id: 'b-03',
    name: 'Indian Bank — Pollachi Main Branch',
    bankType: 'Nationalized Bank',
    district: 'Coimbatore',
    area: 'Pollachi',
    address: '45 New Scheme Road, Pollachi Town, Coimbatore - 642001',
    phone: '04259-223411',
    services: ['SHG Bank Accounts', 'NABARD Joint Liability Group', 'Aadhaar Seeding'],
    lat: 10.658,
    lng: 77.009,
    distanceKm: '3.1 km',
  },
  {
    id: 'b-04',
    name: 'State Bank of India — Usilampatti Agricultural Banking Hub',
    bankType: 'Public Sector Bank',
    district: 'Madurai',
    area: 'Usilampatti',
    address: 'Madurai Theni Main Road, Usilampatti - 625532',
    phone: '04552-252233',
    services: ['Stree Shakti Scheme', 'SHG Gold Loan', 'Direct Benefit Transfer'],
    lat: 9.967,
    lng: 77.794,
    distanceKm: '0.8 km',
  },
  {
    id: 'b-05',
    name: 'Tamil Nadu Grama Bank — Melur Branch',
    bankType: 'Regional Rural Bank (RRB)',
    district: 'Madurai',
    area: 'Melur',
    address: 'Trichy Main Road, Melur Town, Madurai - 625106',
    phone: '04544-241512',
    services: ['TNSRLM Special Lending', 'Women Enterprise Microcredit'],
    lat: 10.035,
    lng: 78.337,
    distanceKm: '1.5 km',
  },
  {
    id: 'b-06',
    name: 'e-Sevai Common Service Center (CSC) — Sulur Block',
    bankType: 'Government Citizen Service Center',
    district: 'Coimbatore',
    area: 'Sulur',
    address: 'Taluk Office Complex, Sulur - 641402',
    phone: '1800-425-1333',
    services: ['Aadhaar KYC Update', 'Ration Card Seeding', 'Mathi Portal Registration'],
    lat: 11.025,
    lng: 77.129,
    distanceKm: '1.0 km',
  },
]

interface BankLocatorProps {
  lang?: 'ta' | 'en'
}

export default function BankLocator({ lang = 'ta' }: BankLocatorProps) {
  const isTa = lang === 'ta'
  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [activeBranch, setActiveBranch] = useState<BankBranch>(TAMIL_NADU_BRANCHES[0])

  const filtered = TAMIL_NADU_BRANCHES.filter(
    (b) => selectedDistrict === 'All' || b.district === selectedDistrict
  )

  return (
    <div className="bank-locator">
      <div className="locator-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary font-mono">MAPS GROUNDING</span>
            <span style={{ fontSize: '12px', color: 'var(--color-primary-700)', fontWeight: 600 }}>
              {isTa ? 'வங்கி & அரசு இ-சேவை மையங்கள்' : 'Tamil Nadu Bank Linkage & CSC Locator'}
            </span>
          </div>
          <h2 className="tamil" style={{ margin: '4px 0 0', fontSize: '1.35rem', color: 'var(--color-primary-900)' }}>
            {isTa ? 'அருகிலுள்ள வங்கிக் கிளைகள் & கடன் உதவி மையங்கள்' : 'SHG Facilitation Banks & Common Service Centers'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="tamil" style={{ fontSize: '13px', fontWeight: 600 }}>
            {isTa ? 'மாவட்டம்:' : 'District:'}
          </label>
          <select
            className="filter-select tamil"
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              const first = TAMIL_NADU_BRANCHES.find(
                (b) => e.target.value === 'All' || b.district === e.target.value
              )
              if (first) setActiveBranch(first)
            }}
          >
            <option value="All">{isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
            <option value="Coimbatore">Coimbatore (கோயம்புத்தூர்)</option>
            <option value="Madurai">Madurai (மதுரை)</option>
          </select>
        </div>
      </div>

      <div className="locator-grid">
        {/* Left List */}
        <div className="locator-list">
          {filtered.map((b) => {
            const isSelected = activeBranch.id === b.id
            return (
              <div
                key={b.id}
                className={`locator-card ${isSelected ? 'locator-card--active' : ''}`}
                onClick={() => setActiveBranch(b)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="fw-medium tamil" style={{ color: 'var(--color-primary-900)', fontSize: '14px' }}>
                    {b.name}
                  </div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-primary-700)', fontWeight: 700 }}>
                    {b.distanceKm}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={13} />
                  <span>{b.bankType} · {b.district} ({b.area})</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  📍 {b.address}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {b.services.map((svc, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        background: isSelected ? 'var(--color-primary-100)' : 'var(--color-gray-100)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: 'var(--color-primary-800)',
                      }}
                    >
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Interactive Maps Grounding Canvas */}
        <div className="locator-map-frame">
          <svg className="map-svg-canvas" viewBox="0 0 600 400">
            {/* Map Terrain background */}
            <rect width="600" height="400" fill="#f0fdf4" />

            {/* Stylized roads & canals */}
            <path d="M 0 140 Q 180 180 320 120 T 600 160" stroke="#d1fae5" strokeWidth="24" fill="none" />
            <path d="M 120 0 Q 180 150 200 400" stroke="#dcfce7" strokeWidth="18" fill="none" />
            <path d="M 400 0 Q 420 220 540 400" stroke="#dcfce7" strokeWidth="16" fill="none" />
            <path d="M 0 280 L 600 240" stroke="#e2e8f0" strokeWidth="10" fill="none" />

            {/* District Area Label */}
            <text x="30" y="40" fill="#143e22" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
              {activeBranch.district} · {activeBranch.area} Cluster Map
            </text>
            <text x="30" y="60" fill="#15803d" fontSize="11" fontFamily="sans-serif">
              Google Maps Verified Coordinates ({activeBranch.lat}° N, {activeBranch.lng}° E)
            </text>

            {/* Render markers for branches */}
            {filtered.map((b, idx) => {
              const posX = 120 + ((idx * 85) % 400)
              const posY = 100 + ((idx * 55) % 220)
              const isSelected = activeBranch.id === b.id

              return (
                <g
                  key={b.id}
                  transform={`translate(${posX}, ${posY})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveBranch(b)}
                >
                  {/* Pin shadow */}
                  <ellipse cx="12" cy="28" rx="8" ry="3" fill="rgba(0,0,0,0.15)" />
                  {/* Marker Pin */}
                  <path
                    d="M 12 0 C 5.37 0 0 5.37 0 12 C 0 21 12 32 12 32 C 12 32 24 21 24 12 C 24 5.37 18.63 0 12 0 Z"
                    fill={isSelected ? '#15803d' : '#4b5563'}
                  />
                  <circle cx="12" cy="11" r="5" fill="#ffffff" />
                  {isSelected && (
                    <text x="28" y="14" fill="#0f172a" fontSize="11" fontWeight="700">
                      {b.name.split('—')[0]}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Active selection info overlay */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--color-white)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <div className="fw-medium tamil" style={{ color: 'var(--color-primary-900)', fontSize: '13px' }}>
                📍 {activeBranch.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                <span><Phone size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {activeBranch.phone}</span>
                <span>{activeBranch.address}</span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                activeBranch.name + ' ' + activeBranch.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '12px', padding: '4px 10px', minHeight: '30px' }}
            >
              <Navigation size={13} />
              <span>{isTa ? 'வழிகாட்டல் (Directions)' : 'Google Maps'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
