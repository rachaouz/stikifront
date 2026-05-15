import { download } from "./client";

function buildExportParams({ ioc_type, risk_level } = {}) {
  const params = new URLSearchParams();
  if (ioc_type)   params.append("ioc_type",   ioc_type);
  if (risk_level) params.append("risk_level", risk_level);
  return params.toString();
}

function makeExporter(format, filename) {
  return (filters) => {
    const qs = buildExportParams(filters);
    return download(`/export/${format}${qs ? "?" + qs : ""}`, filename);
  };
}

export const exportApi = {
  csv:  makeExporter("csv",  "export_ti.csv"),
  json: makeExporter("json", "export_ti.json"),
  pdf:  makeExporter("pdf",  "export_ti.pdf"),
};