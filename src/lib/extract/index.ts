"use client";

// Text extraction: PDF (pdfjs-dist) + Image OCR (tesseract.js) + paste.
// Everything runs client-side. No backend, no API.

export type ProgressFn = (stage: string, pct: number) => void;

// ---------- PDF ----------
type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
};

function groupItemsIntoLines(items: PdfTextItem[]): string[] {
  if (!items.length) return [];
  // Sort top-to-bottom (descending y), then left-to-right (ascending x).
  const sorted = [...items].sort((a, b) => {
    const ya = a.transform[5];
    const yb = b.transform[5];
    if (Math.abs(ya - yb) > 3) return yb - ya;
    return a.transform[4] - b.transform[4];
  });

  const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const it of sorted) {
    if (!it.str) continue;
    const y = it.transform[5];
    const x = it.transform[4];
    // find an existing line within tolerance
    const line = lines.find((l) => Math.abs(l.y - y) <= 3);
    if (line) {
      line.parts.push({ x, str: it.str });
    } else {
      lines.push({ y, parts: [{ x, str: it.str }] });
    }
  }

  return lines.map((l) => {
    l.parts.sort((a, b) => a.x - b.x);
    // join with spaces, collapsing multiple spaces
    return l.parts
      .map((p) => p.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  });
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: ProgressFn,
): Promise<string> {
  onProgress?.("Loading PDF engine", 5);
  const pdfjsLib: typeof import("pdfjs-dist") = await import("pdfjs-dist");
  // Worker is served from /public so it runs fully offline and same-origin.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  onProgress?.("Reading file", 15);
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(
      `Extracting page ${i} of ${pdf.numPages}`,
      15 + Math.round((i / pdf.numPages) * 75),
    );
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as unknown as PdfTextItem[];
    const lines = groupItemsIntoLines(items);
    fullText += lines.join("\n") + "\n\n";
  }

  onProgress?.("Finalizing", 95);
  await pdf.cleanup();
  return fullText.trim();
}

// ---------- Image OCR ----------
export async function extractTextFromImage(
  file: File,
  onProgress?: ProgressFn,
): Promise<string> {
  onProgress?.("Loading OCR engine", 5);
  const { createWorker } = await import("tesseract.js");
  // createWorker(lang) loads the eng traineddata. Processing is fully local.
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.("Running OCR", 20 + Math.round(m.progress * 70));
      } else if (m.status === "loading language traineddata") {
        onProgress?.("Loading language model", 10 + Math.round(m.progress * 10));
      }
    },
  });
  try {
    const { data } = await worker.recognize(file);
    onProgress?.("Finalizing", 95);
    return (data.text || "").trim();
  } finally {
    await worker.terminate();
  }
}

// ---------- Dispatcher ----------
export async function extractText(
  file: File,
  onProgress?: ProgressFn,
): Promise<{ text: string; sourceType: "pdf" | "image" }> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    const text = await extractTextFromPdf(file, onProgress);
    return { text, sourceType: "pdf" };
  }
  if (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|bmp|gif)$/i.test(name)
  ) {
    const text = await extractTextFromImage(file, onProgress);
    return { text, sourceType: "image" };
  }
  // Fallback: try reading as text
  const text = await file.text();
  return { text, sourceType: "image" };
}
