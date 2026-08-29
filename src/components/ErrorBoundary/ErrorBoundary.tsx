import React from 'react';
import './ErrorBoundary.scss';

/**
 * ErrorBoundary
 * ─────────────────────────────────────────────────────────────────────────────
 * React class-based Error Boundary.
 * Catches uncaught JavaScript errors in any child component tree.
 * Shows a friendly fallback UI instead of a blank/broken screen.
 *
 * Usage (wrap the entire app):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Usage (wrap a specific section):
 *   <ErrorBoundary fallback={<p>Widget failed to load.</p>}>
 *     <WidgetComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production: send to an error tracking service (e.g. Sentry)
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    // Use a custom fallback if provided
    if (fallback) return fallback;

    // Default fallback UI
    return (
      <div className="error-boundary" role="alert" aria-live="assertive">
        <div className="error-boundary__card">
          {/* Icon */}
          <div className="error-boundary__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="error-boundary__title">Something went wrong</h1>
          <p className="error-boundary__message">
            An unexpected error occurred. Our team has been notified.
          </p>

          {/* Show technical detail only in development */}
          {import.meta.env.DEV && error && (
            <details className="error-boundary__details">
              <summary>Technical Details</summary>
              <pre>{error.toString()}</pre>
            </details>
          )}

          <div className="error-boundary__actions">
            <button
              id="error-boundary-retry"
              type="button"
              className="error-boundary__btn error-boundary__btn--primary"
              onClick={this.handleReset}
            >
              Try Again
            </button>
            <a
              href="/"
              className="error-boundary__btn error-boundary__btn--secondary"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
