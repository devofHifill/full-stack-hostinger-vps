import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiFetchJson } from "../utils/api";

export function useApiClient() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  async function request(endpoint, options = {}) {
    return await apiFetch(endpoint, {
      ...options,
      token,
    });
  }

  async function requestJson(endpoint, options = {}) {
    try {
      return await apiFetchJson(endpoint, {
        ...options,
        token,
      });
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
      throw error;
    }
  }

  return {
    request,
    requestJson,
    token,
  };
}