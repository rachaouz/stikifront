const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

async function download(path, filename) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Re-export all API modules
export { authApi } from "./auth";
export { hashApi, ipApi, domainApi, urlApi, mailApi, cveApi, iocApi } from "./ioc";
export { chatbotApi } from "./chatbot";
export { chatSessionsApi } from "./chat";
export { historyApi } from "./history";
export { statsApi } from "./stats";
export { exportApi } from "./export";

// Export utilities for use in modules
export { request, download, BASE_URL, authHeaders };
