import mongoose from "mongoose";
import readline from "readline";

// Establish MongoDB connection
mongoose.connect("mongodb://localhost:27017/product_management_system");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

  rl.question("Select an option: ", async (option) => {
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
        console.log("You selected: Create order for products");
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
        rl.close();
        mongoose.connection.close();
        break;
      default:
        console.log("Invalid option. Please select a valid option.");
        break;
    }
  });
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
  rl.question(
    "Select a supplier from the list (enter number) or add a new one (type 'new'): ",
    async (supplierOption) => {
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
        rl.question(
          "Select a category from the list (enter number) or add a new one (type 'new'): ",
          async (categoryOption) => {
            if (categoryOption === "new") {
              addNewCategoryForProduct(selectedSupplier);
            } else if (
              parseInt(categoryOption) >= 1 &&
              parseInt(categoryOption) <= categories.length
            ) {
              const selectedCategory = categories[parseInt(categoryOption) - 1];

              // Ask for product details
              rl.question("Enter product name: ", async (name) => {
                rl.question("Enter product price: ", async (price) => {
                  rl.question("Enter product cost: ", async (cost) => {
                    rl.question("Enter product stock: ", async (stock) => {
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
                    });
                  });
                });
              });
            } else {
              console.log("Invalid selection.");
              displayMenu();
            }
          }
        );
      } else {
        console.log("Invalid selection.");
        displayMenu();
      }
    }
  );
}

// Function to add a new category for a product
async function addNewCategoryForProduct(supplier) {
  console.log("Adding a new category:");

  rl.question("Enter category name: ", async (name) => {
    rl.question("Enter category description: ", async (description) => {
      try {
        const category = new Category({ name, description });
        await category.save();
        console.log("New category added successfully!");

        // Return to adding a new product after adding the category
        addNewProduct();
      } catch (error) {
        console.error("Error adding category:", error);
      }
    });
  });
}

// Function to add a new supplier
async function addNewSupplierForProduct() {
  console.log("Adding a new supplier:");
  rl.question("Enter supplier name: ", async (name) => {
    rl.question("Enter supplier description: ", async (description) => {
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
    });
  });
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
    rl.question(
      "Select a category (enter number): ",
      async (categoryOption) => {
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
        rl.question("Press Enter to continue to the main menu...", () => {
          // Return to the main menu
          displayMenu();
        });
      }
    );
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
    rl.question(
      "Select a supplier (enter number): ",
      async (supplierOption) => {
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
        rl.question("Press Enter to continue to the main menu...", () => {
          // Return to the main menu
          displayMenu();
        });
      }
    );
  } catch (error) {
    console.error("Error viewing products by supplier:", error);
  }
}

// Function to view offers within a price range
async function viewOffersWithinPriceRange() {
  try {
    // Ask the user to input the price range
    rl.question("Enter the minimum price: ", async (minPriceInput) => {
      rl.question("Enter the maximum price: ", async (maxPriceInput) => {
        const minPrice = parseFloat(minPriceInput);
        const maxPrice = parseFloat(maxPriceInput);

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
        console.log(
          `Offers within the price range $${minPrice} - $${maxPrice}:`
        );
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
        rl.question("Press Enter to continue to the main menu...", () => {
          // Return to the main menu
          displayMenu();
        });
      });
    });
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
    rl.question(
      "Select a category (enter number): ",
      async (categoryOption) => {
        // Check if the entered option is valid
        if (
          parseInt(categoryOption) >= 1 &&
          parseInt(categoryOption) <= categories.length
        ) {
          const selectedCategory = categories[parseInt(categoryOption) - 1];

          // Fetch offers that contain products from the selected category
          const offers = await Offer.find({
            "products.category": selectedCategory._id,
          }).populate({
            path: "products",
            populate: { path: "category" }, // Populate category field of products
          });

          if (offers.length === 0) {
            console.log(
              `No offers found for category "${selectedCategory.name}".`
            );
            displayMenu();
            return;
          }

          // Display the offers along with their details
          console.log(`Offers for category "${selectedCategory.name}":`);
          offers.forEach((offer, index) => {
            console.log(`Offer ${index + 1}:`);
            console.log("Included Products:");
            offer.products.forEach((product) => {
              console.log("- Name:", product.name);
              console.log("  Price:", product.price);
              console.log("  Cost:", product.cost);
              console.log("  Stock:", product.stock);
              console.log(
                "  Category:",
                product.category ? product.category.name : "N/A"
              );
            });
            console.log("Price:", offer.price);
            console.log("---------------------------");
          });
        } else {
          console.log("Invalid selection.");
        }

        // Prompt the user to press Enter to continue
        rl.question("Press Enter to continue to the main menu...", () => {
          // Return to the main menu
          displayMenu();
        });
      }
    );
  } catch (error) {
    console.error("Error viewing offers by category:", error);
  }
}
// Function to view the number of offers based on the availability of their products in stock
async function viewOffersByStockAvailability() {
  try {
    // Query all offers from the database
    const offers = await Offer.find().populate("products");

    // Initialize counters for offers with all products in stock, some products in stock, and no products in stock
    let allProductsInStockCount = 0;
    let someProductsInStockCount = 0;
    let noProductsInStockCount = 0;

    // Iterate over each offer
    for (const offer of offers) {
      // Check the availability of products in stock
      const productsInStock = offer.products.filter(
        (product) => product.stock > 0
      );
      if (productsInStock.length === offer.products.length) {
        allProductsInStockCount++;
      } else if (productsInStock.length > 0) {
        someProductsInStockCount++;
      } else {
        noProductsInStockCount++;
      }
    }

    // Display the summary
    console.log(
      "Number of offers with all products in stock:",
      allProductsInStockCount
    );
    console.log(
      "Number of offers with some products in stock:",
      someProductsInStockCount
    );
    console.log(
      "Number of offers with no products in stock:",
      noProductsInStockCount
    );

    // Prompt the user to press Enter to continue
    rl.question("Press Enter to continue to the main menu...", () => {
      // Return to the main menu
      displayMenu();
    });
  } catch (error) {
    console.error("Error viewing offers by stock availability:", error);
  }
}

// Function to add a new category
async function addNewCategory() {
  // Fetch existing categories
  const categories = await Category.find();
  console.log("Existing Categories:");
  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`);
  });

  rl.question(
    "Select a category from the list (enter number) or add a new one (type 'new'): ",
    async (response) => {
      if (response === "new") {
        rl.question("Enter category name: ", async (name) => {
          rl.question("Enter category description: ", async (description) => {
            try {
              const category = new Category({ name, description });
              await category.save();
              console.log("New category added successfully!");
              displayMenu();
            } catch (error) {
              console.error("Error adding category:", error);
              displayMenu();
            }
          });
        });
      } else if (
        parseInt(response) >= 1 &&
        parseInt(response) <= categories.length
      ) {
        console.log(
          `You selected category: ${categories[parseInt(response) - 1].name}`
        );
        displayMenu();
      } else {
        console.log("Invalid selection.");
        displayMenu();
      }
    }
  );
}

// Initialize the menu
displayMenu();
