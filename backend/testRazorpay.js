require("dotenv").config();

const razorpay = require("./config/razorpay");

console.log(
    "Razorpay Key ID:",
    process.env.RAZORPAY_KEY_ID ? "Configured" : "Missing"
);

console.log(
    "Razorpay instance:",
    razorpay ? "Initialized" : "Not initialized"
);