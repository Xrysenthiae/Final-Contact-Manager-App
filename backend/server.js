require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Backend is Running!");
});

const contactRoutes = require("./contacts");
app.use("/api/contacts", contactRoutes);

const authRoutes = require("./auth");
app.use("/api", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
