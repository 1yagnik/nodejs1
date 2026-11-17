import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';


export default class MainModel {

    static async getAllproducts() {
        const db = getdb();

        const products = await db.collection('Products').find({}).toArray();

        return products;
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