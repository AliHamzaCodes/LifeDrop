import { useEffect, useRef } from 'react';

/**
 * useOutsideClick
 * ─────────────────────────────────────────────────────────────────────────────
 * Attaches a mousedown + touchstart listener to the document.
 * Calls `callback` when a click/touch happens outside the returned `ref`.
 *
 * @param {Function} callback   - Called when an outside click is detected.
 * @param {boolean}  [enabled=true] - Set to false to temporarily disable.
 *
 * @returns {React.RefObject} ref — Attach this to the element you want to watch.
 *
 * Usage:
 *   const dropdownRef = useOutsideClick(() => setOpen(false));
 *   <div ref={dropdownRef}>...</div>
 */
const useOutsideClick = (callback, enabled = true) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleEvent = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback(e);
      }
    };

    document.addEventListener('mousedown', handleEvent);
    document.addEventListener('touchstart', handleEvent);

    return () => {
      document.removeEventListener('mousedown', handleEvent);
      document.removeEventListener('touchstart', handleEvent);
    };
  }, [callback, enabled]);

  return ref;
};

export default useOutsideClick;
