require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nano = require("nano")(process.env.COUCHDB_URL);
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

const contactRoutes = require("./contacts");
app.use("/api/contacts", contactRoutes);

const authRoutes = require("./auth");
app.use("/api", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
