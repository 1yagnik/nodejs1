import CartModel from "../models/cartmodel.js"


export default class orderController {

    async getOrders(req, res) {
        const userID = req.session.userid
        console.log(userID);
        
        const user = await CartModel.finduser(userID)


        res.render('order', { layout: 'myaccount',user:user })



    }

}