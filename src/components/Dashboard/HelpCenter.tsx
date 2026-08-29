import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faBolt,
  faChevronDown,
  faChevronUp,
  faSearch,
  faHeadset,
  faCircleCheck,
  faHeartPulse,
  faUserShield,
  faBookOpen,
  faPhone,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import './HelpCenter.scss';
import { HELP_CATEGORIES, FAQS } from '../../data/helpcenter.data';
import { SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE } from '../../constants/pakistan';

const CATEGORY_ICONS = {
  heartPulse:  faHeartPulse,
  userShield:  faUserShield,
  droplet:     faDroplet,
  circleCheck: faCircleCheck,
  bookOpen:    faBookOpen,
  bolt:        faBolt,
};

const CATEGORY_LINKS = {
  'post-donation': '/faq',
  'account-privacy': '/privacy',
  'blood-requests': '/request',
  eligibility: '/eligibility',
  'donation-process': '/faq',
  emergency: '/contact',
};

const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`hc-faq__item${open ? ' hc-faq__item--open' : ''}`} id={item.id}>
      <button
        className="hc-faq__trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        id={`${item.id}-btn`}
      >
        <span className="hc-faq__question">{item.question}</span>
        <span className="hc-faq__chevron" aria-hidden="true">
          <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
        </span>
      </button>
      {open && (
        <div className="hc-faq__answer" role="region" aria-labelledby={`${item.id}-btn`}>
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const HelpCenter = () => {
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="help-center" aria-labelledby="hc-title">
      <div className="hc-header">
        <div className="hc-header__icon-wrap" aria-hidden="true">
          <FontAwesomeIcon icon={faHeadset} />
        </div>
        <div>
          <h1 className="hc-header__title" id="hc-title">Help Center</h1>
          <p className="hc-header__subtitle">
            Guides for donors and families requesting blood. Public copies live on FAQ, Eligibility, and Contact.
          </p>
        </div>
      </div>

      <div className="hc-search" role="search">
        <FontAwesomeIcon icon={faSearch} className="hc-search__icon" aria-hidden="true" />
        <input
          type="search"
          className="hc-search__input"
          placeholder="Search help articles, FAQs, topics…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search help center"
          id="hc-search-input"
        />
        {search && (
          <span className="hc-search__count">
            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!search && (
        <div className="hc-categories" role="region" aria-label="Help categories">
          {HELP_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={CATEGORY_LINKS[cat.id] || '/faq'}
              className={`hc-cat-card hc-cat-card--${cat.color}`}
              id={`hc-cat-${cat.id}`}
              aria-label={`Open ${cat.title}`}
            >
              <div className="hc-cat-card__top">
                <span className="hc-cat-card__icon" aria-hidden="true">
                  <FontAwesomeIcon icon={CATEGORY_ICONS[cat.iconKey]} />
                </span>
              </div>
              <h3 className="hc-cat-card__title">{cat.title}</h3>
              <p className="hc-cat-card__desc">{cat.desc}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="hc-faq" role="region" aria-label="Frequently asked questions">
        <div className="hc-faq__header">
          <h2 className="hc-faq__title">
            {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
          </h2>
          {!search && (
            <p className="hc-faq__subtitle">
              Quick answers for this Pakistan-focused demo. See the public <Link to="/faq">FAQ page</Link> for the full list.
            </p>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="hc-faq__empty">
            <FontAwesomeIcon icon={faSearch} className="hc-faq__empty-icon" aria-hidden="true" />
            <p>No results found for <strong>"{search}"</strong></p>
            <p className="hc-faq__empty-hint">Try a different keyword or <Link to="/contact">contact support</Link>.</p>
          </div>
        ) : (
          <div className="hc-faq__list">
            {filteredFaqs.map((faq) => (
              <FaqItem key={faq.id} item={faq} />
            ))}
          </div>
        )}
      </div>

      <div className="hc-support-banner" role="region" aria-label="Contact support">
        <div className="hc-support-banner__left">
          <div className="hc-support-banner__icon-wrap" aria-hidden="true">
            <FontAwesomeIcon icon={faHeadset} />
          </div>
          <div>
            <h2 className="hc-support-banner__title">Still need help?</h2>
            <p className="hc-support-banner__desc">
              This demo does not include live chat. Use the contact form and we will show an on-page confirmation.
            </p>
            <div className="hc-support-banner__meta">
              <span>
                <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                {SUPPORT_HOURS}
              </span>
              <span>
                <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
                {SUPPORT_PHONE}
              </span>
            </div>
            <p className="hc-support-banner__desc">{SUPPORT_EMAIL}</p>
          </div>
        </div>

        <div className="hc-support-banner__actions">
          <Link className="hc-support-btn hc-support-btn--email" to="/contact">
            <span className="hc-support-btn__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeadset} />
            </span>
            <span className="hc-support-btn__text">
              <span className="hc-support-btn__label">Contact form</span>
              <span className="hc-support-btn__sub">Name, email, and message</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
