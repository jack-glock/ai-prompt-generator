// 클라이언트 측 이미지 유틸리티.
// - 참고 이미지 dataURL을 받아 긴 쪽이 maxSize 이하가 되도록 리사이즈.
// - PNG는 PNG 유지(투명 배경 보존), JPG는 JPG 유지 (quality 0.9).
// - 이미 작은 이미지는 원본 그대로 반환.

/**
 * 이미지 dataURL을 받아 긴 쪽이 maxSize 이하가 되도록 리사이즈한 새 dataURL을 반환.
 * - 1024 이하면 원본 그대로 반환
 * - 초과면 비율 유지하면서 긴 쪽을 maxSize로 줄이기
 * - 클라이언트 환경에서만 동작 (Canvas / Image 사용)
 */
export async function resizeImageDataUrl(
  dataUrl: string,
  maxSize: number = 1024
): Promise<string> {
  if (typeof window === "undefined") return dataUrl;
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return dataUrl;

  // mime type 추출
  const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);/);
  const mime = mimeMatch?.[1]?.toLowerCase() ?? "image/png";
  const isPng = mime.includes("png");
  const outputMime = isPng ? "image/png" : "image/jpeg";
  const quality = isPng ? undefined : 0.9;

  // 이미지 로딩
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    el.src = dataUrl;
  });

  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return dataUrl;

  const longest = Math.max(w, h);
  if (longest <= maxSize) return dataUrl;

  const ratio = maxSize / longest;
  const targetW = Math.round(w * ratio);
  const targetH = Math.round(h * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0, targetW, targetH);
  try {
    return quality !== undefined
      ? canvas.toDataURL(outputMime, quality)
      : canvas.toDataURL(outputMime);
  } catch {
    return dataUrl;
  }
}
