import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';


export default class MainModel {

  constructor(productId, quantity) {
    this.productId = id
    this.quantity = quantity

  }


  static async postProducts(userid, product, quantity) {

    try {
      const db = getdb();
      await db.collection("users").updateOne(
        { _id: new ObjectId(userid) },
        {
          $push: {
            cart: {
              productId: new ObjectId(product._id),
              name: product.name,
              price: product.price,
              image: product.imageUrl[0],
              quantity: quantity,
              status: 'pending'
            }
          }
        }
      );

      return {
        success: true,
        message: 'Product added successfully',
        productId: result.insertedId,
      };
    } catch (error) {

    }

  }

  static async getAllproducts() {
    const db = getdb();

    const products = await db.collection('Products').find({}).toArray();

    return products;
  }

  static async findemail(email) {
    try {
      const db = getdb();
      const product = await db.collection('users').findOne({
        email: email,
      });
      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async findOne(id) {
    try {
      const db = getdb();
      const product = await db.collection('Products').findOne({
        _id: new ObjectId(id),
      });
      return product;
    } catch (err) {
      console.log(err);
    }
  }



}