import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiClock, FiInfo } from 'react-icons/fi'; // Example icons
// import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from the API when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/dispatch");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle status change (for the select dropdown)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dispatch/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          // Only include the fields you want to update
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle priority change (for the select dropdown)
  const handlePriorityChange = async (id, newPriority) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dispatch/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update priority");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  // Handle action change (for the select dropdown)
  const handleActionChange = async (id, newAction) => {
    try {
      const response = await fetch(`http://localhost:5001/api/dispatch/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: newAction,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update action");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating action:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
    <motion.div
      className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Previous Orders</h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border-separate border-spacing-0 border border-gray-300 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left text-gray-700">Order ID</th>
                <th className="py-2 px-4 text-left text-gray-700">Item Name</th>
                <th className="py-2 px-4 text-left text-gray-700">Status</th>
                <th className="py-2 px-4 text-left text-gray-700">Priority</th>
                <th className="py-2 px-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition-all duration-300"
                >
                  <td className="py-3 px-4 text-gray-700">{order.orderId}</td>
                  <td className="py-3 px-4 text-gray-700">{order.itemName}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {order.status === "completed" && (
                        <FiCheck className="text-green-500" />
                      )}
                      {order.status === "in transit" && (
                        <FiTruck className="text-blue-500" />
                      )}
                      {order.status === "pending" && (
                        <FiClock className="text-yellow-500" />
                      )}
                      {order.status === "in process" && (
                        <FiInfo className="text-gray-500" />
                      )}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="in process">In Process</option>
                        <option value="in transit">In Transit</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.priority}
                      onChange={(e) => handlePriorityChange(order._id, e.target.value)}
                      className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.action}
                      onChange={(e) => handleActionChange(order._id, e.target.value)}
                      className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Move to Dispatch">Move to Dispatch</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  </div>
  );
};

export default Orders;
