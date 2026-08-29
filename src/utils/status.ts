export const REQUEST_STATUS = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

export const DONOR_STATUS = {
  pending: 'pending',
  verified: 'verified',
};

export const normalizeRequestStatus = (status: string) => {
  const key = String(status || '').toLowerCase();
  if (key === 'approved') return REQUEST_STATUS.Approved;
  if (key === 'rejected') return REQUEST_STATUS.Rejected;
  return REQUEST_STATUS.Pending;
};

export const isPendingRequest = (status: string) =>
  normalizeRequestStatus(status) === REQUEST_STATUS.Pending;

export const requestBloodGroup = (req: any) => req?.bloodGroup || req?.blood || '—';

export const donorLastDonated = (donor: any) =>
  donor?.last_donation_date || donor?.lastDonated || donor?.lastDonation || 'Not recorded';

export const getCooldownDaysLeft = (lastDonatedString: string | null | undefined): number => {
  if (!lastDonatedString || lastDonatedString === 'Not recorded' || lastDonatedString === 'Never') return 0;
  try {
    const lastDonated = new Date(lastDonatedString);
    if (isNaN(lastDonated.getTime())) return 0;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDonated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 90) {
      return 90 - diffDays;
    }
    return 0;
  } catch (e) {
    return 0;
  }
};

export const isDonorOnCooldown = (lastDonatedString: string | null | undefined): boolean => {
  return getCooldownDaysLeft(lastDonatedString) > 0;
};
