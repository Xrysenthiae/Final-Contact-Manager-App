const express = require("express");
const authMiddleware = require("./authMiddleware");
const nano = require("nano")(process.env.COUCHDB_URL);

const router = express.Router();
const contactsDb = nano.db.use("contacts");

router.post("/", authMiddleware, async (req, res) => {
  try {
      const { name, email, phone } = req.body;
      const contactsDb = nano.db.use("contacts");

      const newContact = {
          userId: req.user.id,
          name,
          email,
          phone
      };

      await contactsDb.insert(newContact);

      res.status(201).json({ message: "Contact Added Successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Error Adding Contact" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
      const contactsDb = nano.db.use("contacts");
      const userId = req.user.id;

      const contacts = await contactsDb.find({
          selector: { userId }
      });

      res.json(contacts.docs);
  } catch (err) {
      res.status(500).json({ error: "Error Retrieving Contacts" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      const contactsDb = nano.db.use("contacts");

      const contact = await contactsDb.get(id);
      if (contact.userId !== req.user.id) {
          return res.status(403).json({ error: "Access Denied" });
      }

      contact.name = name || contact.name;
      contact.email = email || contact.email;
      contact.phone = phone || contact.phone;

      await contactsDb.insert(contact);

      res.json({ message: "Contact Updated Successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Error Updating Contact" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const contactsDb = nano.db.use("contacts");

      const contact = await contactsDb.get(id);
      if (contact.userId !== req.user.id) {
          return res.status(403).json({ error: "Access Denied" });
      }

      await contactsDb.destroy(id, contact._rev);

      res.json({ message: "Contact Deleted Successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Error Deleting Contact" });
  }
});

router.get("/search", authMiddleware, async (req, res) => {
  try {
      const { query } = req.query;
      const contactsDb = nano.db.use("contacts");

      const results = await contactsDb.find({
          selector: {
              userId: req.user.id,
              $or: [
                  { name: { $regex: query } },
                  { email: { $regex: query } },
                  { phone: { $regex: query } }
              ]
          }
      });

      res.json(results.docs);
  } catch (err) {
      res.status(500).json({ error: "Error Searching Contacts" });
  }
});

module.exports = router;
