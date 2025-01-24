import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTrashAlt } from "react-icons/fa";
import "./Inventory.css";

const FormulaInventory = () => {
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formulaBin, setFormulaBin] = useState([]); // Formula bin for batch weight and materials
  const [selectedFormula, setSelectedFormula] = useState(null); // Selected formula number
  const [batchWeight, setBatchWeight] = useState(0); // Batch weight for selected formula
  const [numberOfBatches, setNumberOfBatches] = useState(); // Number of batches
  const [logs, setLogs] = useState([]); // Logs for selected formula
  const [shift, setShift] = useState(""); // Shift
  const [formulaName, setFormulaName] = useState(""); // 
  const [orderNo, setOrderNo] = useState(""); // Order No.
  const [machineNo, setMachineNo] = useState(""); // Machine No.
  const [operator, setOperator] = useState(""); // Operator
  const [batchNo, setBatchNo] = useState(""); // Batch No.
  const [remarks, setRemarks] = useState(""); // Remarks
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch formula bin data
  const fetchFormulaBin = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/formulas"); // Fetch formulas
      const data = await response.json();
      setFormulaBin(data);
    } catch (error) {
      console.error("Error fetching formula bin:", error);
    }
  };

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

  // Fetch logs for the selected formula

  
  const fetchLogs = async (formulaName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/formulas/logs/${formulaName}`);
      
      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
  
      // Parse the JSON response
      const data = await response.json();
      console.log("Response Data:", data);
  
      // Assuming you have a state variable `logs` to store the fetched logs
      setLogs(data.logs); // Update the state with the fetched logs
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Error fetching logs. Please try again.");
    }
  };
  
  useEffect(() => {
    fetchItems();
    fetchFormulaBin(); // Fetch the formula bin when component mounts
  }, []);

  // Function to handle formula selection
  const handleFormulaSelect = (formulaId) => {
    const selected = formulaBin.find((formula) => formula._id === formulaId);
    if (selected) {
      setSelectedFormula(selected);
      setFormulaName(selected.name); // Set formula name
      setBatchWeight(selected.totalWeight); // Set batch weight from formula
      fetchLogs(selected.name); // Fetch logs directly with selected name
    }
  };
  
  
  
  
  // Function to handle order submission and inventory update
  const handleFormulaSubmission = async () => {
    // Step 1: Validation
    if (
      !selectedFormula ||
      !numberOfBatches ||
      !remarks ||
      !shift ||
      !orderNo ||
      !machineNo ||
      !operator ||
      !batchNo
    ) {
      alert("Please fill in all fields.");
      return;
    }
  
    // Step 2: Create the log entry for formula usage
    const transactionLog = {
      date: new Date().toLocaleDateString(),
      shift,
      orderNo,
      machineNo,
      operator,
      batchNo,
      batchWeight,
      numberOfBatches,
      remarks,
      selectedFormulaId: selectedFormula._id,
    };
  
    try {
      // Step 3: Send the log entry for the formula usage to the backend
      const response = await fetch(
        `http://localhost:5001/api/formulas/${selectedFormula._id}/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionLog),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to log formula usage");
      }
  
      const loggedData = await response.json();
      alert("Formula usage logged successfully!");
  
      // Step 4: Refresh the logs after submitting
      fetchLogs(selectedFormula._id);
  
      // Step 5: Deduct materials and log transactions for each ingredient used in the formula
      for (const ingredient of selectedFormula.ingredients) {
        const totalMaterialUsed = ingredient.ratio * numberOfBatches;
  
        // Step 6: Log transaction for each ingredient
        // try {
        //   const transaction = {
        //     particulars: `Used in Order ${orderNo}`,
        //     inward: 0,
        //     outward: totalMaterialUsed,
        //     remarks: `Deduction for ${numberOfBatches} batches of ${selectedFormula.name}`,
        //   };
  
        //   // Send the transaction log for the ingredient usage
        //   const logResponse = await fetch(
        //     `http://localhost:5001/api/items/${ingredient.name}/log`,
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify(transaction),
        //     }
        //   );
  
        //   if (!logResponse.ok) {
        //     throw new Error(`Failed to log transaction for ${ingredient.name}`);
        //   }
  
        //   const ingredientData = await logResponse.json();
        //   console.log("Ingredient usage logged:", ingredientData);
        // } catch (logError) {
        //   console.error("Error logging ingredient usage:", logError);
        //   alert(`Error logging transaction for ${ingredient.name}.`);
        // }
      }
    } catch (error) {
      console.error("Error logging formula usage:", error);
      alert("Error logging formula usage.");
    }
    
  };
  const filteredFormulas = formulaBin.filter((formula) =>
    formula.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 
  
  if (loading) return <div>Loading...</div>;



  return (
    <div className="inventory-page p-6 bg-gray-100 min-h-screen">
    <motion.h2
      className="text-3xl font-bold text-gray-800 mb-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Record Mixing Logs
    </motion.h2>
  
    {/* Formula Selection */}
    <div className="formula-selection mb-8 text-center">
      <label
        htmlFor="formula-select"
        className="text-lg font-medium text-gray-700"
      >
        Select Formula
      </label>
  
      {/* Search Input Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search formula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
  
      {/* Formula Dropdown List */}
      {searchTerm && (
        <div className="bg-white border border-gray-300 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto">
          <ul className="w-full">
            {filteredFormulas.length > 0 ? (
              filteredFormulas.map((formula) => (
                <li
                  key={formula._id}
                  onClick={() => handleFormulaSelect(formula._id)}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                >
                  {formula.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  
    {/* Formula Info Display */}
    <div className="formula-info mb-8 text-center">
      {selectedFormula && (
        <>
          <p className="text-lg font-medium text-gray-700">
            Selected Formula: {selectedFormula.name}
          </p>
          <p className="text-lg font-medium text-gray-700">
            Batch Weight: {batchWeight} KGS
          </p>
        </>
      )}
    </div>
  
    {/* User Inputs */}
    <div className="user-inputs mb-8 text-center">
      <div className="flex flex-wrap justify-center gap-4">
        <input
          type="text"
          name="shift"
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Shift"
        />
        <input
          type="text"
          name="orderNo"
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Order No."
        />
      </div>
  
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <input
          type="text"
          name="machineNo"
          value={machineNo}
          onChange={(e) => setMachineNo(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Machine No."
        />
        <input
          type="text"
          name="operator"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Operator"
        />
      </div>
  
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <input
          type="text"
          name="batchNo"
          value={batchNo}
          onChange={(e) => setBatchNo(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Batch No."
        />
        <textarea
          value={remarks}
          name="remarks"
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          placeholder="Remarks"
        />
      </div>
  
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <input
          type="number"
          name="batchWeight"
          value={batchWeight}
          readOnly
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none bg-gray-100 cursor-not-allowed"
          placeholder="Batch Weight (kg)"
        />
        <input
          type="number"
          name="numberOfBatches"
          placeholder="Number of Batches"
          value={numberOfBatches}
          onChange={(e) => setNumberOfBatches(Number(e.target.value))}
          className="w-full sm:w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>
    </div>
  
    {/* Submit Button */}
    <div className="text-center">
      <button
        onClick={handleFormulaSubmission}
        className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-300"
      >
        Submit Formula Mixing
      </button>
    </div>
  
    {/* Logs Table */}
    <div className="logs-table mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Formula Logs
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order No.</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Shift</th>
              <th className="px-4 py-2">Batch No.</th>
              <th className="px-4 py-2">Number of Batches</th>
              <th className="px-4 py-2">Remarks</th>
              <th className="px-4 py-2">Balance (kg)</th> {/* Added Balance Column */}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{log.orderNo}</td>
                <td className="px-4 py-2">{log.date}</td>
                <td className="px-4 py-2">{log.shift}</td>
                <td className="px-4 py-2">{log.batchNo}</td>
                <td className="px-4 py-2">{log.numberOfBatches}</td>
                <td className="px-4 py-2">{log.remarks}</td>
                <td className="px-4 py-2">{log.balance}</td> {/* Display Balance */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  );
};

export default FormulaInventory;
