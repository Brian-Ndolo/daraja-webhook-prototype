# Daraja Webhook Prototype

A Node.js and Express mini-prototype demonstrating ** webhook signature verification**.

The project simulates how a payment webhook can verify that an incoming request is authentic and that its data has not been modified.

## Features

* Express webhook server
* JSON request-body handling
* HMAC-SHA256 signature generation and verification
* `x-signature` header validation
* Rejects requests with:

  * No signature
  * Invalid signature
  * Modified/tampered request data
* Accepts requests with a valid signature

## Technologies Used

* Node.js
* Express
* Node.js `crypto` module
* Git/GitHub
* curl/Git Bash for testing

## Project Structure

```text
daraja-webhook-prototype/
├── src/
│   └── server.js
├── docs/
│   └── learning-journal.md
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Brian-Ndolo/daraja-webhook-prototype.git
```

### 2. Enter the project

```bash
cd daraja-webhook-prototype
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the server

```bash
node src/server.js
```

The server runs on:

```text
http://localhost:3000
```

## Test the Server

Open another terminal and run:

```bash
curl http://localhost:3000/
```

Expected response:

```text
Daraja Webhook Server is running!
```

## Test the Webhook

### Test 1 — Request without a signature

```bash
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"amount":100,"phone":"0712345678","transactionId":"TX12345"}'
```

Expected:

```json
{
  "ResultCode": 1,
  "ResultDesc": "Invalid signature"
}
```

### Test 2 — Request with a fake signature

```bash
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -H "x-signature: fake-signature" -d '{"amount":100,"phone":"0712345678","transactionId":"TX12345"}'
```

Expected:

```json
{
  "ResultCode": 1,
  "ResultDesc": "Invalid signature"
}
```

### Test 3 — Generate a valid HMAC signature

The prototype currently uses the development secret:

```text
my-learning-secret
```

Generate a signature for the test body:

```bash
node -e 'const crypto=require("crypto"); const body="{\"amount\":100,\"phone\":\"0712345678\",\"transactionId\":\"TX12345\"}"; console.log(crypto.createHmac("sha256","my-learning-secret").update(body).digest("hex"));'
```

The current test signature is:

```text
2a55450689564bae2b5b02c4547f3726c475072f48c7f9ec1a5484e48dca301c
```

### Test 4 — Send a valid signed request

```bash
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -H "x-signature: 2a55450689564bae2b5b02c4547f3726c475072f48c7f9ec1a5484e48dca301c" -d '{"amount":100,"phone":"0712345678","transactionId":"TX12345"}'
```

Expected:

```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

## Tampering Test

To demonstrate that the webhook detects modified data, keep the original signature but change the amount from `100` to `500`.

```bash
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -H "x-signature: 2a55450689564bae2b5b02c4547f3726c475072f48c7f9ec1a5484e48dca301c" -d '{"amount":500,"phone":"0712345678","transactionId":"TX12345"}'
```

Expected:

```json
{
  "ResultCode": 1,
  "ResultDesc": "Invalid signature"
}
```

This demonstrates that changing the request data causes HMAC verification to fail.

## Test Results

| Test                      | Expected Result |
| ------------------------- | --------------- |
| Server health check       | Passed          |
| Request without signature | Rejected        |
| Fake signature            | Rejected        |
| Valid HMAC signature      | Accepted        |
| Modified/tampered data    | Rejected        |

## How HMAC Verification Works

The webhook uses a shared secret to create an HMAC-SHA256 signature from the raw request body.

```text
Incoming request
       │
       ▼
Read raw request body
       │
       ▼
Generate HMAC-SHA256
using shared secret
       │
       ▼
Compare with x-signature
       │
   ┌───┴───┐
   │       │
 Match   No Match
   │       │
   ▼       ▼
Accept   Reject
```

This helps verify that the request was signed with the expected secret and that the request body has not been changed.

## Current Status

**Working — local prototype**

The HMAC webhook verification has been successfully tested with:

* Valid signatures
* Invalid signatures
* Missing signatures
* Modified request data

## Future Improvements

* Connect to the Daraja Sandbox
* Test real Daraja callbacks
* Store secrets in environment variables
* Add automated tests
* Improve error handling
* Use constant-time signature comparison
* Deploy the webhook over HTTPS

## Learning Documentation

The development process and lessons learned are documented in:

```text
docs/learning-journal.md
```

## Author

Brian Ndolo

GitHub: https://github.com/Brian-Ndolo
