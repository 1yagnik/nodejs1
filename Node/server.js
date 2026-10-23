
import express from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

const { PDFParse } = await import("pdf-parse");

import ProductController from "./src/controllers/productController.js";
import upload from "./src/multer.js";
import { askOllama } from "./src/ollama.js";

const server = express();

const productController = new ProductController();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  express.static(path.join(process.cwd(), "src", "views"))
);

server.set("view engine", "ejs");
server.set(
  "views",
  path.join(process.cwd(), "src", "views")
);

server.get("/", productController.getProducts);

// PDF upload aur AI processing
server.post(
  "/",
  upload.array("myFiles", 5),
  async (req, res) => {
    const results = [];
    const uploadedFiles = req.files || [];
    const question = req.body.question?.trim() || "";

    try {
      // PDF upload nahi hui to bhi normal question ka answer do
      if (uploadedFiles.length === 0) {
        if (!question) {
          return res.status(400).json({
            message: "PDF upload karo ya question likho."
          });
        }

        const answer = await askOllama("", question);

        return res.status(200).json({ answer });
      }

      // Har uploaded PDF ko process karo
      for (const uploadedFile of uploadedFiles) {
        let parser;
        let pdfText = "";

        try {
          const buffer = await fs.readFile(uploadedFile.path);

          parser = new PDFParse({ data: buffer });

          try {
            const result = await parser.getText();

            // Parser result mila to text use karo
            pdfText = result?.text?.trim() || "";
          } catch (parseError) {
            // Parser fail ho to bhi AI ko question bhejenge
            console.error(
              "PDF text extraction error:",
              parseError.message
            );
          }

        } catch (fileError) {
          console.error(
            "PDF read error:",
            fileError.message
          );
        } finally {
          if (parser) {
            try {
              await parser.destroy();
            } catch (destroyError) {
              console.error(
                "Parser cleanup error:",
                destroyError.message
              );
            }
          }
        }

        // Text empty ho tab bhi Ollama call hoga
        const content = pdfText ||
          "PDF se text extract nahi ho saka. PDF scanned/image-based ya unreadable ho sakti hai.";

        try {
          const answer = await askOllama(content, question);

          results.push({
            fileName: uploadedFile.originalname,
            question,
            answer
          });
        } finally {
          // Temporary file delete karo
          await fs.unlink(uploadedFile.path).catch(() => {});
        }
      }

      return res.status(200).json({
        message: "PDF processing complete.",
        results
      });

    } catch (error) {
      console.error("AI processing error:", error);

      await Promise.all(
        uploadedFiles.map(file =>
          fs.unlink(file.path).catch(() => {})
        )
      );

      return res.status(500).json({
        message: "AI processing ke dauran error aaya.",
        error: error.message
      });
    }
  }
);

// Error handling
server.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(400).json({
    message: err.message || "Upload failed."
  });
});

if (!process.env.VERCEL) {
  server.listen(3400, () => {
    console.log("Server running at http://localhost:3400");
  });
}

export default server;
