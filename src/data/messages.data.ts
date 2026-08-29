/**
 * src/data/messages.data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock data for the Messages screen — conversations (with embedded messages)
 * and auto-reply seeds used for the typing-indicator simulation.
 * Consumed by: Messages.jsx
 * Next step  : wrap in src/services/messages.service.js with fake async API.
 */

export const initConversations = [
  {
    id: 'conv-1',
    name: 'Dr. Sarah Chen',
    role: 'Hematology Specialist',
    initials: 'SC',
    avatarColor: '#c0392b',
    online: true,
    urgent: true,
    lastMessage: 'Your AB+ request is being processed...',
    timestamp: '10:46 AM',
    messages: [
      {
        id: 'm1', from: 'them', type: 'text',
        text: "Hello! I'm reviewing the emergency request for AB+ blood for the city hospital. Are you currently available to donate?",
        time: '10:42 AM', read: true, date: 'TODAY',
      },
      {
        id: 'm2', from: 'me', type: 'text',
        text: "Yes, Dr. Chen. I am available. I can be at the hospital in about 45 minutes. Is there anything specific I should prepare?",
        time: '10:44 AM', read: true,
      },
      {
        id: 'm3', from: 'them', type: 'text',
        text: "That's wonderful news. We have the requisition ready. Please bring your donor ID card.",
        time: '10:45 AM', read: true,
      },
      {
        id: 'm4', from: 'them', type: 'file',
        fileName: 'Emergency_Requisition_AB.pdf',
        fileSize: '1.2 MB',
        time: '10:45 AM', read: true,
      },
      {
        id: 'm5', from: 'them', type: 'text',
        text: 'Your AB+ request is being processed and your slot is reserved for 11:30 AM.',
        time: '10:46 AM', read: true, divider: 'NEW MESSAGES',
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Marcus Miller',
    role: 'Blood Donor • O+',
    initials: 'MM',
    avatarColor: '#2c3e50',
    online: false,
    urgent: false,
    lastMessage: 'Thanks for the donor reference!',
    timestamp: 'Yesterday',
    messages: [
      {
        id: 'm1', from: 'them', type: 'text',
        text: 'Hi! I saw your blood request for O+ type. I can help.',
        time: '9:10 AM', read: true, date: 'YESTERDAY',
      },
      {
        id: 'm2', from: 'me', type: 'text',
        text: 'That would be amazing, Marcus. We urgently need it for Metro Hospital.',
        time: '9:15 AM', read: true,
      },
      {
        id: 'm3', from: 'them', type: 'text',
        text: 'Thanks for the donor reference! I will head there first thing in the morning.',
        time: '9:22 AM', read: true,
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Hospital Central Blood Bank',
    role: 'Blood Bank Coordinator',
    initials: 'HB',
    avatarColor: '#8e44ad',
    online: true,
    urgent: false,
    lastMessage: 'Confirmation of your appointment...',
    timestamp: 'Mon',
    messages: [
      {
        id: 'm1', from: 'them', type: 'text',
        text: 'Good afternoon. This is a confirmation of your appointment scheduled for Monday at 2:00 PM.',
        time: '2:30 PM', read: true, date: 'MONDAY',
      },
      {
        id: 'm2', from: 'me', type: 'text',
        text: 'Thank you! I will be there on time.',
        time: '2:35 PM', read: true,
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'Volunteer Group #42',
    role: 'Group • 8 members',
    initials: 'VG',
    avatarColor: '#16a085',
    online: false,
    isGroup: true,
    urgent: false,
    lastMessage: "Elena: I'll be there by noon.",
    timestamp: 'Oct 12',
    messages: [
      {
        id: 'm1', from: 'them', sender: 'Elena R.', type: 'text',
        text: "Everyone confirmed for Saturday's blood drive at Westside Community Center?",
        time: '10:00 AM', read: true, date: 'OCT 12',
      },
      {
        id: 'm2', from: 'me', type: 'text',
        text: "Yes, I'll be there!",
        time: '10:05 AM', read: true,
      },
      {
        id: 'm3', from: 'them', sender: 'Elena R.', type: 'text',
        text: "I'll be there by noon.",
        time: '10:08 AM', read: true,
      },
    ],
  },
];

/** Auto-reply pool per conversation — used to simulate incoming responses */
export const autoReplies = {
  'conv-1': ["Got it! We'll see you at 11:30 AM sharp.", "Please don't eat anything heavy before your appointment."],
  'conv-2': ["Sure, happy to help anytime!", "Let me know if you need any other references."],
  'conv-3': ["Your records have been updated.", "See you on Monday!"],
  'conv-4': ["Great! See you all Saturday 🩸", "Reminder: bring your donor ID cards."],
};
