const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");
const twilio = require("twilio");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary/index");
const upload = multer({ storage });
const {
  isLoggedIn,
  checkproductOwnership,
  isbuyerNotSeller,
  isuserAlsoSeller,
} = require("../middleware/index");

const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);

const categories = ["medicine", "oxygen-cylinder", "equipments"];

//GET all products
router.get("/", async (req, res) => {
  const foundProducts = await Product.find({ qtyAvl: { $gt: 0 } });
  res.render("products/index", { foundProducts });
});

router.get("/search/:cityOfPresence/:category", async (req, res) => {
  const { cityOfPresence, category } = req.params;
  const foundProducts = await Product.find({
    cityOfPresence: cityOfPresence,
    category,
    qtyAvl: { $gt: 0 },
  });
  res.render("products/searchResult", { foundProducts });
});

router.get("/search", (req, res) => {
  res.render("products/search");
});

router.post("/search", (req, res) => {
  const { cityOfPresence, category } = req.body;
  res.redirect(`/products/search/${cityOfPresence}/${category}`);
});

// Get a form to add new product
router.get("/new", isuserAlsoSeller, (req, res) => {
  res.render("products/new", { categories });
});

// CREATE new product
router.post("/", isuserAlsoSeller, upload.array("image"), async (req, res) => {
  const newProduct = new Product(req.body);
  newProduct.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  const curUser = req.user;
  newProduct.owner = {
    id: curUser._id,
    ownerName: curUser.username,
  };
  await newProduct.save();

  const curSeller = await User.findById(curUser._id);
  curSeller.createdProducts.push(newProduct);
  await curSeller.save();

  res.redirect("/user/myProducts");
});

// GET a particular product
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const foundProduct = await Product.findById(id).populate("owner");
  res.render("products/show", { foundProduct });
});

// Get form to update a product
router.get("/:id/edit", checkproductOwnership, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

// UPDATE a product
router.put(
  "/:id",
  checkproductOwnership,
  upload.array("image"),
  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    await product.save();
    res.redirect("/user/myProducts");
  }
);

// Delete a product
router.delete("/:id", checkproductOwnership, async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.redirect("/user/myProducts");
});

// Buy a product
router.get("/:id/buy", isbuyerNotSeller, async (req, res) => {
  const { id } = req.params;
  const foundProduct = await Product.findById(id);
  const curUser = await User.findById(req.user._id);
  res.render("products/checkout", { foundProduct, name: curUser.username });
});

// Buy a product
router.post("/:id/buy", isbuyerNotSeller, async (req, res) => {
  const { username, address } = req.body;
  const { id } = req.params;

  const curUser = req.user;
  const foundProduct = await Product.findById(id);
  const buyer = await User.findById(curUser._id);
  buyer.boughtProducts.push(foundProduct);
  await buyer.save();

  if (foundProduct.qtyAvl > 1) {
    foundProduct.qtyAvl--;
    await foundProduct.save();

    client.messages
      .create({
        body: `Dear seller, you have an order request from ${username} for ${foundProduct.name} at address : ${address}`,
        from: "+18173857837",
        to: "+919304257915",
      })
      .then((message) => {
        res.redirect("/products");
      })
      .catch((err) => console.log("UNSUCCESSFUL PURCHASE", err));
  } else {
    foundProduct.qtyAvl--;
    await foundProduct.save();

    client.messages
      .create({
        body: `Dear seller, you have an order request from ${username} for ${foundProduct.name} at address : ${address}`,
        from: "+18173857837",
        to: "+919304257915",
      })
      .then((message) => {});

    client.messages
      .create({
        body: `Dear seller, the amount of ${foundProduct.name} available for selling on CoMeds.com has reduced to zero, Kindly take necessary actions.`,
        from: "+18173857837",
        to: "+919304257915",
      })
      .then((message) => {
        res.redirect("/products");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

module.exports = router;
