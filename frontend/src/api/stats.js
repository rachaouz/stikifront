import { request } from "./client";

export const statsApi = {
  get: ({ ioc_type = null, date_from = null, date_to = null } = {}) => {
    const params = new URLSearchParams();
    if (ioc_type)  params.append("ioc_type",  ioc_type);
    if (date_from) params.append("date_from", date_from);
    if (date_to)   params.append("date_to",   date_to);
    const qs = params.toString();
    return request(`/stats/${qs ? "?" + qs : ""}`);
  },
};