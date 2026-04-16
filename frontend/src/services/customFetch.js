import axios from "axios";

const customFetch = axios.create({
  baseURL: "/api", // Match backend routes
  withCredentials: true,
});

// Request interceptor to add Bearer token
// Request interceptor (Optional - currently just passes config)
customFetch.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
customFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      // Skip redirect if already on login page so error toasts can display
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default customFetch;
