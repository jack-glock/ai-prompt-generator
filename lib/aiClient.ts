// 클라이언트 측 AI 호출 헬퍼.
// 실제 API 키는 서버 라우트(/api/ai/*)에서만 다루므로 이 파일은 안전합니다.

export interface TranslateResult {
  english: string;
}

export class AiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/**
 * 한글 메모를 영어로 번역합니다.
 * @throws AiError API 호출 실패 시 사용자에게 보여줄 한국어 에러 메시지를 담음
 */
export async function aiTranslateKoreanToEnglish(koreanMemo: string): Promise<TranslateResult> {
  const trimmed = koreanMemo.trim();
  if (!trimmed) {
    throw new AiError("번역할 한글 메모가 비어 있습니다.");
  }

  let res: Response;
  try {
    res = await fetch("/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ koreanMemo: trimmed }),
    });
  } catch (err) {
    throw new AiError("네트워크 오류로 AI에 연결할 수 없습니다.");
  }

  let data: { english?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new AiError(data.error ?? `AI 호출 실패 (status ${res.status}).`, res.status);
  }

  if (!data.english) {
    throw new AiError("AI가 빈 응답을 보냈습니다.");
  }

  return { english: data.english };
}

/**
 * 한글 메모 + 영어 보충 입력을 LLM이 분석해 옵션 슬롯에 자동 분배.
 * 결과는 PromptInput과 같은 구조의 부분 객체. null인 슬롯은 변경하지 않습니다.
 */
export interface AiExtractHints {
  workType?: string | null;
  style?: string | null;
  styleCustom?: string;
  aspectRatio?: string | null;
  aspectRatioCustom?: string;
  character?: Record<string, string | null | undefined>;
  background?: Record<string, string | null | undefined>;
  asset?: Record<string, string | null | undefined>;
}

export async function aiExtractOptions(
  koreanMemo: string,
  englishSupplement: string
): Promise<AiExtractHints> {
  const memo = (koreanMemo ?? "").trim();
  const eng = (englishSupplement ?? "").trim();
  if (!memo && !eng) {
    throw new AiError("분석할 입력이 비어 있습니다.");
  }

  let res: Response;
  try {
    res = await fetch("/api/ai/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ koreanMemo: memo, englishSupplement: eng }),
    });
  } catch {
    throw new AiError("네트워크 오류로 AI에 연결할 수 없습니다.");
  }

  let data: { hints?: AiExtractHints; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new AiError(data.error ?? `AI 호출 실패 (status ${res.status}).`, res.status);
  }
  if (!data.hints) {
    throw new AiError("AI가 빈 응답을 보냈습니다.");
  }
  return data.hints;
}

/**
 * 참고 이미지 1장을 Gemini Vision으로 분석.
 * 역할에 해당하는 슬롯만 채워 충돌을 막습니다.
 */
export interface AiAnalyzeImageResult {
  hints: AiExtractHints;
  description: string;
}

export async function aiAnalyzeImage(
  imageDataUrl: string,
  role: string
): Promise<AiAnalyzeImageResult> {
  if (!imageDataUrl) throw new AiError("이미지가 없습니다.");

  let res: Response;
  try {
    res = await fetch("/api/ai/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl, role }),
    });
  } catch {
    throw new AiError("네트워크 오류로 AI에 연결할 수 없습니다.");
  }

  let data: { hints?: AiExtractHints; description?: string; error?: string } = {};
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    throw new AiError(data.error ?? `AI 호출 실패 (status ${res.status}).`, res.status);
  }
  if (!data.hints) {
    throw new AiError("AI가 빈 응답을 보냈습니다.");
  }
  return { hints: data.hints, description: data.description ?? "" };
}

// AI hints를 PromptInput에 병합. 빈 문자열은 옵션 슬롯 무효화 방지를 위해 무시.
// AI가 잘못된 값(존재하지 않는 작업 유형/스타일/비율/슬롯 키)을 보내도
// 화면 상태가 깨지지 않도록 허용된 값만 반영합니다.
import type { PromptInput, WorkType } from "./promptBuilder";
import { STYLE_OPTIONS, ASPECT_RATIO_OPTIONS } from "./options";

const VALID_WORK_TYPES: readonly string[] = ["character", "background", "frame", "icon", "object"];

export function mergeAiHints(prev: PromptInput, hints: AiExtractHints): PromptInput {
  const next: PromptInput = {
    ...prev,
    character: { ...prev.character },
    background: { ...prev.background },
    asset: { ...prev.asset, rules: [...prev.asset.rules] },
    references: prev.references.map((r) => ({ ...r })),
    enabled: { ...prev.enabled },
  };

  // 작업 유형/스타일/비율은 허용된 값 목록에 있을 때만 반영
  if (hints.workType && VALID_WORK_TYPES.includes(hints.workType)) {
    next.workType = hints.workType as WorkType;
  }
  if (hints.style && STYLE_OPTIONS.some((o) => o.value === hints.style)) {
    next.style = hints.style;
  }
  if (typeof hints.styleCustom === "string") next.styleCustom = hints.styleCustom;
  if (hints.aspectRatio && ASPECT_RATIO_OPTIONS.some((o) => o.value === hints.aspectRatio)) {
    next.aspectRatio = hints.aspectRatio;
  }
  if (typeof hints.aspectRatioCustom === "string") next.aspectRatioCustom = hints.aspectRatioCustom;

  const applyGroup = <T extends object>(target: T, src?: Record<string, string | null | undefined>) => {
    if (!src) return;
    for (const [k, v] of Object.entries(src)) {
      if (v == null) continue;
      // 존재하지 않는 슬롯 키는 무시 (AI가 엉뚱한 키를 보내도 상태가 오염되지 않게)
      if (!(k in target)) continue;
      // 옵션 슬롯의 빈 문자열은 무시. *Custom 필드는 빈 문자열도 의미 있음(=입력 없음)
      if (v === "" && !k.endsWith("Custom")) continue;
      (target as any)[k] = v;
    }
  };
  applyGroup(next.character, hints.character);
  applyGroup(next.background, hints.background);
  applyGroup(next.asset, hints.asset);

  return next;
}
