import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WorkerDashboard from "./pages/Worker/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import Inventory from "./pages/Admin/Inventory";
import AddOrder from "./pages/Worker/AddOrder";
import OrderDetails from "./pages/Worker/OrderDetails";
import FormulaBin from "./pages/Admin/FormulaBin";
import LoginPage from "./pages/LoginPage";
import OrderInputPageAdmin from "./pages/Admin/AddOrderAdmin";
import Orders from "./pages/Admin/Orders";
import Sidebar from "./components/Sidebar"; // Import Sidebar only once in Layout
import Navbar from "./components/Navbar"; // Import Navbar
import "./App.css";
import CustomKanban from "./pages/Admin/Kanboard";
import InventoryLogging from "./pages/Admin/InventoryLogging";
import FormulaInventory from "./pages/Admin/FormulaInventory";
import ProductBin from "./pages/Admin/ProductBin";
import ProductInventory from "./pages/Admin/ProductInventory";
import TranslationService from "./utils/TranslationService";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, user }) => {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);

  // Check for stored user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Function to handle login
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser)); // Persist user
  };

  // Function to handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear user from storage
  };

  return (
    <Router>
      <div className="app-container">
        {/* Include Navbar */}
        <Navbar user={user} onLogout={handleLogout} />

        <div className="flex h-screen">
          {/* Show Sidebar only when the user is logged in */}
          {user && <Sidebar role={user.role} />}

          {/* Main Content */}
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            <Routes>
              {/* Public Login Route */}
              <Route path="/" element={<LoginPage onLogin={handleLogin} />} />

              {/* Worker Routes */}
              <Route
                path="/worker"
                element={<WorkerDashboard onLogout={handleLogout} />}
              />
              <Route path="/worker/inventory" element={<Inventory />} />
              <Route path="/worker/orders" element={<Orders />} />
              <Route path="/worker/formula-bin" element={<FormulaBin />} />
              <Route path="/worker/add-order" element={<AddOrder />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<AdminDashboard onLogout={handleLogout} />}
              />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/formula-bin" element={<FormulaBin />} />

              <Route
                path="/admin/add-order"
                element={<OrderInputPageAdmin />}
              />
              <Route path="/admin/board" element={<CustomKanban />} />
              <Route
                path="/admin/inventorylogging"
                element={<InventoryLogging />}
              />
              <Route
                path="/admin/formulaInventory"
                element={<FormulaInventory />}
              />
              <Route path="/admin/productBin" element={<ProductBin />} />
              <Route
                path="/admin/productinventory"
                element={<ProductInventory />}
              />
           

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {/* <TranslationService/> */}
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
