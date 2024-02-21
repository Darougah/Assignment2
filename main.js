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
  contact: { type: String }, // Change 'description' to 'contact'
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

// Define Order schema and model
const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      details: String,
    },
  ],
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  status: { type: String, default: "Pending" },
});

const Order = mongoose.model("Order", orderSchema);

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
      createOrderForOffers();
      break;
    case "10":
      viewOrdersForShipment();
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

// Function to add a new category
async function addNewCategory() {
  try {
    // Prompt the user to enter category details
    const name = promptInput("Enter category name: ");
    const description = promptInput("Enter category description: ");

    // Create a new category instance
    const newCategory = new Category({ name, description });

    // Save the new category to the database
    await newCategory.save();

    console.log("New category added successfully!");
  } catch (error) {
    console.error("Error adding new category:", error);
  } finally {
    // Return to the main menu
    displayMenu();
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
        console.log("Price: $" + product.price.toFixed(2));
        console.log("Cost: $" + product.cost);
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

      // Fetch products associated with the selected supplier, populating the 'products' field
      const products = await Product.find({
        supplier: selectedSupplier._id,
      }).populate("category");

      // Display the products
      console.log(`Products supplied by "${selectedSupplier.name}":`);
      products.forEach((product) => {
        console.log("Name:", product.name);
        console.log("Price: $" + product.price.toFixed(2));
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

    // Fetch offers within the specified price range
    const offers = await Offer.find({
      price: { $gte: minPrice, $lte: maxPrice },
    }).populate({
      path: "products",
      populate: { path: "category supplier" },
    });

    // Display the offers
    console.log(`Offers within the price range $${minPrice} - $${maxPrice}:`);
    offers.forEach((offer) => {
      console.log("Price: $" + offer.price.toFixed(2));
      console.log("Included Products:");
      offer.products.forEach((product) => {
        console.log("  - Name:", product.name);
        console.log(
          "    Category:",
          product.category ? product.category.name : "N/A"
        );
        console.log(
          "    Supplier:",
          product.supplier ? product.supplier.name : "N/A"
        );
      });
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
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "products.supplier",
            foreignField: "_id",
            as: "products.supplier",
          },
        },
        {
          $group: {
            _id: "$_id",
            price: { $first: "$price" },
            products: { $push: "$products" },
          },
        },
      ]);

      // Display the offers
      console.log(
        `Offers containing products from category "${selectedCategory.name}":`
      );
      offers.forEach((offer) => {
        console.log("Price: $" + offer.price.toFixed(2));
        console.log("Included Products:");
        offer.products.forEach((product) => {
          console.log("  - Name:", product.name);
          console.log("    Category:", selectedCategory.name);
          console.log(
            "    Supplier:",
            product.supplier.length > 0 ? product.supplier[0].name : "N/A"
          );
        });
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
    console.error("Error viewing offers by category:", error);
  }
}
// Function to view the number of offers based on the availability of their products in stock
async function viewOffersByStockAvailability() {
  try {
    // Fetch offers with their associated products
    const offers = await Offer.find().populate({
      path: "products",
      populate: { path: "category supplier" },
    });

    // Initialize variables to track different offer availability categories
    let allProductsInStock = 0;
    let someProductsInStock = 0;
    let noProductsInStock = 0;

    // Display the offers along with their products
    console.log("Offers with associated products:");
    offers.forEach((offer) => {
      console.log(`Price: $${offer.price.toFixed(2)}`);
      console.log("Included Products:");
      offer.products.forEach((product) => {
        console.log("  - Name:", product.name);
        console.log(
          "    Category:",
          product.category ? product.category.name : "N/A"
        );
        console.log(
          "    Supplier:",
          product.supplier ? product.supplier.name : "N/A"
        );
      });
      console.log("---------------------------");

      // Check the availability of products in the offer
      const availableProducts = offer.products.filter(
        (product) => product.stock > 0
      );
      if (availableProducts.length === offer.products.length) {
        allProductsInStock++;
      } else if (availableProducts.length > 0) {
        someProductsInStock++;
      } else {
        noProductsInStock++;
      }
    });

    // Display the summary
    console.log("Summary of offer availability based on product stock:");
    console.log("------------------------------------------------------");
    console.log(`Offers with all products in stock: ${allProductsInStock}`);
    console.log(`Offers with some products in stock: ${someProductsInStock}`);
    console.log(`Offers with no products in stock: ${noProductsInStock}`);
    console.log("------------------------------------------------------");

    // Prompt the user to press Enter to continue
    promptInput("Press Enter to continue to the main menu...");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error("Error viewing offers by stock availability:", error);
  }
}

// Function to create an order for products
async function createOrderForProducts() {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Display the products to the user
    console.log("Available Products:");
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Stock: ${product.stock}`);
    });

    // Ask the user to select products for the order
    const selectedProductIndices = promptInput(
      "Select products for the order (enter indices separated by comma): "
    )
      .split(",")
      .map((index) => parseInt(index.trim()) - 1);

    // Validate the selected product indices
    if (
      selectedProductIndices.some(
        (index) => isNaN(index) || index < 0 || index >= products.length
      )
    ) {
      console.log("Invalid selection.");
      displayMenu();
      return;
    }

    // Create the order with the selected products
    const order = new Order({
      products: selectedProductIndices.map((index) => ({
        product: products[index]._id,
        quantity: parseInt(
          promptInput(`Enter quantity for ${products[index].name}: `)
        ),
        details: promptInput(`Enter any details for ${products[index].name}: `),
        name: products[index].name,  // Corrected: Access name property from each product
        price: products[index].price,  // Corrected: Access price property from each product
      })),
      status: "Pending",
    });

    await order.save();
    console.log("Order created successfully:");
  } catch (error) {
    console.error("Error creating order for products:", error);
  }

  // Prompt the user to press Enter to continue
  promptInput("Press Enter to continue to the main menu...");
  // Return to the main menu
  displayMenu();
}

async function createOrderForOffers() {
  try {
    // Fetch all offers from the database, populating the 'products' field
    const offers = await Offer.find().populate("products");

    // Display the offers to the user
    console.log("Available Offers:");
    offers.forEach((offer, index) => {
      console.log(`${index + 1}. Offer ID: ${offer._id}`);
      console.log("   Price:", offer.price);
      console.log("   Products:");
      offer.products.forEach((product) => {
        console.log("     -", product.name);
      });
    });

  
    // Ask the user to select an offer
    const selectedOfferIndex = parseInt(
      promptInput("Select an offer for the order (enter index): ")
    );

    // Validate the selected offer index
    if (
      isNaN(selectedOfferIndex) ||
      selectedOfferIndex < 1 ||
      selectedOfferIndex > offers.length
    ) {
      console.log("Invalid selection.");
      displayMenu();
      return;
    }

    // Create the order with the selected offer
    const selectedOffer = offers[selectedOfferIndex - 1];
    const order = new Order({
      products: selectedOffer.products.map((product) => ({
        product: product._id,
        quantity: 1,
        details: "",
      })),
      offer: selectedOffer._id,
    });

    await order.save();
    console.log("Order created successfully:", order);
  } catch (error) {
    console.error("Error creating order for offers:", error);
  }

  // Prompt the user to press Enter to continue
  promptInput("Press Enter to continue to the main menu...");
  // Return to the main menu
  displayMenu();
}
async function shipOrder(orderId) {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found.");
      return;
    }

    if (order.status === "Shipped") {
      console.log("Order is already shipped.");
      return;
    }

    // Confirm the shipment
    const confirmation = promptInput(`Do you wish to ship order ${orderId}? (yes/no): `);

    if (confirmation.toLowerCase() === "yes") {
      order.status = "Shipped";
      await order.save();

      // Update product stock for each product in the order
      for (const orderProduct of order.products) {
        const productId = orderProduct.product._id;
        const product = await Product.findById(productId);
    
        // Subtract the quantity of the product in the order from the database
        if (product) {
            product.stock -= orderProduct.quantity;
            await product.save();
        }
    }
      console.log(`Order ${orderId} has been shipped.`);
    } else {
      console.log("Shipment canceled.");
    }
  } catch (error) {
    console.error("Error shipping order:", error);
  }
}


async function viewOrdersForShipment() {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();

    // Display the orders with sequential numbers to the user
    console.log("Orders available for shipment:");
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id} - Status: ${order.status}`);
    });

    // Ask the user to select an order for shipment
    const selectedOrderIndex = parseInt(promptInput("Select an order for shipment (enter number): ")) - 1;

    // Validate the selected order index
    if (isNaN(selectedOrderIndex) || selectedOrderIndex < 0 || selectedOrderIndex >= orders.length) {
      console.log("Invalid order selection.");
      return;
    }

    // Get the selected order by its index
    const selectedOrder = orders[selectedOrderIndex];

    // Call the shipOrder function to change the status to "Shipped"
    await shipOrder(selectedOrder._id);
  } catch (error) {
    console.error("Error viewing orders for shipment:", error);
  }

  // Prompt the user to press Enter to continue
  promptInput("Press Enter to continue to the main menu...");
  // Return to the main menu
  displayMenu();
}


// Function to add a new supplier
async function addNewSupplier() {
  try {
    // Prompt the user to enter supplier details
    const name = promptInput("Enter supplier name: ");
    const description = promptInput("Enter supplier description: ");

    // Create a new supplier instance
    const newSupplier = new Supplier({ name, description });

    // Save the new supplier to the database
    await newSupplier.save();

    console.log("New supplier added successfully!");
  } catch (error) {
    console.error("Error adding new supplier:", error);
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

    // Display the suppliers to the user
    console.log("Suppliers:");
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name}`);
      console.log("Contact:", supplier.contact);
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

// Initial function call to start the program
displayMenu();
