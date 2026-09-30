import { Request, Response } from "express";
import { storeDocumentWithChunks } from "../services/vector.service";

interface DocumentRequestBody {
  text: string;
}

export const addDocument = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("BODY:", req.body);

    const body = req.body as DocumentRequestBody | undefined;

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
      });
    }

    const { text } = body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "text is required",
      });
    }

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        message: "text cannot be empty",
      });
    }

    const result = await storeDocumentWithChunks(
      text.trim()
    );

    return res.status(201).json({
      success: true,
      message: "Document stored successfully",
      data: result,
    });

  } catch (error) {
    console.error("Document Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to store document",
    });
  }
};