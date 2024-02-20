import mongoose from "mongoose";
import prompt from "prompt-sync";

// Establish MongoDB connection
mongoose.connect("mongodb://localhost:27017/product_management_system");

// Create prompt
const promptInput = prompt();

// Define Category schema and model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Category = mongoose.model("Category", categorySchema);

// Define Supplier schema and model
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Supplier = mongoose.model("Supplier", supplierSchema);

// Define Product schema and model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

// Define Offer schema and model
const offerSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
});

const Offer = mongoose.model("Offer", offerSchema);

// Function to display menu and handle user input
function displayMenu() {
  console.log("1. Add new category");
  console.log("2. Add new product");
  console.log("3. View products by category");
  console.log("4. View products by supplier");
  console.log("5. View all offers within a price range");
  console.log(
    "6. View all offers that contain a product from a specific category"
  );
  console.log(
    "7. View the number of offers based on the availability of their products in stock"
  );
  console.log("8. Create order for products");
  console.log("9. Create order for offers");
  console.log("10. Ship orders");
  console.log("11. Add a new supplier");
  console.log("12. View suppliers");
  console.log("13. View all sales");
  console.log("14. View sum of all profits");
  console.log("0. Exit");

  const option = promptInput("Select an option: ");

  switch (option) {
    case "1":
      addNewCategory();
      break;
    case "2":
      addNewProduct();
      break;
    case "3":
      viewProductsByCategory();
      break;
    case "4":
      viewProductsBySupplier();
      break;
    case "5":
      viewOffersWithinPriceRange();
      break;
    case "6":
      viewOffersByCategory();
      break;
    case "7":
      viewOffersByStockAvailability();
      break;
    case "8":
      createOrderForProducts();
      break;
    case "9":
      console.log("You selected: Create order for offers");
      break;
    case "10":
      console.log("You selected: Ship orders");
      break;
    case "11":
      addNewSupplier();
      break;
    case "12":
      viewSuppliers();
      break;
    case "13":
      console.log("You selected: View all sales");
      break;
    case "14":
      console.log("You selected: View sum of all profits");
      break;
    case "0":
      // Exit the program
      console.log("Exiting...");
      mongoose.connection.close();
      break;
    default:
      console.log("Invalid option. Please select a valid option.");
      break;
  }
}

// Function to create a new product
async function createProduct(name, category, price, cost, stock, supplier) {
  try {
    const product = new Product({
      name,
      category,
      price,
      cost,
      stock,
      supplier,
    });
    await product.save();
    console.log("Product created successfully:", product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

async function addNewProduct() {
  // Display prompt for product details
  console.log("Adding a new product:");

  // Display existing suppliers
  const suppliers = await Supplier.find();
  console.log("Existing Suppliers:");
  suppliers.forEach((supplier, index) => {
    console.log(`${index + 1}. ${supplier.name}`);
  });

  // Ask user to select a supplier or add a new one
  const supplierOption = promptInput(
    "Select a supplier from the list (enter number) or add a new one (type 'new'): "
  );

  if (supplierOption === "new") {
    addNewSupplierForProduct();
  } else if (
    parseInt(supplierOption) >= 1 &&
    parseInt(supplierOption) <= suppliers.length
  ) {
    const selectedSupplier = suppliers[parseInt(supplierOption) - 1];

    // Fetch existing categories
    const categories = await Category.find();
    console.log("Existing Categories:");
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
    });

    // Ask user to select a category or add a new one
    const categoryOption = promptInput(
      "Select a category from the list (enter number) or add a new one (type 'new'): "
    );

    if (categoryOption === "new") {
      addNewCategoryForProduct(selectedSupplier);
    } else if (
      parseInt(categoryOption) >= 1 &&
      parseInt(categoryOption) <= categories.length
    ) {
      const selectedCategory = categories[parseInt(categoryOption) - 1];

      // Ask for product details
      const name = promptInput("Enter product name: ");
      const price = parseFloat(promptInput("Enter product price: "));
      const cost = parseFloat(promptInput("Enter product cost: "));
      const stock = parseInt(promptInput("Enter product stock: "));

      try {
        // Create the new product
        await createProduct(
          name,
          selectedCategory._id,
          price,
          cost,
          stock,
          selectedSupplier._id
        );
        console.log("Product added successfully!");
      } catch (error) {
        console.error("Error adding product:", error);
      } finally {
        // Return to the main menu
        displayMenu();
      }
    } else {
      console.log("Invalid selection.");
      displayMenu();
    }
  } else {
    console.log("Invalid selection.");
    displayMenu();
  }
}

// Function to add a new category for a product
async function addNewCategoryForProduct(supplier) {
  console.log("Adding a new category:");

  const name = promptInput("Enter category name: ");
  const description = promptInput("Enter category description: ");

  try {
    const category = new Category({ name, description });
    await category.save();
    console.log("New category added successfully!");

    // Return to adding a new product after adding the category
    addNewProduct();
  } catch (error) {
    console.error("Error adding category:", error);
  }
}

// Function to add a new supplier
async function addNewSupplierForProduct() {
  console.log("Adding a new supplier:");

  const name = promptInput("Enter supplier name: ");
  const description = promptInput("Enter supplier description: ");

  try {
    const supplier = new Supplier({ name, description });
    await supplier.save();
    console.log("New supplier added successfully!");
  } catch (error) {
    console.error("Error adding supplier:", error);
  } finally {
    // Return to adding a new product after adding the supplier
    addNewProduct();
  }
}

// Function to view products by category
async function viewProductsByCategory() {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    // Display the categories to the user
    console.log("Categories:");
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
    });

    // Ask the user to select a category
    const categoryOption = promptInput("Select a category (enter number): ");

    // Check if the entered option is valid
    if (
      parseInt(categoryOption) >= 1 &&
      parseInt(categoryOption) <= categories.length
    ) {
      const selectedCategory = categories[parseInt(categoryOption) - 1];

      // Fetch products belonging to the selected category
      const products = await Product.find({
        category: selectedCategory._id,
      }).populate("supplier");

      // Display the products
      console.log(`Products in category "${selectedCategory.name}":`);
      products.forEach((product) => {
        console.log("Name:", product.name);
        console.log("Price:", product.price);
        console.log("Cost:", product.cost);
        console.log("Stock:", product.stock);
        console.log(
          "Supplier:",
          product.supplier ? product.supplier.name : "N/A"
        );
        console.log("---------------------------");
      });
    } else {
      console.log("Invalid selection.");
    }

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error("Error viewing products by category:", error);
  }
}

// Function to view products by supplier
async function viewProductsBySupplier() {
  try {
    // Fetch all suppliers from the database
    const suppliers = await Supplier.find();

    // Display the suppliers to the user
    console.log("Suppliers:");
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name}`);
    });

    // Ask the user to select a supplier
    const supplierOption = promptInput("Select a supplier (enter number): ");

    // Check if the entered option is valid
    if (
      parseInt(supplierOption) >= 1 &&
      parseInt(supplierOption) <= suppliers.length
    ) {
      const selectedSupplier = suppliers[parseInt(supplierOption) - 1];

      // Fetch products associated with the selected supplier
      const products = await Product.find({
        supplier: selectedSupplier._id,
      });

      // Display the products
      console.log(`Products supplied by "${selectedSupplier.name}":`);
      products.forEach((product) => {
        console.log("Name:", product.name);
        console.log("Price:", product.price);
        console.log("Cost:", product.cost);
        console.log("Stock:", product.stock);
        console.log("---------------------------");
      });
    } else {
      console.log("Invalid selection.");
    }

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error("Error viewing products by supplier:", error);
  }
}

// Function to view offers within a price range
async function viewOffersWithinPriceRange() {
  try {
    // Ask the user to input the price range
    const minPrice = parseFloat(promptInput("Enter the minimum price: "));
    const maxPrice = parseFloat(promptInput("Enter the maximum price: "));

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      console.log("Invalid input. Please enter valid prices.");
      displayMenu();
      return;
    }

    // Fetch products within the specified price range
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .populate("category")
      .populate("supplier");

    // Display the offers
    console.log(`Offers within the price range $${minPrice} - $${maxPrice}:`);
    products.forEach((product) => {
      console.log("Name:", product.name);
      console.log(
        "Category:",
        product.category ? product.category.name : "N/A"
      );
      console.log("Price:", product.price);
      console.log("Cost:", product.cost);
      console.log("Stock:", product.stock);
      console.log(
        "Supplier:",
        product.supplier ? product.supplier.name : "N/A"
      );
      console.log("---------------------------");
    });

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error("Error viewing offers within the price range:", error);
  }
}

// Function to view all offers that contain a product from a specific category
async function viewOffersByCategory() {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    // Display the categories to the user
    console.log("Categories:");
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
    });

    // Ask the user to select a category
    const categoryOption = promptInput("Select a category (enter number): ");

    // Check if the entered option is valid
    if (
      parseInt(categoryOption) >= 1 &&
      parseInt(categoryOption) <= categories.length
    ) {
      const selectedCategory = categories[parseInt(categoryOption) - 1];

      // Use aggregation to find offers containing products from the selected category
      const offers = await Offer.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "products",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $match: {
            "products.category": selectedCategory._id,
          },
        },
        {
          $project: {
            _id: 1,
            price: 1,
            products: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $eq: ["$$product.category", selectedCategory._id] },
              },
            },
          },
        },
      ]);

      if (offers.length === 0) {
        console.log(
          `No offers found that contain products from the category "${selectedCategory.name}".`
        );
      } else {
        // Display the offers
        console.log(
          `Offers that contain products from the category "${selectedCategory.name}":`
        );
        offers.forEach((offer) => {
          console.log("Offer ID:", offer._id);
          console.log("Price:", offer.price);
          console.log("Products:");
          offer.products.forEach((product) => {
            console.log("  - Name:", product.name);
            console.log("    Category:", selectedCategory.name); // Since we're filtering by category, we can safely assume the category of each product
          });
          console.log("---------------------------");
        });
      }
    } else {
      console.log("Invalid selection.");
    }

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "Error viewing offers that contain products from a specific category:",
      error
    );
  }
}

// Function to view the number of offers based on the availability of their products in stock
async function viewOffersByStockAvailability() {
  try {
    // Fetch all offers from the database
    const offers = await Offer.find().populate("products");

    // Count the number of offers based on stock availability
    const stockAvailability = {
      low: 0,
      medium: 0,
      high: 0,
    };

    offers.forEach((offer) => {
      const totalStock = offer.products.reduce(
        (acc, product) => acc + product.stock,
        0
      );

      if (totalStock === 0) {
        stockAvailability.low++;
      } else if (totalStock <= 10) {
        stockAvailability.medium++;
      } else {
        stockAvailability.high++;
      }
    });

    // Display the results
    console.log("Number of offers based on stock availability:");
    console.log("No products in stock:", stockAvailability.low);
    console.log("Some products in stock:", stockAvailability.medium);
    console.log("All products in stock:", stockAvailability.high);

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "Error viewing the number of offers based on stock availability:",
      error
    );
  }
}

// Function to add a new category
async function addNewCategory() {
  console.log("Adding a new category:");

  const name = promptInput("Enter category name: ");
  const description = promptInput("Enter category description: ");

  try {
    const category = new Category({ name, description });
    await category.save();
    console.log("New category added successfully!");
  } catch (error) {
    console.error("Error adding category:", error);
  } finally {
    // Return to the main menu
    displayMenu();
  }
}

// Function to add a new supplier
async function addNewSupplier() {
  console.log("Adding a new supplier:");

  const name = promptInput("Enter supplier name: ");
  const description = promptInput("Enter supplier description: ");

  try {
    const supplier = new Supplier({ name, description });
    await supplier.save();
    console.log("New supplier added successfully!");
  } catch (error) {
    console.error("Error adding supplier:", error);
  } finally {
    // Return to the main menu
    displayMenu();
  }
}

// Function to view all suppliers
async function viewSuppliers() {
  try {
    // Fetch all suppliers from the database
    const suppliers = await Supplier.find();

    // Display the suppliers
    console.log("Suppliers:");
    suppliers.forEach((supplier) => {
      console.log("Name:", supplier.name);
      console.log("Description:", supplier.description);
      console.log("---------------------------");
    });
  } catch (error) {
    console.error("Error viewing suppliers:", error);
  } finally {
    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  }
}

async function createOrderForProducts() {
  console.log("Creating order for products:");

  let finished = false;
  let orderProducts = [];

  while (!finished) {
    // Display existing products
    const products = await Product.find();
    console.log("Existing Products:");
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (Stock: ${product.stock})`);
    });

    // Ask user to select a product
    const selectedProductIndex = await askQuestion(
      "Select a product from the list (enter number) or type 'done' to finish: "
    );
    if (selectedProductIndex === "done") {
      finished = true;
      continue;
    }

    const selectedProduct = products[parseInt(selectedProductIndex) - 1];

    // Ask for quantity and additional details
    const quantityInput = await askQuestion("Enter quantity: ");
    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0 || selectedProduct.stock < quantity) {
      console.log("Invalid quantity or insufficient stock.");
      continue;
    }

    const details = await askQuestion("Enter additional details: ");

    // Decrease the stock of the selected product
    selectedProduct.stock -= quantity;
    await selectedProduct.save();

    // Add the selected product to the order
    orderProducts.push({
      product: selectedProduct._id,
      quantity,
      details,
    });

    console.log("Product added to order.");
  }

  // Create the order
  try {
    const order = new Order({ products: orderProducts });
    await order.save();
    console.log("Order created successfully:", order);
  } catch (error) {
    console.error("Error creating order:", error);
  } finally {
    // Return to the main menu
    displayMenu();
  }
}

async function askQuestion(question) {
  return promptInput(question);
}

// Start the application
displayMenu();
