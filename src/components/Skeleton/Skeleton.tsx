import React from 'react'
import './Skeleton.css'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ className = '', width, height, borderRadius, style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-base ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonMetric({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-metrics-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-metric-card">
          <Skeleton width="40%" height="14px" borderRadius="4px" />
          <Skeleton width="60%" height="28px" borderRadius="6px" style={{ margin: '12px 0 8px' }} />
          <Skeleton width="80%" height="12px" borderRadius="4px" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-card-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card__header">
            <Skeleton width="36px" height="36px" borderRadius="50%" />
            <div style={{ flex: 1, marginLeft: '12px' }}>
              <Skeleton width="50%" height="16px" borderRadius="4px" />
              <Skeleton width="30%" height="12px" borderRadius="4px" style={{ marginTop: '6px' }} />
            </div>
          </div>
          <Skeleton width="100%" height="48px" borderRadius="6px" style={{ margin: '14px 0' }} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Skeleton width="80px" height="32px" borderRadius="6px" />
            <Skeleton width="80px" height="32px" borderRadius="6px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-table-wrapper">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${80 / cols}%`} height="16px" borderRadius="4px" />
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="skeleton-table-row">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} width={c === 0 ? '70%' : c === cols - 1 ? '50%' : '60%'} height="14px" borderRadius="4px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GlobalSpinner({
  message = 'Loading data...',
  tamilMessage = 'தரவுகள் ஏற்றப்படுகிறது...',
  lang = 'ta',
}: {
  message?: string
  tamilMessage?: string
  lang?: 'ta' | 'en'
}) {
  return (
    <div className="global-spinner-container" role="status" aria-live="polite">
      <div className="global-spinner">
        <div className="global-spinner__circle" />
      </div>
      <p className="global-spinner__text tamil">
        {lang === 'ta' ? tamilMessage : message}
      </p>
    </div>
  )
}
