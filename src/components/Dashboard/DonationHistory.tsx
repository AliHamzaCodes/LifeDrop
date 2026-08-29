import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpFromBracket,
  faCircleCheck,
  faChevronUp,
  faChevronDown,
  faSort,
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
            aria-label="Export donation history as CSV"
          >
            <FontAwesomeIcon icon={faArrowUpFromBracket} />
            Export Record
          </button>
        </div>

        <div className="dh-cards">
          {sorted.length === 0 ? (
            <p className="dh-table__empty">No donations recorded yet. After you donate, your history will appear here.</p>
          ) : sorted.map((row) => (
            <article key={`card-${row.id}`} className="dh-card-item">
              <p><strong>{row.date}</strong> · {row.type}</p>
              <p>{row.location}</p>
              <p>{row.volume} · {row.status}</p>
            </article>
          ))}
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
                    No donations recorded yet. After you donate, your history will appear here.
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
    </section>
  );
};

export default DonationHistory;

