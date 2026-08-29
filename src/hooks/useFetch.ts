import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFetch
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic hook that calls an async `fetchFn` and manages loading / error state.
 * Safe: cancels pending updates if the component unmounts before the fetch
 * resolves (prevents "setState on unmounted component" warnings).
 *
 * @param {Function} fetchFn   - Async function that returns the data.
 *                               Can accept arguments via the `args` param.
 * @param {Array}    [deps=[]] - Re-fetch when any value in this array changes.
 *                               Pass `null` to disable auto-fetch (manual mode).
 *
 * @returns {{
 *   data:    any,
 *   loading: boolean,
 *   error:   string | null,
 *   refetch: Function,
 * }}
 *
 * Usage (auto-fetch):
 *   const { data: donors, loading, error } = useFetch(fetchDonors);
 *
 * Usage (with deps):
 *   const { data } = useFetch(() => fetchDonorById(id), [id]);
 *
 * Usage (manual / disabled):
 *   const { data, refetch } = useFetch(fetchDonors, null);
 *   // Call refetch() whenever you want to load
 */
const useFetch = (fetchFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(deps !== null); // start loading only if auto-fetch
  const [error, setError]     = useState(null);

  // Keep a ref so we can cancel if the component unmounts
  const cancelledRef = useRef(false);

  const execute = useCallback(async () => {
    if (!fetchFn) return;
    cancelledRef.current = false;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (!cancelledRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (!cancelledRef.current) {
        const message =
          err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.';
        setError(message);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (deps === null) return; // manual mode — don't auto-fetch
    execute();

    return () => {
      cancelledRef.current = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute };
};

export default useFetch;
