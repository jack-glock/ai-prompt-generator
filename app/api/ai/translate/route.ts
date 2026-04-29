// 한글 메모를 영어로 번역하는 서버 라우트.
// API 키(GEMINI_API_KEY)는 서버 측에서만 사용되며 클라이언트 번들에 노출되지 않습니다.
// 사용 모델: gemini-2.5-flash (멀티모달, 비용/성능 균형)
// 비용: 입력 $0.30/1M, 출력 $2.50/1M tokens — 1회 호출 약 1~2원

import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 한국어 입력의 최대 길이. 너무 큰 입력은 거절.
const MAX_INPUT_CHARS = 5000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요." },
      { status: 500 }
    );
  }

  let body: { koreanMemo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const koreanMemo = (body.koreanMemo ?? "").trim();
  if (!koreanMemo) {
    return NextResponse.json({ error: "한글 메모가 비어 있습니다." }, { status: 400 });
  }
  if (koreanMemo.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `입력이 너무 깁니다. ${MAX_INPUT_CHARS}자 이내로 줄여 주세요.` },
      { status: 400 }
    );
  }

  // 시스템 프롬프트 — 영어 이미지 생성 프롬프트로 자연스러운 번역.
  // 디테일 보존이 최우선. 짧게 만들지 말 것.
  const systemPrompt = [
    "You are a translator that converts Korean memos into natural English",
    "specifically for AI image generation prompts (game art, illustration).",
    "",
    "Rules:",
    "- Output ONLY the English translation. No explanation, no quotes, no extra text.",
    "- PRESERVE ALL visual details from the Korean memo: clothing, colors, props, accessories, pose, action, expression, viewing angle, body orientation, atmosphere, etc.",
    "- Use descriptive comma-separated phrases suitable for image generation prompts.",
    "- Do NOT compress or omit details to be brief — every visual element matters.",
    "- Do NOT invent details that are not in the Korean memo.",
    "- Do NOT include any Korean characters in the output.",
    "- Do NOT mention specific brand names, game titles, or real artist names.",
    "",
    "Korean memo:",
    `"""${koreanMemo}"""`,
    "",
    "English translation:",
  ].join("\n");

  try {
    const upstream = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Gemini API error:", upstream.status, errText);
      return NextResponse.json(
        { error: `AI 호출 실패 (status ${upstream.status}). API 키와 사용량 한도를 확인해 주세요.` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    let text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "";
    text = text.trim().replace(/^["']|["']$/g, "");

    if (!text) {
      return NextResponse.json(
        { error: "AI가 빈 응답을 보냈습니다. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({ english: text });
  } catch (err) {
    console.error("Translate route exception:", err);
    return NextResponse.json(
      { error: "AI 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
