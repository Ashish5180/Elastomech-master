import mongoose from 'mongoose';  // Add this line at the top of your file

import Order from "../models/orderSchema.js";
import Item from '../models/inventoryModal.js'; 

// Fetch all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      itemName,
      weightPerProduct,
      quantity,
      rubberIngredients,
      chemicalIngredients,
      deliveryDate,
      remarks,
    } = req.body;

    // Generate Order ID logic
    const date = new Date();
    const dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const orderNumber = await Order.countDocuments();
    const orderId = `ELAST${dateString}${String(orderNumber + 1).padStart(2, "0")}`;

    const newOrder = new Order({
      orderId,
      customerName,
      itemName,
      weightPerProduct,
      quantity,
      rubberIngredients,
      chemicalIngredients,
      deliveryDate,
      remarks,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// API controller to update order status and quantities
export const updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const { manufactured, rejected, status, priority, action } = req.body;

  try {
    // Fetch the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate: Manufactured cannot exceed the ordered quantity
    if (manufactured !== undefined && manufactured > order.quantity) {
      return res.status(400).json({
        message: 'Manufactured quantity cannot exceed the ordered quantity',
      });
    }

    // Calculate changes in manufactured and rejected quantities
    const increaseInManufactured = manufactured !== undefined ? manufactured - order.manufactured : 0;
    const increaseInRejected = rejected !== undefined ? rejected - order.rejected : 0;

    const totalIncrease = increaseInManufactured + increaseInRejected;

    // Update the order's manufactured and rejected quantities
    if (manufactured !== undefined) {
      order.manufactured = manufactured;
    }
    if (rejected !== undefined) {
      order.rejected = rejected;
    }

    // Update the order's status if it's provided in the request body
    if (status && order.status !== status) {
      // Ensure status is one of the allowed values
      const validStatuses = ['pending', 'completed', 'in process', 'in transit'];
      if (validStatuses.includes(status)) {
        order.status = status;
      } else {
        return res.status(400).json({ message: 'Invalid status value' });
      }
    }

    // Update the order's priority if it's provided in the request body
    if (priority && order.priority !== priority) {
      // Ensure priority is one of the allowed values
      const validPriorities = ['low', 'normal', 'high'];
      if (validPriorities.includes(priority)) {
        order.priority = priority;
      } else {
        return res.status(400).json({ message: 'Invalid priority value' });
      }
    }

    // Update the order's action if it's provided in the request body
    if (action && order.action !== action) {
      // Ensure action is one of the allowed values
      const validActions = ['Move to Dispatch', 'Shipped', 'Delivered'];
      if (validActions.includes(action)) {
        order.action = action;
      } else {
        return res.status(400).json({ message: 'Invalid action value' });
      }
    }

    // Save the updated order
    await order.save();

    // Adjust inventory based on the total increase in quantities
    if (totalIncrease > 0) {
      await updateInventoryBasedOnOrderIngredients(order, totalIncrease);
    }

    // Send the updated order back in the response
    res.status(200).json({ message: 'Order updated successfully', order });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


async function updateInventoryBasedOnOrderIngredients(order, totalDecrease) {
  try {
    // Update inventory for rubber ingredients
    for (const ingredient of order.rubberIngredients) {
      const perUnitWeight = ingredient.weight / order.quantity; // Per-unit weight for the rubber ingredient
      const totalWeightToDeduct = perUnitWeight * totalDecrease; // Total weight to deduct
      await adjustInventory(ingredient.name, totalWeightToDeduct);
    }

    // Update inventory for chemical ingredients
    for (const ingredient of order.chemicalIngredients) {
      const perUnitWeight = ingredient.weight / order.quantity; // Per-unit weight for the chemical ingredient
      const totalWeightToDeduct = perUnitWeight * totalDecrease; // Total weight to deduct
      await adjustInventory(ingredient.name, totalWeightToDeduct);
    }
  } catch (error) {
    console.error('Error updating inventory based on order ingredients:', error);
    throw new Error('Failed to update inventory');
  }
}

async function adjustInventory(ingredientName, usage) {
  try {
    // Find the ingredient in inventory
    const item = await Item.findOne({ name: ingredientName });
    if (!item) {
      throw new Error(`Ingredient ${ingredientName} not found in inventory`);
    }

    // Ensure sufficient inventory exists
    if (item.quantity < usage) {
      throw new Error(`Not enough inventory for ${ingredientName}`);
    }

    // Deduct the usage from inventory
    item.quantity -= usage;

    // Save the updated inventory
    await item.save();
  } catch (error) {
    console.error(`Error adjusting inventory for ${ingredientName}:`, error);
    throw new Error(`Error adjusting inventory for ${ingredientName}`);
  }
}
