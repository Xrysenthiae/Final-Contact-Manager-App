const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nano = require("nano")(process.env.COUCHDB_URL);
const authenticateToken = require("./authMiddleware"); 

const router = express.Router();
const usersDb = nano.db.use("users");

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

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login Error" });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
  }

  try {
      const usersDb = nano.db.use("users");
      const users = await usersDb.find({ selector: {} });
      res.json(users.docs);
  } catch (err) {
      console.error("Error Retrieving Users:", err);
      res.status(500).json({ error: "Error Retrieving Users" });
  }
});

router.put("/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, role, password } = req.body;

  if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
  }

  try {
      const usersDb = nano.db.use("users");

      const userDoc = await usersDb.get(id);

      if (username) userDoc.username = username;
      if (role) userDoc.role = role;
      if (password) {
          const bcrypt = require("bcrypt");
          userDoc.password = await bcrypt.hash(password, 10);
      }

      const response = await usersDb.insert(userDoc);
      res.json({ message: "User Updated Successfully", response });
  } catch (err) {
      res.status(500).json({ error: "Error Updating User", details: err.message });
  }
});

router.delete("/users/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
  }

  try {
      const userId = req.params.id;
      const userDb = nano.db.use("users");

      const user = await userDb.get(userId);
      if (!user) {
          return res.status(404).json({ error: "User Not Found" });
      }

      await userDb.destroy(userId, user._rev);

      res.json({ message: "User Deleted Successfully!" });
  } catch (error) {
      res.status(500).json({ error: "Error Deleting User" });
  }
});

module.exports = router;
