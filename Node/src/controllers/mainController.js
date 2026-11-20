import MainModel from "../models/mainmodel.js";
import bcrypt from "bcrypt";
import { getdb } from '../../config/mongodb.js';

export default class MainController {



    async signin(req,res){
        res.render('signin',{ layout: false })
    }


    async postsignin(req, res) {
    try {
        const { email, password } = req.body;

        const user = await MainModel.findemail(email);

        if (!user) {
            return res.redirect('/signin');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.redirect('/signin');
        }

        req.session.userid = user._id;
        
        

        res.redirect('/products');

    } catch (err) {
        console.log(err);
        res.redirect('/signin');
    }
}



    async postlogin(req, res) {
        try {
            const { email, password } = req.body;

            const db = getdb();

            // Password hash
            const hashedPassword = await bcrypt.hash(password, 10);


            // Save user in MongoDB
           const user =  await db.collection("users").insertOne({
                email: email,
                password: hashedPassword,
                cart: [],
                order:[],
                
            });
             req.session.userid = user.insertedId;

        

            res.redirect('/products');
           

        } catch (err) {
            console.log(err);
            res.redirect('/login');
        }
    }



    login(req, res) {
        res.render('login', { layout: false })
    }

    async postProducts(req, res) {
        const userID = req.session.userid
       
        
        const { productId, color, size, quantity } = req.body

        const product = await MainModel.findOne(productId);
        const result = await MainModel.postProducts(userID,product, quantity)

        res.redirect('/products')

    }

    async getMainPage(req, res) {
        res.render('mainpage', { layout: 'specificlayouts' })
    }

    async getProductsPage(req, res) {
        let products = await MainModel.getAllproducts();
        res.render('allproducts', { layout: 'specificlayouts', products: products })
    }

    async getOneproducts(req, res) {
        const id = req.params.id;

        const product = await MainModel.findOne(id);

        res.render('oneproducts', { layout: 'specificlayouts', product: product })
    }



}