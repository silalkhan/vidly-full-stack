import { createContext } from "react";

export type AuthenticatedUser = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  profileError: Error | null;
  login: (token: string) => void;
  logout: () => void;
  retryProfile: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
