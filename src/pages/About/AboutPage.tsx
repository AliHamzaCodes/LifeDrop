import { Link } from 'react-router-dom';
import heroImg from '../../assets/about_hero.png';
import storyImg from '../../assets/about_story.png';
import sarahImg from '../../assets/team_sarah.png';
import marcusImg from '../../assets/team_marcus.png';
import elenaImg from '../../assets/team_elena.png';
import './AboutPage.scss';
import usePageTitle from '../../hooks/usePageTitle';
import { useAppData } from '../../context/AppDataContext';

/* ── Icon Components ─────────────────────────────────────────── */
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const HospitalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 12h6M12 9v6"/>
  </svg>
);

const TrustIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const UrgencyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SafetyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Data ─────────────────────────────────────────────────────── */
const values = [
  { icon: <TrustIcon />,    title: 'Trust',     desc: 'Uncompromising data privacy and medical integrity.' },
  { icon: <UrgencyIcon />,  title: 'Urgency',   desc: 'Rapid response systems for critical situations.' },
  { icon: <CommunityIcon />,title: 'Community', desc: 'Fostering a network of local heroes.' },
  { icon: <SafetyIcon />,   title: 'Safety',    desc: 'Rigorous standards for every single drop.' },
];

const team = [
  { img: sarahImg,  name: 'Dr. Ayesha Malik', role: 'Medical Advisor (demo)' },
  { img: marcusImg, name: 'Omar Sheikh',      role: 'Project Lead (demo)' },
  { img: elenaImg,  name: 'Hina Raza',        role: 'Operations (demo)' },
];

/* ── Component ────────────────────────────────────────────────── */
const AboutPage = () => {
  usePageTitle('About Us');
  const { getStats } = useAppData();
  const live = getStats();
  const stats = [
    { icon: <HeartIcon />, value: `${live.totalDonors}`, label: 'Verified donors in this demo' },
    { icon: <DropIcon />,  value: `${live.totalDonations}`, label: 'Recorded donations' },
    { icon: <HospitalIcon />, value: `${live.activeRequests}`,  label: 'Pending requests' },
  ];
  return (
    <div className="about" id="about-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="about__hero" aria-labelledby="about-hero-heading">
        <div className="container about__hero-inner">
          <div className="about__hero-text">
            <h1 id="about-hero-heading" className="about__hero-title">
              Saving Lives,<br />One Drop at a Time
            </h1>
            <p className="about__hero-desc">
              LifeStream is a Final Year Project: a Pakistan-focused directory that
              helps families find compatible donors and hospitals post blood requests.
              It is a frontend demo — licensed blood banks still perform every medical screening.
            </p>
            <Link
              className="about__hero-cta"
              id="btn-about-become-donor"
              to="/donate"
              aria-label="Become a Donor"
            >
              Become a Donor →
            </Link>
          </div>
          <div className="about__hero-image">
            <img src={heroImg} alt="Medical professional helping blood donation patient" />
          </div>
        </div>
      </section>

      {/* ── Impact Stats ─────────────────────────────────────── */}
      <section className="about__impact" aria-labelledby="impact-heading">
        <div className="container">
          <h2 id="impact-heading" className="about__section-title">Our Impact So Far</h2>
          <p className="about__section-sub">
            These numbers come from the demo dataset stored in your browser, not a national registry.
          </p>
          <div className="about__stats-grid">
            {stats.map((s, i) => (
              <div className="about__stat-card" key={i}>
                <span className="about__stat-icon">{s.icon}</span>
                <span className="about__stat-value">{s.value}</span>
                <span className="about__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────── */}
      <section className="about__story" aria-labelledby="story-heading">
        <div className="container about__story-inner">
          <div className="about__story-image">
            <img src={storyImg} alt="LifeStream technology platform dashboard" />
          </div>
          <div className="about__story-text">
            <h2 id="story-heading" className="about__story-title">Our Story</h2>
            <p>
              LifeStream started as a student project to replace chaotic WhatsApp
              and Facebook blood appeals with a structured search and request flow
              for cities such as Lahore, Karachi, and Islamabad.
            </p>
            <p>
              Hospital names in the demo are illustrative. We do not claim a live
              partnership with those institutions. When a backend is added, the same
              screens can talk to a real API without changing the user journeys.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ──────────────────────────────────────── */}
      <section className="about__values" aria-labelledby="values-heading">
        <div className="container">
          <h2 id="values-heading" className="about__section-title">Our Core Values</h2>
          <div className="about__values-grid">
            {values.map((v, i) => (
              <div className="about__value-card" key={i}>
                <span className="about__value-icon">{v.icon}</span>
                <h3 className="about__value-title">{v.title}</h3>
                <p className="about__value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership Team ──────────────────────────────────── */}
      <section className="about__team" aria-labelledby="team-heading">
        <div className="container">
          <h2 id="team-heading" className="about__section-title">Leadership Team</h2>
          <p className="about__section-sub">
            Illustrative roles for this FYP demo — not a registered foundation.
          </p>
          <div className="about__team-grid">
            {team.map((member, i) => (
              <div className="about__team-card" key={i}>
                <div className="about__team-avatar">
                  <img src={member.img} alt={member.name} />
                </div>
                <h3 className="about__team-name">{member.name}</h3>
                <p className="about__team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="about__cta" aria-labelledby="cta-heading">
        <div className="container about__cta-inner">
          <h2 id="cta-heading" className="about__cta-title">Join our life-saving mission</h2>
          <p className="about__cta-desc">
            Your contribution matters. Every donation has the potential to save up to
            three lives. Register today and become a vital part of our community network.
          </p>
          <Link
            className="about__cta-btn"
            id="btn-about-cta-donate"
            to="/donate"
            aria-label="Become a Donor"
          >
            Become a Donor
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
