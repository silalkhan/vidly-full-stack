import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import CustomersPage from "./pages/CustomersPage";
import RentalsPage from "./pages/RentalsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
