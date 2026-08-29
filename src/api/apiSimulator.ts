/**
 * Resolves with `data` after `delay` ms.
 * Replace call sites with real HTTP requests when a backend is available.
 */
export const simulateApi = (data, delay = 1200) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));
