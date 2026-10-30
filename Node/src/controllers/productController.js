import path from "node:path";
import fs from "node:fs/promises";
import { askOllama } from "../ollama.js";

const { PDFParse } = await import("pdf-parse");


const aiFilePath = process.env.VERCEL
  ? "/tmp/ai.txt"
  : path.join(process.cwd(), "ai.txt");



export default class ProductController {
  // Defining getProducts method
  getProducts(req, res) {
    res.render('products');
  }

  async postollama(req, res) {
    
      const results = [];
      const uploadedFiles = req.files || [];
      const question = req.body.question?.trim() || '';

      try {
        // PDF upload nahi hui to bhi normal question ka answer do
        if (uploadedFiles.length === 0) {
          if (!question) {
            return res.status(400).json({
              message: 'PDF upload karo ya question likho.',
            });
          }

          const answer = await askOllama('', question);
          console.log("THIS IS NO CONTENT ANSWER",answer);
          


          return res.status(200).json({ answer });
        }

        // Har uploaded PDF ko process karo
        for (const uploadedFile of uploadedFiles) {
          let parser;
          let pdfText = '';

          try {
            const buffer = await fs.readFile(uploadedFile.path);

            parser = new PDFParse({ data: buffer });

            try {
              const result = await parser.getText();

              // Parser result mila to text use karo
              pdfText = result?.text?.trim() || '';
            } catch (parseError) {
              // Parser fail ho to bhi AI ko question bhejenge
              console.error('PDF text extraction error:', parseError.message);
            }
          } catch (fileError) {
            console.error('PDF read error:', fileError.message);
          } finally {
            if (parser) {
              try {
                await parser.destroy();
              } catch (destroyError) {
                console.ereror('Parser cleanup error:', destroyError.message);
              }
            }
          }

          // Text empty ho tab bhi Ollama call hoga
          const content =
            pdfText ||
            'PDF se text extract nahi ho saka. PDF scanned/image-based ya unreadable ho sakti hai.';

          //this is fs readfile okay done

          try {
            // Pehle se saved content read karo
            const existingContent = await fs.readFile(aiFilePath, 'utf8').catch(() => '');

            if (existingContent.trim() === '') {
              // File empty hai, naya content save karo
              await fs.writeFile(aiFilePath, content, 'utf8');
            } else {
              // File mein content hai, naya content append karo
              await fs.appendFile(aiFilePath, '\n\n' + content, 'utf8');
            }

            // Updated file ka poora content dobara read karo

            // Ab poora saved content Ollama ko bhejo
            const answer = await askOllama(content, question);
            console.log("THIS IS  CONTENT ANSWER",answer);

            results.push({
              fileName: uploadedFile.originalname,
              question,
              answer,
            });
          } finally {
            // Temporary file delete karo
            await fs.unlink(uploadedFile.path).catch(() => {});
          }
        }

        return res.status(200).json({
          message: 'PDF processing complete.',
          results,
        });
      } catch (error) {
        console.error('AI processing error:', error);

        await Promise.all(uploadedFiles.map((file) => fs.unlink(file.path).catch(() => {})));

        return res.status(500).json({
          message: 'AI processing ke dauran error aaya.',
          error: error.message,
        });
      }
    
  }
}
