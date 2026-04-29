// 참고 이미지 1장을 Gemini Vision으로 분석.
// - 사용자가 정한 "역할"에 해당하는 옵션 슬롯만 채워서 충돌을 막는다.
// - 모델: gemini-2.5-flash (멀티모달)
// - 비용: 이미지 1장 + 시스템 프롬프트 + 응답 = 약 2~4원/회

import { NextRequest, NextResponse } from "next/server";
import {
  STYLE_OPTIONS,
  GENDER_OPTIONS,
  AGE_OPTIONS,
  BODY_OPTIONS,
  HAIR_OPTIONS,
  HAIR_MORE_OPTIONS,
  OUTFIT_OPTIONS,
  OUTFIT_MORE_OPTIONS,
  POSE_OPTIONS,
  POSE_MORE_OPTIONS,
  VISIBLE_RANGE_OPTIONS,
  VISIBLE_RANGE_MORE_OPTIONS,
  VIEW_ANGLE_OPTIONS,
  VIEW_ANGLE_MORE_OPTIONS,
  CHARACTER_DIRECTION_OPTIONS,
  CHARACTER_DIRECTION_MORE_OPTIONS,
  PLACE_OPTIONS,
  PLACE_MORE_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  DEPTH_OPTIONS,
  COMPLEXITY_OPTIONS,
  LAYOUT_OPTIONS,
  BG_VIEW_ANGLE_OPTIONS,
  BG_VISIBLE_RANGE_OPTIONS,
  SURFACE_OPTIONS,
  OptionItem,
} from "@/lib/options";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function valuesOf(opts: OptionItem[], more?: OptionItem[]): string {
  const all = more ? [...opts, ...more] : opts;
  return all
    .filter((o) => o.value !== "auto" && o.value !== "custom")
    .map((o) => o.value)
    .join(" | ");
}

/**
 * 역할별로 채울 슬롯과 그 슬롯의 가능한 value 목록을 반환합니다.
 * 다른 역할의 슬롯은 분석 결과에 포함되지 않아 충돌이 일어나지 않습니다.
 */
function slotsForRole(role: string): { description: string; slots: string } {
  switch (role) {
    case "style":
      return {
        description: "Extract ONLY the visual style of the image.",
        slots: `style: ${valuesOf(STYLE_OPTIONS)}`,
      };
    case "character":
      return {
        description: "Extract ONLY the character's identity (gender/age/body/hair/outfit).",
        slots: [
          `character.gender: ${valuesOf(GENDER_OPTIONS)}`,
          `character.ageRange: ${valuesOf(AGE_OPTIONS)}`,
          `character.bodyType: ${valuesOf(BODY_OPTIONS)}`,
          `character.hair: ${valuesOf(HAIR_OPTIONS, HAIR_MORE_OPTIONS)}`,
          `character.outfit: ${valuesOf(OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS)}`,
        ].join("\n"),
      };
    case "outfit":
      return {
        description: "Extract ONLY the outfit/clothing.",
        slots: `character.outfit: ${valuesOf(OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS)}`,
      };
    case "pose":
      return {
        description: "Extract ONLY the pose/action and character orientation.",
        slots: [
          `character.pose: ${valuesOf(POSE_OPTIONS, POSE_MORE_OPTIONS)}`,
          `character.characterDirection: ${valuesOf(CHARACTER_DIRECTION_OPTIONS, CHARACTER_DIRECTION_MORE_OPTIONS)}`,
        ].join("\n"),
      };
    case "composition":
      return {
        description: "Extract ONLY composition: viewing angle, visible range, layout.",
        slots: [
          `character.visibleRange: ${valuesOf(VISIBLE_RANGE_OPTIONS, VISIBLE_RANGE_MORE_OPTIONS)}`,
          `character.viewingAngle: ${valuesOf(VIEW_ANGLE_OPTIONS, VIEW_ANGLE_MORE_OPTIONS)}`,
          `background.layout: ${valuesOf(LAYOUT_OPTIONS)}`,
          `background.viewingAngle: ${valuesOf(BG_VIEW_ANGLE_OPTIONS)}`,
          `background.visibleRange: ${valuesOf(BG_VISIBLE_RANGE_OPTIONS)}`,
        ].join("\n"),
      };
    case "color":
      return {
        description: "Extract ONLY the color palette / tonal mood.",
        slots: `background.colorPalette: ${valuesOf(COLOR_PALETTE_OPTIONS)}`,
      };
    case "background":
      return {
        description: "Extract ONLY the background scene (place, time of day, mood, lighting, depth, complexity).",
        slots: [
          `background.place: ${valuesOf(PLACE_OPTIONS, PLACE_MORE_OPTIONS)}`,
          `background.timeOfDay: ${valuesOf(TIME_OF_DAY_OPTIONS)}`,
          `background.mood: ${valuesOf(MOOD_OPTIONS)}`,
          `background.lighting: ${valuesOf(LIGHTING_OPTIONS)}`,
          `background.depth: ${valuesOf(DEPTH_OPTIONS)}`,
          `background.complexity: ${valuesOf(COMPLEXITY_OPTIONS)}`,
        ].join("\n"),
      };
    case "material":
      return {
        description: "Extract ONLY the surface/material quality.",
        slots: `asset.surface: ${valuesOf(SURFACE_OPTIONS)}`,
      };
    default:
      return {
        description: "Extract general visual information.",
        slots: `style: ${valuesOf(STYLE_OPTIONS)}`,
      };
  }
}

const ROLE_LABEL_KO: Record<string, string> = {
  style: "스타일 참고",
  composition: "구도 참고",
  color: "색감 참고",
  character: "캐릭터 참고",
  pose: "포즈 참고",
  material: "재질 참고",
  outfit: "의상 참고",
  background: "배경 참고",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: { imageDataUrl?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const role = (body.role ?? "style").toString();
  const dataUrl = (body.imageDataUrl ?? "").toString();
  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "올바른 이미지가 아닙니다." }, { status: 400 });
  }

  // dataURL 파싱: "data:image/jpeg;base64,XXXX..."
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "이미지 형식을 인식할 수 없습니다." }, { status: 400 });
  }
  const mimeType = match[1];
  const base64 = match[2];
  // 5MB 이내로만 허용 (대략, base64 길이 기준)
  if (base64.length > 7_000_000) {
    return NextResponse.json({ error: "이미지가 너무 큽니다 (5MB 이내)." }, { status: 400 });
  }

  const { description, slots } = slotsForRole(role);

  const systemPrompt = `You are a vision-based option extractor for a game art prompt tool.
The user gave you an image with the role: "${role}" (${ROLE_LABEL_KO[role] ?? role}).

${description}

Rules:
1. Output ONLY a JSON object with the slot values listed below.
2. For each slot, choose the EXACT value from the list if the image clearly shows it.
3. If the image shows something not in the list (e.g. "red hair" when only standard colors exist), set the slot to "custom" and put a concise English phrase in the corresponding *Custom field.
4. If the image doesn't clearly show a slot, leave the slot value as null and *Custom as "".
5. Do NOT include slots NOT listed below — they belong to other roles.
6. Do NOT mention specific brand names, game titles, or real artist names.

Slots to fill (only these):
${slots}

Output JSON keys must follow the dotted path (e.g. "character.hair") and each path must come with a paired "*Custom" key (e.g. "character.hairCustom"). Use null for the value when unclear and "" for *Custom.

Example output shape:
{
  "character.hair": "long" | "custom" | null,
  "character.hairCustom": "red hair" | ""
}

JSON:`;

  try {
    const upstream = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Vision analyze error:", upstream.status, errText);
      return NextResponse.json(
        { error: `AI 호출 실패 (status ${upstream.status}). API 키와 사용량을 확인해 주세요.` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      return NextResponse.json({ error: "AI가 빈 응답을 보냈습니다." }, { status: 502 });
    }

    let flat: Record<string, string | null>;
    try {
      flat = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI 응답을 파싱할 수 없습니다." }, { status: 502 });
    }

    // dotted path 응답을 nested hints 구조로 변환 (AiExtractHints 호환)
    const hints: Record<string, unknown> = {
      character: {} as Record<string, string | null>,
      background: {} as Record<string, string | null>,
      asset: {} as Record<string, string | null>,
    };
    for (const [path, value] of Object.entries(flat)) {
      if (value == null || value === "") continue;
      const parts = path.split(".");
      if (parts.length === 1) {
        hints[parts[0]] = value;
      } else if (parts.length === 2) {
        const [group, slot] = parts;
        if (group === "character" || group === "background" || group === "asset") {
          (hints[group] as Record<string, string>)[slot] = value as string;
        } else {
          hints[parts[0] + "." + parts[1]] = value;
        }
      }
    }

    return NextResponse.json({ hints, role });
  } catch (err) {
    console.error("Analyze image route exception:", err);
    return NextResponse.json(
      { error: "AI 호출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
