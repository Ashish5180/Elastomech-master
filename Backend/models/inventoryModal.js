import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  particulars: { type: String, required: true }, // Required field
  inward: { type: Number, default: 0 },
  outward: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  remarks: { type: String },
});

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  logs: [logSchema], // Array of logs
});

const Inventory = mongoose.model("Inventory", inventorySchema);

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true }, // "rubber" or "chemical"
  logs: {
    type: [logSchema],
    default: [], // Ensure logs default to an empty array
  },
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
