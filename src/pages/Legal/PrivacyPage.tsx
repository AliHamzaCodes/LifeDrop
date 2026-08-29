import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import './LegalPage.scss';

const TOC = [
  { id: 'overview',     label: 'Overview'                },
  { id: 'collection',   label: 'Data We Collect'         },
  { id: 'use',          label: 'How We Use Your Data'    },
  { id: 'sharing',      label: 'Data Sharing'            },
  { id: 'retention',    label: 'Data Retention'          },
  { id: 'security',     label: 'Security'                },
  { id: 'rights',       label: 'Your Rights'             },
  { id: 'cookies',      label: 'Cookies'                 },
  { id: 'children',     label: "Children's Privacy"      },
  { id: 'contact',      label: 'Contact Us'              },
];

const PrivacyPage = () => {
  usePageTitle('Privacy Policy');

  return (
    <div className="legal-page" id="privacy-page">

      {/* ── Hero ────────────────────────────────── */}
      <header className="legal-page__hero">
        <div className="legal-page__hero-inner">
          <span className="legal-page__badge">Legal</span>
          <h1 className="legal-page__title">Privacy Policy</h1>
          <div className="legal-page__meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last updated: June 2025</span>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────── */}
      <div className="legal-page__body">

        {/* TOC Sidebar */}
        <aside className="legal-page__toc" aria-label="Table of contents">
          <p className="legal-page__toc-title">On this page</p>
          <ul className="legal-page__toc-list">
            {TOC.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="legal-page__toc-link">{item.label}</a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Article */}
        <article className="legal-page__article">

          <div className="legal-page__callout">
            <strong>Demo notice</strong>
            LifeStream is a Final Year Project frontend. Data is stored in your browser&apos;s localStorage.
            There is no production database, email delivery, or hospital integration yet.
          </div>

          <section className="legal-page__section" id="overview">
            <h2 className="legal-page__section-title" data-num="1">Overview</h2>
            <p className="legal-page__text">
              LifeStream ("we", "us", or "our") operates a blood donation coordination platform.
              This Privacy Policy describes how we collect, use, store, and share information about
              you when you use our website and services. It also describes your rights regarding your data.
            </p>
            <p className="legal-page__text">
              By using LifeStream, you agree to the practices described in this policy.
              This policy should be read alongside our <Link to="/terms">Terms of Service</Link>.
            </p>
          </section>

          <section className="legal-page__section" id="collection">
            <h2 className="legal-page__section-title" data-num="2">Data We Collect</h2>
            <p className="legal-page__text">We collect the following categories of information:</p>
            <ul className="legal-page__list">
              <li><strong>Account data:</strong> Name, email, phone, and password stored in this browser for the demo (not hashed on a server).</li>
              <li><strong>Medical data:</strong> Blood group, last donation date, and donor eligibility status you enter.</li>
              <li><strong>Location data:</strong> City you provide during registration. We do not collect live GPS in this demo.</li>
              <li><strong>Usage data:</strong> Pages visited in this session (not sent to an analytics vendor in the demo).</li>
              <li><strong>Communications:</strong> Contact-form messages stay on the page; they are not emailed.</li>
            </ul>
          </section>

          <section className="legal-page__section" id="use">
            <h2 className="legal-page__section-title" data-num="3">How We Use Your Data</h2>
            <p className="legal-page__text">We use your data to:</p>
            <ul className="legal-page__list">
              <li>Match blood donors with recipients based on blood type and location.</li>
              <li>Send appointment reminders, eligibility alerts, and urgent blood shortage notifications.</li>
              <li>Verify donor eligibility and maintain donation history.</li>
              <li>Improve our platform through analytics and user research.</li>
              <li>Comply with legal obligations, including health authority reporting requirements.</li>
              <li>Prevent fraud and ensure the safety and integrity of the platform.</li>
            </ul>
            <p className="legal-page__text">
              We will never sell your personal data to third parties for marketing purposes.
            </p>
          </section>

          <section className="legal-page__section" id="sharing">
            <h2 className="legal-page__section-title" data-num="4">Data Sharing</h2>
            <p className="legal-page__text">
              We share your data only in the following circumstances:
            </p>
            <ul className="legal-page__list">
              <li><strong>With hospitals and blood banks</strong> when a donation match is confirmed — limited to blood type, general location, and contact information.</li>
              <li><strong>With service providers</strong> (e.g., cloud hosting, email delivery) who process data on our behalf under strict data processing agreements.</li>
              <li><strong>With health authorities</strong> as required by applicable law or public health regulations.</li>
              <li><strong>In aggregated, anonymized form</strong> for research and reporting purposes.</li>
            </ul>
            <div className="legal-page__callout">
              <strong>We never share</strong>
              Your full blood test results, medical history beyond eligibility status,
              or private messages without your explicit consent.
            </div>
          </section>

          <section className="legal-page__section" id="retention">
            <h2 className="legal-page__section-title" data-num="5">Data Retention</h2>
            <p className="legal-page__text">
              We retain your account data for as long as your account is active, plus an additional
              period required by law (typically 5–7 years for health-related records in most jurisdictions).
              When you delete your account, we will anonymize or delete your personal data within 90 days,
              unless retention is required by law.
            </p>
          </section>

          <section className="legal-page__section" id="security">
            <h2 className="legal-page__section-title" data-num="6">Security</h2>
            <p className="legal-page__text">
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className="legal-page__list">
              <li>HTTPS in production when the site is hosted (this demo may run on localhost).</li>
              <li>Session data kept in the browser; passwords in this demo are stored in localStorage and are not production-grade.</li>
              <li>A future backend should hash passwords (for example with bcrypt) and use HTTPS/TLS in transit.</li>
              <li>Do not enter real medical secrets you would not want stored on this device.</li>
            </ul>
            <p className="legal-page__text">
              No method of transmission over the internet is 100% secure. While we strive to use
              commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-page__section" id="rights">
            <h2 className="legal-page__section-title" data-num="7">Your Rights</h2>
            <p className="legal-page__text">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="legal-page__list">
              <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
              <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to the processing of your data for direct communication purposes.</li>
              <li><strong>Withdrawal:</strong> Withdraw consent at any time without affecting prior lawful processing.</li>
            </ul>
            <p className="legal-page__text">
              To exercise any of these rights in a future production system, contact{' '}
              <a href="mailto:support@lifestream.pk">support@lifestream.pk</a>.
              In this demo you can clear site data in your browser.
            </p>
          </section>

          <section className="legal-page__section" id="cookies">
            <h2 className="legal-page__section-title" data-num="8">Cookies</h2>
            <p className="legal-page__text">
              This demo uses localStorage to keep you signed in. We do not set third-party marketing cookies.
              If a future version uses cookies, we will describe them here.
            </p>
          </section>

          <section className="legal-page__section" id="children">
            <h2 className="legal-page__section-title" data-num="9">Children's Privacy</h2>
            <p className="legal-page__text">
              LifeStream is not intended for people under 18 (the typical minimum age for whole-blood donation in this demo).
              We do not knowingly collect personal data from children.
              If you believe a minor has created an account, contact us so the local demo data can be cleared.
            </p>
          </section>

          <section className="legal-page__section" id="contact">
            <h2 className="legal-page__section-title" data-num="10">Contact Us</h2>
            <p className="legal-page__text">
              For any privacy-related questions, data requests, or concerns, please contact our Data Protection Officer:
            </p>
            <ul className="legal-page__list">
              <li>Email: <a href="mailto:support@lifestream.pk">support@lifestream.pk</a></li>
              <li>Address: LifeStream (FYP Demo), Gulberg III, Lahore, Pakistan</li>
              <li>Response time: this demo does not send email; use the Contact page for an on-screen confirmation</li>
            </ul>
          </section>

        </article>
      </div>

      {/* ── Page Footer ─────────────────────────── */}
      <footer className="legal-page__footer">
        <p className="legal-page__footer-text">© 2025 LifeStream Foundation. All rights reserved.</p>
        <div className="legal-page__footer-links">
          <Link to="/terms" id="privacy-to-terms-link">Terms of Service</Link>
          <Link to="/" id="privacy-to-home-link">Home</Link>
        </div>
      </footer>

    </div>
  );
};

export default PrivacyPage;
