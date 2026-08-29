/**
 * src/services/message.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Messaging / conversations API calls.
 * Swap `simulateApi(...)` for `apiClient.get(...)` when backend is ready.
 */

import { simulateApi } from '../api/apiSimulator';
import { initConversations, autoReplies } from '../data/messages.data';

/** Fetch the user's conversation list */
export const fetchConversations = () => simulateApi(initConversations);

/**
 * Get auto-reply messages for a conversation.
 * Returns a fallback array if no replies are found.
 */
export const getAutoReplies = (conversationId) =>
  autoReplies[conversationId] || ['Thanks for reaching out!'];
