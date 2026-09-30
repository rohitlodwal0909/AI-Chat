import { searchEmbeddings } from "./vector.service";
import { generateAIResponse } from "./ai.service";

export const generateRAGResponse = async (
  question: string
) => {

  // 1. Search relevant PDF chunks
  const results = await searchEmbeddings(question,10);

  console.log(
    "RAG SEARCH RESULTS:",
    JSON.stringify(results, null, 2)
  );

  // 2. No relevant data
  if (!results.length) {
    return {
      answer:
        "I could not find relevant information in the uploaded documents.",
      sources: [],
    };
  }

  // 3. Convert search results into context
  const context = results
    .map((item, index) => {
      return `
SOURCE ${index + 1}
File: ${item.metadata?.source}

Content:
${item.document}
`;
    })
    .join("\n\n");

  console.log(
    "RAG CONTEXT:",
    context
  );

  // 4. Create prompt
  const prompt = `
You are a helpful AI assistant.

Answer the user's question using the provided document context.

IMPORTANT RULES:
- Use the document context as the primary source.
- Do not invent information.
- If the answer is not present in the context, clearly say:
  "I could not find this information in the uploaded document."
- Give a clear and concise answer.
- Do not mention embeddings, vectors, ChromaDB or internal implementation.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}
`;

  // 5. Send context to LLM
  const answer = await generateAIResponse([
    {
      role: "user",
      content: prompt,
    },
  ]);

  // 6. Return answer + sources
  return {
    answer,
    sources: results.map((item) => ({
      source: item.metadata?.source,
      chunkIndex: item.metadata?.chunkIndex,
      distance: item.distance,
    })),
  };
};