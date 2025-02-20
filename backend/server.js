require("dotenv").config();
const express = require("express");
const cors = require("cors");

const COUCHDB_URL = process.env.COUCHDB_URL || "http://eileen:1234567@127.0.0.1:5984";

const nano = require("nano")(COUCHDB_URL);
const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:4200",  
  "http://frontend:4200"    
];

app.use(cors({ origin: allowedOrigins }));

const contactRoutes = require("./contacts");
app.use("/api/contacts", contactRoutes);

const authRoutes = require("./auth");
app.use("/api", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
  console.log(`Connected to CouchDB at ${COUCHDB_URL}`);
});
