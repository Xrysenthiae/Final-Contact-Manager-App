const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./authMiddleware"); 

const router = express.Router();
const { usersDb } = require("./couchdb");

require("dotenv").config();

router.post("/register", async (req, res) => {
  const { username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Required: Username and Password" });
  }

  try {
    
    const existingUser = await usersDb.find({ selector: { username: username } });
    if (existingUser.docs.length > 0) {
      return res.status(400).json({ error: "Username Already Taken" });
    }

    const adminCheck = await usersDb.find({ selector: { role: "admin" } });
    if (adminCheck.docs.length > 0) {
      const newUser = {
        username,
        password: await bcrypt.hash(password, 10),
        role: "user",  
      };

      await usersDb.insert(newUser);

      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: `User Registered Successfully as ${newUser.role}`,
        token: token,
      });
    }
    console.log("Received Password:", password);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      username,
      password: hashedPassword,
      role: "admin",  
    };

    await usersDb.insert(newAdmin);

    const token = jwt.sign(
      { id: newAdmin._id, role: newAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: `User Registered Successfully as ${newAdmin.role}`,
      token: token,
    });
  } catch (err) {
    console.error("Error Registering User:", err);
    res.status(500).json({ error: "Error Registering User", details: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Attempt:", username, password);

  if (!username || !password) {
    return res.status(400).json({ error: "Required: Username and Password" });
  }

  try {
    const users = await usersDb.find({ selector: { username } });

    if (users.docs.length === 0) {
      console.log("User Not Found in DB");
      return res.status(404).json({ error: "User Does Not Exist" });
    }

    const user = users.docs[0];
    console.log("Stored Hash:", user.password);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login Error", details: err.message });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
  }

  try {
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
    const user = await usersDb.get(userId).catch(err => {
      console.error("User Fetch Error:", err.message);
      return null;
    });

    if (!user) {
        return res.status(404).json({ error: "User Not Found" });
    }

    console.log("User Found:", user);

    const deleteResponse = await usersDb.destroy(user._id, user._rev).catch(err => {
      console.error("Error Destroying User:", err.message);
      throw err;
    });
    
    console.log("Delete Response:", deleteResponse);

    res.json({ message: "User Deleted Successfully!" });
  } catch (error) {
    console.error("Error Deleting User:", error.message);
    res.status(500).json({ error: "Error Deleting User", details: error.message });
  }
});

module.exports = router;
