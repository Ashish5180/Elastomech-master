// routes/orderRoutes.js
import express from "express";
import { getAllOrders, createOrder , updateOrder } from "../controller/orderController.js";

const router = express.Router();

// Route to fetch all orders
router.get("/", getAllOrders);

// Route to create a new order
router.post("/", createOrder);

// Define the PUT route for updating an order
router.put('/:id', updateOrder);

export default router;
