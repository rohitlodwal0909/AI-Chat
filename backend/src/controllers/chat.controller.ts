import { Request, Response } from "express";

import {
  generateAIResponse,
  ChatMessage,
} from "../services/ai.service";

import {
  searchEmbeddings,
  hybridSearch
} from "../services/vector.service";
// import hybridSearch = require("../services/vector.service");

interface ChatRequestBody {
  message: ChatMessage[];
}

export const chatController = async (
  req: Request,
  res: Response
) => {
  try {
    const { message } =
      req.body as ChatRequestBody;

    // 1. Validate message
    if (!message || !Array.isArray(message)) {
      return res.status(400).json({
        success: false,
        message: "message array is required",
      });
    }

    if (message.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one message is required",
      });
    }

    // 2. Get last user message
    const lastMessage =
      message[message.length - 1];

    const question =
      lastMessage.content.trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question cannot be empty",
      });
    }

    console.log("USER QUESTION:", question);

    // 3. Search relevant PDF chunks
    // const results = await searchEmbeddings(question,10);

    const results =
  await hybridSearch(
    question,
    15,
    6
  );

    console.log("SEARCH RESULTS:",JSON.stringify(results,null,2));

    // 4. Convert search results into context
const context =
  results
    .map((item, index) => {
      return `
========== SOURCE ${index + 1} ==========

File:
${item.metadata?.source}

Page:
${item.metadata?.pageNumber}

Chunk:
${item.metadata?.chunkIndex}

Content:
${item.document}
`;
    })
    .join("\n\n");
    

    // 5. Create RAG system prompt
const ragMessages: ChatMessage[] = [
  {
    role: "system",
    content: `
You are an AI document analysis assistant.

Answer the user's question using the
provided document context.

DOCUMENT CONTEXT:
${context}

RULES:

1. Analyze all relevant chunks.

2. Combine information from multiple pages
   when required.

3. Do not rely only on the first result.

4. Do not invent information.

5. Use exact names, dates and numbers
   from the document.

6. If possible, mention the source page
   in the answer.

7. If information is not available,
   say:
   "I could not find this information
   in the uploaded document."

8. Do not mention embeddings,
   ChromaDB or internal RAG implementation.
`,
  },

  ...message,
];

    // 6. Generate AI response
    const answer =
      await generateAIResponse(
        ragMessages
      );

    // 7. Return response
    return res.status(200).json({
      success: true,
      data: {
        answer,
        sources: results.map(
          (item) => ({
            source:
              item.metadata?.source,
            chunkIndex:
              item.metadata?.chunkIndex,
            distance:
              item.distance,
          })
        ),
      },
    });

  } catch (error) {
    console.error(
      "Chat Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};