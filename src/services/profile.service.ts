/**
 * src/services/profile.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * User profile data API calls.
 * Swap `simulateApi(...)` for `apiClient.get(...)` when backend is ready.
 */

import { simulateApi } from '../api/apiSimulator';
import {
  lifestyleItems,
  timelineEvents,
  achievements,
  notifPrefs,
} from '../data/profile.data';

/** Fetch the current user's full profile data */
export const fetchProfileData = () =>
  simulateApi({ lifestyleItems, timelineEvents, achievements, notifPrefs });
