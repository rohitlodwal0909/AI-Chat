import { chromaClient } from "../config/chroma";
import { generateEmbedding } from "./embedding.service";
import { randomUUID } from "crypto";
import { createEmbedding } from "./embedding.service";
import { splitTextIntoChunks } from "./chunk.service";


interface PdfPage {
  pageNumber: number;
  text: string;
}

export interface SearchResult {
  document: string;
  distance: number;
  metadata: {
    documentId?: string;
    source?: string;
    pageNumber?: number;
    chunkIndex?: number;
  };
}

export const storePdfPagesWithChunks = async (
  pages: PdfPage[],
  source: string
) => {
  const collection =
    await chromaClient.getOrCreateCollection({
      name: "documents_v2",
      embeddingFunction: null,
      metadata: {
        "hnsw:space": "cosine",
      },
    });

  const documentId = randomUUID();

  const ids: string[] = [];
  const documents: string[] = [];
  const embeddings: number[][] = [];

  const metadatas: {
    documentId: string;
    source: string;
    pageNumber: number;
    chunkIndex: number;
  }[] = [];

  let totalChunks = 0;

  for (const page of pages) {
    if (!page.text.trim()) {
      continue;
    }

    const chunks = splitTextIntoChunks(
      page.text,
      500,
      50
    );

    for (
      let chunkIndex = 0;
      chunkIndex < chunks.length;
      chunkIndex++
    ) {
      const chunk = chunks[chunkIndex];

      const embedding =
        await generateEmbedding(chunk.text);

      const id =
        `${documentId}-page-${page.pageNumber}-chunk-${chunkIndex}`;

      ids.push(id);

      documents.push(chunk.text);

      embeddings.push(embedding);

      metadatas.push({
        documentId,
        source,
        pageNumber: page.pageNumber,
        chunkIndex,
      });

      totalChunks++;
    }
  }

  if (ids.length === 0) {
    throw new Error(
      "No text chunks found in PDF"
    );
  }

  await collection.add({
    ids,
    documents,
    embeddings,
    metadatas,
  });

  return {
    documentId,
    source,
    totalPages: pages.length,
    totalChunks,
  };
};

export const storeEmbedding = async (
  id: string,
  text: string
) => {
  const collection = await chromaClient.getOrCreateCollection({
    name: "documents_v2",
    embeddingFunction: null,
    metadata: {
      "hnsw:space": "cosine",
    },

  });

  const embedding = await generateEmbedding(text);

  await collection.add({
    ids: [id],
    documents: [text],
    embeddings: [embedding],
  });

  return {
    id,
    text,
    dimensions: embedding.length,
  };
};

export const storeDocumentWithChunks = async (
  text: string,
  source: string = "manual"
) => {
  const collection =
    await chromaClient.getOrCreateCollection({
      name: "documents_v2",
      embeddingFunction: null,
      metadata: {
        "hnsw:space": "cosine",
      },
    });

  const chunks = splitTextIntoChunks(
    text,
    1000,
    150
  );

  console.log("Total chunks:", chunks.length);

  const documentId = randomUUID();

  const ids: string[] = [];
  const documents: string[] = [];
  const embeddings: number[][] = [];

  const metadatas: {
    documentId: string;
    chunkIndex: number;
    source: string;
  }[] = [];

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];

    console.log(
      `Embedding chunk ${index + 1}/${chunks.length}`
    );

    const embedding = await generateEmbedding(
      chunk.text
    );

    ids.push(
      `${documentId}-${chunk.id}`
    );

    documents.push(chunk.text);

    embeddings.push(embedding);

    metadatas.push({
      documentId,
      chunkIndex: index,
      source,
    });
  }

  await collection.add({
    ids,
    documents,
    embeddings,
    metadatas,
  });

  console.log(
    `Stored ${chunks.length} chunks in ChromaDB`
  );

  return {
    documentId,
    source,
    totalChunks: chunks.length,
  };
};

const calculateKeywordScore = (
  query: string,
  document: string
) => {
  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) => word.length > 2
    );

  const documentText =
    document.toLowerCase();

  let matches = 0;

  for (const word of queryWords) {
    if (
      documentText.includes(word)
    ) {
      matches++;
    }
  }

  return matches;
};

const removeDuplicateResults = (
  results: any[]
) => {
  const seen = new Set<string>();

  return results.filter(
    (item) => {
      const documentId =
        item.metadata?.documentId ??
        "unknown";

      const chunkIndex =
        item.metadata?.chunkIndex ??
        "unknown";

      const key =
        `${documentId}-${chunkIndex}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
};

const rerankResults = (
  query: string,
  results: any[]
) => {
  return results
    .map((item) => {
      const keywordScore =
        calculateKeywordScore(
          query,
          item.document
        );

      /*
       * Lower cosine distance means
       * more similar.
       *
       * Convert distance into
       * a similarity-like score.
       */
      const vectorScore =
        1 / (1 + item.distance);

      /*
       * Hybrid score
       */
      const finalScore =
        vectorScore * 0.7 +
        keywordScore * 0.3;

      return {
        ...item,
        keywordScore,
        vectorScore,
        finalScore,
      };
    })
    .sort(
      (a, b) =>
        b.finalScore -
        a.finalScore
    );
};

export const hybridSearch = async (
  query: string,
  candidateLimit: number = 15,
  finalLimit: number = 6
) => {
  console.log(
    "\n=============================="
  );

  console.log(
    "HYBRID SEARCH QUERY:",
    query
  );

  console.log(
    "=============================="
  );

  // 1. Vector search
  const vectorResults =
    await searchEmbeddings(
      query,
      candidateLimit
    );

  console.log(
    "Vector Results:",
    vectorResults.length
  );

  // 2. Remove duplicates
  const uniqueResults =
    removeDuplicateResults(
      vectorResults
    );

  console.log(
    "Unique Results:",
    uniqueResults.length
  );

  // 3. Re-rank
  const rankedResults =
    rerankResults(
      query,
      uniqueResults
    );

  // 4. Final results
  const finalResults =
    rankedResults.slice(
      0,
      finalLimit
    );

  console.log(
    "\n========== FINAL RESULTS =========="
  );

  finalResults.forEach(
    (item, index) => {
      console.log(
        `\n#${index + 1}`
      );

      console.log(
        "Source:",
        item.metadata?.source
      );

      console.log(
        "Chunk:",
        item.metadata?.chunkIndex
      );

      console.log(
        "Distance:",
        item.distance
      );

      console.log(
        "Keyword Score:",
        item.keywordScore
      );

      console.log(
        "Vector Score:",
        item.vectorScore
      );

      console.log(
        "Final Score:",
        item.finalScore
      );

      console.log(
        "Text:",
        item.document.substring(
          0,
          300
        )
      );
    }
  );

  return finalResults;
};

export const searchEmbeddings = async (
  query: string,
  limit: number = 15
) => {
  const collection =
    await chromaClient.getOrCreateCollection({
      name: "documents_v2",
      embeddingFunction: null,
      metadata: {
        "hnsw:space": "cosine",
      },
    });

  const queryEmbedding =
    await generateEmbedding(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    include: [
      "documents",
      "metadatas",
      "distances",
    ],
  });

  const documents =
    results.documents?.[0] ?? [];

  const distances =
    results.distances?.[0] ?? [];

  const metadatas =
    results.metadatas?.[0] ?? [];

  return documents.map(
    (document, index) => ({
      document,
      distance:
        distances[index] ?? 1,
      metadata:
        metadatas[index] ?? {},
    })
  );
};
