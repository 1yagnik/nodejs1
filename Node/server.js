import express from 'express';
import path from 'node:path';
import { DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import ProductController from './src/controllers/productController.js';
import {uploadFile} from './src/multer.js';
import OneController from './src/controllers/oneController.js';

import expressLayouts from 'express-ejs-layouts'
import { fileURLToPath } from 'node:url';
import {connectToMongoDB} from './config/mongodb.js';

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();


const productController = new ProductController();
const oneController = new OneController();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const viewsPath = path.join(__dirname, 'src', 'views');

server.use(express.static(path.join(__dirname, 'public')));
server.use(expressLayouts);
server.use(express.static(viewsPath));

server.set('view engine', 'ejs');
server.set('views', viewsPath);


server.get('/orders',productController.getOrder)
server.get('/', productController.getDashboard)
server.get('/customers', productController.getCustomers)
server.get('/productsshow', productController.getProducts)
server.get('/setting', productController.getSetting)
server.get('/add', productController.getProductsAdd)
server.get('/productsshow/:id', productController.firstPro)
server.get('/productsshow/update/:id', productController.UpdateForm)

server.get('/form', oneController.getExtraForm)
server.post('/form',oneController.PostForm)
server.post('/update', uploadFile.array("imageUrl", 5),productController.PostUpdateForm)
server.post('/add',uploadFile.array("images", 5),productController.postAddProduct)




//server.get('/', productController.getProducts);

// PDF upload aur AI processing
//server.post('/', upload.array('myFiles', 1500), productController.postollama);

// Error handling
server.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(400).json({
    message: err.message || 'Upload failed.',
  });
});

if (!process.env.VERCEL) {
  server.listen(3400, () => {
    console.log('Server running at http://localhost:3400');
    connectToMongoDB()
  
  });
}

export default server;
