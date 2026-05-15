import { request } from "./client";

export const historyApi = {
  get: ({ limit = 50, offset = 0, ioc_type = null, risk_level = null } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    if (ioc_type)   params.append("ioc_type",   ioc_type);
    if (risk_level) params.append("risk_level", risk_level);
    return request(`/history/?${params}`);
  },
  getFavorites:    ()          => request("/history/favorites"),
  search:          (q)         => request(`/history/search?q=${encodeURIComponent(q)}`),
  toggleFavorite:  (scan_id)   => request(`/history/${scan_id}/favorite`, { method: "PUT" }),
  delete:          (scan_id)   => request(`/history/${scan_id}`,          { method: "DELETE" }),
};