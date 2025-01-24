import express from "express";
import Product from "../models/productModal.js"; // Adjust path as needed
import Formula from "../models/formulaModal.js"; // Import Formula model to check formula names
import axios from 'axios';  // Assuming you're using axios

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // No need to populate, as we're using formulaName now
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching products", message: err.message });
  }
});

// POST a new product
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Product Data:", req.body);  // Log the data

    const {
      articleName,
      image,
      articleNo,
      manufacturing,
      mouldingTemp,
      formulations,
      mouldNo,
      noOfCavity,
      cycleTime,
      expectedCycles,
      noOfLabours,
      hardness,
      lastUpdated,
    } = req.body;

    // Validate formulations
    if (formulations && formulations.length > 0) {
      const invalidFormulas = [];

      for (const formulation of formulations) {
        const formula = await Formula.findById(formulation.formulaName); 
                if (!formula) {
          invalidFormulas.push(formulation.formulaName); // Track invalid formula names
        }
      }

      if (invalidFormulas.length > 0) {
        return res.status(400).json({
          error: "Invalid formulation(s) provided",
          invalidFormulas,
        });
      }
    }

    // If lastUpdated is not provided, set it to the current date
    const productData = {
      articleName,
      image,
      articleNo,
      manufacturing,
      mouldingTemp,
      formulations,
      mouldNo,
      noOfCavity,
      cycleTime,
      expectedCycles,
      noOfLabours,
      hardness,
      lastUpdated: lastUpdated || Date.now(),
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err); // Log error to understand what's going wrong
    res.status(400).json({
      error: "Error saving product",
      message: err.message,
    });
  }
});


// GET transaction logs for a product
router.get("/:id/logs", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ logs: product.transactionLogs || [] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching transaction logs", message: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({  product:product });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching transaction logs", message: err.message });
  }
});

// POST a new transaction log for a product


router.post("/:id/log", async (req, res) => {
  try {
    const productId = req.params.id;
    const { particulars, inward, outward, remarks } = req.body;

    // Validation for inward and outward quantities
    if (inward < 0 || outward < 0) {
      return res.status(400).json({ error: "Inward and outward quantities must be non-negative" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate new balance
    const lastLog = product.transactionLogs[product.transactionLogs.length - 1];
    const lastBalance = lastLog ? lastLog.balance : 0;
    const newBalance = lastBalance + inward - outward;

    // Create new log entry
    const newLog = {
      date: new Date(),
      particulars,
      inward,
      outward,
      balance: newBalance,
      remarks,
    };

    // Add log to product's transaction logs
    product.transactionLogs.push(newLog);
    await product.save();

    // Send the response to the client, and return immediately
    return res.status(201).json({ logs: product.transactionLogs });

    // Now handle the second API request (log formula usage) asynchronously
    // We don't need to send another response here
    await axios.post(`http://localhost:5001/api/formulas/${ingredient.name}/log`, {
      particulars: `Used in Order ${orderNo}`,
      inward: 0,
      outward: totalMaterialUsed,
      remarks: `Deduction for ${numberOfBatches} batches of formula ${ingredient.name} Remarks:(${remarks})`,
    });
    
  } catch (err) {
    console.error(err);  // Log the error to the console for debugging
    if (!res.headersSent) {  // Check if headers are already sent before sending another response
      return res.status(500).json({ error: "Error logging transaction", message: err.message });
    }
  }
});


export default router;
