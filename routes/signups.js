const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const express = require("express");
const router = express.Router();
const User = require("../models/Singup");
const cloudinary = require("cloudinary").v2;

router.post("/user/signup", async (req, res) => {
  try {
    const checkMailDuplicate = await User.findOne({
      email: req.fields.email,
    });
    if (!req.fields.username || !req.fields.email) {
      res.status(400).json({ message: "Username or email is not defined" });
    } else if (checkMailDuplicate) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      const password = req.fields.password;
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(64);
      const newUser = new User({
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
        email: req.fields.email,
        token: token,
        hash: hash,
        salt: salt,
      });
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        email: newUser.email,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

router.post("/upload", isAuthenticated, async (req, res) => {
  try {
    const avatar = req.files.avatar.path;
    const result = await cloudinary.uploader.upload(avatar);
    if (avatar.length === 0) {
      res.status(400).json("No file uploaded!");
    } else {
      req.user.account.avatar = result;
      await req.user.save();
      res.status(200).json({ result });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
