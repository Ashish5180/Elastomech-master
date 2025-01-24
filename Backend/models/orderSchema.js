import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  itemName: { type: String, required: true },
  weightPerProduct: { type: Number, required: true },
  quantity: { type: Number, required: true },
  manufactured: { type: Number, default: 0 }, // Add default value
  rejected: { type: Number, default: 0 }, // Add default value
  rubberIngredients: [
    {
      name: { type: String, required: true },
      ratio: { type: Number, required: true },
      weight: { type: Number, required: true },
    },
  ],
  chemicalIngredients: [
    {
      name: { type: String, required: true },
      ratio: { type: Number, required: true },
      weight: { type: Number, required: true },
    },
  ],
  deliveryDate: { type: String, required: false },
  remarks: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'in process', 'in transit' ], // Define possible status values
    default: 'pending',  // Set default status to 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'], // Define possible priority values
    default: 'normal', // Set default priority to 'normal'
  },
  action: {
    type: String,
    enum: ['Move to Dispatch', 'Shipped', 'Delivered'], // Define possible action values
    default: 'Move to Dispatch', // Set default action to 'Move to Dispatch'
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;