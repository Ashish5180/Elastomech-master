import React, { useState, useEffect , useRef} from "react";
import axios from "axios";
import "./addorder.css";

function AddOrder() {
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [weightPerProduct, setWeightPerProduct] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [selectedRubberIngredients, setSelectedRubberIngredients] = useState(
    []
  );
  const [selectedChemicals, setSelectedChemicals] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [orderNumber, setOrderNumber] = useState(1);
  const [mode, setMode] = useState("formula");
  const [formulas, setFormulas] = useState([]);
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicalIngredients, setChemicalIngredients] = useState([]);

  useEffect(() => {
    fetchFormulas();
    fetchIngredients();
  }, []);


  const printRef = useRef(); // Ref for the printable section

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    // window.location.reload(); // Reload the page to restore original content
  };

  // Fetch formulas from the backend
  const fetchFormulas = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/formulas");
      setFormulas(response.data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

  // Fetch ingredients from the backend
  const fetchIngredients = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/items");
      const rubber = response.data.filter((item) => item.category === "rubber");
      const chemicals = response.data.filter(
        (item) => item.category === "chemical"
      );
      setRubberIngredients(rubber);
      setChemicalIngredients(chemicals);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Function to add a new ingredient
  const addIngredient = (type) => {
    const newIngredient = { name: "", ratio: 0, weight: 0 };
    if (type === "rubber") {
      setSelectedRubberIngredients([
        ...selectedRubberIngredients,
        newIngredient,
      ]);
    } else {
      setSelectedChemicals([...selectedChemicals, newIngredient]);
    }
  };

  // Function to remove an ingredient
  const removeIngredient = (type, index) => {
    if (type === "rubber") {
      const updatedRubberIngredients = [...selectedRubberIngredients];
      updatedRubberIngredients.splice(index, 1);
      setSelectedRubberIngredients(updatedRubberIngredients);
    } else {
      const updatedChemicals = [...selectedChemicals];
      updatedChemicals.splice(index, 1);
      setSelectedChemicals(updatedChemicals);
    }
  };

  // Total weight required calculation
  const totalWeightRequired = weightPerProduct * quantity;

  // Generate Order ID
  const generateOrderID = () => {
    const date = new Date();
    const dateString = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    return `ELAST${dateString}${String(orderNumber).padStart(2, "0")}`;
  };

  // Apply selected formula
  const applyFormula = (formulaName) => {
    const selectedFormula = formulas.find((f) => f.name === formulaName);
    if (selectedFormula) {
      const rubberIngredients = selectedFormula.ingredients.filter(
        (ingredient) => ingredient.type === "rubber"
      );
      const chemicalIngredients = selectedFormula.ingredients.filter(
        (ingredient) => ingredient.type === "chemical"
      );

      // Calculate total ratio of all ingredients
      const totalRatio = [...rubberIngredients, ...chemicalIngredients].reduce(
        (total, ingredient) => total + ingredient.ratio,
        0
      );

      // Calculate the weight for each ingredient based on the ratio and total weight required
      const rubberIngredientsWithWeight = rubberIngredients.map(
        (ingredient) => {
          const weight = (ingredient.ratio / totalRatio) * totalWeightRequired;
          return { ...ingredient, weight };
        }
      );

      const chemicalIngredientsWithWeight = chemicalIngredients.map(
        (ingredient) => {
          const weight = (ingredient.ratio / totalRatio) * totalWeightRequired;
          return { ...ingredient, weight };
        }
      );

      setSelectedRubberIngredients(rubberIngredientsWithWeight);
      setSelectedChemicals(chemicalIngredientsWithWeight);
    }
  };

  // Calculate weights for custom ingredients
  const calculateWeights = () => {
    const totalRatio = calculateTotalRatio();

    // Calculate weight for rubber ingredients
    const rubberWithWeight = selectedRubberIngredients.map((ingredient) => {
      const weight = (ingredient.ratio / totalRatio) * totalWeightRequired;
      return { ...ingredient, weight };
    });

    // Calculate weight for chemical ingredients
    const chemicalWithWeight = selectedChemicals.map((ingredient) => {
      const weight = (ingredient.ratio / totalRatio) * totalWeightRequired;
      return { ...ingredient, weight };
    });

    // Update state with calculated weights
    setSelectedRubberIngredients(rubberWithWeight);
    setSelectedChemicals(chemicalWithWeight);
  };

  // Helper function to calculate total ratio
  const calculateTotalRatio = () => {
    const rubberRatio = selectedRubberIngredients.reduce(
      (sum, ingredient) => sum + ingredient.ratio,
      0
    );
    const chemicalRatio = selectedChemicals.reduce(
      (sum, ingredient) => sum + ingredient.ratio,
      0
    );
    return rubberRatio + chemicalRatio;
  };

  // Function to handle submitting the order
  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        orderId: generateOrderID(),
        customerName,
        itemName,
        weightPerProduct,
        quantity,
        rubberIngredients: selectedRubberIngredients.map((ingredient) => ({
          name: ingredient.name,
          ratio: ingredient.ratio,
          weight: ingredient.weight,
        })),
        chemicalIngredients: selectedChemicals.map((ingredient) => ({
          name: ingredient.name,
          ratio: ingredient.ratio,
          weight: ingredient.weight,
        })),
        deliveryDate,
        remarks,
      };

      const response = await axios.post("http://localhost:5001/api/orders", orderData);
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
    setSelectedRubberIngredients([]);
    setSelectedChemicals([]);
    setDeliveryDate("");
    setRemarks("");
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
          <label>Customer Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label>Item Name:</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label>Weight per Product (kg):</label>
          <input
            type="number"
            value={weightPerProduct}
            onChange={(e) => setWeightPerProduct(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Mode:</label>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              if (e.target.value === "formula") {
                setSelectedRubberIngredients([]);
                setSelectedChemicals([]);
              }
            }}
          >
            <option value="formula">Formula</option>
            <option value="custom">Custom Formula</option>
          </select>
        </div>

        {mode === "formula" && (
          <div>
            <label>Select Formula:</label>
            <select
              onChange={(e) => applyFormula(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Choose a formula
              </option>
              {formulas.map((formula, i) => (
                <option key={i} value={formula.name}>
                  {formula.name}
                </option>
              ))}
            </select>
            <table>
              <thead>
                <tr>
                  <th>Ingredient Name</th>
                  <th>Type</th>
                  <th>Ratio</th>
                  <th>Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {[...selectedRubberIngredients, ...selectedChemicals].map(
                  (ingredient, index) => (
                    <tr key={index}>
                      <td>{ingredient.name}</td>
                      <td>
                        {ingredient.type === "rubber" ? "Rubber" : "Chemical"}
                      </td>
                      <td>{ingredient.ratio}</td>
                      <td>{ingredient.weight.toFixed(2)}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {mode === "custom" && (
          <>
            <h3>Custom Formula Ingredients</h3>

            {/* Rubber Ingredients Section */}
            <h4>Rubber Ingredients</h4>
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Ratio</th>
                  <th>Weight (kg)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedRubberIngredients.map((ingredient, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={ingredient.name}
                        onChange={(e) => {
                          const updatedIngredients = [
                            ...selectedRubberIngredients,
                          ];
                          updatedIngredients[index].name = e.target.value;
                          setSelectedRubberIngredients(updatedIngredients);
                        }}
                      >
                        <option value="" disabled>
                          Select Rubber Ingredient
                        </option>
                        {rubberIngredients.map((rubberOption, i) => (
                          <option key={i} value={rubberOption.name}>
                            {rubberOption.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ingredient.ratio}
                        onChange={(e) => {
                          const updatedIngredients = [
                            ...selectedRubberIngredients,
                          ];
                          updatedIngredients[index].ratio = Number(
                            e.target.value
                          );
                          setSelectedRubberIngredients(updatedIngredients);
                        }}
                        placeholder="Enter ratio"
                      />
                    </td>
                    <td>{ingredient.weight.toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeIngredient("rubber", index)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addIngredient("rubber")}>
              Add Rubber Ingredient
            </button>

            {/* Chemical Ingredients Section */}
            <h4>Chemical Ingredients</h4>
            <table>
              <thead>
                <tr>
                  <th>Chemical</th>
                  <th>Ratio</th>
                  <th>Weight (kg)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedChemicals.map((chemical, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={chemical.name}
                        onChange={(e) => {
                          const updatedChemicals = [...selectedChemicals];
                          updatedChemicals[index].name = e.target.value;
                          setSelectedChemicals(updatedChemicals);
                        }}
                      >
                        <option value="" disabled>
                          Select Chemical
                        </option>
                        {chemicalIngredients.map((chemicalOption, i) => (
                          <option key={i} value={chemicalOption.name}>
                            {chemicalOption.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={chemical.ratio}
                        onChange={(e) => {
                          const updatedChemicals = [...selectedChemicals];
                          updatedChemicals[index].ratio = Number(
                            e.target.value
                          );
                          setSelectedChemicals(updatedChemicals);
                        }}
                        placeholder="Enter ratio"
                      />
                    </td>
                    <td>{chemical.weight.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => removeIngredient("chemical", index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addIngredient("chemical")}>
              Add Chemical Ingredient
            </button>

            {/* Calculate Weights Button */}
            <button onClick={calculateWeights}>Calculate Weights</button>
          </>
        )}

        <div>
          <label>Delivery Date:</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div>
          <label>Remarks:</label>
          <textarea
            style={{ height: "7rem", width: "100%" }}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows="3"
          />
        </div>

        <h3>Summary</h3>
        <p>Item Name: {itemName}</p>
        <p>Total Weight Required: {totalWeightRequired} kg</p>
        <p>Delivery Date: {deliveryDate}</p>
        <p>Remarks: {remarks}</p>

        <button onClick={handlePrint}>Print</button>
        <button onClick={() => window.location.reload()}>Clear</button>
        <button onClick={handleSubmitOrder}>Add Order to Production</button>
      </div>
    </div>
  );
}

export default AddOrder;
