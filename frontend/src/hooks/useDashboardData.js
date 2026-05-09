import { useState, useEffect } from "react";
import { historyApi, statsApi } from "../api";

/**
 * Récupère l'historique des scans + les statistiques globales.
 * Retourne loading, scans, stats, et une fonction reload.
 */
export function useDashboardData() {
  const [scans,   setScans]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        historyApi.get({ limit: 100 }),
        statsApi.get(),
      ]);
      setScans(histRes.results || []);
      setStats(statsRes);
    } catch (e) {
      console.error("useDashboardData:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { loading, scans, stats, reload: load };
}