export type DecodeHit = {
  text: string;
  format: string;
};

async function decodeWithBarcodeDetector(
  bitmap: ImageBitmap,
): Promise<DecodeHit[] | null> {
  const Detector = (
    globalThis as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => {
        detect: (source: ImageBitmap) => Promise<Array<{ rawValue: string; format: string }>>;
      };
    }
  ).BarcodeDetector;
  if (!Detector) return null;
  try {
    const detector = new Detector({ formats: ["qr_code"] });
    const codes = await detector.detect(bitmap);
    if (!codes.length) return [];
    return codes.map((c) => ({ text: c.rawValue, format: c.format }));
  } catch {
    return null;
  }
}

async function decodeWithJsQr(imageData: ImageData): Promise<DecodeHit[]> {
  const { default: jsQR } = await import("jsqr");
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ? [{ text: result.data, format: "qr_code" }] : [];
}

export async function decodeImageFile(file: File): Promise<DecodeHit[]> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be 10 MB or smaller.");
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (file.type && !allowed.includes(file.type)) {
    throw new Error("Use JPEG, PNG, WebP, or GIF.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const detected = await decodeWithBarcodeDetector(bitmap);
    if (detected && detected.length) return detected;
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const fallback = await decodeWithJsQr(imageData);
    if (fallback.length) return fallback;
    return detected ?? [];
  } finally {
    bitmap.close();
  }
}

export async function decodeVideoFrame(video: HTMLVideoElement): Promise<DecodeHit[]> {
  if (!video.videoWidth) return [];
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(video, 0, 0);
  try {
    const bitmap = await createImageBitmap(canvas);
    try {
      const detected = await decodeWithBarcodeDetector(bitmap);
      if (detected && detected.length) return detected;
    } finally {
      bitmap.close();
    }
  } catch {
    /* fall through to jsQR */
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return decodeWithJsQr(imageData);
}
