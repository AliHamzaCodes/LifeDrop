import { Link } from 'react-router-dom';
import './EmptyState.scss';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState = ({
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  icon,
}: EmptyStateProps) => (
  <div className="empty-state" role="status">
    {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
    <h3 className="empty-state__title">{title}</h3>
    {message && <p className="empty-state__message">{message}</p>}
    {actionTo && (
      <Link to={actionTo} className="empty-state__btn">
        {actionLabel}
      </Link>
    )}
    {!actionTo && onAction && (
      <button type="button" className="empty-state__btn" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
