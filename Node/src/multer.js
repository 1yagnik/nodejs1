
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const isVercel = process.env.VERCEL === "1";

// Vercel par temporary storage; local par project ka uploads folder
const uploadDir = isVercel
  ? "/tmp/uploads"
  : path.join(process.cwd(), "uploads");

// Folder ko safely create karo
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,

  limits: {
    files: 5,
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".pdf" || file.mimetype !== "application/pdf") {
      return cb(
        new Error("Sirf PDF files upload kar sakte hain.")
      );
    }

    cb(null, true);
  }
});

export default upload;
