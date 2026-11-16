import ProductModel from '../models/product.model.js';
import OneModel from '../models/one.model.js';

export default class ProductController {



  async UpdateForm(req, res) {
    const id = req.params.id;

    const product = await ProductModel.findOne(id);

    res.render('updateForm', {
      product: product,
    });
  }

  async PostUpdateForm(req, res) {
    console.log('Body:', req.body);

    console.log('Files:', req.files);

    const { id, name, desc, sku, stock, minStock, price, originalPrice, discount, minOrder } =
      req.body;

    const oldImages = req.body.oldImageUrl || [];

    const newImages = req.files
      ? req.files.map((file) => 'images/' + file.filename)
      : [];

    const imageUrl = [...(Array.isArray(oldImages) ? oldImages : [oldImages]), ...newImages];

    console.log('Final Images:', imageUrl);
    await ProductModel.updateForm(
      id,
      name,
      desc,
      sku,
      stock,
      minStock,
      price,
      originalPrice,
      discount,
      minOrder,
      imageUrl,
    );

    try {
      // Retrieve products using the ProductModel
      let products = await ProductModel.getAll();
      const cate = await OneModel.getAllExtraForm();
      let totalProducts = await ProductModel.getTotalStock();

      res.render('productsshow', {
        cate: cate,
        products: products,
        totalProducts: totalProducts,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async firstPro(req, res) {
    const id = req.params.id;

    const product = await ProductModel.findOne(id);

    res.render('firstproducts', {
      product: product,
    });
  }

  async getProducts(req, res) {
    try {
      // Retrieve products using the ProductModel
      let products = await ProductModel.getAll();
      const cate = await OneModel.getAllExtraForm();

      let totalProducts = await ProductModel.getTotalStock();

      res.render('productsshow', {
        cate:cate,
        products: products,
        totalProducts: totalProducts,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async postAddProduct(req, res) {
    try {
      const {
        name,
        desc,
        category,
        subCategory,
        sku,
        stock,
        minStock,
        brand,
        size,
        color,
        price,
        originalPrice,
        discount,
        minOrder,
      } = req.body;

      // Multiple images get
      const imageUrl = req.files.map((file) => {
        return 'images/' + file.filename;
      });

      console.log('Product Images:', imageUrl);

      // Save product
      const result = await ProductModel.postProducts(
        name,
        desc,
        category,
        subCategory,
        sku,
        stock,
        minStock,
        brand,
        size,
        color,
        price,
        originalPrice,
        discount,
        minOrder,
        imageUrl,
      );

      const cate = await OneModel.getAllExtraForm();



      res.render('productsadd', {
        cate: cate,
        message: result.message,
      });
    } catch (error) {
      console.log('Controller Error:', error);

      res.status(500).send('Product upload failed');
    }
  }

  getSetting(req, res) {
    res.render('setting');
  }

  async getProductsAdd(req, res) {
    const cate = await OneModel.getAllExtraForm();
    res.render('productsadd', { cate: cate });
  }

  getCustomers(req, res) {
    res.render('customer');
  }

  getDashboard(req, res) {
    res.render('dashboard');
  }

  getOrder(req, res) {
    res.render('orders');
  }

  // Defining getProducts method
}
