Entry 1 — Initial Server Failure



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



Still to investigate:



Public webhook URL

HTTPS

Actual Daraja integration

Webhook security/validation

Handling real transaction data

