import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.scss';

const footerLinks = [
  { label: 'Donation Eligibility', to: '/eligibility' },
  { label: 'Blood Compatibility', to: '/compatibility' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon-wrap"><FontAwesomeIcon icon={faDroplet} className="logo-icon" /></span>
              <span>LifeDrop</span>
            </Link>
            <p className="footer-tagline">
              Connecting volunteer donors with patients across Pakistan. A smarter, faster way to save lives.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FontAwesomeIcon icon={faFacebook as any} /></a>
              <a href="#" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter as any} /></a>
              <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram as any} /></a>
              <a href="#" aria-label="GitHub"><FontAwesomeIcon icon={faGithub as any} /></a>
            </div>
          </div>

          <div className="footer-nav">
            <h4>Resources</h4>
            <ul>
              {footerLinks.slice(0, 3).map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav">
            <h4>Legal & Help</h4>
            <ul>
              {footerLinks.slice(3).map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Join our newsletter for updates on donation drives and urgent needs.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" aria-label="Email address" required />
              <button type="submit" aria-label="Subscribe">
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {year} LifeDrop Blood Network. Final Year Project Demo.
          </p>
          <div className="footer-badge">
            <span className="heart-icon">❤</span> Crafted in Pakistan
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
