import { useEffect } from 'react';

/**
 * Sets document.title for the current page.
 * Appends the brand name automatically: "Page Name | LifeStream"
 *
 * @param {string} title - The page-specific title (e.g. "Find a Donor")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | LifeStream` : 'LifeStream — Blood Donation Network';
    return () => {
      document.title = prev;
    };
  }, [title]);
};

export default usePageTitle;
