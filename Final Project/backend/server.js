const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/Product");

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ UPDATE WITH YOUR MONGODB URL
mongoose.connect("mongodb+srv://jd2962_db_user:1xhhPzfTTm28kSEM@itc504class.s2vb8s2.mongodb.net/?appName=ITC504Class")
    .then(() => console.log("MongoDB ITC504Class Cluster Connected"))
    .catch(err => console.log(err));

// GET all products
app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// ADD product
app.post("/products", async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true });
});

// UPDATE product
app.put("/products/:id", async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));
