import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';
export default class OneModel {
    constructor(name) {
        this.name = name;
    }


    static async deleteOne(collection,id) {
        try {
          const db = getdb();
          const product = await db.collection(collection).deleteOne({
            _id: new ObjectId(id)
          });
          return product;
        } catch (err) {
          console.log(err);
        }
      }









    static async getExtraForm(
        category,
        subCategory,
        brand,
        size,
        color,
        discount
    ) {
        try {
            const db = getdb();

            if (category?.trim()) {
                await db.collection('category').insertOne({
                    category: category.trim()
                });
            }

            if (subCategory?.trim()) {
                await db.collection('subCategory').insertOne({
                    subCategory: subCategory.trim()
                });
            }

            if (brand?.trim()) {
                await db.collection('brand').insertOne({
                    brand: brand.trim()
                });
            }

            if (size?.trim()) {
                await db.collection('size').insertOne({
                    size: size.trim()
                });
            }

            if (color?.trim()) {
                await db.collection('color').insertOne({
                    color: color.trim()
                });
            }

            if (discount?.trim()) {
                await db.collection('discount').insertOne({
                    discount: discount.trim()
                });
            }

            return {
                success: true,
                message: "Data Inserted Successfully"
            };

        } catch (error) {
            console.log("Extra Form Error:", error);
            throw error;
        }
    }
    static async getAllExtraForm() {
        try {
            const db = getdb();

            const category = await db.collection('category').find().toArray();

            const subCategory = await db.collection('subCategory').find().toArray();

            const brand = await db.collection('brand').find().toArray();

            const size = await db.collection('size').find().toArray();

            const color = await db.collection('color').find().toArray();

            const discount = await db.collection('discount').find().toArray();

            return {
                category,
                subCategory,
                brand,
                size,
                color,
                discount
            };

        } catch (error) {
            console.log("Fetch Extra Form Error:", error);
            throw error;
        }
    }
}
