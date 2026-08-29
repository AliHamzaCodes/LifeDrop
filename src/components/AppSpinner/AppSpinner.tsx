import './AppSpinner.scss';

const AppSpinner = ({ size = 48, label = 'Loading...' }) => {
  return (
    <div className="app-spinner" role="status" aria-live="polite">
      <div
        className="app-spinner__ring"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className="app-spinner__label">{label}</span>}
    </div>
  );
};

export default AppSpinner;
