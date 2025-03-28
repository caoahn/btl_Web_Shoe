const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

// [POST] /api/custom/product
module.exports.getProductByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.body.categoryId;
  const products = await Product.find({ category: categoryId });
  res.json(products);
})

// [GET] /api/custom/product
module.exports.getAsyncProductByCategory = asyncHandler(async (req, res) => { 
  try{
    const categories = await Category.find({display_order: 1});
    
    const result = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ category: category._id });
        return {
          categoryId: category._id,
          name: category.name,
          display_order: category.display_order,
          products: products
        }
      })
    )
    res.status(200).json(result);
  }
  catch(err){
    console.log(err);
  }
})

// [GET] /api/custom/product
module.exports.getAsyncServiceByCategory = asyncHandler(async (req, res) => { 
  try{
    const categories = await Category.find({display_order: 2});
    res.status(200).json(categories);
  }
  catch(err){
    console.log(err);
  }
})

// [GET] /api/custom/getCategory
module.exports.getCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({ display_order: { $ne: 2 } });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// [POST] /api/custom/getProdcutById
module.exports.getProductByCategoryId = asyncHandler(async (req, res) => {
  const categoryId = req.body.categoryId;
  try {
    if (categoryId === "") {
      const products = await Product.find({});
      res.json(products);
    }
    else {
      const products = await Product.find({ category: categoryId });
      res.json(products);
    }
  }
  catch (error) {
    console.error(error);
  }
})