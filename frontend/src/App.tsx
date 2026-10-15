import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";

import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import CustomersPage from "./pages/CustomersPage";
import RentalsPage from "./pages/RentalsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import GenresPage from "./pages/GenresPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <NavBar />
          <Routes>
            {/* Public routes: accessible without login */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes: login required */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Management routes are protected by both authentication and role. */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/rentals" element={<RentalsPage />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
