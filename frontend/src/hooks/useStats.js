import { useEffect, useState, useCallback } from "react";
import { getStats } from "@/lib/api";

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(
        "Couldn't reach the EcoVision AI backend. Confirm it's running and VITE_API_URL is set correctly."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            "Couldn't reach the EcoVision AI backend. Confirm it's running and VITE_API_URL is set correctly."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error, refetch };
}
