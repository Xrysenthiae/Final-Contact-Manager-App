const express = require("express");
const path = require("path");

const app = express();

const frontendPath = path.join(__dirname, "dist/frontend");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Frontend is running on port ${PORT}`);
});
