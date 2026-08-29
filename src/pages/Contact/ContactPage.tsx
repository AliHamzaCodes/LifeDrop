import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { isValidPakistanPhone, SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE, LEGAL_ADDRESS } from '../../constants/pakistan';
import '../shared/InfoPage.scss';

const ContactPage = () => {
  usePageTitle('Contact Us');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General', message: '' });
  const [errors, setErrors] = useState<any>({});
  const [sent, setSent] = useState(false);

  const onChange = (e: any) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const next: any = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.';
    if (form.phone && !isValidPakistanPhone(form.phone)) next.phone = 'Use a Pakistani mobile number.';
    if (!form.message.trim()) next.message = 'Please write a message.';
    if (Object.keys(next).length) { setErrors(next); return; }
    setSent(true);
  };

  return (
    <div className="info-page">
      <div className="container">
        <h1 className="info-page__title">Contact LifeStream</h1>
        <p className="info-page__lead">
          This is a Final Year Project demo. Messages are not emailed; you will see a confirmation on this page.
        </p>
        <div className="info-page__card">
          <p className="info-page__meta">
            Phone: <a href="tel:+9242111000111">{SUPPORT_PHONE}</a><br />
            Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><br />
            Hours: {SUPPORT_HOURS}<br />
            {LEGAL_ADDRESS}
          </p>
          {sent ? (
            <div className="info-page__result" role="status">
              Thank you, {form.name}. Your message was recorded in this demo. Our team would reply within one working day on the live product.
            </div>
          ) : (
            <form className="info-page__form" onSubmit={onSubmit} >
              <div>
                <label className="info-page__label" htmlFor="contact-name">Name</label>
                <input id="contact-name" name="name" className="info-page__input" value={form.name} onChange={onChange} />
                {errors.name && <span className="info-page__error" role="alert">{errors.name}</span>}
              </div>
              <div>
                <label className="info-page__label" htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" className="info-page__input" value={form.email} onChange={onChange} />
                {errors.email && <span className="info-page__error" role="alert">{errors.email}</span>}
              </div>
              <div>
                <label className="info-page__label" htmlFor="contact-phone">Phone (optional)</label>
                <input id="contact-phone" name="phone" type="tel" className="info-page__input" placeholder="0300-1234567" value={form.phone} onChange={onChange} />
                {errors.phone && <span className="info-page__error" role="alert">{errors.phone}</span>}
              </div>
              <div>
                <label className="info-page__label" htmlFor="contact-subject">Subject</label>
                <select id="contact-subject" name="subject" className="info-page__select" value={form.subject} onChange={onChange}>
                  <option>General</option>
                  <option>Urgent request</option>
                  <option>Donor registration</option>
                  <option>Technical issue</option>
                </select>
              </div>
              <div>
                <label className="info-page__label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows={5} className="info-page__textarea" value={form.message} onChange={onChange} />
                {errors.message && <span className="info-page__error" role="alert">{errors.message}</span>}
              </div>
              <button type="submit" className="info-page__btn">Send message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

