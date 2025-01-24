import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FormulaBin.css";

const FormulaBin = () => {
  const [formulas, setFormulas] = useState([]);
  const [currentFormulaName, setCurrentFormulaName] = useState("");
  const [currentIngredients, setCurrentIngredients] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track the formula ID when editing
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicalIngredients, setChemicalIngredients] = useState([]);

  // Fetch formulas and items (ingredients) from the backend
  useEffect(() => {
    fetchFormulas();
    fetchIngredients();
  }, []);

  const fetchFormulas = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/formulas");
      setFormulas(response.data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

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

  const addRow = () => {
    setCurrentIngredients([
      ...currentIngredients,
      { type: "rubber", name: "", ratio: 0 },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedIngredients = [...currentIngredients];
    updatedIngredients[index][field] = value;
    setCurrentIngredients(updatedIngredients);
  };

  const removeRow = (index) => {
    const updatedIngredients = [...currentIngredients];
    updatedIngredients.splice(index, 1);
    setCurrentIngredients(updatedIngredients);
  };

  const calculateTotalRate = () => {
    return currentIngredients.reduce((total, ingredient) => {
      const itemList =
        ingredient.type === "rubber" ? rubberIngredients : chemicalIngredients;
      const item = itemList.find((i) => i.name === ingredient.name);
      return total + (item ? item.rate * ingredient.ratio : 0);
    }, 0);
  };

  const saveFormula = async () => {
    if (!currentFormulaName.trim()) {
      alert("Please enter a formula name.");
      return;
    }

    if (currentIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    // Check for valid ingredients
    const invalidIngredients = currentIngredients.some(
      (ingredient) => !ingredient.name || ingredient.ratio <= 0
    );
    if (invalidIngredients) {
      alert("Please provide valid ingredient details.");
      return;
    }

    const newFormula = {
      name: currentFormulaName,
      ingredients: currentIngredients,
    };

    try {
      if (editingId) {
        // Update existing formula
        await axios.put(
          `http://localhost:5001/api/formulas/${editingId}`,
          newFormula
        );
        console.log("Formula updated successfully!");
      } else {
        // Add new formula
        await axios.post("http://localhost:5001/api/formulas", newFormula);
        console.log("Formula saved successfully!");
      }

      // Reset form and refresh formulas
      setCurrentFormulaName("");
      setCurrentIngredients([]);
      setEditingIndex(null);
      setEditingId(null);
      fetchFormulas();
    } catch (error) {
      console.error("Error saving formula:", error);
    }
  };

  const deleteFormula = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/formulas/${id}`);
      fetchFormulas();
    } catch (error) {
      console.error("Error deleting formula:", error);
    }
  };

  const editFormula = (index, id) => {
    const formula = formulas[index];
    setCurrentFormulaName(formula.name);
    setCurrentIngredients(formula.ingredients);
    setEditingIndex(index);
    setEditingId(id);
  };

  return (
    <div className="formula-bin-container">
      <h2>Formula Bin</h2>

      <div className="formula-creation">
        <h3>{editingIndex !== null ? "Edit Formula" : "Create Formula"}</h3>

        <label>
          Formula Name:
          <input
            type="text"
            name="name"
            value={currentFormulaName}
            onChange={(e) => setCurrentFormulaName(e.target.value)}
            placeholder="Enter formula name"
            className="formula-name-input"
          />
        </label>

        <div className="ingredients-table">
          <div className="table-header">
            <div>Type</div>
            <div>Ingredient</div>
            <div>Ratio (kg)</div>
            <div>Actions</div>
          </div>
          {currentIngredients.map((ingredient, index) => (
            <div className="table-row" key={index}>
              <select
                value={ingredient.type}
                name="type"
                onChange={(e) =>
                  handleInputChange(index, "type", e.target.value)
                }
              >
                <option value="rubber">Rubber</option>
                <option value="chemical">Chemical</option>
              </select>

              <select
                value={ingredient.name}
                name="name"
                onChange={(e) =>
                  handleInputChange(index, "name", e.target.value)
                }
              >
                <option value="">Select Ingredient</option>
                {(ingredient.type === "rubber"
                  ? rubberIngredients
                  : chemicalIngredients
                ).map((item, i) => (
                  <option key={i} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="ratio"
                placeholder="Ratio (kg)"
                value={ingredient.ratio}
                onChange={(e) =>
                  handleInputChange(index, "ratio", parseFloat(e.target.value))
                }
              />

              <button onClick={() => removeRow(index)}>Remove</button>
            </div>
          ))}
        </div>

        <button onClick={addRow} className="add-row-btn">
          Add Row
        </button>
        <button onClick={saveFormula} className="save-formula-btn">
          {editingIndex !== null ? "Update Formula" : "Save Formula"}
        </button>
      </div>

      <div className="formula-list">
        <h3>Saved Formulas</h3>
        {formulas.length === 0 ? (
          <p>No formulas saved yet.</p>
        ) : (
          <ul>
            {formulas.map((formula, index) => (
              <li key={formula._id}>
                <strong>{formula.name}</strong>
                <ul>
                  {formula.ingredients.map((ingredient, i) => (
                    <li key={i}>
                      {ingredient.type === "rubber" ? "Rubber" : "Chemical"}:{" "}
                      {ingredient.name} - {ingredient.ratio} kg
                    </li>
                  ))}
                </ul>
                <button onClick={() => editFormula(index, formula._id)}>
                  Edit
                </button>
                <button onClick={() => deleteFormula(formula._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FormulaBin;
