import MainModel from "../models/mainmodel.js";

export default class MainController {

    async getMainPage(req, res) {
        res.render('mainpage', { layout: 'specificlayouts'})
    }

    async getProductsPage(req, res) {
        let products = await MainModel.getAllproducts();
        res.render('allproducts', { layout: 'specificlayouts',products:products })
    }

    async getOneproducts(req, res) {
        const id = req.params.id;
        console.log(id);
        const product = await MainModel.findOne(id);
        
        res.render('oneproducts', { layout: 'specificlayouts',product:product})
    }



}