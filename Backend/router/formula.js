import express from 'express';
import Formula from '../models/formulaModal.js';
import axios from 'axios';

const router = express.Router();

// Create a new log for formula usage
router.post('/:id/log', async (req, res) => {
  const { id } = req.params;
  const {
    date,
    shift,
    orderNo,
    machineNo,
    operator,
    batchNo,
    batchWeight,
    numberOfBatches,
    remarks,
  } = req.body;

  try {
    const formula = await Formula.findById(id);
    if (!formula) return res.status(404).json({ message: 'Formula not found' });

    // Calculate the total batch weight for this log entry
    const totalBatchWeight = batchWeight * numberOfBatches;

    // Get the previous balance (if any), or set it to 0 if this is the first log
    const lastLog = formula.logs[formula.logs.length - 1];
    const previousBalance = lastLog ? lastLog.balance : 0;

    // Calculate the new balance by adding the total batch weight to the previous balance
    const newBalance = previousBalance + totalBatchWeight;

    // Create new log entry
    const newLog = {
      date,
      shift,
      orderNo,
      machineNo,
      operator,
      batchNo,
      batchWeight,
      numberOfBatches,
      remarks,
      selectedFormulaId: id,
      balance: newBalance, // Set the new balance here
    };

    // Add log to formula's logs array
    formula.logs.push(newLog);
    await formula.save();

    // Log the transaction for each ingredient
    await logIngredientUsage(formula.ingredients, numberOfBatches, orderNo, remarks);

    res.status(201).json({ message: 'Formula usage logged successfully', newLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging formula usage' });
  }
});

// Helper function to log ingredient usage in the inventory
const logIngredientUsage = async (ingredients, numberOfBatches, orderNo, remarks) => {
  for (const ingredient of ingredients) {
    const totalMaterialUsed = ingredient.ratio * numberOfBatches;

    try {
      // Assuming you're using axios to interact with your inventory API
      const response = await axios.post(`http://localhost:5001/api/items/${ingredient.name}/log`, {
        particulars: `Used in Order ${orderNo}`,
        inward: 0,
        outward: totalMaterialUsed,
        remarks: `Deduction for ${numberOfBatches} batches of formula ${ingredient.name} Remarks:(${remarks})`,
      });

      console.log('Ingredient usage logged:', response.data);
    } catch (error) {
      console.error('Error logging ingredient usage in inventory:', error);
    }
  }
};

// Get formula logs by name

router.get("/logs/:name", async (req, res) => {
  const { name } = req.params;

  try {
    // Find the formula by its name
    const formula = await Formula.findOne({ name });

    if (!formula) {
      return res.status(404).json({ message: "Formula not found" });
    }

    // Directly retrieve the logs as they are stored
    const logs = formula.logs.map(log => log.toObject()); // Convert mongoose documents to plain objects if necessary

    // Return the logs with the stored balance
    res.json({ logs });

  } catch (err) {
    res.status(500).json({ message: "Error retrieving formula logs", error: err.message });
  }
});

router.post('/:id/logformulafromproduct', async (req, res) => {
  const { id } = req.params;
  const {
    orderNo,
    particulars,
    inward,
    outward,
    fillWeight,
  } = req.body;

  // Validate required fields
  if (!orderNo || !particulars || inward === undefined || outward === undefined || fillWeight === undefined) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Fetch formula by ID
    const formula = await Formula.findById(id);
    if (!formula) {
      return res.status(404).json({ message: "Formula not found" });
    }

    // Calculate the total weight used
    const totalWeightUsed = inward * fillWeight;

    // Get previous balance or set it to 0 if this is the first log
    const lastLog = formula.logs.length > 0 ? formula.logs[formula.logs.length - 1] : null;
    const previousBalance = lastLog ? lastLog.balance : 0;

    // Update the balance using the formula: previousBalance - (fillWeight * inward)
    const newBalance = previousBalance - totalWeightUsed;

    // Create a new log entry
    const newLog = {
      date: new Date(),
      shift: "NA", // Default values, can be made dynamic if needed
      orderNo,
      machineNo: "NA",
      operator: "NA",
      batchNo: "NA",
      batchWeight: 0, // Optional if not provided
      numberOfBatches: 0, // Optional if not provided
      remarks: particulars,
      selectedFormulaId: id,
      balance: newBalance, // Set the calculated balance here
    };

    // Add the log to the formula's logs array
    formula.logs.push(newLog);
    await formula.save();
    console.log("Fetched Formula:", formula);
console.log("Last Log:", lastLog);
console.log("Previous Balance:", previousBalance);
console.log("Total Weight Used:", totalWeightUsed);
console.log("New Balance:", newBalance);

    // Return success response
    return res.status(201).json({ message: "Formula usage logged successfully", newLog });
    
  } catch (error) {
    console.error("Error logging formula usage:", error);
    return res.status(500).json({ message: "Error logging formula usage", error: error.message });
  }
});





export default router;
