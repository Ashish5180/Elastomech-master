import mongoose from "mongoose";
import Formula from "./formulaModal.js"; // Assuming the Formula model is here

const transactionLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // Date of the transaction
  particulars: { type: String, required: true }, // Description of the transaction
  inward: { type: Number, default: 0 }, // Quantity received
  outward: { type: Number, default: 0 }, // Quantity issued
  balance: { type: Number, default: 0 }, // Current balance after the transaction
  remarks: { type: String }, // Additional remarks about the transaction
});

const productSchema = new mongoose.Schema({
  articleName: { type: String, required: true }, // Name of the product
  image: { type: String }, // Image URL of the product
  articleNo: { type: String, unique: true, required: true }, // Unique identifier for the product
  manufacturing: { 
    type: String, 
    enum: ['Moulding', 'Extrusion'], 
    required: true 
  },
  
  mouldingTemp: { type: String }, // Moulding temperature
  formulations: [
    {
      formulaName: { type: String, required: true }, // Store formula name directly
      fillWeight: { type: Number, required: true }, // Percentage of the formula in the product
    },
  ],
  mouldNo: { type: String }, // Mould number associated with the product
  noOfCavity: { type: Number }, // Number of cavities in the mould
  cycleTime: { type: Number }, // Cycle time in seconds
  expectedCycles: { type: Number }, // Expected number of cycles
  noOfLabours: { type: Number }, // Number of labors involved
  hardness: { type: Number }, // Hardness of the product
  lastUpdated: { type: Date, default: Date.now }, // Last updated timestamp
  transactionLogs: [transactionLogSchema], // Logs for transactions (inward/outward movements)
});

const Product = mongoose.model("Product", productSchema);

export default Product;
