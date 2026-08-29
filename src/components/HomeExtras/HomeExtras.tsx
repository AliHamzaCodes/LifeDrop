import { Link } from 'react-router-dom';
import { FAQS } from '../../data/helpcenter.data';
import './HomeExtras.scss';

const HomeExtras = () => (
  <>
    <section className="home-cta" aria-labelledby="home-emergency-heading">
      <div className="container home-cta__inner">
        <div>
          <h2 id="home-emergency-heading">Need blood for a patient?</h2>
          <p>Submit a request with hospital, units, and needed-by date. Compatible donors are listed on Search.</p>
        </div>
        <Link to="/request" className="home-cta__btn">Request blood</Link>
      </div>
    </section>

    <section className="home-teasers" aria-label="Learn more">
      <div className="container home-teasers__grid">
        <article className="home-teasers__card">
          <h3>Am I eligible?</h3>
          <p>A short quiz covering age, weight, last donation, and how you feel today. Educational only.</p>
          <Link to="/eligibility">Open eligibility checker</Link>
        </article>
        <article className="home-teasers__card">
          <h3>Who can donate to whom?</h3>
          <p>Use the compatibility chart, then search for matching donors in Pakistani cities.</p>
          <Link to="/compatibility">View compatibility chart</Link>
        </article>
        <article className="home-teasers__card">
          <h3>How matching works</h3>
          <p>Filter by city, name, or blood group. Compatible mode includes O− for every patient group.</p>
          <Link to="/search">Search donors</Link>
        </article>
      </div>
    </section>

    <section className="home-faq" aria-labelledby="home-faq-heading">
      <div className="container">
        <h2 id="home-faq-heading">Common questions</h2>
        <div className="home-faq__list">
          {FAQS.slice(0, 3).map((item) => (
            <article key={item.id}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
        <p className="home-faq__more"><Link to="/faq">See all FAQs</Link> · <Link to="/contact">Contact us</Link></p>
      </div>
    </section>
  </>
);

export default HomeExtras;
