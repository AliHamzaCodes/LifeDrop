//  Mock data for Active Requests — blood requests list, filter tabs, and
//  status configuration. FontAwesome icons are intentionally NOT imported here;
//  data files should be icon-library-agnostic. The component (ActiveRequests.jsx)
//  resolves iconKey strings to actual FA icon objects.

export const requests = [
  {
    id: 'req-1',
    blood: 'O+',
    hospital: 'City General Hospital',
    patient: 'Sarah Jenkins',
    neededBy: 'Oct 24, 2024',
    units: 2,
    status: 'Pending',
  },
  {
    id: 'req-2',
    blood: 'A-',
    hospital: 'Mercy Medical Center',
    patient: 'Michael Chang',
    neededBy: 'Oct 20, 2024',
    units: 1,
    status: 'Approved',
  },
  {
    id: 'req-3',
    blood: 'AB+',
    hospital: "St. Jude's Children's",
    patient: 'Emily Davis',
    neededBy: 'Oct 15, 2024',
    units: 3,
    status: 'Rejected',
  },
  {
    id: 'req-4',
    blood: 'B+',
    hospital: 'Metro Regional Blood Center',
    patient: 'Liam Torres',
    neededBy: 'Nov 02, 2024',
    units: 2,
    status: 'Pending',
  },
  {
    id: 'req-5',
    blood: 'O-',
    hospital: 'Sunrise Medical Hospital',
    patient: 'Aisha Patel',
    neededBy: 'Oct 30, 2024',
    units: 1,
    status: 'Approved',
  },
];

/** Filter tab labels */
export const filters = ['All', 'Pending', 'Approved', 'Rejected'];

/**
 * Maps request status → display label, iconKey (string), BEM modifier, and action text.
 * `iconKey` is resolved to a FontAwesome icon object inside ActiveRequests.jsx,
 * keeping this data file free of any icon-library imports.
 */
export const statusConfig = {
  Pending: {
    label: 'Pending Review',
    iconKey: 'clock',
    modifier: 'pending',
    action: 'View Details',
  },
  Approved: {
    label: 'Approved',
    iconKey: 'circleCheck',
    modifier: 'approved',
    action: 'Contact Donor',
  },
  Rejected: {
    label: 'Rejected',
    iconKey: 'circleXmark',
    modifier: 'rejected',
    action: 'View Reason',
  },
};
