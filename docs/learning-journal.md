Entry 1 — Initial Server Failure



Date: 18 August 2026

Start time: \[18:00]

End time: \[20:00]

Duration: \[2hrs]







Objective:

Build a small webhook prototype using Node.js/Express to understand how a webhook receives external POST requests.



Initial state:

The project contained:



daraja-webhook-prototype/

├── node\_modules/

├── package-lock.json

├── package.json

└── src/

&#x20;   └── server.js



When I initially ran:



node src/server.js



the command immediately returned to the terminal without displaying anything.



Investigation:

I checked the contents of server.js using:



cat src/server.js



The command returned nothing, indicating that the file contained no code.



Blocker:

server.js existed but was empty, so Node had nothing to execute.



Action taken:

I added a basic Node.js HTTP server that listened on port 3000.



Result:



Server running at http://localhost:3000



The terminal remained occupied, confirming that the server process was running.



Verification:

I opened:



http://localhost:3000



and confirmed that the server responded.



Learning:

I learned that a Node.js process will immediately exit when there is no active asynchronous operation keeping it alive. In this case, the HTTP server's listen() operation kept the process running.





Entry 2 — Testing POST Requests



Date: 18 August 2026

Start time: \[23:00]

End time: \[00:30]

Duration: \[1.5hrs]





Objective:

Verify that the server could receive HTTP POST requests, since webhooks generally deliver data through POST requests.



Attempt:

I initially ran:



curl -x POST http://localhost:3000



Blocker:

The request failed with:



curl: (5) Could not resolve proxy: POST



Investigation:

The problem was a command-line option typo. I had used lowercase -x instead of uppercase -X.



Fix:



curl -X POST http://localhost:3000



Result:

The POST request successfully reached the server.



Learning:

I learned the difference between curl's -x proxy option and -X request-method option.





Entry 3 — Building the Webhook Endpoint



Date: 19 August 2026

Start time: \[02:00]

End time: \[Not Recorded]

Duration: \[Not Recorded]



Objective:

Move from a basic HTTP server to an actual webhook endpoint capable of receiving JSON.



Investigation:

I checked the project's package.json and found:



{

&#x20; "dependencies": {

&#x20;   "express": "^5.2.1"

&#x20; }

}



I then verified that Express was installed successfully.



Action taken:

I implemented:



POST /webhook



with Express JSON parsing.



The endpoint was designed to:



Receive the request.

Parse the JSON body.

Log the received payload.

Return an acknowledgement.



Test:



{

&#x20; "test": "hello",

&#x20; "amount": 100

}



Result:



{

&#x20; "ResultCode": 0,

&#x20; "ResultDesc": "Accepted"

}



The server also logged the received JSON.





Entry 4 — Daraja-Style Callback Test



Date: 19 August 2026

Start time: \[Not Recorded]

End time: \[Not Recorded]

Duration: \[Not Recorded]



Objective:

Test the webhook using a payload resembling an actual Daraja callback.



Test payload structure:



Body

└── stkCallback

&#x20;   ├── MerchantRequestID

&#x20;   ├── CheckoutRequestID

&#x20;   ├── ResultCode

&#x20;   └── ResultDesc



Result:

The server successfully received and displayed:



Webhook received:

{

&#x20; "Body": {

&#x20;   "stkCallback": {

&#x20;     "MerchantRequestID": "test-123",

&#x20;     "CheckoutRequestID": "ws\_CO\_test",

&#x20;     "ResultCode": 0,

&#x20;     "ResultDesc": "The service request is processed succefully."

&#x20;   }

&#x20; }

}



Learning:

I confirmed that webhook data arrives as an HTTP request body and that nested JSON structures can be accessed by the application for further processing.



Current Prototype Status



At this point:



Functional prototype: ✅



POST request

&#x20;    ↓

/webhook

&#x20;    ↓

Express

&#x20;    ↓

JSON parser

&#x20;    ↓

req.body

&#x20;    ↓

Log callback

&#x20;    ↓

Return acknowledgement





Entry 5 — Webhook Verification Investigation

Date: 19 August 2026

Start time: 08:30 EAT

End time: 09:50 EAT

Duration: 1hr 20 minutes


Objective:

Understand how a webhook receiver can determine whether an incoming request is legitimate.

Investigation:

I researched webhook signatures, shared secrets, HMAC, and timestamps.


Learning:

I learned that the sender and receiver can share a secret that is not exposed directly in the request. The sender uses the secret and request data to generate a signature. The receiver uses its own copy of the secret to independently calculate the expected signature and compares it with the received signature.

I also learned that timestamps can be used to check whether a request is recent and help protect against replay attacks.


Key realization:

A webhook endpoint that accepts every POST request without verification cannot determine whether the request actually came from the expected sender.

## Entry 6 — HMAC Webhook Verification Implementation

Date: 19 August 2026

Start time: 11: 30 am

End time:  15: 00 PM

Duration: 3 hrs 30mins

### Objective

Implement a learning prototype for webhook signature verification using HMAC-SHA256.

The goal was to change the webhook flow from:

```text
Request
↓
express.json()
↓
req.body
↓
/webhook
↓
Accepted
```

to:

```text
Request
↓
Capture raw body
↓
Read signature
↓
Calculate expected HMAC
↓
Compare signatures
↓
Valid → HTTP 200
Invalid/missing → HTTP 401
```

This was intentionally a learning prototype and not a production implementation of Safaricom/Daraja authentication.

### Research

I researched the purpose of webhook signatures and how a webhook receiver can determine whether an incoming request is legitimate.

Key concepts investigated:

* Shared secrets
* HMAC
* HMAC-SHA256
* Request signatures
* Raw request bodies
* Signature comparison
* Replay attacks and timestamps

The main concept I learned was that the sender and receiver can share a secret that is not exposed directly in the request.

The sender uses:

```text
Request body + shared secret
↓
HMAC-SHA256
↓
Signature
```

The receiver independently performs the same calculation and compares the generated signature with the signature received in the request.

### Initial Blocker

The existing webhook endpoint accepted JSON requests and returned HTTP 200 without checking whether the request contained any authentication or verification information.

The existing flow was effectively:

```text
POST /webhook
↓
Parse JSON
↓
Log req.body
↓
Return HTTP 200
```

This meant that any client capable of reaching the endpoint could potentially send a request that would be treated as accepted.

### Solution

I introduced HMAC-SHA256 signature verification using Node.js's built-in `crypto` module.

No additional npm package was required.

A local shared secret was defined for the experiment:

```js
const SHARED_SECRET = "my-learning-secret";
```

The JSON parser was modified to preserve the raw request body using Express's `verify` option:

```js
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
```

This was important because the HMAC needed to be calculated from the original request body.

### Implementation

Node's built-in crypto module was imported:

```js
const crypto = require("crypto");
```

The webhook endpoint then read the incoming signature:

```js
const receivedSignature = req.headers["x-signature"];
```

The server calculated the expected HMAC-SHA256 signature:

```js
const expectedSignature = crypto
  .createHmac("sha256", SHARED_SECRET)
  .update(req.rawBody)
  .digest("hex");
```

The received signature was then compared with the expected signature.

Invalid or missing signatures were rejected:

```js
if (!receivedSignature || receivedSignature !== expectedSignature) {
  return res.status(401).json({
    ResultCode: 1,
    ResultDesc: "Invalid signature"
  });
}
```

Valid signatures continued through the existing webhook logic:

```js
console.log("Webhook received:");
console.log(JSON.stringify(req.body, null, 2));

res.status(200).json({
  ResultCode: 0,
  ResultDesc: "Accepted"
});
```

### Troubleshooting During Testing

#### Blocker 1 — Invalid JSON test payload

The first test request contained:

```json
{"TransactionID":"TEST123",Amount":100}
```

The `Amount` property was missing quotation marks.

The server correctly returned:

```text
HTTP/1.1 400 Bad Request
```

with a JSON parsing error.

I corrected the payload to:

```json
{"TransactionID":"TEST123","Amount":100}
```

This allowed the request to reach the HMAC verification logic.

#### Blocker 2 — Incorrect shared secret

When generating a test HMAC, I accidentally used:

```text
my-laerning-secret
```

instead of:

```text
my-learning-secret
```

This produced a different HMAC signature.

I learned that HMAC verification is extremely sensitive to changes in both the secret and request body. A single character difference produces a different signature.

I corrected the secret and generated the signature again.

### Test 1 — Missing Signature

I sent a valid JSON POST request without an `x-signature` header.

The request body was:

```json
{
  "TransactionID": "TEST123",
  "Amount": 100
}
```

The server returned:

```text
HTTP/1.1 401 Unauthorized
```

Response:

```json
{
  "ResultCode": 1,
  "ResultDesc": "Invalid signature"
}
```

This confirmed that unsigned requests were rejected.

### Test 2 — Valid HMAC Signature

I generated an HMAC-SHA256 signature using:

```text
Secret:
my-learning-secret
```

and the exact request body:

```json
{"TransactionID":"TEST123","Amount":100}
```

I then sent the generated signature using the:

```text
x-signature
```

request header.

The server returned:

```text
HTTP/1.1 200 OK
```

Response:

```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

The server also logged:

```text
Webhook received:
{
  "TransactionID": "TEST123",
  "Amount": 100
}


This confirmed that a valid HMAC signature was accepted.

### Final Verified Flow

The completed experiment demonstrated:

```text
                 Incoming Request
                        ↓
                 Capture Raw Body
                        ↓
                  Read Signature
                        ↓
              Calculate HMAC-SHA256
                        ↓
               Compare Signatures
                        ↓
                 ┌──────┴──────┐
                 ↓             ↓
               MATCH       NO MATCH
                 ↓             ↓
             HTTP 200       HTTP 401
              Accepted       Rejected



### Learning Outcome

This experiment taught me that webhook security is not simply about receiving a POST request and parsing JSON.

I learned:

1. A webhook receiver should have a way to verify the authenticity of incoming requests.
2. HMAC allows the sender and receiver to independently calculate the same signature using a shared secret.
3. The raw request body matters when calculating a body-based signature.
4. A valid JSON request can still be rejected if its signature is missing or incorrect.
5. Changing even one character in the shared secret or signed body changes the HMAC result.
6. Node.js provides the `crypto` module natively, so an additional npm package was unnecessary for this prototype.
7. Testing both the failure and success paths is essential.
8. Git branches and pull requests provide a controlled way to implement, test, review, and merge a feature without directly modifying `main`.
