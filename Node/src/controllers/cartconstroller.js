import CartModel from "../models/cartmodel.js"

export default class CartController {

    async postcart(req,res){
        const userID = req.session.userid
        const {shipping,promo} = req.body
        const order = await CartModel.postcart(userID,shipping,promo)

        res.redirect('/products')
        
    }



    async getCart(req,res){
        const userID = req.session.userid

        const user = await CartModel.finduser(userID)
        
        
        

        res.render('cart',{ layout: false,user:user})
    }
}
