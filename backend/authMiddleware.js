const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid Token" });
  }
};

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; 

  if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
  } catch (err) {
      console.error("JWT Error:", err.message);
      return res.status(403).json({ error: "Forbidden: Invalid Token" });
  }
}

module.exports = authenticateToken;