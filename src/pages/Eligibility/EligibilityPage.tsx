import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import '../shared/InfoPage.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface EligibilityState {
  age: string;
  gender: string;
  weight: string;
  lastDonation: string;
  illness: string;
  tattoo: string;
  travel: string;
  chronic: string;
}

interface ResultState {
  status: 'green' | 'yellow' | 'red';
  title: string;
  reasons: string[];
}

const EligibilityPage = () => {
  usePageTitle('Donation Eligibility | LifeDrop');
  
  const [answers, setAnswers] = useState<EligibilityState>({
    age: '',
    gender: '',
    weight: '',
    lastDonation: '',
    illness: '',
    tattoo: '',
    travel: '',
    chronic: ''
  });

  const [result, setResult] = useState<ResultState | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnswers(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const calculateProgress = () => {
    const total = 8;
    const answered = Object.values(answers).filter(val => val !== '').length;
    return { answered, total };
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ageNum = parseInt(answers.age, 10);
    const weightNum = parseFloat(answers.weight);
    
    const redReasons: string[] = [];
    const yellowReasons: string[] = [];

    // 1. Age Logic
    if (ageNum < 16) {
      redReasons.push('You must be at least 16 years old to donate blood.');
    } else if (ageNum === 16) {
      yellowReasons.push('As a 16-year-old, you may need parental consent to donate.');
    } else if (ageNum > 65) {
      yellowReasons.push('Donors over 65 should consult a physician before donating.');
    }

    // 2. Weight Logic
    if (weightNum < 45) {
      redReasons.push('You must weigh at least 45 kg (preferably 50 kg) to safely donate.');
    } else if (weightNum >= 45 && weightNum < 50) {
      yellowReasons.push('Your weight is borderline (45-49kg). Please consult the donation center.');
    }

    // 3. Gender & Last Donation Interval
    if (answers.lastDonation !== 'never') {
      if (answers.gender === 'male' && answers.lastDonation === '<3') {
        redReasons.push('Men must wait at least 12 weeks (3 months) between whole-blood donations.');
      } else if (answers.gender === 'female' && (answers.lastDonation === '<3' || answers.lastDonation === '3-4')) {
        redReasons.push('Women must wait at least 16 weeks (4 months) between whole-blood donations.');
      }
    }

    // 4. Illness
    if (answers.illness === 'yes') {
      redReasons.push('You must be fully recovered and symptom-free for at least 48 hours before donating.');
    }

    // 5. Tattoo/Piercing
    if (answers.tattoo === 'yes') {
      redReasons.push('You must wait 6 months after receiving a tattoo or piercing before donating.');
    }

    // 6. Travel
    if (answers.travel === 'yes') {
      yellowReasons.push('Recent travel to malaria/dengue areas may require a temporary deferral. Please consult your local blood bank.');
    }

    // 7. Chronic Condition
    if (answers.chronic === 'yes') {
      yellowReasons.push('Please consult a physician regarding your chronic condition or medications before donating.');
    }

    // Determine Result State
    if (redReasons.length > 0) {
      setResult({
        status: 'red',
        title: 'Not eligible right now',
        reasons: redReasons
      });
    } else if (yellowReasons.length > 0) {
      setResult({
        status: 'yellow',
        title: 'Likely eligible — Please Confirm',
        reasons: yellowReasons
      });
    } else {
      setResult({
        status: 'green',
        title: 'You appear eligible to donate!',
        reasons: [
          'You meet the general age and weight requirements.',
          'Sufficient time has passed since your last donation.',
          'No recent high-risk activities or illnesses reported.'
        ]
      });
    }
  };

  const resetForm = () => {
    setResult(null);
    setAnswers({ age: '', gender: '', weight: '', lastDonation: '', illness: '', tattoo: '', travel: '', chronic: '' });
  };

  const progress = calculateProgress();

  return (
    <div className="info-page">
      <div className="container">
        <h1 className="info-page__title">Donation eligibility checker</h1>
        <p className="info-page__lead">
          Answer a few questions based on WHO-style donor criteria to see if you can donate today.
        </p>

        <div className="info-page__card glass-panel">
          {!result ? (
            <form className="info-page__form" onSubmit={onSubmit}>
              <div className="form-progress">
                <span className="progress-text">Question {progress.answered} of {progress.total} answered</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(progress.answered / progress.total) * 100}%` }}></div>
                </div>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-age">1. What is your age?</label>
                <input 
                  type="number" id="elig-age" name="age" className="info-page__input" 
                  min="0" max="120" value={answers.age} onChange={onChange} required 
                  placeholder="e.g. 25"
                />
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-gender">2. What is your gender?</label>
                <select id="elig-gender" name="gender" className="info-page__select" value={answers.gender} onChange={onChange} required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-weight">3. What is your weight (kg)?</label>
                <input 
                  type="number" id="elig-weight" name="weight" className="info-page__input" 
                  min="0" max="300" step="0.1" value={answers.weight} onChange={onChange} required 
                  placeholder="e.g. 65"
                />
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-lastDonation">4. When was your last whole-blood donation?</label>
                <select id="elig-lastDonation" name="lastDonation" className="info-page__select" value={answers.lastDonation} onChange={onChange} required>
                  <option value="">Select timeframe</option>
                  <option value="never">Never donated</option>
                  <option value="<3">Less than 3 months ago</option>
                  <option value="3-4">3-4 months ago</option>
                  <option value=">4">More than 4 months ago</option>
                </select>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-illness">5. Do you currently have a fever, cold, flu, or active infection?</label>
                <select id="elig-illness" name="illness" className="info-page__select" value={answers.illness} onChange={onChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-tattoo">6. Have you had a tattoo or piercing in the last 6 months?</label>
                <select id="elig-tattoo" name="tattoo" className="info-page__select" value={answers.tattoo} onChange={onChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-travel">7. Have you traveled to a malaria or dengue-affected area in the last 3 months?</label>
                <select id="elig-travel" name="travel" className="info-page__select" value={answers.travel} onChange={onChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="info-page__label" htmlFor="elig-chronic">8. Do you have any chronic condition, take blood-thinners, or are currently pregnant/breastfeeding?</label>
                <select id="elig-chronic" name="chronic" className="info-page__select" value={answers.chronic} onChange={onChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <button type="submit" className="info-page__btn btn-primary">Check Eligibility</button>
            </form>
          ) : (
            <div className={`info-page__result result-${result.status}`} role="alert">
              <div className="result-header">
                {result.status === 'green' && <FontAwesomeIcon icon={faCheckCircle} className="result-icon" />}
                {result.status === 'yellow' && <FontAwesomeIcon icon={faExclamationTriangle} className="result-icon" />}
                {result.status === 'red' && <FontAwesomeIcon icon={faTimesCircle} className="result-icon" />}
                <h2>{result.title}</h2>
              </div>
              
              <ul className="result-reasons">
                {result.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>

              <div className="result-actions">
                {result.status !== 'red' && (
                  <Link to="/auth" className="btn btn-primary">Register to Donate</Link>
                )}
                <button onClick={resetForm} className="btn btn-outline">
                  <FontAwesomeIcon icon={faArrowLeft} /> Check Again
                </button>
              </div>
            </div>
          )}

          <div className="info-page__disclaimer">
            <p><strong>Disclaimer:</strong> This checklist follows general WHO donor guidelines and is educational only — not a medical diagnosis. Licensed blood banks perform full screening including hemoglobin and blood pressure tests before any donation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityPage;
