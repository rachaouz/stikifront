import { download } from "./index";

export const exportApi = {
  csv: ({ ioc_type, risk_level } = {}) => {
    const params = new URLSearchParams();
    if (ioc_type) params.append("ioc_type", ioc_type);
    if (risk_level) params.append("risk_level", risk_level);
    return download(`/export/csv?${params}`, "export_ti.csv");
  },

  json: ({ ioc_type, risk_level } = {}) => {
    const params = new URLSearchParams();
    if (ioc_type) params.append("ioc_type", ioc_type);
    if (risk_level) params.append("risk_level", risk_level);
    return download(`/export/json?${params}`, "export_ti.json");
  },

  pdf: ({ ioc_type, risk_level } = {}) => {
    const params = new URLSearchParams();
    if (ioc_type) params.append("ioc_type", ioc_type);
    if (risk_level) params.append("risk_level", risk_level);
    return download(`/export/pdf?${params}`, "export_ti.pdf");
  },
};
