const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const SHARED_SECRET = "my-learning-secret";


// Allow Express to read JSON request bodies
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Test route
app.get("/", (req, res) => {
  res.send("Daraja Webhook Server is running!");
});

// Daraja callback endpoint
app.post("/webhook", (req, res) => {
  const receivedSignature = req.headers["x-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (!receivedSignature || receivedSignature !== expectedSignature) {
    return res.status(401).json({
      ResultCode: 1,
      ResultDesc: "Invalid signature"
    });
  }

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