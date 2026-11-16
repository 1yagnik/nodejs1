import { getdb } from '../../config/mongodb.js';
export default class OneModel {
    constructor(name) {
        this.name = name;
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

            // 1. Category Collection
            await db.collection('category').insertOne({
                category: category
            });

            // 2. SubCategory Collection
            await db.collection('subCategory').insertOne({
                subCategory: subCategory
            });

            // 3. Brand Collection
            await db.collection('brand').insertOne({
                brand: brand
            });

            // 4. Size Collection
            await db.collection('size').insertOne({
                size: size
            });

            // 5. Color Collection
            await db.collection('color').insertOne({
                color: color
            });

            // 6. Discount Collection
            await db.collection('discount').insertOne({
                discount: discount
            });

            return {
                success: true,
                message: "All Data Inserted Successfully"
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
