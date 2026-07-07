import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    // Strip control characters PDF extraction sometimes leaves behind (form
    // feeds, null bytes, etc.) — left in, they can end up quoted verbatim
    // inside a JSON string an AI feature generates and break JSON.parse.
    return result.text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
  } finally {
    await parser.destroy();
  }
}
