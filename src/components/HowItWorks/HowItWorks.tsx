import './HowItWorks.scss';

const steps = [
  {
    id: 'step-register',
    number: 1,
    title: 'Create a profile',
    description:
      'Register, then complete donor details or a blood request. Eligibility is educational here; blood banks still screen in person.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'step-match',
    number: 2,
    title: 'Match by group and city',
    description:
      'Search verified donors by name, city, or blood group. Compatible mode includes groups that can donate to the patient type.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.183 4.068 1 6.5 1 8.28 1 9.65 1.735 11 3.348 12.35 1.735 13.72 1 15.5 1 17.932 1 21 3.183 21 7.191c0 4.105-5.37 8.863-11 14.402z" />
      </svg>
    ),
  },
  {
    id: 'step-connect',
    number: 3,
    title: 'Connect and donate',
    description:
      'Call a verified donor or track your request in the dashboard. The actual donation happens at a licensed hospital or blood bank.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="hiw-heading">
      <div className="container">
        <div className="how-it-works__header">
          <h2 id="hiw-heading">How matching works</h2>
          <p>A digital directory for Pakistan — not a clinic visit. We help you find people; hospitals confirm every transfusion.</p>
        </div>

        <div className="how-it-works__grid" role="list">
          {steps.map((step) => (
            <article
              key={step.id}
              id={step.id}
              className="how-it-works__step"
              role="listitem"
              aria-label={`Step ${step.number}: ${step.title}`}
            >
              <div className="how-it-works__step-header">
                <span className="how-it-works__step-number" aria-hidden="true">{step.number}</span>
                <div className="how-it-works__step-icon-wrap">{step.icon}</div>
              </div>
              <h3 className="how-it-works__step-title">{step.title}</h3>
              <p className="how-it-works__step-desc">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
