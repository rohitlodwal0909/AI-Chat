export interface PdfPage {
  pageNumber: number;
  text: string;
}

const cleanPdfText = (text: string): string => {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const extractPdfPages = async (
  buffer: Buffer
): Promise<PdfPage[]> => {
  const pdfjsLib = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdf = await loadingTask.promise;

  console.log("Total PDF Pages:", pdf.numPages);

  const pages: PdfPage[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const textContent =
      await page.getTextContent();

    const text = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");

    const cleanedText = cleanPdfText(text);

    pages.push({
      pageNumber,
      text: cleanedText,
    });

    console.log(
      `Page ${pageNumber}: ${cleanedText.length} characters`
    );
  }

  return pages;
};