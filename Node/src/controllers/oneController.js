import OneModel from '../models/one.model.js';

export default class OneController {

     async PostForm(req, res) {
        try {

            const {
                category,
                subCategory,
                brand,
                size,
                color,
                discount
            } = req.body;

            await OneModel.getExtraForm(
                category,
                subCategory,
                brand,
                size,
                color,
                discount
            );

            res.redirect('/form');

        } catch (error) {
            console.log(error);
            res.status(500).send("Data Insert Error");
        }
    }

     async getExtraForm(req, res) {
        try {
            const products = await OneModel.getAllExtraForm();
            
            res.render("extraform", { products:products });

        } catch (error) {
            console.log(error);
            res.status(500).send("Data Fetch Error");
        }
    }
}