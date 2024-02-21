import mongoose from "mongoose";

// Define Supplier schema and model
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
});
const Supplier = mongoose.model("Supplier", supplierSchema);

// Define Category schema and model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
});
const Category = mongoose.model("Category", categorySchema);

// Define Product schema and model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
});
const Product = mongoose.model("Product", productSchema);

// Define Offer schema and model
const offerSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
});
const Offer = mongoose.model("Offer", offerSchema);

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

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/product_management_system");

// Sample category data
const categoriesData = [
  { name: "Electronics", description: "Electronic gadgets and devices" },
  { name: "Clothing", description: "Fashionable clothing and accessories" },
  {
    name: "Home Appliances",
    description: "Home appliances and kitchen equipment",
  },
  {
    name: "Beauty & Personal Care",
    description: "Beauty and personal care products",
  },
  { name: "Sports & Outdoors", description: "Sports and outdoor equipment" },
];

// Insert categories data
const insertedCategories = await Category.insertMany(categoriesData);

// Sample supplier data
const suppliersData = [
  {
    name: "Electronics Supplier Inc.",
    contact: "John Doe (john@electronicsupplier.com)",
  },
  {
    name: "Fashion Supplier Co.",
    contact: "Jane Smith (jane@fashionsupplier.com)",
  },
  {
    name: "Home Appliance Supplier Ltd.",
    contact: "Michael Johnson (michael@homeappliancesupplier.com)",
  },
];

// Insert suppliers data
const insertedSuppliers = await Supplier.insertMany(suppliersData);

// Sample product data
const productsData = [
  {
    name: "Laptop",
    category: insertedCategories.find((cat) => cat.name === "Electronics")._id,
    price: 1000,
    cost: 800,
    stock: 50,
    supplier: insertedSuppliers[0]._id,
  },
  {
    name: "Smartphone",
    category: insertedCategories.find((cat) => cat.name === "Electronics")._id,
    price: 800,
    cost: 600,
    stock: 40,
    supplier: insertedSuppliers[0]._id,
  },
  {
    name: "T-shirt",
    category: insertedCategories.find((cat) => cat.name === "Clothing")._id,
    price: 20,
    cost: 10,
    stock: 100,
    supplier: insertedSuppliers[1]._id,
  },
  {
    name: "Refrigerator",
    category: insertedCategories.find((cat) => cat.name === "Home Appliances")
      ._id,
    price: 1200,
    cost: 1000,
    stock: 30,
    supplier: insertedSuppliers[2]._id,
  },
  {
    name: "Shampoo",
    category: insertedCategories.find(
      (cat) => cat.name === "Beauty & Personal Care"
    )._id,
    price: 10,
    cost: 5,
    stock: 80,
    supplier: insertedSuppliers[1]._id,
  },
  {
    name: "Soccer Ball",
    category: insertedCategories.find((cat) => cat.name === "Sports & Outdoors")
      ._id,
    price: 30,
    cost: 20,
    stock: 60,
    supplier: insertedSuppliers[2]._id,
  },
];

// Insert products data
const insertedProducts = await Product.insertMany(productsData);

// Sample offer data
const offersData = [
  {
    products: [insertedProducts[0]._id, insertedProducts[1]._id],
    price: 1800,
    active: true,
  },
  {
    products: [insertedProducts[2]._id, insertedProducts[4]._id],
    price: 30,
    active: true,
  },
  {
    products: [
      insertedProducts[3]._id,
      insertedProducts[1]._id,
      insertedProducts[5]._id,
    ],
    price: 1830,
    active: false,
  },
];

// Insert offers data
const insertedOffers = await Offer.insertMany(offersData);

// Sample sales order data
const OrdersData = [
  {
    products: [
      {
        product: insertedProducts[0]._id,
        name: "Laptop", 
        price: 1000,
        cost: 800,
        quantity: 1,
        details: "Label 2442", 
      },
    ],
    status: "pending",
    totalCost: 1000,
    totalNetCost: 800,
  },
];

// Insert sales orders data
await Order.insertMany(OrdersData);

// Disconnect from MongoDB
await mongoose.disconnect();
