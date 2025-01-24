import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./addorder.css";

function AddOrder() {
  const [customerName, setCustomerName] = useState("");
const [itemName, setItemName] = useState("");
const [weightPerProduct, setWeightPerProduct] = useState(0);
const [quantity, setQuantity] = useState(0);
const [deliveryDate, setDeliveryDate] = useState("");
const [remarks, setRemarks] = useState("");
const [orderNumber, setOrderNumber] = useState(1);
const [orderDescription, setOrderDescription] = useState("");
const [selectedProduct, setSelectedProduct] = useState(null); // State for the selected product

const printRef = useRef(); // Ref for the printable section

const [articles, setArticles] = useState([]);
const [filteredArticles, setFilteredArticles] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [selectedArticle, setSelectedArticle] = useState("");

const [formulas, setFormulas] = useState([]); // New state to store formulas with names

// Fetch formulas from your API or data source
useEffect(() => {
  const fetchFormulas = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/formulas");
      // Check if response data exists and is in the expected format
      if (response.data && Array.isArray(response.data)) {
        setFormulas(response.data); // Store formulas in state
        console.log("Formulas fetched:", response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

  fetchFormulas();
}, []);  // The empty array ensures this runs once when the component mounts

const getFormulaNameById = (formulaId) => {
  if (!formulaId) {
    // Handle cases where formulaId is invalid or undefined
    console.log("Formula ID is invalid:", formulaId);
    return "Unknown Formula"; 
  }

  console.log("Formula ID from product:", formulaId); // Log formulaId from product

  // Log the structure of the formulas array
  console.log("Formulas array structure:", formulas);

  // Loop through the formulas array to find the matching formula ID
  formulas.forEach(f => {
    console.log("Formula in list:", f); // Log each formula to understand the structure
  });

  // Adjust comparison: Check if _id and $oid exist before comparison
  let formula = formulas.find(f => {
    // Check if the formula has a _id field with a possible $oid field
    const formulaIdFromDb = f._id && f._id.$oid ? f._id.$oid : f._id; // Adjust for cases where $oid may be missing
    console.log("Formula ID in DB:", formulaIdFromDb); // Log formulaId in DB
    return formulaIdFromDb && String(formulaIdFromDb) === String(formulaId);
  });

  if (formula) {
    console.log("Found formula:", formula); // Log found formula
    return formula.name; // Use 'name' instead of 'formulaName'
  } else {
    console.log("Formula not found for ID:", formulaId); // Log if formula is not found
    return "Unknown Formula"; // Return "Unknown Formula" if not found
  }
};









// Fetch articles from the API
useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/products");
      setArticles(response.data); // Store the API response in state
      setFilteredArticles(response.data); // Initialize filtered articles
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  fetchArticles();
}, []);

// Generate Order ID
const generateOrderID = () => {
  const date = new Date();
  const dateString = `${String(date.getDate()).padStart(2, "0")}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}`;

  return `OD${dateString}-${String(orderNumber).padStart(2, "0")}`;
};

const handlePrint = () => {
  const printContents = printRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // Reload the page to restore original content
};

useEffect(() => {
  const results = articles.filter((article) =>
    article.articleName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredArticles(results);
}, [searchTerm, articles]);

// Function to handle selecting an article
const handleArticleSelect = (selectedId) => {
  setSelectedArticle(selectedId);

  console.log("Selected ID:", selectedId); // Should be the _id, not articleName

  // Find the selected article by _id
  const selectedProduct = articles.find((article) => article._id === selectedId);
  setSelectedProduct(selectedProduct)

  console.log("Articles:", articles); // Log the articles to verify they have the correct _id
  console.log("Selected Product:", selectedProduct); // Ensure we found the correct product

  if (selectedProduct) {
    console.log("Formulations:", selectedProduct.formulations); // Check if formulations exist and have fillWeight

    // Sum all the fillWeight values from formulations
    const totalWeight = selectedProduct.formulations.reduce(
      (sum, formula) => {
        console.log("Formula Fill Weight:", formula.fillWeight); // Check individual fillWeight values
        return sum + (formula.fillWeight || 0);
      },
      0
    );

    console.log("Total Weight:", totalWeight); // Check the final calculated weight
    setWeightPerProduct(totalWeight);
  } else {
    setWeightPerProduct(0); // Reset weight if no article is selected
  }
};





  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        orderId: generateOrderID(),
        customerName,
        itemName,
        weightPerProduct,
        quantity,
        deliveryDate,
        remarks,
        orderDescription,
      };

      const response = await axios.post(
        "http://localhost:5001/api/orders",
        orderData
      );
      alert("Order added successfully!");
      console.log(response.data);
      resetForm();
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to add order. Please try again.");
    }
  };

  // Reset form function to clear all fields
  const resetForm = () => {
    setCustomerName("");
    setItemName("");
    setWeightPerProduct(0);
    setQuantity(0);
    setDeliveryDate("");
    setRemarks("");
    setOrderDescription("");
    setOrderNumber((prev) => prev + 1); // Increment order number for the next order
  };

  return (
    <div className="add-order-container">
      <div className="add-order-content" ref={printRef}>
        <h2>Order Input Page</h2>

        <div>
          <label>Order ID:</label>
          <p>{generateOrderID()}</p>
        </div>

        <div>
          <label htmlFor="customerName">Customer Name:</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        <div>
        <label htmlFor="searchInput">Search Article:</label>
      <input
        id="searchInput"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search articles"
        style={{ marginBottom: "10px", display: "block" }}
      />

      <label htmlFor="articleSelect">Select Article:</label>
      <select
        id="articleSelect"
        value={selectedArticle}
        onChange={(e) => handleArticleSelect(e.target.value)}
        style={{ width: "100%", padding: "5px" }}
      >
        <option value="">-- Select an Article --</option>
        {filteredArticles.map((article) => (
          <option key={article._id} value={article._id}>
            {article.articleName}
          </option>
        ))}
      </select>
        </div>

        <div>
          <label htmlFor="weightPerProduct">Fill Weight (kg):</label>
          <input
          id="weightPerProduct"
          type="number"
          value={weightPerProduct}
          onChange={(e) => setWeightPerProduct(Number(e.target.value))} // Optional manual adjustment
          disabled
        />
        </div>

        <div>
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="orderDescription">Order Description:</label>
          <textarea
            id="orderDescription"
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            placeholder="Enter order description"
            rows="3"
          />
        </div>

        <div>
          <label htmlFor="deliveryDate">Delivery Date:</label>
          <input
            id="deliveryDate"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="remarks">Remarks:</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any remarks"
            rows="3"
          />
        </div>

        <h3>Summary</h3>
        <p>Item Name: {itemName}</p>
        <p>Order Description: {orderDescription}</p>
        <p>
  Formula Used: A total of {weightPerProduct * quantity} kgs, consisting of:
  {selectedProduct && selectedProduct.formulations
    ? selectedProduct.formulations.map((formula, index) => {
        const individualWeight = formula.fillWeight * quantity; // Calculate individual weight for the formula
        const formulaName = getFormulaNameById(formula.formulaName); // Get the formula name using its ID

        return (
          <span key={formula._id}>
            {formulaName} ({individualWeight} kgs)
            {index < selectedProduct.formulations.length - 1 && ", "}
          </span>
        );
      })
    : "No formulas available"}
</p>


        <p>Delivery Date: {deliveryDate}</p>
        <p>Remarks: {remarks}</p>

        <button onClick={handlePrint}>Print</button>
        <button onClick={resetForm}>Clear</button>
        <button onClick={handleSubmitOrder}>Add Order to Production</button>
      </div>
    </div>
  );
}

export default AddOrder;