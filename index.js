require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT, () => {
  console.log("Server started");
});

const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(formidable());
mongoose.connect("mongodb://localhost/vinted");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const usersRoutes = require("./routes/signups");
app.use(usersRoutes);
const loginRoutes = require("./routes/logins");
app.use(loginRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.listen(3000, () => {
  console.log("Serveur has started !");
});