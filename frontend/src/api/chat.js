import { request } from "./index";

export const chatSessionsApi = {
  create: (title = "Nouvelle conversation") =>
    request("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  list: () => request("/chat/sessions"),

  delete: (session_id) =>
    request(`/chat/sessions/${session_id}`, { method: "DELETE" }),

  rename: (session_id, title) =>
    request(`/chat/sessions/${session_id}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),

  getMessages: (session_id) =>
    request(`/chat/sessions/${session_id}/messages`),

  addMessage: (session_id, message) =>
    request(`/chat/sessions/${session_id}/messages`, {
      method: "POST",
      body: JSON.stringify({ session_id, message }),
    }),
};
