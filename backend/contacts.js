const express = require("express");
const authMiddleware = require("./authMiddleware");
const nano = require("nano")(process.env.COUCHDB_URL);

const router = express.Router();
const contactsDb = nano.db.use("contacts");

// Create Contact
router.post("/", authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    await contactsDb.insert({ userId: req.user.id, name, email, phone });
    res.status(201).json({ message: "Contact Added!" });
  } catch (err) {
    res.status(500).json({ error: "Error Adding Contact" });
  }
});

// Get Contacts for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await contactsDb.find({ selector: { userId: req.user.id } });
    res.json(contacts.docs);
  } catch (err) {
    res.status(500).json({ error: "Error Fetching Contacts" });
  }
});

module.exports = router;
