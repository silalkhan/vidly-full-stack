import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // Redirect logged-out users to Login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the matching child route.
  return <Outlet />;
}

export default ProtectedRoute;
