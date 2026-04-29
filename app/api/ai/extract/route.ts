// 한글 메모 + 영어 보충 입력을 LLM으로 분석해 옵션 슬롯에 자동 분배.
// - 정해진 옵션 값에 정확히 매칭되면 그 value를 선택
// - 매칭 안 되면 'custom'으로 두고 영어 표현을 *Custom 필드에 채움
// - 모호하면 null로 두어 사용자가 직접 채우게 함
// 모델: gemini-2.5-flash, JSON 응답 강제

import { NextRequest, NextResponse } from "next/server";
import {
  WORK_TYPE_OPTIONS,
  STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
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
  CHARACTER_SHEET_OPTIONS,
  CHARACTER_SHEET_MORE_OPTIONS,
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
  SHAPE_OPTIONS,
  SURFACE_OPTIONS,
  DIMENSION_OPTIONS,
  DECORATION_LEVEL_OPTIONS,
  BG_TREATMENT_OPTIONS,
  OptionItem,
} from "@/lib/options";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_INPUT_CHARS = 5000;

function valuesOf(opts: OptionItem[], more?: OptionItem[]): string {
  const all = more ? [...opts, ...more] : opts;
  return all
    .filter((o) => o.value !== "auto" && o.value !== "custom")
    .map((o) => o.value)
    .join(" | ");
}

function buildSlotMap(): string {
  return [
    `workType: ${valuesOf(WORK_TYPE_OPTIONS)}`,
    `style: ${valuesOf(STYLE_OPTIONS)}`,
    `aspectRatio: ${valuesOf(ASPECT_RATIO_OPTIONS)}`,
    ``,
    `character.gender: ${valuesOf(GENDER_OPTIONS)}`,
    `character.ageRange: ${valuesOf(AGE_OPTIONS)}`,
    `character.bodyType: ${valuesOf(BODY_OPTIONS)}`,
    `character.hair: ${valuesOf(HAIR_OPTIONS, HAIR_MORE_OPTIONS)}`,
    `character.outfit: ${valuesOf(OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS)}`,
    `character.pose: ${valuesOf(POSE_OPTIONS, POSE_MORE_OPTIONS)}`,
    `character.visibleRange: ${valuesOf(VISIBLE_RANGE_OPTIONS, VISIBLE_RANGE_MORE_OPTIONS)}`,
    `character.viewingAngle: ${valuesOf(VIEW_ANGLE_OPTIONS, VIEW_ANGLE_MORE_OPTIONS)}`,
    `character.characterDirection: ${valuesOf(CHARACTER_DIRECTION_OPTIONS, CHARACTER_DIRECTION_MORE_OPTIONS)}`,
    `character.characterSheet: ${valuesOf(CHARACTER_SHEET_OPTIONS, CHARACTER_SHEET_MORE_OPTIONS)}`,
    ``,
    `background.place: ${valuesOf(PLACE_OPTIONS, PLACE_MORE_OPTIONS)}`,
    `background.timeOfDay: ${valuesOf(TIME_OF_DAY_OPTIONS)}`,
    `background.mood: ${valuesOf(MOOD_OPTIONS)}`,
    `background.lighting: ${valuesOf(LIGHTING_OPTIONS)}`,
    `background.colorPalette: ${valuesOf(COLOR_PALETTE_OPTIONS)}`,
    `background.depth: ${valuesOf(DEPTH_OPTIONS)}`,
    `background.complexity: ${valuesOf(COMPLEXITY_OPTIONS)}`,
    `background.layout: ${valuesOf(LAYOUT_OPTIONS)}`,
    `background.viewingAngle: ${valuesOf(BG_VIEW_ANGLE_OPTIONS)}`,
    `background.visibleRange: ${valuesOf(BG_VISIBLE_RANGE_OPTIONS)}`,
    ``,
    `asset.shape: ${valuesOf(SHAPE_OPTIONS)}`,
    `asset.surface: ${valuesOf(SURFACE_OPTIONS)}`,
    `asset.dimension: ${valuesOf(DIMENSION_OPTIONS)}`,
    `asset.decorationLevel: ${valuesOf(DECORATION_LEVEL_OPTIONS)}`,
    `asset.backgroundTreatment: ${valuesOf(BG_TREATMENT_OPTIONS)}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: { koreanMemo?: string; englishSupplement?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const memo = (body.koreanMemo ?? "").trim();
  const eng = (body.englishSupplement ?? "").trim();
  if (!memo && !eng) {
    return NextResponse.json({ error: "분석할 입력이 비어 있습니다." }, { status: 400 });
  }
  if (memo.length + eng.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `입력이 너무 깁니다. ${MAX_INPUT_CHARS}자 이내로 줄여 주세요.` },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an option extractor for a game art prompt tool.
Read the user input (Korean memo + English supplement) and decide which options to fill.

Rules:
1. For each slot, choose the EXACT value from the list below if the input clearly indicates it.
2. If the input mentions something that doesn't match any value (e.g. "red hair" when only standard colors exist), set the slot to "custom" and put a concise English phrase in the corresponding *Custom field (e.g. hair: "custom", hairCustom: "red hair").
3. If the input doesn't mention a slot at all, set the slot value to JSON null (NOT empty string "") and the *Custom to "".
4. NEVER use empty string "" for slot values. Always use null when nothing is specified.
5. Do NOT invent details not present in the input.
6. Do NOT mention specific brand names, game titles, or real artist names in any *Custom field.
7. Output ONLY valid JSON matching the schema below. No prose.

Available slot values:
${buildSlotMap()}

Output JSON shape (omit nothing, use null for unspecified slots):
{
  "workType": "character" | "background" | "frame" | "icon" | "object" | null,
  "style": string | null,
  "styleCustom": string,
  "aspectRatio": string | null,
  "aspectRatioCustom": string,
  "character": {
    "gender": string | null, "genderCustom": string,
    "ageRange": string | null, "ageRangeCustom": string,
    "bodyType": string | null, "bodyTypeCustom": string,
    "hair": string | null, "hairCustom": string,
    "outfit": string | null, "outfitCustom": string,
    "pose": string | null, "poseCustom": string,
    "visibleRange": string | null, "visibleRangeCustom": string,
    "viewingAngle": string | null, "viewingAngleCustom": string,
    "characterDirection": string | null, "characterDirectionCustom": string,
    "characterSheet": string | null, "characterSheetCustom": string
  },
  "background": {
    "place": string | null, "placeCustom": string,
    "timeOfDay": string | null, "timeOfDayCustom": string,
    "mood": string | null, "moodCustom": string,
    "lighting": string | null, "lightingCustom": string,
    "colorPalette": string | null, "colorPaletteCustom": string,
    "depth": string | null, "depthCustom": string,
    "complexity": string | null, "complexityCustom": string,
    "layout": string | null, "layoutCustom": string,
    "viewingAngle": string | null, "viewingAngleCustom": string,
    "visibleRange": string | null, "visibleRangeCustom": string
  },
  "asset": {
    "shape": string | null, "shapeCustom": string,
    "surface": string | null, "surfaceCustom": string,
    "dimension": string | null, "dimensionCustom": string,
    "decorationLevel": string | null, "decorationLevelCustom": string,
    "backgroundTreatment": string | null, "backgroundTreatmentCustom": string
  }
}

User input:
Korean memo: """${memo || "(empty)"}"""
English supplement: """${eng || "(empty)"}"""

JSON:`;

  try {
    const upstream = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Gemini extract error:", upstream.status, errText);
      return NextResponse.json(
        { error: `AI 호출 실패 (status ${upstream.status}). API 키와 사용량 한도를 확인해 주세요.` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      return NextResponse.json({ error: "AI가 빈 응답을 보냈습니다." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI 응답을 파싱할 수 없습니다." }, { status: 502 });
    }

    return NextResponse.json({ hints: parsed });
  } catch (err) {
    console.error("Extract route exception:", err);
    return NextResponse.json(
      { error: "AI 호출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
