/**
 * src/components/StatusBar/StatusBar.tsx
 * ----------------------------------------
 * Shows a status bar at the top indicating whether the browser
 * currently has an internet connection (Online / Offline).
 */

import { useState, useEffect } from 'react'
import './StatusBar.css'

export default function StatusBar() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <div
      className={`status-bar ${isOnline ? 'status-bar--online' : 'status-bar--offline'}`}
      role="status"
      aria-live="polite"
      aria-label={
        isOnline
          ? 'இணையம் இணைக்கப்பட்டுள்ளது'
          : 'இணையம் இல்லை — ஆஃப்லைன் பயன்முறை'
      }
    >
      <span className="status-bar__dot" aria-hidden="true" />
      <span className="status-bar__text tamil">
        {isOnline ? '🌐 நேரடி இணைப்பு' : '📵 ஆஃப்லைன் பயன்முறை'}
      </span>
      <span className="status-bar__text-en">
        {isOnline ? 'Online' : 'Offline — changes saved locally'}
      </span>
    </div>
  )
}
