import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpFromBracket,
  faCircleCheck,
  faChevronUp,
  faChevronDown,
  faSort,
  faAward,
  faPrint,
  faXmark,
  faHeartPulse
} from '@fortawesome/free-solid-svg-icons';
import './DonationHistory.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import { columns } from '../../data/donations.data';
import { fetchDonations } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

// ── CSV Export ────────────────────────────────────────────────────────────────
const exportToCSV = (rows) => {
  const headers = ['Date', 'Location', 'Donation Type', 'Volume', 'Status'];
  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [r.date, `"${r.location}"`, r.type, r.volume, r.status].join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'donation_history.csv';
  link.click();
  URL.revokeObjectURL(url);
};

// ── Component ─────────────────────────────────────────────────────────────────
const DonationHistory = () => {
  const [sortKey, setSortKey]     = useState('date');
  const [sortDir, setSortDir]     = useState('desc');
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchDonations(currentUser?.id);
      setDonations(data);
      setLoading(false);
    };
    load();
  }, [currentUser?.id]);

  const handleSort = (key) => {
    if (!columns.find((c) => c.key === key)?.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...donations].sort((a, b) => {
    let valA = sortKey === 'date' ? a.rawDate : a[sortKey];
    let valB = sortKey === 'date' ? b.rawDate : b[sortKey];
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const SortIcon = ({ colKey }) => {
    const col = columns.find((c) => c.key === colKey);
    if (!col?.sortable) return null;
    if (sortKey !== colKey) return <FontAwesomeIcon icon={faSort} className="dh-table__sort-icon dh-table__sort-icon--idle" />;
    return sortDir === 'asc'
      ? <FontAwesomeIcon icon={faChevronUp}   className="dh-table__sort-icon dh-table__sort-icon--active" />
      : <FontAwesomeIcon icon={faChevronDown} className="dh-table__sort-icon dh-table__sort-icon--active" />;
  };

  if (loading) {
    return (
      <section className="donation-history" aria-label="Donation History">
        <AppSpinner label="Loading donation history..." />
      </section>
    );
  }

  return (
    <section className="donation-history" aria-label="Donation History">
      {/* ── Card ── */}
      <div className="dh-card">
        {/* Header */}
        <div className="dh-card__header">
          <h2 className="dh-card__title">Recent Donation History</h2>
          <button
            type="button"
            className="dh-card__export-btn"
            id="btn-export-donations"
            onClick={() => exportToCSV(sorted)}
            aria-label="Export donations to CSV"
          >
            <FontAwesomeIcon icon={faArrowUpFromBracket} aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="dh-table-wrapper" role="region" aria-label="Donation history table" tabIndex={0}>
          <table className="dh-table" aria-label="Recent donations">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`dh-table__th${col.sortable ? ' dh-table__th--sortable' : ''}${sortKey === col.key ? ' dh-table__th--sorted' : ''}`}
                    onClick={() => handleSort(col.key)}
                    aria-sort={
                      sortKey === col.key
                        ? sortDir === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dh-table__empty">
                    No donations recorded yet. After you donate, your history and digital award certificates will appear here.
                  </td>
                </tr>
              ) : sorted.map((row, idx) => (
                <tr key={row.id} className="dh-table__row" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td className="dh-table__td dh-table__td--date">{row.date}</td>
                  <td className="dh-table__td">{row.location}</td>
                  <td className="dh-table__td">{row.type}</td>
                  <td className="dh-table__td">{row.volume}</td>
                  <td className="dh-table__td">
                    <span className={`dh-badge dh-badge--${row.status.toLowerCase()}`}>
                      <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                      {row.status}
                    </span>
                  </td>
                  <td className="dh-table__td">
                    <button
                      type="button"
                      onClick={() => setSelectedCert(row)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #f59e0b',
                        background: '#fffbeb',
                        color: '#b45309',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="View Official Certificate"
                    >
                      <FontAwesomeIcon icon={faAward} />
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <p className="dh-card__footer">
          Showing <strong>{sorted.length}</strong> donation{sorted.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Official Certificate Modal ── */}
      {selectedCert && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%', maxWidth: '640px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faAward} style={{ color: '#d97706' }} />
                LifeDrop Official Digital Certificate
              </span>
              <button
                onClick={() => setSelectedCert(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Certificate Canvas */}
            <div id="printable-certificate" style={{
              margin: '20px',
              padding: '36px 30px',
              borderRadius: '12px',
              border: '6px double #d97706',
              background: 'linear-gradient(180deg, #fffdfa 0%, #fff 100%)',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '8px' }}>
                <FontAwesomeIcon icon={faHeartPulse} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b45309' }}>
                LifeDrop Pakistan Blood Network
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 16px 0', fontFamily: 'serif' }}>
                Certificate of Appreciation
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>This is proudly presented to</p>
              <h2 style={{ fontSize: '1.6rem', color: '#dc2626', margin: '8px 0', textDecoration: 'underline' }}>
                {currentUser?.fullName || 'Hero Donor'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, maxWidth: '480px', margin: '12px auto' }}>
                In grateful recognition of your voluntary donation of <strong>{selectedCert.volume} ({selectedCert.type})</strong> at <strong>{selectedCert.location}</strong> on <strong>{selectedCert.date}</strong>. Your compassion and selfless act of giving blood has helped save lives.
              </p>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>VERIFIED AT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{selectedCert.location}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {selectedCert.date}</div>
                </div>

                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  border: '2px dashed #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#d97706', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center',
                  padding: '4px'
                }}>
                  Official LifeSaver
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ISSUED BY</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>LifeDrop PK</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Status: VERIFIED</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none',
                  background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <FontAwesomeIcon icon={faPrint} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DonationHistory;
