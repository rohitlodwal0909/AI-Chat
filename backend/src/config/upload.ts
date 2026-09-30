import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads"
);

// Create uploads directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, uploadDir);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    const fileName =
      `${Date.now()}-${file.originalname}`;

    cb(null, fileName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are allowed")
    );
  }
};

export const uploadPDFFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
