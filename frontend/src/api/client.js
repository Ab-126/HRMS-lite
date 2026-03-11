import axios from "axios";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((e) => e.msg).join(", ")
      : detail || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default client;