/**
 * src/data/profile.data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock data for the My Profile screen — lifestyle tracker, donation timeline,
 * achievement badges, and notification preference seeds.
 * Consumed by: MyProfile.jsx
 * Next step  : wrap in src/services/profile.service.js with fake async API.
 */

import {
  faGlassWater,
  faBed,
  faPersonRunning,
  faAppleWhole,
  faLeaf,
  faHeart,
  faFire,
  faStar,
  faAward,
  faBell,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';

// ── Lifestyle Tracker ─────────────────────────────────────────────────────────
export const lifestyleItems = [
  { id: 'ls-water',    icon: faGlassWater,    label: 'Hydration',   value: '2.4L',   target: '3L',    pct: 80,  color: '#0ea5e9' },
  { id: 'ls-sleep',    icon: faBed,           label: 'Sleep',       value: '7h',     target: '8h',    pct: 87,  color: '#8b5cf6' },
  { id: 'ls-exercise', icon: faPersonRunning, label: 'Activity',    value: '5.2km',  target: '8km',   pct: 65,  color: '#f59e0b' },
  { id: 'ls-diet',     icon: faAppleWhole,    label: 'Diet Score',  value: '82/100', target: '100',   pct: 82,  color: '#10b981' },
  { id: 'ls-iron',     icon: faLeaf,          label: 'Iron Level',  value: 'Good',   target: 'Great', pct: 70,  color: '#c0392b' },
];

// ── Donation Timeline ─────────────────────────────────────────────────────────
export const timelineEvents = [
  { id: 'tl-1', date: 'Oct 10, 2025', hospital: 'City General Hospital',   units: '450ml', blood: 'O+', badge: 'Whole Blood' },
  { id: 'tl-2', date: 'Jul 02, 2025', hospital: "Metro Children's Clinic", units: '450ml', blood: 'O+', badge: 'Whole Blood' },
  { id: 'tl-3', date: 'Mar 15, 2025', hospital: 'Westside General',        units: '450ml', blood: 'O+', badge: 'Whole Blood' },
  { id: 'tl-4', date: 'Nov 20, 2024', hospital: 'Sunrise Medical Hub',     units: '450ml', blood: 'O+', badge: 'Platelet'    },
];

// ── Achievement Badges ────────────────────────────────────────────────────────
export const achievements = [
  { id: 'ach-1', label: 'Life Saver',    icon: faHeart, earned: true,  desc: '10+ donations'  },
  { id: 'ach-2', label: 'Streak Master', icon: faFire,  earned: true,  desc: '5 consecutive'  },
  { id: 'ach-3', label: 'Gold Donor',    icon: faStar,  earned: true,  desc: 'Top 10% donor'  },
  { id: 'ach-4', label: 'Hero Badge',    icon: faAward, earned: false, desc: '20 donations'   },
];

// ── Notification Preferences ──────────────────────────────────────────────────
export const notifPrefs = [
  { id: 'notif-urgent', label: 'Urgent Blood Requests',  desc: 'Critical alerts near you',         icon: faBell,          default: true  },
  { id: 'notif-appt',   label: 'Appointment Reminders',  desc: '24h before your next donation',    icon: faCalendarCheck, default: true  },
  { id: 'notif-news',   label: 'Community Updates',      desc: 'Blood drive events & news',        icon: faLeaf,          default: false },
];
