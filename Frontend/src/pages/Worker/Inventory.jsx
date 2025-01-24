import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTrashAlt } from "react-icons/fa";
import "./Inventory.css";

const Inventory = () => {
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState({ name: "", rate: 0, quantity: 0 });
  const [selectedCategory, setSelectedCategory] = useState("rubber");

  // Fetch all items from the backend
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/items");
      const data = await response.json();
      const rubber = data.filter((item) => item.category === "rubber");
      const chemical = data.filter((item) => item.category === "chemical");
      setRubberIngredients(rubber);
      setChemicals(chemical);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleQuantityChange = (index, category, value) => {
    const updatedItems =
      category === "rubber" ? [...rubberIngredients] : [...chemicals];
    updatedItems[index].quantity = parseFloat(value) || 0;
    if (category === "rubber") setRubberIngredients(updatedItems);
    else setChemicals(updatedItems);
  };

  const handleRateChange = (index, category, value) => {
    const updatedItems =
      category === "rubber" ? [...rubberIngredients] : [...chemicals];
    updatedItems[index].rate = parseFloat(value) || 0;
    if (category === "rubber") setRubberIngredients(updatedItems);
    else setChemicals(updatedItems);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes to the backend
      const updates = [...rubberIngredients, ...chemicals];
      await Promise.all(
        updates.map((item) =>
          fetch(`http://localhost:5001/api/items/${item.name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          })
        )
      );
      await fetchItems(); // Refresh data after saving
    }
    setIsEditing(!isEditing);
  };

  const handleAddNewItem = async () => {
    const newInventoryItem = { ...newItem, category: selectedCategory };
    try {
      await fetch("http://localhost:5001/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInventoryItem),
      });
      await fetchItems(); // Refresh data after adding
    } catch (error) {
      console.error("Error adding new item:", error);
    }
    setNewItem({ name: "", rate: 0, quantity: 0 });
  };

  const handleDeleteItem = async (name) => {
    try {
      await fetch(`http://localhost:5001/api/items/${name}`, {
        method: "DELETE",
      });
      await fetchItems(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory-page p-6 bg-gray-100 min-h-screen">
  <motion.h2
    className="text-3xl font-bold text-gray-800 mb-8 text-center sm:text-4xl md:text-5xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    Inventory of Raw Materials
  </motion.h2>

  <div className="flex justify-center mb-6">
    <button
      onClick={handleEditToggle}
      className={`px-6 py-3 rounded-lg shadow-md font-medium text-white ${
        isEditing
          ? "bg-blue-600 hover:bg-blue-500"
          : "bg-green-600 hover:bg-green-500"
      } transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
    >
      {isEditing ? (
        <>
          <FaSave className="inline-block mr-2" /> Save Changes
        </>
      ) : (
        <>
          <FaEdit className="inline-block mr-2" /> Edit Inventory
        </>
      )}
    </button> 
  </div>

  {/* Rubber Section */}
  <motion.div
    className="inventory-section bg-white p-6 rounded-lg shadow-md mb-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-2xl font-semibold text-gray-700 mb-4 sm:text-3xl">Rubber</h3>
    <table className="min-w-full border-collapse border border-gray-300 text-left">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b border-gray-300">Name</th>
          <th className="py-2 px-4 border-b border-gray-300">Rate per Kg (₹)</th>
          <th className="py-2 px-4 border-b border-gray-300">Available Quantity (Kg)</th>
          <th className="py-2 px-4 border-b border-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rubberIngredients.map((item, index) => (
          <tr key={item._id} className="even:bg-gray-50">
            <td className="py-3 px-4 border-b border-gray-300">{item.name}</td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing ? (
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    handleRateChange(index, "rubber", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                item.rate
              )}
            </td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing ? (
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, "rubber", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                item.quantity
              )}
            </td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing && (
                <button
                  onClick={() => handleDeleteItem(item.name)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <FaTrashAlt />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>

  {/* Chemicals Section */}
  <motion.div
    className="inventory-section bg-white p-6 rounded-lg shadow-md mb-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-2xl font-semibold text-gray-700 mb-4 sm:text-3xl">Chemicals</h3>
    <table className="min-w-full border-collapse border border-gray-300 text-left">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b border-gray-300">Name</th>
          <th className="py-2 px-4 border-b border-gray-300">Rate (₹)</th>
          <th className="py-2 px-4 border-b border-gray-300">Available Quantity (Kg)</th>
          <th className="py-2 px-4 border-b border-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        {chemicals.map((item, index) => (
          <tr key={item._id} className="even:bg-gray-50">
            <td className="py-3 px-4 border-b border-gray-300">{item.name}</td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing ? (
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    handleRateChange(index, "chemical", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                item.rate
              )}
            </td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing ? (
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, "chemical", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                item.quantity
              )}
            </td>
            <td className="py-3 px-4 border-b border-gray-300">
              {isEditing && (
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <FaTrashAlt />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>

  {/* Add Item Section */}
  <motion.div
    className="add-item-section mt-10 p-8 bg-gray-50 rounded-lg shadow-lg max-w-lg mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center sm:text-4xl">
      Add New Item
    </h3>
    <form className="space-y-6">
      {/* Category */}
      <div className="flex flex-col">
        <label
          htmlFor="category"
          className="text-lg font-medium text-gray-700 mb-2"
        >
          Select Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 py-3 px-4 text-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base"
        >
          <option value="rubber">Rubber</option>
          <option value="chemical">Chemicals</option>
        </select>
      </div>

      {/* Item Name */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="name"
          className="text-lg font-medium text-gray-700 mb-2"
        >
          Item Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 px-4 text-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base"
        />
      </div>

      {/* Rate */}
      <div className="flex flex-col">
        <label
          htmlFor="rate"
          className="text-lg font-medium text-gray-700 mb-2"
        >
          Rate per Kg (₹)
        </label>
        <input
          type="number"
          id="rate"
          placeholder="Enter rate per Kg"
          value={newItem.rate}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              rate: parseFloat(e.target.value) || 0,
            })
          }
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 py-3 px-4 text-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base"
        />
      </div>

      {/* Quantity */}
      <div className="flex flex-col">
        <label
          htmlFor="quantity"
          className="text-lg font-medium text-gray-700 mb-2"
        >
          Available Quantity (Kg)
        </label>
        <input
          type="number"
          id="quantity"
          placeholder="Enter available quantity"
          value={newItem.quantity}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              quantity: parseFloat(e.target.value) || 0,
            })
          }
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 py-3 px-4 text-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleAddNewItem}
          className="rounded-lg bg-green-600 py-3 px-6 text-base font-medium text-white shadow-md transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Item
        </button>
      </div>
    </form>
  </motion.div>
</div>

  );
};

export default Inventory;
