import mongoose from "mongoose";
import prompt from "prompt-sync";

// Establish MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/product_management_system");

// Create prompt
const promptInput = prompt();

// Define Category schema and model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Category = mongoose.model("Category", categorySchema);

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String }, // Ensure contact field is defined
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
  name: String,
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
  totalCost: { type: Number, default: 0 },
  totalNetCost: { type: Number, default: 0 },
});

const Offer = mongoose.model("Offer", offerSchema);

// Define Order schema and model
const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      cost: Number,
      quantity: Number,
      details: String,
    },
  ],
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now },
  totalCost: { type: Number, default: 0 },
  totalNetCost: { type: Number, default: 0 },
});

const Order = mongoose.model("Order", orderSchema);

// Function to display menu and handle user input
function displayMenu() {
  console.log("\x1b[36m\n=== Welcome! ===\n\x1b[0m");

  // Menu options
  console.log("\x1b[33mMenu:\x1b[0m");
  console.log("\x1b[33m1.\x1b[0m Add new category");
  console.log("\x1b[33m2.\x1b[0m Add new product");
  console.log("\x1b[33m3.\x1b[0m View products by category");
  console.log("\x1b[33m4.\x1b[0m View products by supplier");
  console.log("\x1b[33m5.\x1b[0m View all offers within a price range");
  console.log(
    "\x1b[33m6.\x1b[0m View all offers that contain a product from a specific category"
  );
  console.log(
    "\x1b[33m7.\x1b[0m View the number of offers based on the availability of their products in stock"
  );
  console.log("\x1b[33m8.\x1b[0m Create order for products");
  console.log("\x1b[33m9.\x1b[0m Create order for offers");
  console.log("\x1b[33m10.\x1b[0m Ship orders");
  console.log("\x1b[33m11.\x1b[0m Add a new supplier");
  console.log("\x1b[33m12.\x1b[0m View suppliers");
  console.log("\x1b[33m13.\x1b[0m View all sales orders");
  console.log("\x1b[33m14.\x1b[0m View sum of all profits");
  console.log("\x1b[33m0.\x1b[0m Exit\n");

  const option = promptInput("\x1b[35mSelect an option: \x1b[0m");

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
      viewAllSalesOrders();
      break;
    case "14":
      viewProfitFromSales();
      break;
    case "0":
      // Exit the program
      console.log("Exiting...");
      mongoose.connection.close();
      break;
    default:
      console.log(
        "\x1b[31mInvalid option. Please select a valid option.\x1b[0m"
      );
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
    console.log("\x1b[32mProduct created successfully:\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError creating product:", error, "\x1b[0m");
    throw error; // Rethrow the error for handling in the calling function
  }
}

async function addNewProduct() {
  try {
    // Display prompt for product details
    console.log("\x1b[36mAdding a new product:\x1b[0m");

    // Display existing suppliers
    const suppliers = await Supplier.find();
    console.log("\x1b[36mExisting Suppliers:\x1b[0m");
    suppliers.forEach((supplier, index) => {
      console.log(`\x1b[33m${index + 1}.\x1b[0m ${supplier.name}`);
    });

    // Ask user to select a supplier or add a new one
    const supplierOption = promptInput(
      "\x1b[31mSelect a supplier from the list (enter number) or add a new one (type 'new'):\x1b[0m "
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
      console.log("\x1b[36mExisting Categories:\x1b[0m");
      categories.forEach((category, index) => {
        console.log(`\x1b[33m${index + 1}\x1b[0m. ${category.name}`);
      });

      // Ask user to select a category or add a new one
      const categoryOption = promptInput(
        "\x1b[31mSelect a category from the list (enter number) or add a new one (type 'new'):\x1b[0m "
      );

      if (categoryOption === "new") {
        await addNewCategoryForProduct(selectedSupplier);
      } else if (
        parseInt(categoryOption) >= 1 &&
        parseInt(categoryOption) <= categories.length
      ) {
        const selectedCategory = categories[parseInt(categoryOption) - 1];

        // Ask for product details
        const name = promptInput("\x1b[34mEnter product name:\x1b[0m ");
        const price = parseFloat(
          promptInput("\x1b[34mEnter product price:\x1b[0m ")
        );
        const cost = parseFloat(
          promptInput("\x1b[34mEnter product cost:\x1b[0m ")
        );
        const stock = parseInt(
          promptInput("\x1b[34mEnter product stock:\x1b[0m ")
        );

        // Create the new product
        await createProduct(
          name,
          selectedCategory._id,
          price,
          cost,
          stock,
          selectedSupplier._id
        );
        console.log("\x1b[32mProduct added successfully!\x1b[0m");
      } else {
        console.log("\x1b[31mInvalid selection.\x1b[0m");
      }
    } else {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
    }
  } catch (error) {
    console.error("\x1b[31mError adding product:", error, "\x1b[0m");
  } finally {
    // Return to the main menu
    displayMenu();
  }
}

async function addNewCategoryForProduct(selectedSupplier) {
  try {
    // Prompt the user to enter category details
    const name = promptInput("\x1b[34mEnter category name:\x1b[0m ");
    const description = promptInput(
      "\x1b[34mEnter category description:\x1b[0m "
    );

    // Create a new category instance
    const newCategory = new Category({ name, description });

    // Save the new category to the database
    await newCategory.save();

    console.log("\x1b[32mNew category added successfully!\x1b[0m");

    // Now, proceed to add the product with the newly created category
    const price = parseFloat(
      promptInput("\x1b[34mEnter product price:\x1b[0m ")
    );
    const cost = parseFloat(promptInput("\x1b[34mEnter product cost:\x1b[0m "));
    const stock = parseInt(promptInput("\x1b[34mEnter product stock:\x1b[0m "));

    // Create the new product with the selected category and supplier
    await createProduct(
      name, // Use the same name for the product as the category
      newCategory._id,
      price,
      cost,
      stock,
      selectedSupplier._id
    );
    console.log("\x1b[32mProduct added successfully!\x1b[0m");
  } catch (error) {
    console.error(
      "\x1b[31mError adding new category and product:",
      error,
      "\x1b[0m"
    );
  } finally {
    // Return to the main menu
    displayMenu();
  }
}

async function addNewSupplierForProduct() {
  console.log("\x1b[36mAdding a new supplier:\x1b[0m");

  const name = promptInput("\x1b[34mEnter supplier name:\x1b[0m ");
  const contact = promptInput("\x1b[34mEnter supplier contact:\x1b[0m ");
  const description = promptInput(
    "\x1b[34mEnter supplier description:\x1b[0m "
  );

  try {
    const supplier = new Supplier({ name, contact, description }); // Include contact in the Supplier creation
    await supplier.save();
    console.log("\x1b[32mNew supplier added successfully!\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError adding supplier:", error, "\x1b[0m");
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
    console.log("\x1b[36mCategories:\x1b[0m");
    categories.forEach((category, index) => {
      console.log(`\x1b[33m${index + 1}\x1b[0m. ${category.name}`);
    });

    // Ask the user to select a category
    const categoryOption = promptInput(
      "\x1b[31mSelect a category (enter number):\x1b[0m "
    );

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
      console.log(
        `\x1b[33mProducts in category "${selectedCategory.name}":\x1b[0m`
      );
      products.forEach((product) => {
        console.log("\x1b[36mName:\x1b[0m", product.name);
        console.log("\x1b[36mPrice:\x1b[0m $" + product.price.toFixed(2));
        console.log("\x1b[36mCost:\x1b[0m $" + product.cost);
        console.log("\x1b[36mStock:\x1b[0m", product.stock);
        console.log(
          "\x1b[36mSupplier:\x1b[0m",
          product.supplier ? product.supplier.name : "N/A"
        );
        console.log("---------------------------");
      });
    } else {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
    }

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing products by category:",
      error,
      "\x1b[0m"
    );
  }
}

// Function to view products by supplier
async function viewProductsBySupplier() {
  try {
    // Fetch all suppliers from the database
    const suppliers = await Supplier.find();

    // Display the suppliers to the user
    console.log("\x1b[36mSuppliers:\x1b[0m");
    suppliers.forEach((supplier, index) => {
      console.log(`\x1b[33m${index + 1}. \x1b[0m${supplier.name}`);
    });

    // Ask the user to select a supplier
    const supplierOption = promptInput(
      "\x1b[31mSelect a supplier (enter number):\x1b[0m "
    );

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
      console.log(
        `\x1b[33mProducts supplied by "${selectedSupplier.name}":\x1b[0m`
      );
      products.forEach((product) => {
        console.log("\x1b[36mName:\x1b[0m", product.name);
        console.log("\x1b[36mPrice:\x1b[0m $" + product.price.toFixed(2));
        console.log("\x1b[36mCost:\x1b[0m $" + product.cost);
        console.log("\x1b[36mStock:\x1b[0m", product.stock);
        console.log("\x1b[36m---------------------------\x1b[0m");
      });
    } else {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
    }

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing products by supplier:",
      error,
      "\x1b[0m"
    );
  }
}

async function viewOffersWithinPriceRange() {
  try {
    // Ask the user to input the price range
    const minPrice = parseFloat(
      promptInput("\x1b[36mEnter the minimum price:\x1b[0m ")
    );
    const maxPrice = parseFloat(
      promptInput("\x1b[36mEnter the maximum price:\x1b[0m ")
    );

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      console.log("\x1b[31mInvalid input. Please enter valid prices.\x1b[0m");
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
    console.log(
      `\x1b[33mOffers within the price range $${minPrice} - $${maxPrice}:\x1b[0m`
    );
    offers.forEach((offer) => {
      console.log("\x1b[36mPrice: $" + offer.price.toFixed(2) + "\x1b[0m");
      console.log("\x1b[36mIncluded Products:\x1b[0m");
      offer.products.forEach((product) => {
        console.log("  - Name:", product.name);
        console.log("    Price: $" + product.price.toFixed(2));
        console.log(
          "\x1b[36m    Category:\x1b[0m",
          product.category ? product.category.name : "N/A"
        );
        console.log(
          "\x1b[36m    Supplier:\x1b[0m",
          product.supplier ? product.supplier.name : "N/A"
        );
      });
      console.log("\x1b[36m---------------------------\x1b[0m");
    });

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing offers within the price range:",
      error,
      "\x1b[0m"
    );
  }
}

async function viewOffersByCategory() {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    // Display the categories to the user
    console.log("\x1b[36mCategories:\x1b[0m");
    categories.forEach((category, index) => {
      console.log(`\x1b[33m${index + 1}. \x1b[0m${category.name}`);
    });

    // Ask the user to select a category
    const categoryOption = promptInput(
      "\x1b[31mSelect a category (enter number):\x1b[0m "
    );

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
        '\x1b[33mOffers containing products from category "' +
          selectedCategory.name +
          '":\x1b[0m'
      );
      offers.forEach((offer) => {
        console.log("\x1b[36mPrice: $" + offer.price.toFixed(2) + "\x1b[0m");
        console.log("\x1b[36mIncluded Products:\x1b[0m");
        offer.products.forEach((product) => {
          console.log("  - Name:", product.name);
          console.log("    Price: $" + product.price.toFixed(2));
          console.log("    Category:", selectedCategory.name);
          console.log(
            "\x1b[36m    Supplier:\x1b[0m",
            product.supplier.length > 0 ? product.supplier[0].name : "N/A"
          );
        });
        console.log("\x1b[36m---------------------------\x1b[0m");
      });
    } else {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
    }

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing offers by category:",
      error,
      "\x1b[0m"
    );
  }
}

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
    console.log("\x1b[33mOffers with associated products:\x1b[0m");
    offers.forEach((offer) => {
      console.log(`\x1b[36mPrice: $${offer.price.toFixed(2)}\x1b[0m`);
      console.log("\x1b[36mIncluded Products:\x1b[0m");
      offer.products.forEach((product) => {
        console.log("  - Name:", product.name);
        console.log(
          "\x1b[36m    Category:\x1b[0m",
          product.category ? product.category.name : "N/A"
        );
        console.log(
          "\x1b[36m    Supplier:\x1b[0m",
          product.supplier ? product.supplier.name : "N/A"
        );
      });
      console.log("\x1b[36m---------------------------\x1b[0m");

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
    console.log(
      "\x1b[35mSummary of offer availability based on product stock:\x1b[0m"
    );
    console.log(
      "\x1b[36m------------------------------------------------------\x1b[0m"
    );
    console.log(
      `\x1b[33mOffers with all products in stock: ${allProductsInStock}\x1b[0m`
    );
    console.log(
      `\x1b[33mOffers with some products in stock: ${someProductsInStock}\x1b[0m`
    );
    console.log(
      `\x1b[33mOffers with no products in stock: ${noProductsInStock}\x1b[0m`
    );
    console.log(
      "\x1b[36m------------------------------------------------------\x1b[0m"
    );

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing offers by stock availability:",
      error,
      "\x1b[0m"
    );
  }
}

// Function to create an order for products
async function createOrderForProducts() {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Display the products to the user
    console.log("\x1b[36mAvailable Products:\x1b[0m");
    products.forEach((product, index) => {
      console.log(
        `\x1b[33m${index + 1}. \x1b[0m${product.name} - Stock: ${product.stock}`
      );
    });

    // Ask the user to select products for the order
    const selectedProductIndices = promptInput(
      "\x1b[90mSelect products for the order (enter indices separated by comma): \x1b[0m"
    )
      .split(",")
      .map((index) => parseInt(index.trim()) - 1);

    // Validate the selected product indices
    if (
      selectedProductIndices.some(
        (index) => isNaN(index) || index < 0 || index >= products.length
      )
    ) {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
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
        name: products[index].name, // Corrected: Access name property from each product
        price: products[index].price, // Corrected: Access price property from each product
        cost: products[index].cost, // Corrected: Access cost property from each product
      })),
      status: "Pending",
    });

    order.totalCost = order.products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );

    order.totalNetCost = order.products.reduce(
      (total, product) => total + product.quantity * product.cost,
      0
    );

    await order.save();
    console.log("\x1b[32mOrder created successfully:\x1b[0m");
  } catch (error) {
    console.error(
      "\x1b[31mError creating order for products:",
      error,
      "\x1b[0m"
    );
  }

  // Prompt the user to press Enter to continue
  promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
  // Return to the main menu
  displayMenu();
}

async function createOrderForOffers() {
  try {
    // Fetch all offers from the database, populating the 'products' field
    const offers = await Offer.find().populate("products");

    // Display the offers to the user
    console.log("\x1b[33mAvailable Offers:\x1b[0m");
    offers.forEach((offer, index) => {
      console.log(`\x1b[36m${index + 1}. Offer ID: ${offer._id}\x1b[0m`);
      console.log("\x1b[36m   Price:\x1b[0m", offer.price);
      console.log("\x1b[36m   Products:\x1b[0m");
      offer.products.forEach((product) => {
        console.log("\x1b[36m     -\x1b[0m", product.name);
      });
    });

    // Ask the user to select an offer
    const selectedOfferIndex = parseInt(
      promptInput("\x1b[33mSelect an offer for the order (enter index):\x1b[0m")
    );

    // Validate the selected offer index
    if (
      isNaN(selectedOfferIndex) ||
      selectedOfferIndex < 1 ||
      selectedOfferIndex > offers.length
    ) {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
      displayMenu();
      return;
    }

    // Create the order with the selected offer
    const selectedOffer = offers[selectedOfferIndex - 1];
    const order = new Order({
      products: selectedOffer.products.map((product) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        cost: product.cost,
        quantity: parseInt(
          promptInput(`Enter quantity for: ${product.name}: `)
        ),
        details: "",
      })),
      offer: selectedOffer._id,
    });

    order.totalCost = order.products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );

    order.totalNetCost = order.products.reduce(
      (total, product) => total + product.quantity * product.cost,
      0
    );

    await order.save();
    console.log("\x1b[32mOrder created successfully:\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError creating order for offers:", error, "\x1b[0m");
  }

  // Prompt the user to press Enter to continue
  promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
  // Return to the main menu
  displayMenu();
}
async function shipOrder(orderId) {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("\x1b[31mOrder not found.\x1b[0m");
      return;
    }

    if (order.status === "Shipped") {
      console.log("\x1b[32mOrder is already shipped.\x1b[0m");
      return;
    }

    // Confirm the shipment
    const confirmation = promptInput(
      "\x1b[35mDo you wish to ship order ${orderId}? (yes/no):\x1b[0m "
    );
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
      console.log("\x1b[32mOrder " + orderId + " has been shipped.\x1b[0m");
    } else {
      console.log("\x1b[31mShipment canceled.\x1b[0m");
    }
  } catch (error) {
    console.error("\x1b[31mError shipping order:", error, "\x1b[0m");
  }
}

async function viewOrdersForShipment() {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();

    // Display the orders with sequential numbers to the user
    console.log("\x1b[36mOrders available for shipment:\x1b[0m");
    orders.forEach((order, index) => {
      console.log(
        `\x1b[33m${index + 1}. Order ID: ${order._id} - Status: ${
          order.status
        }\x1b[0m`
      );
    });

    // Ask the user to select an order for shipment
    const selectedOrderIndex =
      parseInt(
        promptInput(
          "\x1b[33mSelect an order for shipment (enter number):\x1b[0m "
        )
      ) - 1;

    // Validate the selected order index
    if (
      isNaN(selectedOrderIndex) ||
      selectedOrderIndex < 0 ||
      selectedOrderIndex >= orders.length
    ) {
      console.log("\x1b[31mInvalid order selection.\x1b[0m");
      return;
    }

    // Get the selected order by its index
    const selectedOrder = orders[selectedOrderIndex];

    // Call the shipOrder function to change the status to "Shipped"
    await shipOrder(selectedOrder._id);
  } catch (error) {
    console.error(
      "\x1b[31mError viewing orders for shipment:",
      error,
      "\x1b[0m"
    );
  }

  // Prompt the user to press Enter to continue
  promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
  // Return to the main menu
  displayMenu();
}

// Function to add a new supplier
async function addNewSupplier() {
  try {
    // Prompt the user to enter supplier details
    const name = promptInput("\x1b[36mEnter supplier name:\x1b[0m ");
    const contact = promptInput("\x1b[36mEnter supplier contact:\x1b[0m "); // Prompt for contact
    const description = promptInput(
      "\x1b[36mEnter supplier description:\x1b[0m "
    );

    // Create a new supplier instance
    const newSupplier = new Supplier({ name, contact, description }); // Include contact

    // Save the new supplier to the database
    await newSupplier.save();

    console.log("\x1b[New supplier added successfully!:\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError adding new supplier:", error, "\x1b[0m");
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
    console.log("\x1b[36mSuppliers:\x1b[0m");
    suppliers.forEach((supplier, index) => {
      console.log(
        `\x1b[33m${index + 1}.\x1b[0m \x1b[36m${supplier.name}\x1b[0m`
      );
      console.log("\x1b[33mContact:\x1b[0m", supplier.contact);
      console.log("\x1b[36m---------------------------\x1b[0m");
    });
  } catch (error) {
    console.error("\x1b[31mError viewing suppliers:", error, "\x1b[0m");
  } finally {
    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  }
}

async function viewAllSalesOrders() {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();

    // Display the details of all sales orders
    console.log("\x1b[36mAll Sales Orders:\x1b[0m");
    let totalValue = 0;
    orders.forEach((order) => {
      console.log(`\x1b[33mOrder Number: ${order._id}\x1b[0m`);
      console.log(); // Blank row
      order.products.forEach((product, index) => {
        console.log(
          `  \x1b[36m${index + 1}. Product Name: ${product.name}\x1b[0m`
        );
        console.log(`     \x1b[36mQuantity: ${product.quantity}\x1b[0m`);
        console.log(
          `     \x1b[36mUnit Price: $${product.price.toFixed(2)}\x1b[0m`
        );
      });
      const formattedDate = order.date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      console.log(); // Blank row
      console.log(`\x1b[35mTotal Cost: $${order.totalCost.toFixed(2)}\x1b[0m`);
      console.log(); // Blank row
      console.log(`\x1b[33mOrder Date: ${formattedDate}\x1b[0m`);
      console.log(`\x1b[31mStatus: ${order.status}\x1b[0m`);
      console.log("---------------------------");
      totalValue += order.totalCost;
    });
    console.log(
      `All Sales Orders total value: \x1b[32m$${totalValue.toFixed(2)}\x1b[0m`
    );
  } catch (error) {
    console.error("\x1b[31mError viewing all sales orders:", error, "\x1b[0m");
  } finally {
    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  }
}

async function viewProfitFromSales() {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();
    let totalValue = 0;
    let totalNetValue = 0;
    // Display the details of all sales orders
    console.log("\x1b[36mAll Sales Orders:\x1b[0m");
    orders.forEach((order) => {
      console.log(`Order number: ${order._id}`);
      const formattedDate = order.date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      console.log(`\x1b[33mOrder Date: ${formattedDate}\x1b[0m`);
      console.log(`\x1b[31mStatus: ${order.status}\x1b[0m`);
      console.log(
        `\x1b[34mTotal cost value: \x1b[32m$${order.totalNetCost.toFixed(
          2
        )}\x1b[0m`
      );
      console.log(
        `\x1b[34mTotal order value: \x1b[32m$${order.totalCost.toFixed(
          2
        )}\x1b[0m`
      );
      console.log("---------------------------");
      totalValue += order.totalCost;
      totalNetValue += order.totalNetCost;
    });
    console.log(
      `\x1b[35mAll sales orders cost value: \x1b[32m$${totalNetValue.toFixed(
        2
      )}\x1b[0m`
    );
    console.log(
      `\x1b[35mAll sales orders total value: \x1b[32m$${totalValue.toFixed(
        2
      )}\x1b[0m`
    );
    console.log("---------------------------");

    const totalProfitMargin = totalValue - totalNetValue;
    console.log(
      `\x1b[35mTotal profit margin: \x1b[32m$${totalProfitMargin.toFixed(
        2
      )}\x1b[0m`
    );
    console.log("---------------------------");

    const offerOption = promptInput(
      'Press "y" to view offers by product or press Enter to continue: '
    );

    if (offerOption.toLowerCase() === "y") {
      // View offers by product
      await viewOffersByProduct();
    }
  } catch (error) {
    console.error("\x1b[31mError viewing all sales orders:", error, "\x1b[0m");
  } finally {
    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  }
}

async function viewOffersByProduct() {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Display the products to the user
    console.log("\x1b[36mProducts:\x1b[0m");
    products.forEach((product, index) => {
      console.log(`\x1b[33m${index + 1}. ${product.name}\x1b[0m`);
    });

    // Ask the user to select a product
    const productOption = promptInput(
      "\x1b[36mSelect a product (enter number): \x1b[0m"
    );

    // Check if the entered option is valid
    if (
      parseInt(productOption) >= 1 &&
      parseInt(productOption) <= products.length
    ) {
      const selectedProduct = products[parseInt(productOption) - 1];

      // Use aggregation to find offers containing the selected product
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
            "products._id": selectedProduct._id,
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
            totalNetPrice: { $sum: "$products.cost" }, // Calculate total net price
          },
        },
      ]);

      if (offers.length > 0) {
        // Display the offers containing the selected product
        console.log(
          '\x1b[33mOffers containing product "' +
            selectedProduct.name +
            '":\x1b[0m'
        );
        offers.forEach((offer) => {
          console.log("\x1b[35mOffer includes:\x1b[0m");
          console.log(); // Blank row
          offer.products.forEach((product) => {
            console.log("\x1b[36m  - Name:\x1b[0m", product.name);
            console.log("\x1b[36m  - Cost:\x1b[0m", product.cost);
            console.log("\x1b[36m  - Sales price:\x1b[0m", product.price);
            console.log(); // Blank row
          });
          console.log("\x1b[33mOffer ID:\x1b[0m", offer._id);
          console.log("\x1b[36m---------------------------\x1b[0m");
          console.log(
            "\x1b[36mTotal Net Price:\x1b[0m",
            "$" + offer.totalNetPrice.toFixed(2)
          );
          console.log("\x1b[36mPrice:\x1b[0m", "$" + offer.price.toFixed(2));
        });
      } else {
        console.log(
          `Product "${selectedProduct.name}" is not in any offerings.`
        );
      }
    } else {
      console.log("\x1b[31mInvalid selection.\x1b[0m");
    }

    // Prompt the user to press Enter to continue
    promptInput("\x1b[90mPress Enter to continue to the main menu...\x1b[0m");
    // Return to the main menu
    displayMenu();
  } catch (error) {
    console.error(
      "\x1b[31mError viewing offers by products:",
      error,
      "\x1b[0m"
    );
  }
}

// Initial function call to start the program
displayMenu();
