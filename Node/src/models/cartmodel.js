import { getdb } from '../../config/mongodb.js';
import { ObjectId } from 'mongodb';


export default class CartModel {

    constructor() {


    }



    static async postcart(userid, shipping, promo) {
        try {
            const db = getdb();

            // User ka cart fetch karo
            const user = await db.collection("users").findOne({
                _id: new ObjectId(userid)
            });

            if (!user || !user.cart || user.cart.length === 0) {
                return {
                    success: false,
                    message: "Cart is empty"
                };
            }

            const result = await db.collection("orders").insertOne({

                userId: new ObjectId(userid),
                email: user.email,

                products: user.cart,


                shipping: Number(shipping),
                promo: promo,



                status: "Pending",

                createdAt: new Date()

            });

            await db.collection("users").updateOne(
                { _id: new ObjectId(userid) },
                {
                    $push: {
                        order: {
                            orderId: result.insertedId,
                            status: "pending",
                            orders: user.cart
                        }
                    }
                }
            );

            await db.collection("users").updateOne(
                {
                    _id: new ObjectId(userid)
                },
                {
                    $set: {
                        cart: []
                    }
                }
            );

            return {
                success: true,
                message: "Order placed successfully",
                orderId: result.insertedId
            };


        }


        catch (error) {
            console.log(error);

            return {
                success: false,
                message: "Order failed"
            };
        }
    }


    static async finduser(id) {
        try {
            const db = getdb();
            const users = await db.collection('users').findOne({
                _id: new ObjectId(id),
            });
            return users;
        } catch (err) {
            console.log(err);
        }
    }





}