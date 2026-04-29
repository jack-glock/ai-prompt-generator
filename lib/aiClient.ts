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
export async function aiAnalyzeImage(
  imageDataUrl: string,
  role: string
): Promise<AiExtractHints> {
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

  let data: { hints?: AiExtractHints; error?: string } = {};
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    throw new AiError(data.error ?? `AI 호출 실패 (status ${res.status}).`, res.status);
  }
  if (!data.hints) {
    throw new AiError("AI가 빈 응답을 보냈습니다.");
  }
  return data.hints;
}
