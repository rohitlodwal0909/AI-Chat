import { chromaClient } from "../config/chroma";

export const keywordSearch = async (
  query: string,
  limit: number = 5
) => {
  const collection =
    await chromaClient.getOrCreateCollection({
      name: "documents_v2",
      embeddingFunction: null,
      metadata: {
      "hnsw:space": "cosine",
    },

    });

  const results = await collection.get({
    include: ["documents", "metadatas"],
  });

  const documents = results.documents || [];
  const metadatas = results.metadatas || [];

  const searchTerm = query.toLowerCase();

  const matchedResults = documents
    .map((document, index) => ({
      document,
      metadata: metadatas[index],
    }))
    .filter((item) =>
      item.document
        ?.toLowerCase()
        .includes(searchTerm)
    )
    .slice(0, limit);

  return matchedResults;
};