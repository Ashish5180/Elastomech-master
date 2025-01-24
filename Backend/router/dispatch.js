import express from "express";
import Item from "../models/inventoryModal.js"; // Ensure the model name matches your schema file

const router = express.Router();

// Helper function to validate required fields
const validateItemData = (data) => {
  if (!data.name || !data.quantity) {
    return "Name and quantity are required";
  }
  return null;
};

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(
      items.map((item) => ({
        ...item.toObject(),
        logs: item.logs || [], // Ensure logs are not undefined
      }))
    );
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Error fetching items", error: err });
  }
});

// Add a new item
router.post("/", async (req, res) => {
  const validationError = validateItemData(req.body);
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json({
      status: "success",
      message: "Item added successfully",
      data: newItem,
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: "Error adding item", error: err });
  }
});

// Update an item
router.put("/:id", async (req, res) => {
  const validationError = validateItemData(req.body);
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({
      status: "success",
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: "Error updating item", error: err });
  }
});

// Delete an item
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Item deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: "Error deleting item", error: err });
  }
});

// Get logs for a specific item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }
    res.json({
      status: "success",
      data: { ...item.toObject(), logs: item.logs || [] }, // Ensure logs are not undefined
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Error fetching item logs",
        error: err,
      });
  }
});

// Add a log entry to a specific item
router.post("/:id/log", async (req, res) => {
  const { particulars, inward, outward, remarks } = req.body;
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    // Calculate new balance and prevent negative balance
    const newBalance = Math.max(
      item.quantity + (inward || 0) - (outward || 0),
      0
    );

    // Create a new log entry
    const newLog = {
      date: new Date(),
      particulars,
      inward,
      outward,
      balance: newBalance,
      remarks,
    };

    // Update item with the new log
    item.logs.push(newLog);
    item.quantity = newBalance;
    await item.save();

    res.json({
      status: "success",
      message: "Log added successfully",
      data: { logs: item.logs, balance: newBalance },
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Error adding log", error: err });
  }
});

export default router;
