export default class MyAccountController {

    getaccount(req,res){
        res.render('myaccount',{layout:false})
    }
}