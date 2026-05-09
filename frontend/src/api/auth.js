import { request } from "./index";

export const authApi = {
  login: async (credentials) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("role", data.role);
    return data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
  },

  me: () => request("/auth/me"),

  updateProfile: (data) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  changePassword: (old_password, new_password) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ old_password, new_password }),
    }),

  listUsers: () => request("/auth/users"),

  createUser: (email, password) =>
    request("/auth/create-user", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  toggleUser: (user_id) =>
    request(`/auth/toggle-user/${user_id}`, { method: "PUT" }),

  deleteUser: (user_id) =>
    request(`/auth/delete-user/${user_id}`, { method: "DELETE" }),

  resetPassword: (user_id) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ user_id }),
    }),

  getLogs: (limit = 100) => request(`/auth/logs?limit=${limit}`),

  updateNgrokUrl: (llm_api_url) =>
    request("/auth/ngrok-url", {
      method: "PUT",
      body: JSON.stringify({ llm_api_url }),
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getResetRequests: () => request("/auth/reset-requests"),

  approveReset: (request_id, new_password) =>
    request(`/auth/approve-reset/${request_id}`, {
      method: "POST",
      body: JSON.stringify({ new_password }),
    }),

  rejectReset: (request_id) =>
    request(`/auth/reject-reset/${request_id}`, { method: "POST" }),
};
