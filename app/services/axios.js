import axios from "axios";

const api = axios.create({
  baseURL: "//school-repo-three.vercel.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ THIS IS THE FIX — delete Content-Type when sending FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default api;