import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import './LegalPage.scss';

const TOC = [
  { id: 'acceptance',    label: 'Acceptance of Terms'     },
  { id: 'eligibility',   label: 'Eligibility'             },
  { id: 'registration',  label: 'Account Registration'    },
  { id: 'donor-conduct', label: 'Donor Conduct'           },
  { id: 'medical',       label: 'Medical Disclaimer'      },
  { id: 'data',          label: 'Data & Privacy'          },
  { id: 'intellectual',  label: 'Intellectual Property'   },
  { id: 'liability',     label: 'Limitation of Liability' },
  { id: 'termination',   label: 'Termination'             },
  { id: 'contact',       label: 'Contact Us'              },
];

const TermsPage = () => {
  usePageTitle('Terms of Service');

  return (
    <div className="legal-page" id="terms-page">

      {/* ── Hero ────────────────────────────────── */}
      <header className="legal-page__hero">
        <div className="legal-page__hero-inner">
          <span className="legal-page__badge">Legal</span>
          <h1 className="legal-page__title">Terms of Service</h1>
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
            <strong>Please read carefully</strong>
            LifeStream is a student demo for coordinating blood donors in Pakistan.
            By using the site you agree to these terms. It is not a licensed blood bank.
          </div>

          <section className="legal-page__section" id="acceptance">
            <h2 className="legal-page__section-title" data-num="1">Acceptance of Terms</h2>
            <p className="legal-page__text">
              These Terms of Service ("Terms") govern your access to and use of the LifeStream blood donation
              platform, including our website, mobile application, and all related services (collectively,
              the "Service"). By registering an account or using any part of the Service, you confirm that
              you have read, understood, and agree to be legally bound by these Terms.
            </p>
            <p className="legal-page__text">
              LifeStream reserves the right to modify these Terms at any time. We will notify registered users
              of material changes via email or an in-app notification. Continued use of the Service after such
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="legal-page__section" id="eligibility">
            <h2 className="legal-page__section-title" data-num="2">Eligibility</h2>
            <p className="legal-page__text">
              To use LifeStream, you must:
            </p>
            <ul className="legal-page__list">
              <li>Be at least 18 years of age to register as a donor in this demo (aligned with typical whole-blood donation age in Pakistan).</li>
              <li>Meet the minimum medical criteria set by your regional blood donation authority.</li>
              <li>Provide accurate, truthful, and current information during registration.</li>
              <li>Not be subject to any legal prohibition that would prevent you from using the Service.</li>
            </ul>
            <p className="legal-page__text">
              LifeStream does not collect data from individuals under the age of 18 for donor registration.
              If you believe we have inadvertently collected such data, please contact us immediately.
            </p>
          </section>

          <section className="legal-page__section" id="registration">
            <h2 className="legal-page__section-title" data-num="3">Account Registration</h2>
            <p className="legal-page__text">
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You agree to:
            </p>
            <ul className="legal-page__list">
              <li>Provide accurate personal and medical information.</li>
              <li>Notify us immediately of any unauthorized account access.</li>
              <li>Not share your login credentials with any third party.</li>
              <li>Use your account solely for lawful purposes related to blood donation.</li>
            </ul>
            <p className="legal-page__text">
              LifeStream reserves the right to suspend or terminate accounts that violate these Terms,
              provide false information, or engage in fraudulent activity.
            </p>
          </section>

          <section className="legal-page__section" id="donor-conduct">
            <h2 className="legal-page__section-title" data-num="4">Donor Conduct</h2>
            <p className="legal-page__text">
              As a registered donor on LifeStream, you agree to adhere to ethical and responsible conduct:
            </p>
            <ul className="legal-page__list">
              <li>Only register if you genuinely intend to donate blood when contacted.</li>
              <li>Accurately disclose your medical history and any conditions that may affect donation eligibility.</li>
              <li>Inform LifeStream if your health status changes and you become temporarily or permanently ineligible.</li>
              <li>Not misrepresent your blood type, location, or availability.</li>
              <li>Treat hospital staff, patients, and other users with respect and dignity.</li>
            </ul>
          </section>

          <section className="legal-page__section" id="medical">
            <h2 className="legal-page__section-title" data-num="5">Medical Disclaimer</h2>
            <div className="legal-page__callout">
              <strong>Important</strong>
              LifeStream is a coordination and matching platform only. We do not provide medical advice,
              diagnosis, or treatment.
            </div>
            <p className="legal-page__text">
              All medical decisions regarding blood donation, eligibility, and transfusion compatibility must
              be made by qualified healthcare professionals. LifeStream does not guarantee the safety, suitability,
              or medical appropriateness of any blood match facilitated through the platform.
            </p>
            <p className="legal-page__text">
              Donors should consult with their physician before donating if they have any medical concerns.
              Recipients and hospitals are solely responsible for conducting all required compatibility testing
              before any transfusion.
            </p>
          </section>

          <section className="legal-page__section" id="data">
            <h2 className="legal-page__section-title" data-num="6">Data &amp; Privacy</h2>
            <p className="legal-page__text">
              Your privacy matters to us. The collection, storage, and use of your personal data is governed
              by our <Link to="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference.
              By using the Service you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          <section className="legal-page__section" id="intellectual">
            <h2 className="legal-page__section-title" data-num="7">Intellectual Property</h2>
            <p className="legal-page__text">
              All content on the LifeStream platform — including logos, design, code, text, graphics, and
              trademarks — is the exclusive property of LifeStream and its licensors. You may not copy,
              reproduce, distribute, modify, or create derivative works without our prior written consent.
            </p>
          </section>

          <section className="legal-page__section" id="liability">
            <h2 className="legal-page__section-title" data-num="8">Limitation of Liability</h2>
            <p className="legal-page__text">
              To the fullest extent permitted by applicable law, LifeStream, its affiliates, directors,
              employees, and licensors shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of or related to your use of the Service, including but not limited
              to medical complications, loss of data, or service interruptions.
            </p>
            <p className="legal-page__text">
              Our total aggregate liability shall not exceed the greater of USD $100 or the amount you paid to
              LifeStream in the twelve months preceding the claim.
            </p>
          </section>

          <section className="legal-page__section" id="termination">
            <h2 className="legal-page__section-title" data-num="9">Termination</h2>
            <p className="legal-page__text">
              You may terminate your account at any time by contacting our support team. LifeStream may
              suspend or terminate your account at its sole discretion if you breach these Terms or if we
              are required to do so by law. Upon termination, your right to access the Service ceases immediately.
            </p>
          </section>

          <section className="legal-page__section" id="contact">
            <h2 className="legal-page__section-title" data-num="10">Contact Us</h2>
            <p className="legal-page__text">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="legal-page__list">
              <li>Email: <a href="mailto:support@lifestream.pk">support@lifestream.pk</a></li>
              <li>Address: LifeStream (FYP Demo), Gulberg III, Lahore, Pakistan</li>
              <li>Support hours: Monday–Saturday, 9:00 AM–6:00 PM PKT</li>
            </ul>
          </section>

        </article>
      </div>

      {/* ── Page Footer ─────────────────────────── */}
      <footer className="legal-page__footer">
        <p className="legal-page__footer-text">© 2025 LifeStream Foundation. All rights reserved.</p>
        <div className="legal-page__footer-links">
          <Link to="/privacy" id="terms-to-privacy-link">Privacy Policy</Link>
          <Link to="/" id="terms-to-home-link">Home</Link>
        </div>
      </footer>

    </div>
  );
};

export default TermsPage;
