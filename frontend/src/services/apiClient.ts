import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3003"}/api`,
});

//Add an Axios interceptor so every API request automatically includes the saved token.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["x-auth-token"] = token;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 ||
        (error.response?.status === 404 &&
          error.config?.url?.replace(/\/$/, "").endsWith("/users/me"))) &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("vidly:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
//This will automatically attach the token to requests made through apiClient.
