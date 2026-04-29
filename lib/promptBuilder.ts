// 프롬프트 빌더 (v0.6 재구조화)
// - 작업 유형 5종(character/background/frame/icon/object)
// - 한글 자유입력은 "원본 한글 메모"로만 노출되고, 최종 영어 프롬프트에는
//   절대 포함되지 않습니다.
// - 영어 보충 입력은 모든 모델 프롬프트에 그대로 반영됩니다.
// - 옵션은 한글 라벨로 UI에 표시되고, 영어 표현은 lib/options.ts에서 가져옵니다.
// - API 미사용. 키워드 매칭으로만 자동 정리(lib/keywordExtract.ts).

import {
  ModelKey,
  WORK_TYPE_OPTIONS,
  WORK_TYPE_KEYWORD,
  STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  NEGATIVE_OPTIONS,
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
  CHARACTER_SHEET_EXTRA_KEYWORDS,
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
  ASSET_RULES_OPTIONS,
  ASSET_TYPE_EXTRA,
  REFERENCE_ROLE_OPTIONS,
  REFERENCE_ROLE_SENTENCE,
  REFERENCE_ROLE_MJ_PARAM,
  REFERENCE_ROLE_NIJI_PARAM,
  resolveOptionEn,
  resolveOptionLabel,
  containsKorean,
  OptionItem,
} from "./options";

export type WorkType = "character" | "background" | "frame" | "icon" | "object";

export interface CharacterInput {
  gender: string;
  genderCustom: string;
  ageRange: string;
  ageRangeCustom: string;
  bodyType: string;
  bodyTypeCustom: string;
  hair: string;
  hairCustom: string;
  outfit: string;
  outfitCustom: string;
  pose: string;
  poseCustom: string;
  visibleRange: string;
  visibleRangeCustom: string;
  viewingAngle: string;
  viewingAngleCustom: string;
  characterDirection: string;
  characterDirectionCustom: string;
  characterSheet: string;
  characterSheetCustom: string;
}

export interface BackgroundInput {
  place: string;
  placeCustom: string;
  timeOfDay: string;
  timeOfDayCustom: string;
  mood: string;
  moodCustom: string;
  lighting: string;
  lightingCustom: string;
  colorPalette: string;
  colorPaletteCustom: string;
  depth: string;
  depthCustom: string;
  complexity: string;
  complexityCustom: string;
  layout: string;
  layoutCustom: string;
  viewingAngle: string;
  viewingAngleCustom: string;
  visibleRange: string;
  visibleRangeCustom: string;
}

export interface AssetInput {
  shape: string;
  shapeCustom: string;
  surface: string;
  surfaceCustom: string;
  dimension: string;
  dimensionCustom: string;
  decorationLevel: string;
  decorationLevelCustom: string;
  backgroundTreatment: string;
  backgroundTreatmentCustom: string;
  rules: string[];
}

export interface ReferenceImageInput {
  src: string | null; // dataURL (없으면 null)
  role: string; // REFERENCE_ROLE_OPTIONS의 value
}

/** 옵션 그룹별 사용/비사용 플래그. 끄면 해당 그룹은 영어 프롬프트에 반영되지 않습니다. */
export interface EnabledFlags {
  workType: boolean;
  style: boolean;
  aspectRatio: boolean;
  negative: boolean;
  references: boolean;
  character: boolean;
  background: boolean;
  asset: boolean;
}

export const DEFAULT_ENABLED: EnabledFlags = {
  workType: true,
  style: true,
  aspectRatio: true,
  negative: true,
  references: true,
  character: true,
  background: true,
  asset: true,
};

export interface PromptInput {
  workType: WorkType;
  koreanMemo: string;
  englishSupplement: string;
  style: string;
  styleCustom: string;
  aspectRatio: string;
  aspectRatioCustom: string;
  negativeChecks: string[];
  negativeCustom: string;
  character: CharacterInput;
  background: BackgroundInput;
  asset: AssetInput;
  references: ReferenceImageInput[]; // 길이 3 고정
  enabled: EnabledFlags;
}

export const EMPTY_CHARACTER: CharacterInput = {
  gender: "auto", genderCustom: "",
  ageRange: "auto", ageRangeCustom: "",
  bodyType: "auto", bodyTypeCustom: "",
  hair: "auto", hairCustom: "",
  outfit: "auto", outfitCustom: "",
  pose: "auto", poseCustom: "",
  visibleRange: "auto", visibleRangeCustom: "",
  viewingAngle: "auto", viewingAngleCustom: "",
  characterDirection: "auto", characterDirectionCustom: "",
  characterSheet: "single", characterSheetCustom: "",
};

export const EMPTY_BACKGROUND: BackgroundInput = {
  place: "auto", placeCustom: "",
  timeOfDay: "auto", timeOfDayCustom: "",
  mood: "auto", moodCustom: "",
  lighting: "auto", lightingCustom: "",
  colorPalette: "auto", colorPaletteCustom: "",
  depth: "auto", depthCustom: "",
  complexity: "auto", complexityCustom: "",
  layout: "auto", layoutCustom: "",
  viewingAngle: "auto", viewingAngleCustom: "",
  visibleRange: "auto", visibleRangeCustom: "",
};

export const EMPTY_ASSET: AssetInput = {
  shape: "auto", shapeCustom: "",
  surface: "auto", surfaceCustom: "",
  dimension: "auto", dimensionCustom: "",
  decorationLevel: "auto", decorationLevelCustom: "",
  backgroundTreatment: "auto", backgroundTreatmentCustom: "",
  rules: [],
};

export const EMPTY_REFERENCES: ReferenceImageInput[] = [
  { src: null, role: "style" },
  { src: null, role: "style" },
  { src: null, role: "style" },
];

export const DEFAULT_INPUT: PromptInput = {
  workType: "character",
  koreanMemo: "",
  englishSupplement: "",
  style: "auto",
  styleCustom: "",
  aspectRatio: "1:1",
  aspectRatioCustom: "",
  negativeChecks: ["text", "logo", "watermark", "distorted_hand"],
  negativeCustom: "",
  character: EMPTY_CHARACTER,
  background: EMPTY_BACKGROUND,
  asset: EMPTY_ASSET,
  references: EMPTY_REFERENCES,
  enabled: DEFAULT_ENABLED,
};

// ===== 비율 처리 =====

function resolveAspectRatio(input: PromptInput): string {
  const item = ASPECT_RATIO_OPTIONS.find((o) => o.value === input.aspectRatio);
  if (!item) return "1:1";
  if (item.en === "__custom__") {
    const t = (input.aspectRatioCustom ?? "").trim();
    return t || "1:1";
  }
  return item.en;
}

function aspectRatioForGpt(input: PromptInput): string {
  const r = resolveAspectRatio(input);
  if (/^\d+x\d+$/i.test(r)) return `${r} pixels`;
  return `${r} aspect ratio`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatioForMidjourney(input: PromptInput): string {
  const r = resolveAspectRatio(input);
  if (r === "1000x600") return "--ar 5:3";
  const px = r.match(/^(\d+)x(\d+)$/i);
  if (px) {
    const w = parseInt(px[1], 10);
    const h = parseInt(px[2], 10);
    if (!w || !h) return "--ar 1:1";
    const g = gcd(w, h);
    return `--ar ${w / g}:${h / g}`;
  }
  if (/^\d+:\d+$/.test(r)) return `--ar ${r}`;
  return "--ar 1:1";
}

// ===== 영어 토큰 수집 =====

function pushEn(out: string[], options: OptionItem[], value: string, customText: string = "") {
  const en = resolveOptionEn(options, value, customText);
  if (en) out.push(en);
}

function pushFromTwoLists(
  out: string[],
  primary: OptionItem[],
  more: OptionItem[],
  value: string,
  customText: string = ""
) {
  // 더보기 항목이 선택된 경우도 처리
  const item = primary.find((o) => o.value === value) || more.find((o) => o.value === value);
  if (!item) return;
  if (item.en === "__custom__") {
    const t = (customText ?? "").trim();
    if (!t || containsKorean(t)) return;
    out.push(t);
    return;
  }
  if (item.en) out.push(item.en);
}

function collectStyle(input: PromptInput): string {
  if (!input.enabled.style) return "";
  return resolveOptionEn(STYLE_OPTIONS, input.style, input.styleCustom);
}

function collectCharacterTokens(c: CharacterInput): string[] {
  const out: string[] = [];
  pushEn(out, GENDER_OPTIONS, c.gender, c.genderCustom);
  pushEn(out, AGE_OPTIONS, c.ageRange, c.ageRangeCustom);
  pushEn(out, BODY_OPTIONS, c.bodyType, c.bodyTypeCustom);
  pushFromTwoLists(out, HAIR_OPTIONS, HAIR_MORE_OPTIONS, c.hair, c.hairCustom);
  pushFromTwoLists(out, OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS, c.outfit, c.outfitCustom);
  pushFromTwoLists(out, POSE_OPTIONS, POSE_MORE_OPTIONS, c.pose, c.poseCustom);
  pushFromTwoLists(out, VISIBLE_RANGE_OPTIONS, VISIBLE_RANGE_MORE_OPTIONS, c.visibleRange, c.visibleRangeCustom);
  pushFromTwoLists(out, VIEW_ANGLE_OPTIONS, VIEW_ANGLE_MORE_OPTIONS, c.viewingAngle, c.viewingAngleCustom);
  pushFromTwoLists(out, CHARACTER_DIRECTION_OPTIONS, CHARACTER_DIRECTION_MORE_OPTIONS, c.characterDirection, c.characterDirectionCustom);
  pushFromTwoLists(out, CHARACTER_SHEET_OPTIONS, CHARACTER_SHEET_MORE_OPTIONS, c.characterSheet, c.characterSheetCustom);

  // 캐릭터 시트가 single이 아니면 시트용 표준 키워드 추가
  if (c.characterSheet && c.characterSheet !== "single" && c.characterSheet !== "auto") {
    for (const kw of CHARACTER_SHEET_EXTRA_KEYWORDS) {
      if (!out.includes(kw)) out.push(kw);
    }
  }
  return out;
}

function collectBackgroundTokens(b: BackgroundInput): string[] {
  const out: string[] = [];
  pushFromTwoLists(out, PLACE_OPTIONS, PLACE_MORE_OPTIONS, b.place, b.placeCustom);
  pushEn(out, TIME_OF_DAY_OPTIONS, b.timeOfDay, b.timeOfDayCustom);
  pushEn(out, MOOD_OPTIONS, b.mood, b.moodCustom);
  pushEn(out, LIGHTING_OPTIONS, b.lighting, b.lightingCustom);
  pushEn(out, COLOR_PALETTE_OPTIONS, b.colorPalette, b.colorPaletteCustom);
  pushEn(out, DEPTH_OPTIONS, b.depth, b.depthCustom);
  pushEn(out, COMPLEXITY_OPTIONS, b.complexity, b.complexityCustom);
  pushEn(out, LAYOUT_OPTIONS, b.layout, b.layoutCustom);
  pushEn(out, BG_VIEW_ANGLE_OPTIONS, b.viewingAngle, b.viewingAngleCustom);
  pushEn(out, BG_VISIBLE_RANGE_OPTIONS, b.visibleRange, b.visibleRangeCustom);
  return out;
}

function collectAssetTokens(a: AssetInput, workType: WorkType): string[] {
  const out: string[] = [];
  pushEn(out, SHAPE_OPTIONS, a.shape, a.shapeCustom);
  pushEn(out, SURFACE_OPTIONS, a.surface, a.surfaceCustom);
  pushEn(out, DIMENSION_OPTIONS, a.dimension, a.dimensionCustom);
  pushEn(out, DECORATION_LEVEL_OPTIONS, a.decorationLevel, a.decorationLevelCustom);
  pushEn(out, BG_TREATMENT_OPTIONS, a.backgroundTreatment, a.backgroundTreatmentCustom);
  // 체크박스 룰
  for (const r of a.rules) {
    const item = ASSET_RULES_OPTIONS.find((o) => o.value === r);
    if (item && item.en) out.push(item.en);
  }
  // 작업유형별 추가 강조
  const extras = ASSET_TYPE_EXTRA[workType] ?? [];
  for (const k of extras) if (!out.includes(k)) out.push(k);
  return out;
}

function collectNegatives(input: PromptInput): string[] {
  if (!input.enabled.negative) return [];
  const out: string[] = [];
  for (const v of input.negativeChecks) {
    const item = NEGATIVE_OPTIONS.find((o) => o.value === v);
    if (item && item.en) out.push(item.en);
  }
  const t = (input.negativeCustom ?? "").trim();
  if (t && !containsKorean(t)) out.push(`no ${t}`);
  return out;
}

function collectMainTokens(input: PromptInput): string[] {
  const en = input.enabled;
  switch (input.workType) {
    case "character":
      return en.character ? collectCharacterTokens(input.character) : [];
    case "background":
      return en.background ? collectBackgroundTokens(input.background) : [];
    case "frame":
    case "icon":
    case "object":
      return en.asset ? collectAssetTokens(input.asset, input.workType) : [];
  }
}

function activeReferences(input: PromptInput): ReferenceImageInput[] {
  if (!input.enabled.references) return [];
  return input.references.filter((r) => r.src);
}

function englishSupplementClean(input: PromptInput): string {
  const t = (input.englishSupplement ?? "").trim();
  if (!t) return "";
  // 한글이 섞이면 한글 부분은 제외 (단어 단위로 잘라 한글 단어 제거)
  if (!containsKorean(t)) return t;
  // 한글이 섞였다면 안전하게 통째로 제외
  return "";
}

// ===== 모델별 빌더 =====

function buildGptImage(input: PromptInput): string {
  const work = input.enabled.workType
    ? (WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.en ?? "an illustration")
    : "an illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);
  const refs = activeReferences(input);

  const sentences: string[] = [];
  sentences.push(`Create ${work}.`);

  // 주요 묘사 (캐릭터/배경/에셋 토큰)
  if (main.length > 0) {
    sentences.push(`Key details: ${main.join(", ")}.`);
  }

  // 영어 보충 입력
  if (eng) {
    sentences.push(`Additional direction from the artist: ${eng}.`);
  }

  // 스타일
  if (style) {
    sentences.push(`Render it in ${style}.`);
  }

  // 비율
  if (input.enabled.aspectRatio) {
    sentences.push(`Compose the image at ${aspectRatioForGpt(input)} with a clear focal point and balanced layout.`);
  } else {
    sentences.push("Compose the image with a clear focal point and balanced layout.");
  }

  // 참고 이미지: 텍스트로 안내하지 않음 — 사용자가 ChatGPT/도구에 이미지를 직접 첨부

  // 금지 요소
  if (negatives.length > 0) {
    sentences.push(`Important constraints: ${negatives.join(", ")}.`);
  }

  sentences.push("Keep the result production-ready for game art use, with clean edges and consistent lighting.");
  return sentences.join(" ");
}

function buildNanoBanana(input: PromptInput, model: ModelKey): string {
  // Google 공식 권장에 따라 "자연어 서술 문장"으로 빌드합니다.
  // (구조형 라벨 Goal:/Subject:/Style: 등은 Nano Banana에서 비권장)
  const work = input.enabled.workType
    ? (WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.en ?? "an illustration")
    : "an illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);

  const sentences: string[] = [];

  // 메인 한 문장: 작품 종류 + 주요 디테일 + 스타일을 자연스럽게 한 문단으로 결합
  const mainParts: string[] = [];
  if (main.length > 0) mainParts.push(main.join(", "));
  if (eng) mainParts.push(eng);
  if (style) mainParts.push(`in ${style}`);
  if (mainParts.length > 0) {
    sentences.push(`Create ${work} of ${mainParts.join(", ")}.`);
  } else {
    sentences.push(`Create ${work}.`);
  }

  // 구도
  if (input.enabled.aspectRatio) {
    sentences.push(`Compose at ${resolveAspectRatio(input)} aspect ratio with a clear focal point and balanced layout.`);
  } else {
    sentences.push("Use a clear focal point and balanced layout.");
  }

  // 모델별 강조점 (capability 차등)
  if (model === "nano_banana_pro") {
    sentences.push("Render in 4K resolution with intricate details and professional print-ready quality. Render any text exactly as specified, with multilingual support enabled.");
  } else if (model === "nano_banana_2") {
    sentences.push("Render in 2K or higher resolution with refined detail and precise aspect ratio. Maintain a coherent, polished result.");
  } else {
    sentences.push("Render in commercial game asset quality with clean, readable design.");
  }

  // 회피 요소 — "no " / "avoid " 접두사 제거하여 "Avoid no text" 같은 이중부정 방지
  if (negatives.length > 0) {
    const cleaned = negatives.map((n) => n.replace(/^no /i, "").replace(/^avoid /i, ""));
    sentences.push(`Avoid ${cleaned.join(", ")}.`);
  }

  return sentences.join(" ");
}

function buildMidjourney(input: PromptInput, _model: ModelKey): string {
  // 키워드만 출력 — --ar / --no / --sref / --oref / --hd 같은 파라미터는 사용자가
  // Discord나 MJ 사이트에서 직접 추가합니다 (URL/취향 통제권 사용자에게).
  const workKw = input.enabled.workType ? (WORK_TYPE_KEYWORD[input.workType] ?? "illustration") : "illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const eng = englishSupplementClean(input);

  const keywords: string[] = [];
  keywords.push(workKw);
  for (const t of main) keywords.push(t);
  if (eng) keywords.push(eng);
  if (style) keywords.push(style);
  keywords.push("clean composition", "polished design");

  return keywords.join(", ").replace(/\s+/g, " ").trim();
}

function buildNiji(input: PromptInput, _model: ModelKey): string {
  // 키워드만 출력 — --niji / --ar / --no / --sref / --cref 같은 파라미터는 사용자가
  // Discord나 Niji 사이트에서 직접 추가합니다.
  const workKw = input.enabled.workType ? (WORK_TYPE_KEYWORD[input.workType] ?? "illustration") : "illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const eng = englishSupplementClean(input);

  const keywords: string[] = [];
  keywords.push("anime style");
  keywords.push(workKw);
  for (const t of main) keywords.push(t);
  if (eng) keywords.push(eng);
  if (style) keywords.push(style);
  keywords.push("clean character silhouette", "polished anime game illustration");

  return keywords.join(", ").replace(/\s+/g, " ").trim();
}

function buildRevision(input: PromptInput): string {
  const negatives = collectNegatives(input);
  const lines: string[] = [];
  lines.push("Keep:");
  lines.push("- The main subject, overall style, and core composition.");
  lines.push("");
  lines.push("Change:");
  lines.push("- Improve the weak or unsatisfactory parts of the image.");
  lines.push("- Make the image cleaner, more readable, and more polished.");
  lines.push("");
  lines.push("Remove:");
  if (negatives.length > 0) {
    for (const n of negatives) lines.push(`- ${n.replace(/^no /, "")}`);
  } else {
    lines.push("- text");
    lines.push("- logos");
    lines.push("- visual noise");
    lines.push("- messy textures");
    lines.push("- distorted hands");
    lines.push("- unwanted extra objects");
  }
  lines.push("");
  lines.push("Do not change:");
  lines.push("- Main subject");
  lines.push("- Core theme");
  lines.push("- Important composition");
  lines.push("- Aspect ratio");
  return lines.join("\n");
}

// ===== 외부 API =====

export interface SummaryRow {
  label: string;
  value: string;
}

export interface SummaryTags {
  label: string;
  tags: string[];
}

export interface PromptSummary {
  rows: SummaryRow[];
  negative: SummaryTags;
  references: SummaryTags;
}

export function buildSummary(input: PromptInput): PromptSummary {
  const rows: SummaryRow[] = [];
  const wt = WORK_TYPE_OPTIONS.find((o) => o.value === input.workType);
  if (wt) rows.push({
    label: "작업 유형",
    value: input.enabled.workType ? wt.label : `${wt.label} (꺼짐)`,
  });

  if (input.enabled.style) {
    const styleLabel = resolveOptionLabel(STYLE_OPTIONS, input.style, input.styleCustom);
    if (styleLabel) rows.push({ label: "스타일", value: styleLabel });
  }

  if (input.enabled.aspectRatio) {
    const ratio = resolveAspectRatio(input);
    rows.push({ label: "비율", value: ratio });
  }

  if (input.workType === "character" && input.enabled.character) {
    const c = input.character;
    const gender = resolveOptionLabel(GENDER_OPTIONS, c.gender, c.genderCustom);
    const age = resolveOptionLabel(AGE_OPTIONS, c.ageRange, c.ageRangeCustom);
    const ga = [gender, age].filter(Boolean).join(" / ");
    if (ga) rows.push({ label: "성별 / 나이대", value: ga });

    const body = resolveOptionLabel(BODY_OPTIONS, c.bodyType, c.bodyTypeCustom);
    if (body) rows.push({ label: "체형", value: body });

    const hair = resolveOneFromTwo(HAIR_OPTIONS, HAIR_MORE_OPTIONS, c.hair, c.hairCustom);
    if (hair) rows.push({ label: "머리", value: hair });

    const outfit = resolveOneFromTwo(OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS, c.outfit, c.outfitCustom);
    if (outfit) rows.push({ label: "의상", value: outfit });

    const pose = resolveOneFromTwo(POSE_OPTIONS, POSE_MORE_OPTIONS, c.pose, c.poseCustom);
    if (pose) rows.push({ label: "포즈", value: pose });

    const vr = resolveOneFromTwo(VISIBLE_RANGE_OPTIONS, VISIBLE_RANGE_MORE_OPTIONS, c.visibleRange, c.visibleRangeCustom);
    if (vr) rows.push({ label: "보이는 범위", value: vr });

    const va = resolveOneFromTwo(VIEW_ANGLE_OPTIONS, VIEW_ANGLE_MORE_OPTIONS, c.viewingAngle, c.viewingAngleCustom);
    if (va) rows.push({ label: "보는 각도", value: va });

    const cd = resolveOneFromTwo(CHARACTER_DIRECTION_OPTIONS, CHARACTER_DIRECTION_MORE_OPTIONS, c.characterDirection, c.characterDirectionCustom);
    if (cd) rows.push({ label: "캐릭터 방향", value: cd });

    const cs = resolveOneFromTwo(CHARACTER_SHEET_OPTIONS, CHARACTER_SHEET_MORE_OPTIONS, c.characterSheet, c.characterSheetCustom);
    if (cs) rows.push({ label: "캐릭터 시트", value: cs });
  }

  if (input.workType === "background" && input.enabled.background) {
    const b = input.background;
    const place = resolveOneFromTwo(PLACE_OPTIONS, PLACE_MORE_OPTIONS, b.place, b.placeCustom);
    if (place) rows.push({ label: "장소", value: place });

    const time = resolveOptionLabel(TIME_OF_DAY_OPTIONS, b.timeOfDay, b.timeOfDayCustom);
    if (time) rows.push({ label: "시간대", value: time });

    const mood = resolveOptionLabel(MOOD_OPTIONS, b.mood, b.moodCustom);
    if (mood) rows.push({ label: "분위기", value: mood });

    const light = resolveOptionLabel(LIGHTING_OPTIONS, b.lighting, b.lightingCustom);
    if (light) rows.push({ label: "빛 느낌", value: light });

    const color = resolveOptionLabel(COLOR_PALETTE_OPTIONS, b.colorPalette, b.colorPaletteCustom);
    if (color) rows.push({ label: "색감", value: color });

    const depth = resolveOptionLabel(DEPTH_OPTIONS, b.depth, b.depthCustom);
    if (depth) rows.push({ label: "깊이감", value: depth });

    const complexity = resolveOptionLabel(COMPLEXITY_OPTIONS, b.complexity, b.complexityCustom);
    if (complexity) rows.push({ label: "배경 복잡도", value: complexity });

    const layout = resolveOptionLabel(LAYOUT_OPTIONS, b.layout, b.layoutCustom);
    if (layout) rows.push({ label: "여백 / 배치", value: layout });

    const va = resolveOptionLabel(BG_VIEW_ANGLE_OPTIONS, b.viewingAngle, b.viewingAngleCustom);
    if (va) rows.push({ label: "보는 각도", value: va });

    const vr = resolveOptionLabel(BG_VISIBLE_RANGE_OPTIONS, b.visibleRange, b.visibleRangeCustom);
    if (vr) rows.push({ label: "보이는 범위", value: vr });
  }

  if ((input.workType === "frame" || input.workType === "icon" || input.workType === "object") && input.enabled.asset) {
    const a = input.asset;
    const shape = resolveOptionLabel(SHAPE_OPTIONS, a.shape, a.shapeCustom);
    if (shape) rows.push({ label: "형태", value: shape });

    const surface = resolveOptionLabel(SURFACE_OPTIONS, a.surface, a.surfaceCustom);
    if (surface) rows.push({ label: "표면 느낌", value: surface });

    const dim = resolveOptionLabel(DIMENSION_OPTIONS, a.dimension, a.dimensionCustom);
    if (dim) rows.push({ label: "입체감", value: dim });

    const dec = resolveOptionLabel(DECORATION_LEVEL_OPTIONS, a.decorationLevel, a.decorationLevelCustom);
    if (dec) rows.push({ label: "장식 정도", value: dec });

    const bgT = resolveOptionLabel(BG_TREATMENT_OPTIONS, a.backgroundTreatment, a.backgroundTreatmentCustom);
    if (bgT) rows.push({ label: "배경 처리", value: bgT });

    if (a.rules.length > 0) {
      const labels = a.rules
        .map((r) => ASSET_RULES_OPTIONS.find((o) => o.value === r)?.label)
        .filter((x): x is string => !!x);
      if (labels.length > 0) rows.push({ label: "에셋 조건", value: labels.join(", ") });
    }
  }

  const eng = englishSupplementClean(input);
  if (eng) rows.push({ label: "영어 보충", value: eng });

  const negTags: string[] = [];
  if (input.enabled.negative) {
    for (const v of input.negativeChecks) {
      const lbl = NEGATIVE_OPTIONS.find((o) => o.value === v)?.label;
      if (lbl) negTags.push(lbl);
    }
    const negCustom = (input.negativeCustom ?? "").trim();
    if (negCustom) negTags.push(negCustom);
  }

  const refTags: string[] = [];
  if (input.enabled.references) {
    input.references.forEach((r, i) => {
      if (!r.src) return;
      const label = REFERENCE_ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role;
      refTags.push(`이미지 ${i + 1}: ${label}`);
    });
  }

  return {
    rows,
    negative: { label: "빼고 싶은 것", tags: negTags },
    references: { label: "참고 이미지", tags: refTags },
  };
}

function resolveOneFromTwo(
  primary: OptionItem[],
  more: OptionItem[],
  value: string,
  customText: string
): string {
  const item = primary.find((o) => o.value === value) || more.find((o) => o.value === value);
  if (!item) return "";
  if (item.en === "__custom__") {
    const t = (customText ?? "").trim();
    return t || "직접 입력";
  }
  if (item.en === "") return "";
  return item.label;
}

export function buildPromptFor(model: ModelKey, input: PromptInput): string {
  switch (model) {
    case "gpt_image_2":
    case "gpt_image_1_5":
    case "gpt_image_1":
    case "gpt_image_1_mini":
      return buildGptImage(input);
    case "nano_banana":
    case "nano_banana_2":
    case "nano_banana_pro":
      return buildNanoBanana(input, model);
    case "mj_v7":
    case "mj_v8_alpha":
    case "mj_v8_1_alpha":
      return buildMidjourney(input, model);
    case "niji_6":
    case "niji_7":
      return buildNiji(input, model);
  }
}

export function buildRevisionPrompt(input: PromptInput): string {
  return buildRevision(input);
}

export function hasKoreanInOutput(s: string): boolean {
  return containsKorean(s);
}

// ===== GPT Image 한국어 버전 =====
// GPT Image / Nano Banana는 한국어 프롬프트도 잘 처리하므로, 사용자가 한/영을
// 토글해서 비교할 수 있도록 별도 빌더를 둡니다. 영어 빌더와 동일한 enabled 분기
// 를 따르며, 옵션은 한국어 라벨(`label`)을 사용합니다.

// 한국어 빌더용: 표준 옵션의 한글 라벨만 추가하고, '직접 입력'(custom)의 영어 customText는
// 한국어 본문에 섞이지 않도록 제외합니다. 디테일은 한글 메모(작가 메모)와 영어 빌더에서 보존.
function pushLabel(out: string[], options: OptionItem[], value: string, _customText: string) {
  const item = options.find((o) => o.value === value);
  if (!item) return;
  if (item.en === "" || item.en === "__custom__") return; // 자동/직접 입력은 한국어 빌더 본문에 미포함
  out.push(item.label);
}

function pushLabelTwo(out: string[], primary: OptionItem[], more: OptionItem[], value: string, _customText: string) {
  const item = primary.find((o) => o.value === value) || more.find((o) => o.value === value);
  if (!item) return;
  if (item.en === "" || item.en === "__custom__") return;
  out.push(item.label);
}

function collectCharacterTokensKo(c: CharacterInput): string[] {
  const out: string[] = [];
  pushLabel(out, GENDER_OPTIONS, c.gender, c.genderCustom);
  pushLabel(out, AGE_OPTIONS, c.ageRange, c.ageRangeCustom);
  pushLabel(out, BODY_OPTIONS, c.bodyType, c.bodyTypeCustom);
  pushLabelTwo(out, HAIR_OPTIONS, HAIR_MORE_OPTIONS, c.hair, c.hairCustom);
  pushLabelTwo(out, OUTFIT_OPTIONS, OUTFIT_MORE_OPTIONS, c.outfit, c.outfitCustom);
  pushLabelTwo(out, POSE_OPTIONS, POSE_MORE_OPTIONS, c.pose, c.poseCustom);
  pushLabelTwo(out, VISIBLE_RANGE_OPTIONS, VISIBLE_RANGE_MORE_OPTIONS, c.visibleRange, c.visibleRangeCustom);
  pushLabelTwo(out, VIEW_ANGLE_OPTIONS, VIEW_ANGLE_MORE_OPTIONS, c.viewingAngle, c.viewingAngleCustom);
  pushLabelTwo(out, CHARACTER_DIRECTION_OPTIONS, CHARACTER_DIRECTION_MORE_OPTIONS, c.characterDirection, c.characterDirectionCustom);
  pushLabelTwo(out, CHARACTER_SHEET_OPTIONS, CHARACTER_SHEET_MORE_OPTIONS, c.characterSheet, c.characterSheetCustom);
  return out;
}

function collectBackgroundTokensKo(b: BackgroundInput): string[] {
  const out: string[] = [];
  pushLabelTwo(out, PLACE_OPTIONS, PLACE_MORE_OPTIONS, b.place, b.placeCustom);
  pushLabel(out, TIME_OF_DAY_OPTIONS, b.timeOfDay, b.timeOfDayCustom);
  pushLabel(out, MOOD_OPTIONS, b.mood, b.moodCustom);
  pushLabel(out, LIGHTING_OPTIONS, b.lighting, b.lightingCustom);
  pushLabel(out, COLOR_PALETTE_OPTIONS, b.colorPalette, b.colorPaletteCustom);
  pushLabel(out, DEPTH_OPTIONS, b.depth, b.depthCustom);
  pushLabel(out, COMPLEXITY_OPTIONS, b.complexity, b.complexityCustom);
  pushLabel(out, LAYOUT_OPTIONS, b.layout, b.layoutCustom);
  pushLabel(out, BG_VIEW_ANGLE_OPTIONS, b.viewingAngle, b.viewingAngleCustom);
  pushLabel(out, BG_VISIBLE_RANGE_OPTIONS, b.visibleRange, b.visibleRangeCustom);
  return out;
}

function collectAssetTokensKo(a: AssetInput): string[] {
  const out: string[] = [];
  pushLabel(out, SHAPE_OPTIONS, a.shape, a.shapeCustom);
  pushLabel(out, SURFACE_OPTIONS, a.surface, a.surfaceCustom);
  pushLabel(out, DIMENSION_OPTIONS, a.dimension, a.dimensionCustom);
  pushLabel(out, DECORATION_LEVEL_OPTIONS, a.decorationLevel, a.decorationLevelCustom);
  pushLabel(out, BG_TREATMENT_OPTIONS, a.backgroundTreatment, a.backgroundTreatmentCustom);
  for (const r of a.rules) {
    const item = ASSET_RULES_OPTIONS.find((o) => o.value === r);
    if (item) out.push(item.label);
  }
  return out;
}

function collectMainTokensKo(input: PromptInput): string[] {
  const en = input.enabled;
  switch (input.workType) {
    case "character":
      return en.character ? collectCharacterTokensKo(input.character) : [];
    case "background":
      return en.background ? collectBackgroundTokensKo(input.background) : [];
    case "frame":
    case "icon":
    case "object":
      return en.asset ? collectAssetTokensKo(input.asset) : [];
  }
}

export function buildGptImageKorean(input: PromptInput): string {
  const en = input.enabled;
  const parts: string[] = [];

  // 작업 유형
  const workLabel = en.workType
    ? (WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.label ?? "이미지")
    : "이미지";
  parts.push(`${workLabel}를 만들어 주세요.`);

  // 주요 묘사
  const main = collectMainTokensKo(input);
  if (main.length > 0) {
    parts.push(`주요 디테일: ${main.join(", ")}.`);
  }

  // 한글 메모 — 영어 빌더와 달리 한국어 프롬프트에는 그대로 넣어 줍니다.
  const memo = (input.koreanMemo ?? "").trim();
  if (memo) {
    parts.push(`작가 메모: ${memo}.`);
  }

  // 영어 보충 입력 — 영어로 적혀 있어도 그대로 포함 (GPT가 처리 가능)
  // 영어 보충 입력은 영어 빌더 전용 — 한국어 빌더에서는 한글 메모와 중복되지 않도록 제외

  // 스타일
  if (en.style) {
    const styleLabel = resolveOptionLabel(STYLE_OPTIONS, input.style, input.styleCustom);
    if (styleLabel) parts.push(`스타일: ${styleLabel}.`);
  }

  // 비율
  if (en.aspectRatio) {
    parts.push(`비율은 ${resolveAspectRatio(input)}로, 명확한 초점과 균형 잡힌 구도로 만들어 주세요.`);
  } else {
    parts.push("명확한 초점과 균형 잡힌 구도로 만들어 주세요.");
  }

  // 참고 이미지
  // 참고 이미지: 텍스트로 안내하지 않음 — 사용자가 ChatGPT 등에 이미지를 직접 첨부

  if (en.negative) {
    const negs = input.negativeChecks
      .map((v) => NEGATIVE_OPTIONS.find((o) => o.value === v)?.label)
      .filter((x): x is string => !!x);
    const customNeg = (input.negativeCustom ?? "").trim();
    if (customNeg) negs.push(customNeg);
    if (negs.length > 0) {
      parts.push(`다음 요소는 빼주세요: ${negs.join(", ")}.`);
    }
  }

  parts.push("게임 아트로 바로 쓸 수 있도록 깨끗한 가장자리와 일관된 조명으로 마감해 주세요.");
  return parts.join(" ");
}

// ===== Nano Banana 한국어 버전 =====
// Google 권장에 따라 자연어 서술 문장형. 모델별로 capability 강조를 다르게.
export function buildNanoBananaKorean(input: PromptInput, model: ModelKey): string {
  const en = input.enabled;
  const sentences: string[] = [];

  const workLabel = en.workType
    ? (WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.label ?? "이미지")
    : "이미지";

  // 메인 한 문장
  const mainParts: string[] = [];
  const mainTokens = collectMainTokensKo(input);
  if (mainTokens.length > 0) mainParts.push(mainTokens.join(", "));
  const memo = (input.koreanMemo ?? "").trim();
  if (memo) mainParts.push(`작가 메모: ${memo}`);
  // 영어 보충 입력은 한국어 빌더에서 제외
  if (en.style) {
    const styleLabel = resolveOptionLabel(STYLE_OPTIONS, input.style, input.styleCustom);
    if (styleLabel) mainParts.push(`${styleLabel} 스타일`);
  }
  if (mainParts.length > 0) {
    sentences.push(`${workLabel}를 만들어 주세요. 주요 묘사: ${mainParts.join(", ")}.`);
  } else {
    sentences.push(`${workLabel}를 만들어 주세요.`);
  }

  // 구도
  if (en.aspectRatio) {
    sentences.push(`비율 ${resolveAspectRatio(input)}로, 명확한 초점과 균형 잡힌 배치로 구도를 잡아 주세요.`);
  } else {
    sentences.push("명확한 초점과 균형 잡힌 배치로 구도를 잡아 주세요.");
  }

  // 모델별 capability 강조
  if (model === "nano_banana_pro") {
    sentences.push("4K 해상도, 정교한 디테일과 인쇄에 바로 쓸 수 있는 고품질로 렌더링해 주세요. 텍스트가 있다면 다국어 지원으로 정확하게 렌더링해 주세요.");
  } else if (model === "nano_banana_2") {
    sentences.push("2K 이상 해상도, 정확한 비율과 균형 잡힌 디테일로 렌더링해 주세요.");
  } else {
    sentences.push("게임 에셋으로 바로 쓸 수 있도록 깔끔하고 알아보기 쉬운 상업 품질로 렌더링해 주세요.");
  }

  // 회피 요소
  if (en.negative) {
    const negs = input.negativeChecks
      .map((v) => NEGATIVE_OPTIONS.find((o) => o.value === v)?.label)
      .filter((x): x is string => !!x);
    const customNeg = (input.negativeCustom ?? "").trim();
    if (customNeg) negs.push(customNeg);
    if (negs.length > 0) sentences.push(`다음은 빼주세요: ${negs.join(", ")}.`);
  }

  return sentences.join(" ");
}
