import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faUserGroup,
  faFlask,
  faMagnifyingGlass,
  faFilter,
  faCheck,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
  faHourglassHalf,
  faShieldHalved,
  faLock,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import './AdminPanel.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import {
  fetchAdminRequests,
  fetchAdminDonors,
  fetchAdminUsers,
} from '../../api/services';
import {
  isPendingRequest,
  normalizeRequestStatus,
  requestBloodGroup,
  donorLastDonated,
  DONOR_STATUS,
  REQUEST_STATUS,
} from '../../utils/status';


/* ─── Urgency Badge ─────────────────────────────────────── */
const UrgencyBadge = ({ urgency }) => {
  const norm = String(urgency).toUpperCase();
  const map = {
    CRITICAL: 'critical',
    HIGH: 'high',
    ROUTINE: 'routine',
  };
  const cls = map[norm] || 'routine';
  return (
    <span className={`urgency-glowing-badge urgency-glowing-badge--${cls}`}>
      {norm === 'CRITICAL' && (
        <span className="pulse-dot"></span>
      )}
      {norm}
    </span>
  );
};

/* ─── Status Pill ───────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const key = String(status || '').toLowerCase();
  const map = {
    pending: { cls: 'pending', icon: faHourglassHalf, label: 'Pending' },
    approved: { cls: 'approved', icon: faCircleCheck, label: 'Approved' },
    verified: { cls: 'approved', icon: faCircleCheck, label: 'Verified' },
    active: { cls: 'approved', icon: faCircleCheck, label: 'Active' },
    rejected: { cls: 'rejected', icon: faCircleXmark, label: 'Rejected' },
    inactive: { cls: 'rejected', icon: faCircleXmark, label: 'Inactive' },
  };
  const { cls, icon, label } = map[key] || map.pending;
  return (
    <span className={`admin-status admin-status--${cls}`}>
      <FontAwesomeIcon icon={icon} />
      {label}
    </span>
  );
};

/* ─── Blood Group Badge ─────────────────────────────────── */
const BloodBadge = ({ group }) => (
  <span className="admin-blood-badge" aria-label={`Blood group ${group}`}>
    {group}
  </span>
);

/* ─── Pagination ────────────────────────────────────────── */
const Pagination = ({ current, total, onChange }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="admin-pagination">
      <button
        className="admin-pagination__btn"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
        id="admin-pagination-prev"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`admin-pagination__btn admin-pagination__btn--num${current === p ? ' admin-pagination__btn--active' : ''}`}
          onClick={() => onChange(p)}
          aria-current={current === p ? 'page' : undefined}
          id={`admin-pagination-page-${p}`}
        >
          {p}
        </button>
      ))}
      <button
        className="admin-pagination__btn"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        aria-label="Next page"
        id="admin-pagination-next"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

/* ─── Requests Table ────────────────────────────────────── */
const RequestsTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { deleteRequest, updateRequest } = useAppData();
  const [statusFilter, setStatusFilter] = useState('All');
  const PER_PAGE = 3;

  const reload = async () => {
    setLoading(true);
    const rows = await fetchAdminRequests();
    setData(rows);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  if (loading) return <AppSpinner label="Loading requests..." />;

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      (r.hospital || '').toLowerCase().includes(q) ||
      (r.patient  || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || normalizeRequestStatus(r.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAction = (id, action) => {
    const status = normalizeRequestStatus(action);
    updateRequest(id, { status });
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this request permanently?')) return;
    deleteRequest(id, currentUser);
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="admin-table-section">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-wrap__icon" />
          <input
            type="text"
            className="admin-search-wrap__input"
            placeholder="Search requests…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search requests"
            id="admin-requests-search"
          />
        </div>
        <label className="admin-filter-btn" htmlFor="admin-requests-filter">
          <FontAwesomeIcon icon={faFilter} />
          <select
            id="admin-requests-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter requests by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table" role="table" aria-label="Blood requests table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hospital / Patient</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">No requests found.</td>
              </tr>
            ) : (
              paged.map((req) => (
                <tr key={req.id} className={`admin-table__row admin-table__row--${req.status}`}>
                  <td className="admin-table__id">{req.id}</td>
                  <td>
                    <p className="admin-table__primary">{req.hospital}</p>
                    <p className="admin-table__secondary">Patient: {req.patient}</p>
                  </td>
                  <td><BloodBadge group={requestBloodGroup(req)} /></td>
                  <td className="admin-table__units">{req.units} {req.units === 1 ? 'Unit' : 'Units'}</td>
                  <td><UrgencyBadge urgency={req.urgency} /></td>
                  <td className="admin-table__date">{req.neededBy || req.date || '—'}</td>
                  <td>
                    <div className="admin-actions">
                      {isPendingRequest(req.status) && (
                        <>
                          <button
                            className="admin-actions__btn admin-actions__btn--approve"
                            onClick={() => handleAction(req.id, REQUEST_STATUS.Approved)}
                            aria-label={`Approve request ${req.id}`}
                            id={`approve-req-${req.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </button>
                          <button
                            className="admin-actions__btn admin-actions__btn--reject"
                            onClick={() => handleAction(req.id, REQUEST_STATUS.Rejected)}
                            aria-label={`Reject request ${req.id}`}
                            id={`reject-req-${req.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                            Reject
                          </button>
                        </>
                      )}
                      {!isPendingRequest(req.status) && (
                        <StatusPill status={req.status} />
                      )}
                      <button
                        className="admin-actions__btn admin-actions__btn--delete"
                        onClick={() => handleDelete(req.id)}
                        aria-label={`Delete request ${req.id}`}
                        id={`delete-req-${req.id}`}
                        type="button"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="admin-table-footer">
        <p className="admin-table-footer__info">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} to{' '}
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} entries
        </p>
        <Pagination current={page} total={total} onChange={setPage} />
      </div>
    </div>
  );
};

/* ─── Donors Table ──────────────────────────────────────── */
const DonorsTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { deleteDonor, updateDonor } = useAppData();
  const PER_PAGE = 4;

  const reload = async () => {
    setLoading(true);
    const rows = await fetchAdminDonors();
    setData(rows);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  if (loading) return <AppSpinner label="Loading donors..." />;

  const filtered = data.filter(
    (d) =>
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.id   || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.city || '').toLowerCase().includes(search.toLowerCase())
  );
  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAction = (id, action) => {
    const status = action === 'approve' ? DONOR_STATUS.verified : DONOR_STATUS.pending;
    updateDonor(id, { status, canContact: status === DONOR_STATUS.verified });
    setData((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status, canContact: status === DONOR_STATUS.verified } : d
      )
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this donor permanently?')) return;
    deleteDonor(id, currentUser);
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="admin-table-section">
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-wrap__icon" />
          <input
            type="text"
            className="admin-search-wrap__input"
            placeholder="Search donors…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search donors"
            id="admin-donors-search"
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table" role="table" aria-label="Donors table">
          <thead>
            <tr>
              <th>Donor ID</th>
              <th>Name</th>
              <th>Blood Group</th>
              <th>City</th>
              <th>Last Donation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">No donors found.</td>
              </tr>
            ) : (
              paged.map((donor) => (
                <tr key={donor.id} className="admin-table__row">
                  <td className="admin-table__id">{donor.id}</td>
                  <td>
                    <p className="admin-table__primary">{donor.name}</p>
                    <p className="admin-table__secondary">{donor.phone}</p>
                  </td>
                  <td><BloodBadge group={donor.bloodGroup} /></td>
                  <td className="admin-table__secondary">{donor.city}</td>
                  <td className="admin-table__date">{donorLastDonated(donor)}</td>
                  <td><StatusPill status={donor.status} /></td>
                  <td>
                    <div className="admin-actions">
                      {donor.status === 'pending' && (
                        <>
                          <button
                            className="admin-actions__btn admin-actions__btn--approve"
                            onClick={() => handleAction(donor.id, 'approve')}
                            aria-label={`Approve donor ${donor.id}`}
                            id={`approve-donor-${donor.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </button>
                          <button
                            className="admin-actions__btn admin-actions__btn--reject"
                            onClick={() => handleAction(donor.id, 'reject')}
                            aria-label={`Reject donor ${donor.id}`}
                            id={`reject-donor-${donor.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                            Reject
                          </button>
                        </>
                      )}
                      {donor.status !== 'pending' && (
                        <StatusPill status={donor.status} />
                      )}
                      <button
                        className="admin-actions__btn admin-actions__btn--delete"
                        onClick={() => handleDelete(donor.id)}
                        aria-label={`Delete donor ${donor.id}`}
                        id={`delete-donor-${donor.id}`}
                        type="button"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-footer">
        <p className="admin-table-footer__info">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} to{' '}
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} entries
        </p>
        <Pagination current={page} total={total} onChange={setPage} />
      </div>
    </div>
  );
};

/* ─── Users Table ───────────────────────────────────────── */
const UsersTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { deleteUser } = useAppData();
  const PER_PAGE = 4;

  const reload = async () => {
    setLoading(true);
    const rows = await fetchAdminUsers();
    // Show all users except passwords
    setData(rows.map(({ password: _pw, ...u }) => u));
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  if (loading) return <AppSpinner label="Loading users..." />;

  const filtered = data.filter(
    (u) =>
      (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(search.toLowerCase())
  );
  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAction = (id, action) => {
    setData((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: action === 'approve' ? 'active' : 'inactive' } : u
      )
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    deleteUser(id, currentUser);
    setData((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="admin-table-section">
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-wrap__icon" />
          <input
            type="text"
            className="admin-search-wrap__input"
            placeholder="Search users…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search users"
            id="admin-users-search"
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table" role="table" aria-label="Users table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">No users found.</td>
              </tr>
            ) : (
              paged.map((user) => (
                <tr key={user.id} className="admin-table__row">
                  <td className="admin-table__id">{user.id}</td>
                  <td className="admin-table__primary">{user.fullName || user.name || '—'}</td>
                  <td className="admin-table__secondary">{user.email}</td>
                  <td>
                    <span className={`admin-role admin-role--${(user.role || 'donor').toLowerCase()}`}>
                      {user.role || 'Donor'}
                    </span>
                  </td>
                  <td className="admin-table__date">{user.joined || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')}</td>
                  <td><StatusPill status={user.status} /></td>
                  <td>
                    <div className="admin-actions">
                      {(!user.status || user.status === 'pending') && (
                        <>
                          <button
                            className="admin-actions__btn admin-actions__btn--approve"
                            onClick={() => handleAction(user.id, 'approve')}
                            aria-label={`Approve user ${user.id}`}
                            id={`approve-user-${user.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </button>
                          <button
                            className="admin-actions__btn admin-actions__btn--reject"
                            onClick={() => handleAction(user.id, 'reject')}
                            aria-label={`Reject user ${user.id}`}
                            id={`reject-user-${user.id}`}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                            Reject
                          </button>
                        </>
                      )}
                      {user.status && user.status !== 'pending' && (
                        <StatusPill status={user.status} />
                      )}
                      <button
                        className="admin-actions__btn admin-actions__btn--delete"
                        onClick={() => handleDelete(user.id)}
                        aria-label={`Delete user ${user.id}`}
                        id={`delete-user-${user.id}`}
                        type="button"
                        title="Delete"
                        disabled={user.role === 'admin'}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                   </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-footer">
        <p className="admin-table-footer__info">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} to{' '}
          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} entries
        </p>
        <Pagination current={page} total={total} onChange={setPage} />
      </div>
    </div>
  );
};

/* ─── Main AdminPanel ───────────────────────────────────── */
const TABS = ['Donors', 'Requests', 'Users'];

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const { getStats } = useAppData();
  const [activeTab, setActiveTab] = useState('Requests');
  const [alert, setAlert] = useState<any>(null);
  const live = getStats();

  useEffect(() => {
    import('../../utils/api').then(({ default: api }) => {
      api.get('analytics/predict_shortage/').then(res => setAlert(res.data)).catch(console.error);
    });
  }, []);

  // ── Role guard ─────────────────────────────────────────────────
  if (currentUser?.role !== 'admin') {
    return (
      <section className="admin-panel" aria-labelledby="admin-access-denied">
        <div className="admin-access-denied" id="admin-access-denied-screen">
          <span className="admin-access-denied__icon" aria-hidden="true">
            <FontAwesomeIcon icon={faLock} />
          </span>
          <h2 className="admin-access-denied__title" id="admin-access-denied">Access Restricted</h2>
          <p className="admin-access-denied__desc">
            The Admin Panel is only accessible to users with the <strong>admin</strong> role.
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </section>
    );
  }

  const stats = [
    {
      label: 'Pending Requests',
      value: String(live.activeRequests),
      icon: faDroplet,
      iconClass: 'red',
      id: 'stat-pending',
    },
    {
      label: 'Verified Donors',
      value: String(live.totalDonors),
      icon: faUserGroup,
      iconClass: 'teal',
      id: 'stat-donors',
    },
    {
      label: 'Blood logged',
      value: String(live.totalLitres),
      unit: 'L donated (demo)',
      icon: faFlask,
      iconClass: 'indigo',
      id: 'stat-units',
    },
  ];

  return (
    <section className="admin-panel" aria-labelledby="admin-panel-title">
      {/* Header */}
      <div className="admin-panel__header">
        <div className="admin-panel__header-text">
          <div className="admin-panel__title-row">
            <span className="admin-panel__shield-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faShieldHalved} />
            </span>
            <h1 className="admin-panel__title" id="admin-panel-title">
              System Administration
            </h1>
          </div>
          <p className="admin-panel__subtitle">
            Manage donors, hospital requests, and user accounts. Demo data is stored locally.
          </p>
        </div>
      </div>

      {alert && (
        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', marginBottom: '24px', borderRadius: '4px', display: 'flex', gap: '12px', marginTop: '24px' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#b45309' }}>ML Predictive Shortage Alert: {alert.city}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              <strong>Predicted Shortage:</strong> {alert.predicted_shortage} <br />
              {alert.reasoning} (Confidence: {alert.confidence})
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-stats" role="region" aria-label="Administration statistics">
        {stats.map((s) => (
          <div className="admin-stats__card" key={s.id} id={s.id}>
            <div className="admin-stats__card-body">
              <p className="admin-stats__label">{s.label}</p>
              <div className="admin-stats__value-row">
                <span className="admin-stats__value">{s.value}</span>
                {s.unit && <span className="admin-stats__unit">{s.unit}</span>}
                {s.trend && (
                  <span className="admin-stats__trend" aria-label={`Trend: ${s.trend}`}>
                    <FontAwesomeIcon icon={faArrowTrendUp} />
                    {s.trend}
                  </span>
                )}
              </div>
            </div>
            <div className={`admin-stats__icon-wrap admin-stats__icon-wrap--${s.iconClass}`} aria-hidden="true">
              <FontAwesomeIcon icon={s.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist" aria-label="Data management tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            className={`admin-tabs__tab${activeTab === tab ? ' admin-tabs__tab--active' : ''}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            id={`admin-tab-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="admin-tab-content"
        role="tabpanel"
        aria-labelledby={`admin-tab-${activeTab.toLowerCase()}`}
      >
        {activeTab === 'Donors' && <DonorsTable />}
        {activeTab === 'Requests' && <RequestsTable />}
        {activeTab === 'Users' && <UsersTable />}
      </div>
    </section>
  );
};

export default AdminPanel;

