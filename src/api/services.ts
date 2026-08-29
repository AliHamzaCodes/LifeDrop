/**
 * src/api/services.js  (Backwards-Compatibility Barrel)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file now re-exports everything from the domain-specific service files
 * in src/services/. Keeping this barrel ensures that any existing import paths
 * (e.g. `from '../../api/services'`) continue to work without changes.
 *
 * New code should import directly from the domain service:
 *   import { fetchDonors } from '../../services/donor.service';
 */

export { fetchDonors, fetchDonorBySlug } from '../services/donor.service';
export { fetchRequests, acceptRequest, cancelAcceptRequest, fulfillRequest } from '../services/request.service';
export { fetchConversations, getAutoReplies } from '../services/message.service';
export { fetchDashboardData }          from '../services/dashboard.service';
export { fetchProfileData }            from '../services/profile.service';
export { fetchAdminRequests, fetchAdminDonors, fetchAdminUsers } from '../services/admin.service';
export { fetchDonations }              from '../services/donation.service';
