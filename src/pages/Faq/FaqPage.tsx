import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { FAQS } from '../../data/helpcenter.data';
import '../shared/InfoPage.scss';

const FaqPage = () => {
  usePageTitle('FAQ');
  const [open, setOpen] = useState<string | null>(FAQS[0]?.id ?? null);

  return (
    <div className="info-page">
      <div className="container">
        <h1 className="info-page__title">Frequently asked questions</h1>
        <p className="info-page__lead">
          Practical answers for donors and families requesting blood in Pakistan. For a personal check, use the{' '}
          <Link to="/eligibility">eligibility checker</Link> or <Link to="/compatibility">compatibility chart</Link>.
        </p>
        <div className="info-page__faq">
          {FAQS.map((item) => (
            <div className="info-page__faq-item" key={item.id}>
              <button
                type="button"
                className="info-page__faq-q"
                aria-expanded={open === item.id}
                onClick={() => setOpen((id) => (id === item.id ? null : item.id))}
              >
                {item.question}
              </button>
              {open === item.id && (
                <p className="info-page__faq-a">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
