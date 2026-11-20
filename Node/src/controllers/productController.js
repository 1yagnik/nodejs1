import ProductModel from '../models/product.model.js';
import OneModel from '../models/one.model.js';
import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';
import CartModel from '../models/cartmodel.js';

export default class ProductController {


  async deleteProducts(req, res) {
    const id = req.params.id
    console.log(id);


    const result = await ProductModel.deleteOne(id);

    if (result.deletedCount === 1) {
      return res.redirect('/productsshow');
    } else {
      return res.status(404).send("Product Not Found");
    }

  }



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
        cate: cate,
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
      console.log(req.body);


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

  async getCustomers(req, res) {
    const db = getdb();

    const customers = await db.collection('users').find({}).toArray();



    res.render('customer', { customers: customers });
  }

  getDashboard(req, res) {
    res.render('dashboard');
  }



  async postStatus(req, res) {
    try {

      const { id, userId } = req.params;



      const { status } = req.body;

      const allowedStatus = [
        "pending",
        "delivered",
        "completed"
      ];

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID"
        });
      }

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }

      const db = getdb();

      const user = await CartModel.finduser(userId)


      const results = await db.collection("users").updateOne(
        {
          _id: new ObjectId(userId),
          "order.orderId": new ObjectId(id)
        },
        {
          $set: {
            "order.$.status": status
          }
        }
      );


      const result = await db.collection("orders").updateOne(
        {
          _id: new ObjectId(id)
        },
        {
          $set: {
            status: status
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        message: "Order status updated"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }
  }

  async getOrder(req, res) {
    const db = getdb();

    const orders = await db.collection('orders').find({}).toArray();

    res.render('adminorders', { orders: orders });
  }

  // Defining getProducts method
}
