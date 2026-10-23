

export default class ProductController {

    // Defining getProducts method
    getProducts(req, res) {


        res.render("products")
    }
    setProducts(req, res) {


        try {
            // Agar koi file upload nahi hui
            if (!req.files || req.files.length === 0) {
                return res.status(400).send({ message: "Kripya kam se kam ek file upload karein." });
            }

            // 4. Saare file paths ko ek array me store karna
            const filePathsArray = req.files.map(file => file.path);

            for (const files of filePathsArray) {
                file.push("./" + files)
            }

            console.log(file);






            // Aap is array ko Database (MongoDB/SQL) me save kar sakte hain
            console.log("Aapka Paths Array:", filePathsArray);



            res.send({
                message: "Saari files successfully upload ho gayi hain!",
                paths: filePathsArray // Response me array bhej rahe hain
            });

        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}
