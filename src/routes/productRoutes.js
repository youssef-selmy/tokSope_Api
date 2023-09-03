const express = require("express");
const productRouter = express.Router();
const productController = require("../controllers/products");

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

let upload = multer({ storage, fileFilter });
const passport = require("passport");

require("../services/authenticate");

productRouter
  .route("/:shopId")
  .post(
    passport.authenticate("jwt", { session: false }),
    productController.addProductToShop
  );

productRouter
  .route("/products/:productId")
  .get(productController.getProductById)
  .put(
    passport.authenticate("jwt", { session: false }),
    productController.updateProductById
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    productController.deleteProductById
  );

productRouter
  .route("/images/:productId")
  .put(
    passport.authenticate("jwt", { session: false }),
    productController.updateProductImages
  );



productRouter
  .route("/product/product/qtycheck/:productId")
  .post(productController.productQtyCheck);

productRouter
  .route("/paginated/allproducts")
  .get(
    productController.getProducts
  );

productRouter
  .route("/related/products/:id")
  .get(productController.relatedProducts);

productRouter
  .route("/interest/interest/products/:interest")
  .get(productController.interestProducts);
  
productRouter
  .route("/channel/products/:channel")
  .get(productController.channelProducts);
productRouter
  .route("/related/products/:id")
  .get(productController.relatedProducts);

productRouter.route("/review/:id").post(productController.addProductReview);
productRouter.route("/review/:id").get(productController.getProductReviews);
productRouter
  .route("/review/:userId/:id")
  .get(productController.getProductReviewsByUserId);
productRouter
  .route("/review/delete/review/:id")
  .delete(productController.deleteProductReviewsById);


module.exports = productRouter;
