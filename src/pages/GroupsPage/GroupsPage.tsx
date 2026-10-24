import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { groupsApi, districtsApi } from '../../services/api'
import Modal from '../../components/Modal/Modal'
import { SkeletonCard } from '../../components/Skeleton/Skeleton'
import { SHGGroup, GroupCreateInput, UserAccount } from '../../types'
import { Search, Filter, Users, MapPin, Calendar, Activity, Plus, ShieldCheck, X } from 'lucide-react'
import './GroupsPage.css'

interface GroupsPageProps {
  lang?: 'ta' | 'en'
  currentUser?: UserAccount | null
  onSelectGroup?: (group: SHGGroup) => void
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const EMPTY_FORM: GroupCreateInput = {
  name: '',
  registration_number: '',
  village: '',
  area: '',
  district: '',
  state: 'Tamil Nadu',
  meeting_day: 'Monday',
  group_limit: 50000,
}

export default function GroupsPage({
  lang = 'ta',
  currentUser,
  onSelectGroup,
}: GroupsPageProps) {
  const isTa = lang === 'ta'
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  const [groups, setGroups] = useState<SHGGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [selectedArea, setSelectedArea] = useState('ALL')

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupsApi.list()
      setGroups(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Extract unique districts and areas for dropdowns
  const availableDistricts = useMemo(() => {
    const set = new Set<string>()
    groups.forEach((g) => {
      if (g.district) set.add(g.district)
    })
    return Array.from(set).sort()
  }, [groups])

  const availableAreas = useMemo(() => {
    const set = new Set<string>()
    groups.forEach((g) => {
      if (selectedDistrict === 'ALL' || g.district.toLowerCase() === selectedDistrict.toLowerCase()) {
        if (g.area) set.add(g.area)
      }
    })
    return Array.from(set).sort()
  }, [groups, selectedDistrict])

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchDistrict = selectedDistrict === 'ALL' || g.district.toLowerCase() === selectedDistrict.toLowerCase()
      const matchArea = selectedArea === 'ALL' || g.area.toLowerCase() === selectedArea.toLowerCase()
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.village.toLowerCase().includes(q) ||
        g.district.toLowerCase().includes(q) ||
        (g.group_admin_name && g.group_admin_name.toLowerCase().includes(q))
      return matchDistrict && matchArea && matchSearch
    })
  }, [groups, selectedDistrict, selectedArea, searchQuery])

  const handleGroupClick = (group: SHGGroup) => {
    // Permission check:
    // Super Admin can view all
    // Group Admin can view only assigned group
    // Member can view only assigned group
    if (isSuperAdmin) {
      onSelectGroup?.(group)
      return
    }

    if (currentUser?.group_id === group.id) {
      onSelectGroup?.(group)
    } else {
      setPermissionNotice(
        isTa
          ? `அணுகல் கட்டுப்பாடு: நீங்கள் '${group.name}' குழுவின் உறுப்பினர் அல்ல. உங்கள் சொந்த குழுவின் தகவல்களை மட்டுமே பார்வையிட முடியும்.`
          : `Restricted Access: You are not a registered member of '${group.name}'. Members can view their assigned group only.`
      )
      setTimeout(() => setPermissionNotice(null), 4000)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('ALL')
    setSelectedArea('ALL')
  }

  return (
    <div className="groups-page">
      {/* Header with directory information */}
      <div className="page-header">
        <div>
          <span className="page-pre-tag tamil">
            {isTa ? 'சுய உதவிக் குழு கோப்பகம்' : 'SHG Directory'}
          </span>
          <h1 className="page-title tamil">
            {isTa ? 'சுய உதவிக் குழுக்கள்' : 'Self-Help Groups'}
          </h1>
          <p className="page-subtitle tamil">
            {isTa
              ? 'தமிழ்நாடு மாநில அரசால் பதிவு செய்யப்பட்டு நிர்வாகியால் உருவாக்கப்பட்ட மகளிர் சுய உதவிக் குழுக்கள்'
              : 'Official Women Self-Help Groups across Tamil Nadu created and managed by the Main Administrator.'}
          </p>
        </div>
      </div>

      {/* ── Search Bar & Filter Dropdowns ── */}
      <div className="groups-filter-toolbar">
        <div className="filter-search-box">
          <Search size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input tamil"
            placeholder={
              isTa
                ? 'குழு பெயர், குறியீடு, கிராமம், அல்லது நிர்வாகி பெயர் கொண்டு தேடுக...'
                : 'Search by group name, code, village, or admin...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns-row">
          <div className="filter-select-wrap">
            <Filter size={14} className="filter-select-icon" />
            <select
              className="filter-select tamil"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value)
                setSelectedArea('ALL')
              }}
              aria-label="Filter by district"
            >
              <option value="ALL">
                {isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}
              </option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <select
              className="filter-select tamil"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Filter by area"
            >
              <option value="ALL">
                {isTa ? 'அனைத்து பகுதிகள்' : 'All Areas / Blocks'}
              </option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedDistrict !== 'ALL' || selectedArea !== 'ALL') && (
            <button
              type="button"
              className="btn btn-text tamil filter-reset-link"
              onClick={clearFilters}
            >
              {isTa ? 'வடிகட்டிகளை அழிக்க' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Results counter */}
      <div className="groups-count-bar">
        <span className="groups-count-text tamil">
          {isTa
            ? `காட்டப்படும் குழுக்கள்: ${filteredGroups.length} / மொத்தம்: ${groups.length}`
            : `Showing ${filteredGroups.length} of ${groups.length} groups`}
        </span>
      </div>

      {/* ── Content States ── */}
      {loading && <SkeletonCard count={4} />}

      {error && !loading && (
        <div className="state-msg state-msg--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredGroups.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h3 className="empty-state__title tamil">
            {isTa ? 'பொருத்தமான குழுக்கள் எதுவும் இல்லை' : 'No matching SHG groups found'}
          </h3>
          <p className="empty-state__desc tamil">
            {isTa
              ? 'உங்கள் தேடல் சொற்கள் அல்லது மாவட்ட வடிகட்டியை மாற்றி முயற்சிக்கவும்.'
              : 'Try adjusting your search query or selecting a different district/area.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary tamil"
            onClick={clearFilters}
            style={{ marginTop: '12px' }}
          >
            {isTa ? 'அனைத்து குழுக்களையும் காட்டு' : 'Show All Groups'}
          </button>
        </div>
      )}

      {/* ── Groups Cards Grid ── */}
      {!loading && !error && filteredGroups.length > 0 && (
        <div className="groups-grid" role="list">
          {filteredGroups.map((group) => {
            const health = groupsApi.getFinancialHealth(group)
            return (
              <div
                key={group.id}
                className="group-card"
                role="listitem"
                onClick={() => onSelectGroup?.(group)}
              >
                <div className="group-card__header">
                  <div className="group-card__header-text">
                    <span className="group-card__code font-mono">{group.code}</span>
                    <h3 className="group-card__name tamil">{group.name}</h3>
                  </div>
                  <span className="health-score-badge" title={health.explanation}>
                    <Activity size={12} />
                    <span>{health.total_score}/100</span>
                  </span>
                </div>

                <div className="group-card__details">
                  <div className="group-card__detail-row">
                    <MapPin size={14} className="detail-icon" />
                    <span className="detail-text tamil">
                      {group.village}, {group.district}
                    </span>
                  </div>

                  <div className="group-card__detail-row">
                    <Users size={14} className="detail-icon" />
                    <span className="detail-text tamil">
                      {group.member_count} {isTa ? 'உறுப்பினர்கள்' : 'Members'}
                      {group.group_admin_name && (
                        <span className="group-admin-tag">
                          · {isTa ? 'நிர்வாகி: ' : 'Admin: '}
                          {group.group_admin_name}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="group-card__detail-row">
                    <Calendar size={14} className="detail-icon" />
                    <span className="detail-text tamil">
                      {isTa ? 'கூட்ட நாள்: ' : 'Meeting: '}
                      {group.meeting_day}
                    </span>
                  </div>
                </div>

                {group.description && (
                  <p className="group-card__desc tamil">{group.description}</p>
                )}

                <div className="group-card__footer">
                  <div className="group-card__savings">
                    <span className="savings-label tamil">
                      {isTa ? 'சேமிப்பு இருப்பு' : 'Savings Pool'}
                    </span>
                    <span className="savings-value font-mono">
                      ₹{group.current_savings.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm tamil group-card__view-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectGroup?.(group)
                    }}
                  >
                    {isTa ? 'உறுப்பினர்கள் →' : 'View Members →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Super Admin Group Create Modal ── */}
      {showModal && isSuperAdmin && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={isTa ? 'புதிய குழு உருவாக்கு (Super Admin)' : 'Create New SHG Group'}
          lang={lang}
        >
          <form onSubmit={handleSubmit} className="form">
            {formError && (
              <div className="form__error tamil" role="alert">
                {formError}
              </div>
            )}

            <div className="form__field">
              <label className="form__label tamil" htmlFor="grp-name">
                {isTa ? 'குழு பெயர் *' : 'Group Name *'}
              </label>
              <input
                id="grp-name"
                name="name"
                className="form__input tamil"
                value={form.name}
                onChange={handleChange}
                placeholder={isTa ? 'எ.கா. அன்னை தெரசா மகளிர் மன்றம்' : 'e.g. Annai Therasa SHG'}
                required
              />
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-district">
                  {isTa ? 'மாவட்டம் *' : 'District *'}
                </label>
                <input
                  id="grp-district"
                  name="district"
                  className="form__input tamil"
                  value={form.district || ''}
                  onChange={handleChange}
                  placeholder="Coimbatore"
                  required
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-area">
                  {isTa ? 'வட்டார பகுதி (Area) *' : 'Area / Block *'}
                </label>
                <input
                  id="grp-area"
                  name="area"
                  className="form__input tamil"
                  value={form.area || ''}
                  onChange={handleChange}
                  placeholder="Sulur"
                  required
                />
              </div>
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-village">
                  {isTa ? 'கிராமம் *' : 'Village Name *'}
                </label>
                <input
                  id="grp-village"
                  name="village"
                  className="form__input tamil"
                  value={form.village || ''}
                  onChange={handleChange}
                  placeholder="Sulur North"
                  required
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-day">
                  {isTa ? 'கூட்ட நாள் *' : 'Meeting Day *'}
                </label>
                <select
                  id="grp-day"
                  name="meeting_day"
                  className="form__input"
                  value={form.meeting_day || 'Monday'}
                  onChange={handleChange}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form__row">
              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-reg">
                  {isTa ? 'பதிவு எண்' : 'Registration Number'}
                </label>
                <input
                  id="grp-reg"
                  name="registration_number"
                  className="form__input font-mono"
                  value={form.registration_number || ''}
                  onChange={handleChange}
                  placeholder="TN/CBE/2026/01"
                />
              </div>

              <div className="form__field">
                <label className="form__label tamil" htmlFor="grp-limit">
                  {isTa ? 'கடன் வரம்பு (₹)' : 'Max Request Limit (₹)'}
                </label>
                <input
                  id="grp-limit"
                  name="group_limit"
                  type="number"
                  className="form__input font-mono"
                  value={form.group_limit || 50000}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form__actions">
              <button
                type="button"
                className="btn btn-secondary tamil"
                onClick={closeModal}
              >
                {isTa ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary tamil"
                disabled={saving}
              >
                {saving ? (isTa ? 'சேமிக்கிறது...' : 'Saving...') : (isTa ? 'உருவாக்கு' : 'Create Group')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
