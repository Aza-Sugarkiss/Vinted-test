const mongoose = require("mongoose");
const Login = mongoose.model("Login", {
  email: String,
  password: String,
});
module.exports = Login;
