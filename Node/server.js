import express from 'express';
import path from 'node:path';
import { DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import ProductController from './src/controllers/productController.js';
import upload from './src/multer.js';
import { fileURLToPath } from 'node:url';

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

const productController = new ProductController();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const viewsPath = path.join(__dirname, 'src', 'views');

server.use(express.static(path.join(__dirname, 'public')));

server.use(express.static(viewsPath));

server.set('view engine', 'ejs');
server.set('views', viewsPath);

server.get('/', productController.getProducts);

// PDF upload aur AI processing
server.post('/', upload.array('myFiles', 1500), productController.postollama);

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
  });
}

export default server;
