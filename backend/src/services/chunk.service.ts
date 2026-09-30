export interface TextChunk {
  id: string;
  text: string;
}

export const splitTextIntoChunks = (
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): TextChunk[] => {
  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    const chunkText = text.slice(start, end);

    chunks.push({
      id: `chunk-${chunkIndex}`,
      text: chunkText,
    });

    chunkIndex++;

    // Move forward but keep overlap
    start += chunkSize - overlap;
  }

  return chunks;
};

