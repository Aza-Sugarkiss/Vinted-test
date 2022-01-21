const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const express = require("express");
const router = express.Router();
const Login = require("../models/Login");
const User = require("../models/Singup");

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    const password = req.fields.password;
    const hash = SHA256(password + user.salt).toString(encBase64);
    if (user.hash !== hash) {
      res.status(400).json({ message: "Unauthorized" });
    } else {
      const newLogIn = new Login();
      await newLogIn.save();
      const result = await User.findOne({ email: req.fields.email }).select(
        "_id token account"
      );
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
