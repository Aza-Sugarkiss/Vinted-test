const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const Offer = require("../models/Offer");
const User = require("../models/Singup");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidable());

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

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(pictureToUpload);
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          MARQUE: req.fields.brand,
          TAILLE: req.fields.size,
          COULEUR: req.fields.color,
          EMPLACEMENT: req.fields.city,
        },
      ],
      product_image: result,
      owner: req.user,
    });
    await newOffer.save();
    res.json({ newOffer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let priceMin = 0;
    if (req.query.priceMin) {
      priceMin = req.query.priceMin;
    }

    let priceMax = 100000;
    if (req.query.priceMax) {
      priceMax = req.query.priceMax;
    }

    const filters = {
      product_name: new RegExp(req.query.title, "i"),
      product_price: { $gte: priceMin, $lte: priceMax },
    };

    const limit = 3;
    let sort = "";
    if (req.query.sort) {
      sort = req.query.sort;
    }

    const offers = await Offer.find(filters)
      .sort({ product_price: sort.replace("price-", "") })
      .limit(limit)
      .skip((req.query.page - 1) * limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filters);

    res.status(200).json(count, offers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(400).json({ message: "Offer doesn't exists" });
    } else {
      res.status(200).json(offer);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
