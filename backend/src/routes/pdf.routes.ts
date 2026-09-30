import { Router } from "express";

import {
  uploadPDF,
} from "../controllers/pdf.controller";

import {
  uploadPDFFile,
} from "../config/upload";

const router = Router();

router.post(
  "/upload",
  uploadPDFFile.single("file"),
  uploadPDF
);

export default router;
