import React, { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

const InventoryLogging = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [transaction, setTransaction] = useState({
    particulars: "",
    inward: 0,
    outward: 0,
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/items");
      const data = await response.json();
      setMaterials(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setErrorMessage("Failed to load materials.");
      setLoading(false);
    }
  };

  const fetchLogs = useCallback(async (materialId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/items/${materialId}`
      );
      const data = await response.json();
      setLogs(data.logs || []); // Ensure logs are never undefined
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setErrorMessage("Failed to load transaction logs.");
      setLoading(false);
    }
  }, []);

  const handleMaterialSelection = (materialId) => {
    setSelectedMaterialId(materialId);
    fetchLogs(materialId);
  };

  const handleLogTransaction = async (e) => {
    e.preventDefault();

    if (!selectedMaterialId) {
      alert("Please select a material first.");
      return;
    }

    if (transaction.inward < 0 || transaction.outward < 0) {
      alert("Inward and outward quantities cannot be negative.");
      return;
    }

    if (!transaction.particulars) {
      alert("Particulars are required.");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Reset any previous error

    try {
      const response = await fetch(
        `http://localhost:5001/api/items/${selectedMaterialId}/log`,
        {
          method: "POST", // Use POST to add a new log entry
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        }
      );
      const updatedMaterial = await response.json();
      setLogs(updatedMaterial.logs || []); // Ensure logs are never undefined
      setTransaction({ particulars: "", inward: 0, outward: 0, remarks: "" }); // Reset form
      setLoading(false);
    } catch (error) {
      console.error("Error logging transaction:", error);
      setErrorMessage("Failed to log transaction.");
      setLoading(false);
    }
  };

  // Filter materials based on search term
  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 shadow-xl rounded-lg mt-12">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-12">
        Raw Material Inventory Logging System
      </h1>

      {/* Search Box */}
      <div className="mb-8 flex justify-between items-center">
        <motion.input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for materials..."
          className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <FaSearch className="text-gray-500 ml-4" />
      </div>

      {/* Materials Section */}
      <div className="materials-section mb-8">
        <h2 className="text-3xl font-medium text-gray-700 mb-6">Materials</h2>
        {loading ? (
          <p className="text-gray-600">Loading materials...</p>
        ) : errorMessage ? (
          <p className="text-red-600">{errorMessage}</p>
        ) : (
          <ul className="space-y-4">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <motion.li
                  key={material.name}
                  onClick={() => handleMaterialSelection(material.name)}
                  className={`w-full text-left p-4 rounded-lg border transition duration-300 cursor-pointer ${
                    selectedMaterialId === material.name
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-100"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-semibold">{material.name}</span>{" "}
                  (Available: {material.quantity})
                </motion.li>
              ))
            ) : (
              <p className="text-gray-600">No materials found.</p>
            )}
          </ul>
        )}
      </div>

      {/* Transaction Form Section */}
      {selectedMaterialId && (
        <div className="transaction-section mt-12">
          <h2 className="text-3xl font-medium text-gray-700 mb-6">Log Transaction</h2>
          <form onSubmit={handleLogTransaction} className="space-y-6">
            <div className="flex flex-col">
              <label className="text-lg text-gray-700">Particulars</label>
              <input
                type="text"
                value={transaction.particulars}
                onChange={(e) =>
                  setTransaction({
                    ...transaction,
                    particulars: e.target.value,
                  })
                }
                required
                className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="flex flex-col w-full sm:w-1/2">
                <label className="text-lg text-gray-700">Inward Quantity</label>
                <input
                  type="number"
                  value={transaction.inward}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      inward: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col w-full sm:w-1/2">
                <label className="text-lg text-gray-700">Outward Quantity</label>
                <input
                  type="number"
                  value={transaction.outward}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      outward: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-lg text-gray-700">Remarks</label>
              <input
                type="text"
                value={transaction.remarks}
                onChange={(e) =>
                  setTransaction({ ...transaction, remarks: e.target.value })
                }
                className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? "Logging..." : "Log Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Logs Table Section */}
      <div className="logs-section mt-12">
        <h2 className="text-3xl font-medium text-gray-700 mb-6">Transaction Logs</h2>
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Particulars</th>
                <th className="py-3 px-4 text-left">Inward</th>
                <th className="py-3 px-4 text-left">Outward</th>
                <th className="py-3 px-4 text-left">Balance</th>
                <th className="py-3 px-4 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-t border-b`}
                  >
                    <td className="py-4 px-4">
                      {new Date(log.date).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">{log.particulars}</td>
                    <td className="py-4 px-4">{log.inward}</td>
                    <td className="py-4 px-4">{log.outward}</td>
                    <td className="py-4 px-4">{log.balance}</td>
                    <td className="py-4 px-4">{log.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 px-4 text-center text-gray-600">
                    No logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogging;
