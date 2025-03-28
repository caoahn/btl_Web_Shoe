const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

// [GET] /api/products
module.exports.index = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ _id: -1 });
  
  const result = await Promise.all(
    products.map(async (product) => {
      const category = await Category.findOne({ _id: product.category });
      const categoryName = category ? category.name : "Uncategorized";  
      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        countInStock: product.countInStock,
        description: product.description,
        category: categoryName,
        image: product.image,
        rating: product.rating,
        numReviews: product.numReviews,
        reviews: product.reviews,
      };
    })
  );

  res.json(result);
});

// [GET] /api/products/all
module.exports.all = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ _id: -1 });
  res.json(products);
});

// [GET] /api/products/:id
module.exports.get = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found!");
  }
});

// [POST] /api/products/:id/review
module.exports.review = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating và comment là bắt buộc" });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;

  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.numReviews;

  try {
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Lỗi khi lưu đánh giá:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lưu đánh giá" });
  }
});

// [DELETE] /api/products/:id
module.exports.delete = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// [POST] /api/products
module.exports.create = asyncHandler(async (req, res) => {
  const { name, price, countInStock, description, category, image } = req.body;

  const productExists = await Product.findOne({ name });

  if (productExists) {
    res.status(400);
    throw new Error("Product name already exists");
  } else {
    const product = new Product({
      name,
      price,
      countInStock,
      description,
      category,
      image,
      user: req.user._id,
    });

    if (product) {
      const createProduct = await product.save();
      res.status(201).json(createProduct);
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  }
});

// [PATCH] /api/products/:id
module.exports.update = asyncHandler(async (req, res) => {
  const { name, price, countInStock, description, category, image } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.countInStock = countInStock || product.countInStock;
    product.description = description || product.description;
    product.category = category || product.category;
    product.image = image || product.image;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
