import axios from "axios";

export const api = axios.create({
  baseURL: "",  // relative URLs — same domain
  withCredentials: true,  // send cookies
  headers: { "Content-Type": "application/json" },
});

// For non-auth API calls that go directly to backend
export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;
    const isRefreshCall = String(original?.url ?? "").includes("/api/auth/refresh");
    const isLoginCall   = String(original?.url ?? "").includes("/api/auth/login");
    const skipRefresh   = original?.skipAuthRefresh || isRefreshCall || isLoginCall;

    if (error.response?.status === 401 && !original._retry && !skipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original)).catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Call Next.js refresh route — reads httpOnly cookie server-side
        await api.post("/api/auth/refresh");
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        if (!original.skipAuthRedirect && typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);