import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Module-level singleton — guaranteed one instance
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(undefined);
  });
  failedQueue = [];
};

// Dedicated refresh instance — no interceptors to avoid infinite loops
const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    const isRefreshCall = String(originalRequest?.url ?? "").includes(
      "/api/v1/auth/refresh"
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        // Don't call refresh again — just queue and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest._retry = true;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use dedicated instance to avoid interceptor loop
        await refreshApi.post("/api/v1/auth/refresh");
        processQueue(null);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        if (typeof window !== "undefined") {
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


















// import axios from "axios";

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config as typeof error.config & { _retry?: boolean };
//     if (error.response?.status === 401 && !originalRequest?._retry && !String(originalRequest?.url ?? "").includes("/api/v1/auth/refresh")) {
//       try {
//         originalRequest._retry = true;
//         await api.post("/api/v1/auth/refresh");
//         return api(originalRequest);
//       } catch {
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );
