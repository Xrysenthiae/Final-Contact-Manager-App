const express = require("express");
const authMiddleware = require("./authMiddleware");

const router = express.Router();
const { contactsDb } = require("./couchdb");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

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
    const contacts = await contactsDb.find({ selector: { userId: req.user.id } });

    if (!contacts.docs.length) {
        return res.status(200).json({ data: [], message: "No Contacts Found" });
      }
  
      res.status(200).json({ data: contacts.docs });
    } catch (err) {
      res.status(500).json({ error: "Error Retrieving Contacts" });
    }
  });

router.put("/:id", authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      const contact = await contactsDb.get(id);
      if (!contact || contact.userId !== req.user.id) {
        return res.status(403).json({ error: "Access Denied" });
      }

      const updatedContact = {
        ...contact,
        name: name || contact.name,
        email: email || contact.email,
        phone: phone || contact.phone,
      };
  
      await contactsDb.insert(updatedContact);

      res.json({ message: "Contact Updated Successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Error Updating Contact" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await contactsDb.get(id);
    if (!contact || contact.userId !== req.user.id) {
        return res.status(403).json({ error: "Access Denied" });
      }

      await contactsDb.destroy(contact._id, contact._rev);

    res.json({ message: "Contact Deleted Successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Error Deleting Contact" });
  }
});

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    const results = await contactsDb.find({
        selector: {
          userId: req.user.id,
          $or: [
            { name: { $regex: query } },
            { email: { $regex: query } },
            { phone: { $regex: query } },
          ],
        },
      });

    if (!results.docs.length) {
      return res.status(200).json({ data: [], message: "No Matching Contacts Found" });
    }

    res.json(results.docs);
  } catch (err) {
    res.status(500).json({ error: "Error Searching Contacts" });
  }
});

module.exports = router;
