import { request } from "./index";

export const chatbotApi = {
  message: (message, session_id = null, model) =>
    request("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message, session_id, model }),
    }),

  bulk: (indicators, session_id = null, model) =>
    request("/chatbot/analyze/bulk", {
      method: "POST",
      body: JSON.stringify({ indicators, session_id, model }),
    }),
};
