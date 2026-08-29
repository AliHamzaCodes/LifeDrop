export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const BLOOD_COMPONENTS = ['Whole Blood', 'Plasma', 'Platelets'];

/** Compatible donor groups for a recipient blood group */
export const COMPATIBLE_DONORS = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/** Who a donor of this group can give to */
export const COMPATIBLE_RECIPIENTS = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export const isCompatibleDonor = (donorGroup, neededGroup) => {
  const list = COMPATIBLE_DONORS[neededGroup];
  if (!list) return donorGroup === neededGroup;
  return list.includes(donorGroup);
};

export const parseBloodGroupQuery = (q) => {
  const normalized = (q || '').trim().toUpperCase().replace(/\s+/g, '');
  return BLOOD_GROUPS.find((g) => g === normalized) || null;
};
