import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import AuthContext, { type AuthContextType } from "./authContext";
import type { AuthenticatedUser } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  // Restore the saved token after a refresh.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["currentUser", token],
    queryFn: async () => {
      const response = await apiClient.get<AuthenticatedUser>("/users/me");
      return response.data;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("vidly:unauthorized", logout);
    return () => window.removeEventListener("vidly:unauthorized", logout);
  }, [logout]);

  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  const value: AuthContextType = {
    token,
    isAuthenticated: Boolean(token),
    isAdmin: profileQuery.data?.isAdmin === true,
    user: profileQuery.data ?? null,
    isLoading: Boolean(token) && profileQuery.isPending,
    profileError: profileQuery.error,
    login,
    logout,
    retryProfile: () => {
      void profileQuery.refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
