import mongoose from "mongoose";
const formulaLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  shift: { type: String, required: true },
  orderNo: { type: String, required: true },
  machineNo: { type: String, required: true },
  operator: { type: String, required: true },
  batchNo: { type: String, required: true },
  batchWeight: { type: Number, required: true },
  numberOfBatches: { type: Number, required: true },
  remarks: { type: String },
  selectedFormulaId: { type: mongoose.Schema.Types.ObjectId, ref: "Formula" },
  balance: { type: Number, },
});
const formulaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lotMultiplier: { type: String, required: true }, // Added lotMultiplier field
  ingredients: [
    {
      type: { type: String, required: true },
      name: { type: String, required: true },
      ratio: { type: Number, required: true },
      phr: { type: Number, required: false }, // Optional PHR field for chemicals
      consumption: { type: Number, required: false }, // Optional Consumption field
    },
  ],
  totalWeight: { type: Number, required: true },
  logs: {
    type: [formulaLogSchema],
  },
});

const Formula = mongoose.model("Formula", formulaSchema);

export default Formula;
