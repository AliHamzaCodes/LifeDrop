/**
 * Shared FAQ and help-category copy for the dashboard Help Center and public FAQ page.
 */

export const HELP_CATEGORIES = [
  {
    id: 'post-donation',
    iconKey: 'heartPulse',
    title: 'After donation',
    desc: 'Rest, fluids, and when you can donate whole blood again.',
    color: 'red',
  },
  {
    id: 'account-privacy',
    iconKey: 'userShield',
    title: 'Account & privacy',
    desc: 'How this demo stores your session in the browser.',
    color: 'blue',
  },
  {
    id: 'blood-requests',
    iconKey: 'droplet',
    title: 'Blood requests',
    desc: 'How to submit and track a request for a patient.',
    color: 'rose',
  },
  {
    id: 'eligibility',
    iconKey: 'circleCheck',
    title: 'Eligibility',
    desc: 'Age, weight, and typical waiting periods.',
    color: 'green',
  },
  {
    id: 'donation-process',
    iconKey: 'bookOpen',
    title: 'How matching works',
    desc: 'Search by city, name, and compatible blood groups.',
    color: 'amber',
  },
  {
    id: 'emergency',
    iconKey: 'bolt',
    title: 'Urgent help',
    desc: 'Use Request Blood and Contact — this demo has no live chat.',
    color: 'purple',
  },
];

export const FAQS = [
  {
    id: 'faq-1',
    question: 'How often can I donate whole blood?',
    answer:
      'A common interval is about 12 weeks (roughly three months) between whole-blood donations. Plasma and platelets can have different gaps. Always follow the licensed blood bank that screens you.',
  },
  {
    id: 'faq-2',
    question: 'Who can typically donate in Pakistan?',
    answer:
      'Educational guidance used in this app: about 18–65 years old, at least 50 kg, and feeling well on the day. Final eligibility is decided by trained staff after a health history and haemoglobin check — not by this website.',
  },
  {
    id: 'faq-3',
    question: 'How do I find a compatible donor?',
    answer:
      'Open Search, pick the patient’s blood group, and choose Compatible donors. O− can donate red cells to all groups in the usual chart; hospitals still confirm compatibility in the lab.',
  },
  {
    id: 'faq-4',
    question: 'Can I request blood without an account?',
    answer:
      'Yes. Guests must leave an email so the request can be followed up. Create an account if you want the request to appear in Dashboard. This demo stores data in your browser only.',
  },
  {
    id: 'faq-5',
    question: 'Is my data encrypted or emailed?',
    answer:
      'No. LifeStream is a Final Year Project frontend demo. Accounts and requests are saved in localStorage. There is no real email, Google sign-in, or hospital integration yet.',
  },
  {
    id: 'faq-6',
    question: 'What should I do before donating?',
    answer:
      'Eat a normal meal, drink water, and bring a valid ID to the blood bank. Avoid donating if you have a fever or feel unwell. Iron-rich foods (spinach, meat, lentils) support recovery afterwards.',
  },
];
