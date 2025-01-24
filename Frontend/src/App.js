import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";
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
import ProtectedRoute from "./pages/Protected"; // Import ProtectedRoute

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
    Cookies.set("token", loggedInUser.token); // Store token in cookies
  };

  // Function to handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear user from storage
    Cookies.remove("token"); // Remove token from cookies
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
                element={
                  <ProtectedRoute requiredRole="worker">
                    <WorkerDashboard onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/inventory"
                element={
                  <ProtectedRoute requiredRole="worker">
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/orders"
                element={
                  <ProtectedRoute requiredRole="worker">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/formula-bin"
                element={
                  <ProtectedRoute requiredRole="worker">
                    <FormulaBin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/add-order"
                element={
                  <ProtectedRoute requiredRole="worker">
                    <AddOrder />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/formula-bin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FormulaBin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-order"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrderInputPageAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/board"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <CustomKanban />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventorylogging"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <InventoryLogging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/formulaInventory"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FormulaInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productBin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductBin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productinventory"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ProductInventory />
                  </ProtectedRoute>
                }
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
