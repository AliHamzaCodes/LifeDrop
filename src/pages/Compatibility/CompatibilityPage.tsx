import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { BLOOD_GROUPS, COMPATIBLE_DONORS, COMPATIBLE_RECIPIENTS } from '../../constants/blood';
import '../shared/InfoPage.scss';

const CompatibilityPage = () => {
  usePageTitle('Blood Compatibility');

  return (
    <div className="info-page">
      <div className="container">
        <h1 className="info-page__title">Blood group compatibility</h1>
        <p className="info-page__lead">
          Hospitals still confirm compatibility in the lab. Use this chart to find likely donor matches, then{' '}
          <Link to="/search">search verified donors</Link>.
        </p>
        <div className="info-page__grid">
          {BLOOD_GROUPS.map((group) => (
            <article className="info-page__cell" key={group}>
              <strong>Patient {group}</strong>
              Can receive from: {COMPATIBLE_DONORS[group].join(', ')}
            </article>
          ))}
        </div>
        <h2 className="info-page__title" style={{ fontSize: '1.5rem', marginTop: '2.5rem' }}>If you are a donor</h2>
        <div className="info-page__grid">
          {BLOOD_GROUPS.map((group) => (
            <article className="info-page__cell" key={`d-${group}`}>
              <strong>Donor {group}</strong>
              Can give to: {COMPATIBLE_RECIPIENTS[group].join(', ')}
            </article>
          ))}
        </div>
        <p className="info-page__disclaimer">
          O− is often called the universal red-cell donor; AB+ is often the universal recipient. Plasma compatibility can differ. Always follow hospital protocol.
        </p>
      </div>
    </div>
  );
};

export default CompatibilityPage;
