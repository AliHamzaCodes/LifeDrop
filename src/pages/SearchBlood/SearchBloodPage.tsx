import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './SearchBloodPage.scss';
import AppSpinner from '../../components/AppSpinner/AppSpinner';
import { fetchDonors } from '../../api/services';
import usePageTitle from '../../hooks/usePageTitle';

import { BLOOD_GROUPS, isCompatibleDonor, parseBloodGroupQuery } from '../../constants/blood';
import { calculateDistance } from '../../utils/distance';
import { useAuth } from '../../context/AuthContext';
import { formatKm } from '../../constants/pakistan';
import { getAvatarColor } from '../../utils/avatar';
import { DONOR_STATUS, isDonorOnCooldown } from '../../utils/status';
import EmptyState from '../../components/EmptyState/EmptyState';
import DonorMap from '../../components/DonorMap/DonorMap';

const PAGE_SIZE = 6;

const parseLastDonatedToMonths = (str) => {
  if (!str) return 999;
  const match = str.toLowerCase().match(/^(\d+)\s+(month|year)s?\s+ago$/);
  if (!match) return 999;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'year') return value * 12;
  return value;
};

// -------------------------------------------------------------------------------------------------
const DonorCard = ({ donor, isBestMatch }) => {
  const isVerified = donor.status === DONOR_STATUS.verified;

  return (
    <article className="donor-card" id={`donor-card-${donor.id}`} aria-label={`Donor: ${donor.name}`} style={{ position: 'relative' }}>
      {isBestMatch && (
        <div style={{
          position: 'absolute', top: '-12px', right: '-12px', background: 'linear-gradient(135deg, #f59e0b, #eab308)', 
          color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, 
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          ✨ Best Match
        </div>
      )}
      <div className="donor-card__header">
        {/* Avatar */}
        <div
          className="donor-card__avatar"
          style={{ background: getAvatarColor(donor.id) }}
          aria-hidden="true"
        >
          {donor.avatar}
        </div>

        {/* Info */}
        <div className="donor-card__info">
          <h3 className="donor-card__name">{donor.name}</h3>
          <div className={`donor-card__status ${isVerified ? 'donor-card__status--verified' : 'donor-card__status--pending'}`}>
            <svg viewBox="0 0 24 24" className="donor-card__status-icon" aria-hidden="true">
              {isVerified
                ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
                : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              }
            </svg>
            {isVerified ? 'Verified Donor' : 'Pending Verification'}
          </div>
        </div>

        {/* Blood Group Badge */}
        <div className={`donor-card__badge ${isVerified ? 'donor-card__badge--verified' : 'donor-card__badge--pending'}`}>
          {isVerified && (
            <svg viewBox="0 0 24 24" className="donor-card__badge-drop" aria-hidden="true">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          )}
          {donor.bloodGroup}
        </div>
      </div>

      {/* Gamification Badges */}
      {donor.badges && donor.badges.length > 0 && (
        <div className="donor-card__gamification" style={{ display: 'flex', gap: '8px', padding: '0 20px', marginTop: '12px' }}>
          {donor.badges.map((badge, idx) => {
            const colors = {
              'BRONZE_DONOR': { bg: '#cd7f32', color: '#fff' },
              'SILVER_DONOR': { bg: '#c0c0c0', color: '#333' },
              'GOLD_DONOR': { bg: '#ffd700', color: '#333' },
              'LIFE_SAVER': { bg: '#ff4d4f', color: '#fff' },
            };
            const theme = colors[badge.badge_type] || { bg: '#eee', color: '#333' };
            const label = badge.badge_type.replace('_', ' ');
            return (
              <span key={idx} style={{ 
                background: theme.bg, color: theme.color, 
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                {label}
              </span>
            );
          })}
        </div>
      )}

      <div className="donor-card__meta">
        {/* Location */}
        <div className="donor-card__meta-row">
          <svg viewBox="0 0 24 24" className="donor-card__meta-icon" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{donor.city} &bull; <strong>{formatKm(donor.km ?? donor.miles)}</strong></span>
        </div>

        {/* Last donated */}
        <div className="donor-card__meta-row">
          <svg viewBox="0 0 24 24" className="donor-card__meta-icon" aria-hidden="true">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L11 14V7h1.5v6.25l4.5 2.67-1.77 1.08z"/>
          </svg>
          <span>Last donated: <strong>{donor.lastDonated}</strong></span>
        </div>
      </div>

      {/* CTA */}
      <div className="donor-card__actions">
        {donor.status === DONOR_STATUS.verified && donor.phone ? (
          <a
            href={`tel:${donor.phone}`}
            className="donor-card__call-btn"
            id={`call-donor-${donor.id}`}
            aria-label={`Call ${donor.name}`}
          >
            <svg viewBox="0 0 24 24" className="donor-card__call-icon" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Call Donor
          </a>
        ) : (
          <button
            className="donor-card__call-btn"
            id={`call-donor-${donor.id}`}
            disabled
            title="Contact unavailable until donor is verified"
          >
            <svg viewBox="0 0 24 24" className="donor-card__call-icon" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Unavailable
          </button>
        )}
        <Link
          to={`/donor/${donor.name}`}
          className="donor-card__call-btn donor-card__call-btn--secondary"
          id={`view-profile-${donor.id}`}
          aria-label={`View profile of ${donor.name}`}
        >
          View Profile
        </Link>
      </div>
    </article>
  );
};

const SearchBloodPage = () => {
  usePageTitle('Find a Donor');
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(queryParam);
  const [radius, setRadius] = useState(50); // Default 50 km
  const [selectedGroup, setSelectedGroup] = useState('');
  const [matchMode, setMatchMode] = useState('compatible'); // compatible | exact
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'recent'
  const [viewMode, setViewMode] = useState('list'); // list | map
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [showSortMenu, setShowSortMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = queryParam.trim();
    const groupFromQuery = parseBloodGroupQuery(q);
    if (groupFromQuery) {
      setSelectedGroup(groupFromQuery);
      setLocation('');
    } else {
      setLocation(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    };
    if (showSortMenu) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showSortMenu]);

  useEffect(() => {
    const loadDonors = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDonors();
        if (currentUser?.latitude && currentUser?.longitude) {
          data.results.forEach(d => {
            d.km = calculateDistance(currentUser.latitude, currentUser.longitude, d.latitude, d.longitude);
          });
        }
        setDonors(data.results || data);
      } catch {
        setError('Could not load donors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDonors();
  }, []);

  // Filter & sort donors
  const filteredDonors = useMemo(() => {
    let list = donors.filter(d => !isDonorOnCooldown(d.lastDonated));

    // Filter by radius if km is available
    list = list.filter(d => {
      if (d.km !== undefined && d.km !== null) {
        return d.km <= radius;
      }
      return true; // if no distance data, keep them
    });

    // Filter by blood group (exact or compatible)
    if (selectedGroup) {
      list = list.filter((d) =>
        matchMode === 'exact'
          ? d.bloodGroup === selectedGroup
          : isCompatibleDonor(d.bloodGroup, selectedGroup)
      );
    }

    // Filter by location or name
    if (location.trim()) {
      const q = location.toLowerCase();
      const asGroup = parseBloodGroupQuery(location);
      list = list.filter((d) =>
        d.city.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (asGroup && d.bloodGroup === asGroup)
      );
    }

    // Sort
    if (sortBy === 'distance') {
      list = [...list].sort((a, b) => (a.km ?? a.miles ?? 999) - (b.km ?? b.miles ?? 999));
    } else {
      // Sort by most recently donated
      list = [...list].sort((a, b) => parseLastDonatedToMonths(a.lastDonated) - parseLastDonatedToMonths(b.lastDonated));
    }

    return list;
  }, [donors, location, selectedGroup, sortBy, matchMode, radius]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroup, matchMode, location, sortBy]);

  const totalPages = Math.ceil(filteredDonors.length / PAGE_SIZE);
  const visibleDonors = filteredDonors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortMenu(false);
    setCurrentPage(1);
  };

  const handleGroupToggle = (group) => {
    setSelectedGroup((prev) => (prev === group ? '' : group));
    setCurrentPage(1);
  };

  return (
    <div className="search-page" id="search-blood-page">
      {/* ── Page Hero ─────────────────────────────── */}
      <section className="search-page__hero" aria-labelledby="search-heading">
        <div className="container">
          <h1 className="search-page__title" id="search-heading">
            Find a <span>Donor</span>
          </h1>
          <p className="search-page__subtitle">
            Locate available blood donors in your area instantly. Every drop counts.
          </p>
        </div>
      </section>

      {/* ── Filter Bar ────────────────────────────── */}
      <section className="search-page__filters" aria-label="Filter donors">
        <div className="container">
          <div className="filter-bar">
            {/* Location */}
            <div className="filter-bar__location">
              <label className="filter-bar__label" htmlFor="location-input">Location</label>
              <div className="filter-bar__input-wrap">
                <svg viewBox="0 0 24 24" className="filter-bar__input-icon" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <input
                  id="location-input"
                  type="text"
                  className="filter-bar__input"
                  placeholder="City, donor name, or blood group"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
                  autoComplete="off"
                />
                {location && (
                  <button
                    className="filter-bar__clear"
                    id="clear-location-btn"
                    onClick={() => setLocation('')}
                    aria-label="Clear location"
                  >×</button>
                )}
              </div>
              
              <div style={{ marginTop: '16px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a5568', marginBottom: '8px', fontWeight: 500 }}>
                  <span>Distance: {radius} km</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={radius} 
                  onChange={(e) => { setRadius(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="filter-bar__divider" aria-hidden="true" />

            {/* Blood Group */}
            <div className="filter-bar__groups">
              <label className="filter-bar__label">Blood Group</label>
              <div className="filter-bar__group-btns" role="group" aria-label="Select blood group">
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    id={`filter-group-${group.replace('+', 'pos').replace('-', 'neg')}`}
                    className={`filter-bar__group-btn ${selectedGroup === group ? 'filter-bar__group-btn--active' : ''}`}
                    onClick={() => handleGroupToggle(group)}
                    aria-pressed={selectedGroup === group}
                  >
                    {selectedGroup === group && (
                      <svg viewBox="0 0 24 24" className="filter-bar__drop" aria-hidden="true">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      </svg>
                    )}
                    {group}
                  </button>
                ))}
              </div>
              {selectedGroup && (
                <div className="filter-bar__match" role="group" aria-label="Match mode">
                  <button
                    type="button"
                    className={`filter-bar__group-btn ${matchMode === 'compatible' ? 'filter-bar__group-btn--active' : ''}`}
                    aria-pressed={matchMode === 'compatible'}
                    onClick={() => setMatchMode('compatible')}
                  >
                    Compatible donors
                  </button>
                  <button
                    type="button"
                    className={`filter-bar__group-btn ${matchMode === 'exact' ? 'filter-bar__group-btn--active' : ''}`}
                    aria-pressed={matchMode === 'exact'}
                    onClick={() => setMatchMode('exact')}
                  >
                    Exact type
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ───────────────────────────────── */}
      <section className="search-page__results" aria-label="Donor results">
        <div className="container">
          {/* Results header */}
          <div className="results-header">
            <h2 className="results-header__count" id="results-count">
              Available Donors
              <span className="results-header__badge">{filteredDonors.length}</span>
            </h2>

            {/* Map Toggle & Sort dropdown */}
            <div className="results-header__sort" id="sort-dropdown" ref={dropdownRef} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
                className="results-header__sort-btn"
                style={{ background: viewMode === 'map' ? '#ffe6e6' : 'white' }}
              >
                {viewMode === 'list' ? '🗺️ View Map' : '📋 View List'}
              </button>
              <button
                className="results-header__sort-btn"
                id="sort-toggle-btn"
                onClick={() => setShowSortMenu((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showSortMenu}
              >
                <svg viewBox="0 0 24 24" className="results-header__sort-icon" aria-hidden="true">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
                Sort by {sortBy === 'distance' ? 'Distance' : 'Most Recent'}
                <svg viewBox="0 0 24 24" className={`results-header__chevron ${showSortMenu ? 'results-header__chevron--up' : ''}`} aria-hidden="true">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>

              {showSortMenu && (
                <ul className="results-header__sort-menu" role="listbox" aria-label="Sort options">
                  <li role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={sortBy === 'distance'}
                      className={`results-header__sort-option ${sortBy === 'distance' ? 'results-header__sort-option--active' : ''}`}
                      onClick={() => handleSortSelect('distance')}
                      id="sort-by-distance"
                    >
                      {sortBy === 'distance' && '✓ '}Sort by Distance
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={sortBy === 'recent'}
                      className={`results-header__sort-option ${sortBy === 'recent' ? 'results-header__sort-option--active' : ''}`}
                      onClick={() => handleSortSelect('recent')}
                      id="sort-by-recent"
                    >
                      {sortBy === 'recent' && '✓ '}Most Recent
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <AppSpinner label="Fetching donors..." />
          ) : error ? (
            <EmptyState
              title="Could not load donors"
              message={error}
              actionLabel="Try again"
              onAction={() => window.location.reload()}
            />
          ) : visibleDonors.length > 0 ? (
            <>
              {viewMode === 'map' ? (
                <DonorMap donors={visibleDonors} />
              ) : (
                <div className="donors-grid" id="donors-grid">
                  {visibleDonors.map((donor, idx) => (
                    <DonorCard key={donor.id} donor={donor} isBestMatch={idx === 0 && viewMode === 'list'} />
                  ))}
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && viewMode === 'list' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#374151' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '1rem', color: '#4b5563', fontWeight: 500 }}>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#374151' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="search-page__empty" id="empty-state">
              <div className="search-page__empty-icon" aria-hidden="true">🩸</div>
              <h3>No donors found</h3>
              <p>Try adjusting your location or blood group filter.</p>
              <button
                className="search-page__reset-btn"
                id="reset-filters-btn"
                onClick={() => { setLocation(''); setSelectedGroup(''); setCurrentPage(1); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchBloodPage;

