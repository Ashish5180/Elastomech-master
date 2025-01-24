import express from "express";
import Inventory from "../models/inventoryModal.js"; // Ensure the schema is correctly imported

const router = express.Router();

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err });
  }
});

// Add a new item
router.post("/", async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: "Error adding item", error: err });
  }
});

// Update an item (using name)
router.put("/:name", async (req, res) => {
  try {
    const updatedItem = await Inventory.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true } // This returns the updated document
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: "Error updating item", error: err });
  }
});

// Delete an item (using name)
router.delete("/:name", async (req, res) => {
  try {
    const deletedItem = await Inventory.findOneAndDelete({ name: req.params.name });
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting item", error: err });
  }
});

// Get item and logs (using name)
router.get("/:name", async (req, res) => {
  try {
    const item = await Inventory.findOne({ name: req.params.name });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({
      ...item.toObject(),
      logs: item.logs || [], // Ensure logs are never undefined
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching item logs", error: err });
  }
});

// Add a log entry to a specific item (using name)
router.post("/:name/log", async (req, res) => {
  const { name } = req.params; // Get the name from the request parameters
  const { particulars, inward, outward, remarks } = req.body;

  try {
    // Find the item by its name
    const item = await Inventory.findOne({ name }); // Find item by name
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Calculate new balance (ensure it reflects the inward and outward transactions)
    const newBalance = item.quantity + (inward || 0) - (outward || 0);

    // Create a new log entry
    const newLog = {
      date: new Date(),
      particulars,
      inward,
      outward,
      balance: newBalance,
      remarks,
    };

    // Add the log and update the inventory quantity
    item.logs.push(newLog);
    item.quantity = newBalance; // Update the available quantity in the inventory

    await item.save();
    res.json({
      message: "Transaction logged successfully",
      logs: item.logs, // Return the updated logs
      updatedQuantity: item.quantity, // Return the updated quantity
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging transaction", error: err });
  }
});

export default router;
