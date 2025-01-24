import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./database/connect.js";
import Inventory from "./models/inventoryModal.js";
import Formula from "./models/formulaModal.js";
import Product from "./models/productModal.js";
import orderRoutes from "./router/orderRouter.js";
import itemRoutes from "./router/inventory.js";
import dispatchRoutes from "./router/dispatch.js";
import authRouter from "./router/login.js";
import productRouter from './router/productRouter.js';

import notesRouter from './router/notesRouter.js';
import formulaRouter from './router/formula.js'





const app = express();
const __dirname = path.resolve();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true, // Allows cookies to be sent with requests
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => res.send("Hello World!"));

// API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRouter);

// Use the products router
app.use('/api/products', productRouter);

// Routes
app.use('/api/formulas', formulaRouter);

app.use(dispatchRoutes);
app.use('/api/notes',notesRouter)

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Existing Routes

// Get all materials
app.get("/api/materials", async (req, res) => {
  try {
    const materials = await Inventory.find();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials", error });
  }
});

// Get material logs
app.get("/api/materials/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const material = await Inventory.findById(id);
    if (material) {
      res.json({ logs: material.logs });
    } else {
      res.status(404).json({ message: "Material not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching material logs", error });
  }
});

// Log inventory transaction
app.post("/api/materials/:id/update", async (req, res) => {
  const { id } = req.params;
  const { particulars, inward, outward, remarks } = req.body;

  if (!particulars || (!inward && !outward)) {
    return res.status(400).json({ message: "Invalid transaction data" });
  }

  try {
    const material = await Inventory.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Calculate new balance
    const lastBalance = material.logs.length
      ? material.logs[material.logs.length - 1].balance
      : 0;
    const newBalance = lastBalance + inward - outward;

    // Add new log entry
    const newLog = {
      date: new Date(),
      particulars,
      inward,
      outward,
      balance: newBalance,
      remarks,
    };
    material.logs.push(newLog);

    // Update material quantity
    material.quantity = newBalance;
    await material.save();

    res.json({ logs: material.logs });
  } catch (error) {
    res.status(500).json({ message: "Error updating inventory", error });
  }
});

// Formula Routes
app.get("/api/formulas", async (req, res) => {
  try {
    const formulas = await Formula.find();
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving formulas", error: err });
  }
});

app.get("/api/formulas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const formula = await Formula.findById(id);
    if (formula) {
      res.json(formula);
    } else {
      res.status(404).json({ message: "Formula not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving formula", error: err });
  }
});

app.post("/api/formulas", async (req, res) => {
  const { name, lotMultiplier, ingredients, totalWeight } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Formula name is required" });
  }

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "Ingredients are required" });
  }

  if (totalWeight == null || totalWeight <= 0) {
    return res
      .status(400)
      .json({ message: "Total weight is required and must be greater than 0" });
  }

  try {
    const existingFormula = await Formula.findOne({ name });
    if (existingFormula) {
      return res.status(400).json({ message: "Formula already exists" });
    }

    const newFormula = new Formula({
      name,
      lotMultiplier,
      ingredients,
      totalWeight,
    });
    await newFormula.save();
    res.status(201).json({
      message: "Formula added successfully",
      formula: newFormula,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding formula", error: err });
  }
});

app.put("/api/formulas/:id", async (req, res) => {
  const { id } = req.params;
  const { name, ingredients } = req.body;
  if (!name || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "Invalid formula data" });
  }

  try {
    const updatedFormula = await Formula.findByIdAndUpdate(
      id,
      { name, ingredients },
      { new: true }
    );
    if (updatedFormula) {
      res.json({
        message: "Formula updated successfully",
        formula: updatedFormula,
      });
    } else {
      res.status(404).json({ message: "Formula not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating formula", error: err });
  }
});

app.delete("/api/formulas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFormula = await Formula.findByIdAndDelete(id);
    if (deletedFormula) {
      res.json({
        message: "Formula deleted successfully",
        formula: deletedFormula,
      });
    } else {
      res.status(404).json({ message: "Formula not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting formula", error: err });
  }
});

// New Product Routes

// Add a new product with formulations and their fill weights
app.post("/api/products", async (req, res) => {
  const {
    articleName,
    image,
    articleNo,
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

  // Validation
  if (
    !articleName ||
    !articleNo ||
    !mouldingTemp ||
    !formulations.length ||
    !mouldNo ||
    !noOfCavity ||
    !cycleTime ||
    !expectedCycles ||
    !noOfLabours ||
    !hardness ||
    !lastUpdated
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  try {
    // Add new product
    const newProduct = new Product({
      articleName,
      image,
      articleNo,
      mouldingTemp,
      formulations,
      mouldNo,
      noOfCavity,
      cycleTime,
      expectedCycles,
      noOfLabours,
      hardness,
      lastUpdated,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Error adding product", error: err });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().populate("formulations.formulaId"); // Populate formula data
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving products", error: err });
  }
});

// Get a single product
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate(
      "formulations.formulaId"
    ); // Populate formula data
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving product", error: err });
  }
});

// Start the server
app.listen(5001, () => {
  console.log("Server is running on port 5001");
});