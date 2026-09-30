import { Request, Response } from "express";
import fs from "fs/promises";
import pdf from "pdf-parse";

import {
  storePdfPagesWithChunks,
} from "../services/vector.service";

import {
  extractPdfPages,
} from "../services/pdf.service";

export const uploadPDF = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const fileBuffer = await fs.readFile(
      req.file.path
    );

    // Extract page-wise text
    const pages =
      await extractPdfPages(fileBuffer);

    console.log(
      "Extracted Pages:",
      pages.length
    );

    const result =
      await storePdfPagesWithChunks(
        pages,
        req.file.originalname
      );

    // Development me PDF retain karna hai
    // isliye abhi delete nahi karenge

    /*
    await fs.unlink(req.file.path);
    */

    return res.status(201).json({
      success: true,
      message:
        "PDF processed successfully",
      data: {
        fileName:
          req.file.originalname,

        totalPages:
          pages.length,

        ...result,
      },
    });
  } catch (error) {
    console.error(
      "PDF Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process PDF",
    });
  }
};