import { useState, type ReactNode } from "react";
import AuthContext, { type AuthContextType } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

type TokenPayload = {
  isAdmin?: boolean;
};

function getIsAdmin(token: string | null): boolean {
  if (!token) return false;

  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64)) as TokenPayload;

    return decoded.isAdmin === true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Restore the saved token after a refresh.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const isAdmin = getIsAdmin(token);

  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  const value: AuthContextType = {
    token,
    isAuthenticated: Boolean(token),
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
