const mongoose = require("mongoose");
const Account = mongoose.model("Account", {
  _id: String,
  token: String,
  account: {
    username: String,
    phone: String,
  },
});
module.exports = Account;
