import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request; let the browser set multipart boundary for FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; store_name: string; phone: string }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: () => api.get("/products"),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post("/products", data),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  analyzePhoto: (formData: FormData) => api.post("/products/analyze-photo", formData),
  voiceAdd: (formData: FormData) => api.post("/products/voice-add", formData),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: (status?: string) => api.get("/orders", { params: status ? { status } : {} }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: object) => api.post("/orders", data),
  confirm: (id: string) => api.patch(`/orders/${id}/confirm`),
  reject: (id: string, reason?: string) => api.patch(`/orders/${id}/reject`, { reason }),
  delete: (id: string) => api.delete(`/orders/${id}`),
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  list: () => api.get("/inventory"),
  updateStock: (productId: string, quantity: number) =>
    api.patch(`/inventory/${productId}`, { quantity }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary: (period: "today" | "week" | "month") =>
    api.get("/analytics", { params: { period } }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message: string) => api.post("/chat", { message }),
};

// ── Voice ─────────────────────────────────────────────────────────────────────
export const voiceApi = {
  sendCommand: (audioBlob: Blob) => {
    const ext = audioBlob.type.includes("ogg") ? "ogg" : audioBlob.type.includes("mp4") ? "mp4" : "webm";
    const form = new FormData();
    form.append("audio", audioBlob, `command.${ext}`);
    return api.post("/voice-command", form);
  },
};
