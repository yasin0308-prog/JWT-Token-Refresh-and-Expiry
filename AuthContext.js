import React, { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const res = await API.post("/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      setUser({ email });
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const res = await API.post("/refresh", { refreshToken });
      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data.accessToken;
    } catch (error) {
      logout();
      return null;
    }
  };

  // Auto-refresh interceptor
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
    setLoading(false);
    return () => API.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
