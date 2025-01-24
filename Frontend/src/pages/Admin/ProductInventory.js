import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [transaction, setTransaction] = useState({
    particulars: "",
    inward: 0,
    outward: 0,
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);  // Set initial filtered products to all products
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMessage("Failed to load products.");
      setLoading(false);
    }
  };

  const fetchLogs = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/products/${productId}/logs`
      );
      const proddata = await fetch(
        `http://localhost:5001/api/products/${productId}`
      );
      const pdata = await proddata.json();
      const data = await response.json();

      setLogs(pdata.product.transactionLogs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setErrorMessage("Failed to load transaction logs.");
      setLoading(false);
    }
  }, []);

  const handleProductSelection = (productId) => {
    setSelectedProductId(productId);
    fetchLogs(productId);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.articleName.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleLogTransaction = async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Please select a product first.");
      return;
    }

    if (transaction.inward < 0 || transaction.outward < 0) {
      alert("Inward and outward quantities cannot be negative.");
      return;
    }

    if (transaction.inward === 0 && transaction.outward === 0) {
      alert("Both inward and outward quantities cannot be zero.");
      return;
    }

    if (!transaction.particulars) {
      alert("Particulars are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const proddata = await fetch(
        `http://localhost:5001/api/products/${selectedProductId}`
      );
      const pdata = await proddata.json();
      const productResponse = await fetch(
        `http://localhost:5001/api/products/${selectedProductId}/log`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        }
      );

      if (!productResponse.ok) {
        const errorDetails = await productResponse.json();
        throw new Error(errorDetails.message || "Failed to log product transaction.");
      }

      const updatedProduct = await productResponse.json();
      setLogs(updatedProduct.logs || []);

      const formulations = pdata.product.formulations || [];
      const formulaPromises = formulations.map(async (formula) => {
        const formulaId = formula.formulaName;
        const formulaFillWeight = formula.fillWeight;

        const formulaTransaction = {
          orderNo: transaction.particulars,
          inward: transaction.inward,
          outward: transaction.outward,
          particulars: "deducted automatically.",
          fillWeight: formulaFillWeight,
        };

        try {
          const response = await fetch(
            `http://localhost:5001/api/formulas/${formulaId}/logformulafromproduct`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formulaTransaction),
            }
          );

          if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`Error logging formula ${formulaId}: ${errorDetails.message || "Unknown error"}`);
          }
        } catch (error) {
          console.error(error.message);
          return `Formula ${formulaId} failed: ${error.message}`;
        }
      });

      await Promise.all(formulaPromises);

      setTransaction({ particulars: "", inward: 0, outward: 0, remarks: "" });
    } catch (error) {
      console.error("Error logging transaction:", error);
      setErrorMessage(error.message || "Failed to log transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 shadow-2xl rounded-lg mt-12">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-12">
        Product Inventory Logging System
      </h1>

      <div className="products-section mb-8">
        <h2 className="text-3xl font-medium text-gray-700 mb-6">Products</h2>

        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search Products"
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/3"
          />
          <FaSearch className="text-gray-500" />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : errorMessage ? (
          <p className="text-red-600">{errorMessage}</p>
        ) : (
          <motion.ul
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProducts.map((product) => (
              <motion.li key={product._id} whileHover={{ scale: 1.05 }}>
                <button
                  onClick={() => handleProductSelection(product._id)}
                  className={`w-full text-left p-4 rounded-lg border transition duration-300 ${
                    selectedProductId === product._id
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-100"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span className="font-semibold">{product.articleName}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {selectedProductId && (
        <div className="transaction-section mt-12">
          <h2 className="text-3xl font-medium text-gray-700 mb-6">
            Log Transaction
          </h2>
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
                <label className="text-lg text-gray-700">
                  Outward Quantity
                </label>
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
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, loop: Infinity }}>
                  <FaSpinner className="animate-spin" />
                </motion.div>
              ) : (
                "Log Transaction"
              )}
            </button>
          </form>
        </div>
      )}

      <div className="logs-section mt-12">
        <h2 className="text-3xl font-medium text-gray-700 mb-6">
          Transaction Logs
        </h2>
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
                  <td
                    colSpan="6"
                    className="py-4 px-4 text-center text-gray-600"
                  >
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

export default ProductInventory;
