const express = require("express");

const app = express();
const PORT = 3000;

// Allow Express to read JSON request bodies
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Daraja Webhook Server is running!");
});

// Daraja callback endpoint
app.post("/webhook", (req, res) => {
  console.log("Webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});