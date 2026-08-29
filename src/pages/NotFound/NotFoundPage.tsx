import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import './NotFoundPage.scss';

const NotFoundPage = () => {
  usePageTitle('404 — Page Not Found');

  return (
    <div className="not-found" id="not-found-page">
      <div className="not-found__content">

        {/* Decorative 404 */}
        <div className="not-found__number" aria-hidden="true">404</div>

        <h1 className="not-found__title">Oops! Page not found</h1>
        <p className="not-found__desc">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track — every second counts when lives are at stake.
        </p>

        {/* CTA buttons */}
        <div className="not-found__actions">
          <Link to="/" className="not-found__btn-primary" id="not-found-home-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Back to Home
          </Link>
          <Link to="/search" className="not-found__btn-secondary" id="not-found-search-btn">
            Find a Donor
          </Link>
        </div>

        {/* Quick navigation links */}
        <nav className="not-found__links" aria-label="Quick navigation">
          <Link to="/search"  className="not-found__link" id="nf-link-search">Find Blood</Link>
          <Link to="/request" className="not-found__link" id="nf-link-request">Request Blood</Link>
          <Link to="/donate"  className="not-found__link" id="nf-link-donate">Become a Donor</Link>
          <Link to="/about"   className="not-found__link" id="nf-link-about">About Us</Link>
          <Link to="/auth"    className="not-found__link" id="nf-link-auth">Login</Link>
        </nav>

      </div>
    </div>
  );
};

export default NotFoundPage;
