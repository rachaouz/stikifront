import { request } from "./index";

// IOC enrichment direct
export const hashApi = {
  analyze: (hash) => request(`/hash/?param=${encodeURIComponent(hash)}`),
};

export const ipApi = {
  analyze: (ip) => request(`/ip/?param=${encodeURIComponent(ip)}`),
};

export const domainApi = {
  analyze: (domain) => request(`/domain/?param=${encodeURIComponent(domain)}`),
};

export const urlApi = {
  analyze: (url) => request(`/url/?param=${encodeURIComponent(url)}`),
};

export const mailApi = {
  analyze: (email) => request(`/mail/?email=${encodeURIComponent(email)}`),
};

export const cveApi = {
  analyze: (cve_id) => request(`/cve/?cve_id=${encodeURIComponent(cve_id)}`),
};

// IOC analyze
export const iocApi = {
  analyze: (indicator, force_rag = false) =>
    request(`/ioc/analyze?force_rag=${force_rag}`, {
      method: "POST",
      body: JSON.stringify({ indicator }),
    }),

  bulk: (indicators, force_rag = false) =>
    request("/ioc/bulk", {
      method: "POST",
      body: JSON.stringify({ indicators, force_rag }),
    }),
};
