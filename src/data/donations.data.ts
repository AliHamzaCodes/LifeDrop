/**
 * src/data/donations.data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock data for Donation History — past donation records and table column config.
 * Consumed by: DonationHistory.jsx
 * Next step  : wrap in src/services/donations.service.js with fake async API.
 */

export const donationData = [
  {
    id: 'don-1',
    date: 'Aug 28, 2024',
    rawDate: new Date('2024-08-28'),
    location: 'Metro Regional Blood Center',
    type: 'Whole Blood',
    volume: '450ml',
    status: 'Completed',
  },
  {
    id: 'don-2',
    date: 'May 12, 2024',
    rawDate: new Date('2024-05-12'),
    location: 'City General Hospital',
    type: 'Plasma',
    volume: '800ml',
    status: 'Completed',
  },
  {
    id: 'don-3',
    date: 'Feb 05, 2024',
    rawDate: new Date('2024-02-05'),
    location: 'Community Drive - Westside',
    type: 'Whole Blood',
    volume: '450ml',
    status: 'Completed',
  },
  {
    id: 'don-4',
    date: 'Oct 14, 2023',
    rawDate: new Date('2023-10-14'),
    location: 'Sunrise Donation Hub',
    type: 'Platelets',
    volume: '300ml',
    status: 'Completed',
  },
  {
    id: 'don-5',
    date: 'Jun 30, 2023',
    rawDate: new Date('2023-06-30'),
    location: 'Metro Regional Blood Center',
    type: 'Whole Blood',
    volume: '450ml',
    status: 'Completed',
  },
];

/** Table column definitions — used to render headers and drive sorting logic */
export const columns = [
  { key: 'date',     label: 'Date',          sortable: true  },
  { key: 'location', label: 'Location',      sortable: true  },
  { key: 'type',     label: 'Donation Type', sortable: true  },
  { key: 'volume',   label: 'Volume',        sortable: false },
  { key: 'status',   label: 'Status',        sortable: false },
];
