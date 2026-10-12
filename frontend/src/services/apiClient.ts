import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
});

//Add an Axios interceptor so every API request automatically includes the saved token.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["x-auth-token"] = token;
  }

  return config;
});

export default apiClient;
//This will automatically attach the token to requests made through apiClient.
