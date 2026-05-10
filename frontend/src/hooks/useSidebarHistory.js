import { useState, useEffect } from "react";
import { historyApi }          from "../api/history";
import { formatDate, capitalize } from "../utils/formatUtils";

/**
 * Gère le chargement et la suppression de l'historique dans la sidebar.
 *
 * Toute cette logique était inline dans ChatSidebar.jsx,
 * qui se retrouvait à mélanger fetch, state, formatage et rendu.
 *
 * @param {boolean} open - La sidebar est-elle ouverte ? (déclenche le chargement)
 */
export function useSidebarHistory(open) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = () => {
    setLoading(true);
    historyApi
      .get({ limit: 50 })
      .then((data) => {
        const items = (data.results || []).map((s) => ({
          id:      s.id,
          title:   s.indicator,
          preview: `Score: ${s.risk_score ?? "??"}/100 · ${capitalize(s.risk_level ?? "inconnu")}`,
          date:    formatDate(s.created_at),
          type:    s.ioc_type,
        }));
        setHistory(items);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  // Recharge l'historique à chaque ouverture de la sidebar
  useEffect(() => {
    if (!open) return;
    loadHistory();
  }, [open]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await historyApi.delete(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return { history, loading, handleDelete };
}