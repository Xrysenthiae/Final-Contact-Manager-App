const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nano = require("nano")(process.env.COUCHDB_URL);

const router = express.Router();
const usersDb = nano.db.use("users");

// Register User
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await usersDb.insert({ username, password: hashedPassword, role });
    res.status(201).json({ message: "User Registered Successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error Registering User" });
  }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const users = await usersDb.find({ selector: { username } });
  
      if (users.docs.length === 0) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }
  
      const user = users.docs[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: "Login Error" });
    }
  });

router.get("/users", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access Denied" });
  }

  try {
    const usersDb = nano.db.use("users");
    const users = await usersDb.find({ selector: {} }); 
    res.json(users.docs);
  } catch (err) {
    res.status(500).json({ error: "Error Retrieving Users" });
  }
});


module.exports = router;
