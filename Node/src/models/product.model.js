import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';

export default class ProductModel {
  constructor(
    id,
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
  ) {
    this.id = id++;
    this.name = name;
    this.desc = desc;
    this.category = category;
    this.subCategory = subCategory;
    this.sku = sku;
    this.stock = stock;
    this.minStock = minStock;
    this.brand = brand;
    this.size = size;
    this.color = color;
    this.price = price;
    this.originalPrice = originalPrice;
    this.discount = discount;
    this.minOrder = minOrder;

    // Multiple images
    this.imageUrl = imageUrl;
  }

  static async getAll() {
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

  static async updateForm(
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
  ) {
    try {
      const db = getdb();
      const product = await db.collection('Products').updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            name: name,
            desc: desc,
            sku: sku,
            stock: stock,
            minStock: minStock,
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            minOrder: minOrder,
            imageUrl: imageUrl,
          },
        },
      );
      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async getTotalStock() {
    try {
      const db = getdb();
      const products = await db
        .collection('Products')
        .find({}, { projection: { stock: 1, _id: 0 } })
        .toArray();

      const totalStock = products.reduce((sum, item) => {
        return sum + (Number(item.stock) || 0);
      }, 0);

      return totalStock; // Output: 400
    } catch (err) {
      console.log(err);
    }
  }

  static async postProducts(
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
  ) {
    try {
      const db = getdb();
      const Collection = db.collection('Products');

      const newProducts = new ProductModel(
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

      const result = await Collection.insertOne(newProducts);

      return {
        success: true,
        message: 'Product added successfully',
        productId: result.insertedId,
      };
    } catch (error) {
      console.log('Product insert error:', error);

      return {
        success: false,
        message: error.message,
      };
    }
  }
}
