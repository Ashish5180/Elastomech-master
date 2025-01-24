import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema({
  orderId: String,
  itemName: String,
  action: String,
  status: String,
  priority: String,
});

const Dispatch = mongoose.model("Dispatch", dispatchSchema);

export default Dispatch;  // Default export
