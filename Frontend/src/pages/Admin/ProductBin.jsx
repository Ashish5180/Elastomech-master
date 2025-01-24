import React, { useState, useEffect } from "react";
import { FaSearch } from 'react-icons/fa'; // Importing React Icons
import { motion } from 'framer-motion'; // Importing Framer Motion

const ProductBin = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
 
  // Set the current date when the component mounts
  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format
    setProductForm((prevState) => ({
      ...prevState,
      lastUpdated: currentDate, // Set the current date as default
    }));
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prevState) => ({
      ...prevState,
      [name]: value, // Update the date when the user changes it
    }));
  };

  // Format the date to display in DD/MM/YY (not for input)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format
    setProductForm((prevState) => ({
      ...prevState,
      lastUpdated: currentDate,
    }));
  }, []);





  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const sortProducts = (products, config) => {
    if (config === null) return products;

    const sortedProducts = [...products];
    sortedProducts.sort((a, b) => {
      if (a[config.key] < b[config.key]) return config.direction === "ascending" ? -1 : 1;
      if (a[config.key] > b[config.key]) return config.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortedProducts;
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.articleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.articleNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  const [productForm, setProductForm] = useState({
    articleName: '',
    image: '',
    articleNo: '',
    manufacturing: '',
    mouldingTemp: '',
    formulations: [],
    mouldNo: '',
    noOfCavity: '',
    cycleTime: '',
    expectedCycles: '',
    noOfLabours: '',
    hardness: '',
    lastUpdated: new Date().toISOString().split("T")[0],
  });

  const [formulas, setFormulas] = useState([]);
  const [selectedFormulas, setSelectedFormulas] = useState([]);
  const [fillWeights, setFillWeights] = useState({});

  const fetchFormulas = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/formulas");
      const data = await response.json();
      setFormulas(data);
    } catch (error) {
      console.error("Error fetching formulas:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/products");
      const productsData = await response.json();
      
      const formulaIds = productsData.flatMap(product =>
        product.formulations.map(formulation => formulation.formulaName)
      );
      
      const uniqueFormulaIds = [...new Set(formulaIds)];
  
      const formulaResponse = await fetch(
        `http://localhost:5001/api/formulas?ids=${uniqueFormulaIds.join(",")}`
      );
      const formulasData = await formulaResponse.json();
  
      const formulaMap = formulasData.reduce((acc, formula) => {
        acc[formula._id] = formula;
        return acc;
      }, {});
  
      const populatedProducts = productsData.map((product) => ({
        ...product,
        formulations: product.formulations.map((formulation) => ({
          ...formulation,
          formulaName: formulaMap[formulation.formulaName],
        })),
      }));
  
      setProducts(populatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };



  const handleFormulaSelect = (e) => {
    const { value, checked } = e.target;
    setSelectedFormulas((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((id) => id !== value)
    );
  };

  const handleFillWeightChange = (e, formulaId) => {
    const weight = e.target.value;
    setFillWeights((prevWeights) => ({
      ...prevWeights,
      [formulaId]: weight,
    }));
  };

 

  const parseDate = (formattedDate) => {
    if (!formattedDate) return "";
    const [day, month, year] = formattedDate.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Ensure that fill weight for each selected formula is provided
    for (const formulaName of selectedFormulas) {
      if (!fillWeights[formulaName]) {
        alert(`Please enter the fill weight for formula ${formulaName}.`);
        return;
      }
    }

    const finalFormulations = selectedFormulas.map((formulaName) => ({
      formulaName,
      fillWeight: Number(fillWeights[formulaName]),
    }));

    const newProduct = { 
      ...productForm, 
      formulations: finalFormulations 
    };

    if (!newProduct.articleName || !newProduct.articleNo || !newProduct.manufacturing) {
      alert("Please ensure all required fields (articleName, articleNo, manufacturing) are filled.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setProducts((prevProducts) => [...prevProducts, createdProduct]);
        alert("Product saved successfully!");
        resetForm();
      } else {
        const errorResponse = await response.json();
        alert(`Error saving product: ${errorResponse.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Error submitting product.");
    }
  };

  const resetForm = () => {
    setProductForm({
      articleName: "",
      image: "",
      articleNo: "",
      mouldingTemp: "",
      fillWeight: "",
      formulationNumber: [],
      mouldNo: "",
      noOfCavity: "",
      cycleTime: "",
      expectedCycles: "",
      noOfLabours: "",
      hardness: "",
      lastUpdated: "",
    });

    setFillWeights({});
    setSelectedFormulas([]);
  };

  useEffect(() => {
    fetchFormulas();
    fetchProducts();
  }, []);

  return (
    <motion.div
      className="product-inventory-container max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-center text-3xl mb-6 font-semibold">Product Bin</h1>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="form-group">
          <label className="block text-lg">Article Name</label>
          <input
            type="text"
            name="articleName"
            value={productForm.articleName}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="manufacturing" className="block text-lg">Type of Manufacturing</label>
          <select
            name="manufacturing"
            id="manufacturing"
            value={productForm.manufacturing}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Manufacturing Type</option>
            <option value="Moulding">Moulding</option>
            <option value="Extrusion">Extrusion</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-lg">Image URL</label>
          <input
            type="text"
            name="image"
            value={productForm.image}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-lg">Article No.</label>
          <input
            type="text"
            name="articleNo"
            value={productForm.articleNo}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {productForm.manufacturing === 'Moulding' && (
          <div className="form-group">
            <label className="block text-lg">Moulding Temp UT-LT(°C)</label>
            <input
              type="text"
              name="mouldingTemp"
              value={productForm.mouldingTemp}
              onChange={handleInputChange}
              required
              pattern="^\d+(\.\d{1,2})?-\d+(\.\d{1,2})?$"
              title="Please enter the temperature in the format UT-LT, e.g., 200-250"
              placeholder="e.g., 200-250"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        <div className="form-group">
          <label className="block text-lg">Select Formulation Number(s)</label>
          <div className="space-y-2">
            {formulas.map((formula) => (
              <div key={formula._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={formula._id}
                  value={formula._id}
                  checked={selectedFormulas.includes(formula._id)}
                  onChange={handleFormulaSelect}
                  className="form-checkbox text-green-500"
                />
                <label htmlFor={formula._id} className="text-lg">{formula.name}</label>
              </div>
            ))}
          </div>
        </div>

        {selectedFormulas.length > 0 && (
          <div className="fill-weight-inputs space-y-4">
            <h3 className="text-xl font-semibold">Enter Fill Weights for Selected Formulas</h3>
            {selectedFormulas.map((formulaId) => {
              const formula = formulas.find((f) => f._id === formulaId);
              return (
                <div key={formulaId} className="form-group">
                  <label className="block text-lg">Fill Weight for {formula.name}</label>
                  <input
                    type="number"
                    value={fillWeights[formulaId] || ""}
                    onChange={(e) => handleFillWeightChange(e, formulaId)}
                    placeholder={`Enter fill weight for ${formula.name}`}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              );
            })}
          </div>
        )}

        {productForm.manufacturing === 'Moulding' && (
          <>
            <div className="form-group">
              <label className="block text-lg">Mould No.</label>
              <input
                type="text"
                name="mouldNo"
                value={productForm.mouldNo}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="form-group">
              <label className="block text-lg">No. of Cavity</label>
              <input
                type="number"
                name="noOfCavity"
                value={productForm.noOfCavity}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="form-group">
              <label className="block text-lg">Cycle Time (Seconds)</label>
              <input
                type="number"
                name="cycleTime"
                value={productForm.cycleTime}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="block text-lg">{productForm.manufacturing === 'Extrusion' ? 'Expected production per hour' : 'No. of Expected Cycles per 24 hrs'}</label>
          <input
            type="number"
            name="expectedCycles"
            value={productForm.expectedCycles}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-lg">No. of Labours Required</label>
          <input
            type="number"
            name="noOfLabours"
            value={productForm.noOfLabours}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-lg">Hardness</label>
          <input
            type="text"
            name="hardness"
            value={productForm.hardness}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="form-group">
    <label>Last Updated</label>
    <input
  type="date"
  name="lastUpdated"
  value={productForm.lastUpdated}
  onChange={handleInputChange}
  required
  disabled
/>
  </div>

        <button type="submit" className="mt-4 w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none">
          Save Product
        </button>
      </form>

      {/* Product table section */}
      <div className="table-container mt-8 overflow-scroll">
        <h2 className="text-xl font-semibold mb-4">Saved Products</h2>
        <div className="mb-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaSearch className="ml-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <motion.table
          className="table-auto border-collapse overflow-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("articleName")}>Article Name</th>
              <th className="border px-4 py-2 text-left">Image</th>
              <th className="border px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("articleNo")}>Article No.</th>
              <th className="border px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("manufacturing")}>Manufacturing Type</th>
              <th className="border px-4 py-2 text-left">Moulding Temp (°C)</th>
              <th className="border px-4 py-2 text-left">Formulation Number(s)</th>
              <th className="border px-4 py-2 text-left">Mould No.</th>
              <th className="border px-4 py-2 text-left">No. of Cavity</th>
              <th className="border px-4 py-2 text-left">Cycle Time</th>
              <th className="border px-4 py-2 text-left">No. of Cycles per 24 hrs</th>
              <th className="border px-4 py-2 text-left">No. of Labours</th>
              <th className="border px-4 py-2 text-left">Hardness</th>
              <th className="border px-4 py-2 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortProducts(paginatedProducts, sortConfig).map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{product.articleName}</td>
                <td className="border px-4 py-2">
                  {product.image ? <img src={product.image} alt="product" className="w-12 h-12 object-cover rounded" /> : "No Image"}
                </td>
                <td className="border px-4 py-2">{product.articleNo}</td>
                <td className="border px-4 py-2">{product.manufacturing}</td>
                <td className="border px-4 py-2">{product.manufacturing === "Moulding" ? product.mouldingTemp : "N/A"}</td>
                <td className="border px-4 py-2">
                  {product.formulations && product.formulations.length > 0
                    ? product.formulations.map((formulation, i) => (
                        <span key={i}>
                          {formulation?.formulaName?.name} (Fill Weight: {formulation?.fillWeight})
                          {i < product.formulations.length - 1 && ", "}
                        </span>
                      ))
                    : "No Formulation"}
                </td>
                <td className="border px-4 py-2">{product.mouldNo || "N/A"}</td>
                <td className="border px-4 py-2">
                  {product.manufacturing === "Moulding" ? product.noOfCavity : "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {product.manufacturing === "Moulding" ? product.cycleTime : "N/A"}
                </td>
                <td className="border px-4 py-2">{product?.expectedCycles}</td>
                <td className="border px-4 py-2">{product?.noOfLabours}</td>
                <td className="border px-4 py-2">{product?.hardness}</td>
                <td className="border px-4 py-2">{new Date(product.lastUpdated).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default ProductBin;
