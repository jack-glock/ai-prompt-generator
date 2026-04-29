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
  switch (input.workType) {
    case "character":
      return collectCharacterTokens(input.character);
    case "background":
      return collectBackgroundTokens(input.background);
    case "frame":
    case "icon":
    case "object":
      return collectAssetTokens(input.asset, input.workType);
  }
}

function activeReferences(input: PromptInput): ReferenceImageInput[] {
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
  const work = WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.en
    ?? "an illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);
  const ratio = aspectRatioForGpt(input);
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
  sentences.push(`Compose the image at ${ratio} with a clear focal point and balanced layout.`);

  // 참고 이미지
  for (const r of refs) {
    const sentence = REFERENCE_ROLE_SENTENCE[r.role] ?? REFERENCE_ROLE_SENTENCE.style;
    sentences.push(sentence);
  }

  // 금지 요소
  if (negatives.length > 0) {
    sentences.push(`Important constraints: ${negatives.join(", ")}.`);
  }

  sentences.push("Keep the result production-ready for game art use, with clean edges and consistent lighting.");
  return sentences.join(" ");
}

function buildNanoBanana(input: PromptInput, model: ModelKey): string {
  const work = WORK_TYPE_OPTIONS.find((o) => o.value === input.workType)?.en
    ?? "an illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);
  const ratio = resolveAspectRatio(input);
  const refs = activeReferences(input);

  const lines: string[] = [];

  // Goal
  lines.push("Goal:");
  lines.push(`- Create ${work}.`);

  // Subject (main details + 영어 보충)
  lines.push("");
  lines.push("Subject:");
  if (main.length > 0) {
    for (const t of main) lines.push(`- ${t}`);
  } else {
    lines.push("- (subject not specified, infer from artist direction)");
  }
  if (eng) lines.push(`- ${eng}`);

  // Style
  if (style) {
    lines.push("");
    lines.push("Style:");
    lines.push(`- ${style}`);
  }

  // Composition
  lines.push("");
  lines.push("Composition:");
  lines.push(`- aspect ratio ${ratio}`);
  lines.push("- clean composition, clear focal point, balanced layout");

  // Reference
  if (refs.length > 0) {
    lines.push("");
    lines.push("Reference:");
    for (const r of refs) {
      const label = REFERENCE_ROLE_OPTIONS.find((o) => o.value === r.role)?.en ?? r.role;
      const sentence = REFERENCE_ROLE_SENTENCE[r.role] ?? "";
      lines.push(`- (${label}) ${sentence.replace(/^Use the attached reference image /, "")}`);
    }
  }

  // Quality
  lines.push("");
  lines.push("Quality:");
  if (model === "nano_banana_pro") {
    lines.push("- target resolution: 4K, professional print-ready");
    lines.push("- multilingual text rendering enabled");
  } else if (model === "nano_banana_2") {
    lines.push("- target resolution: 2K or higher");
    lines.push("- precise aspect ratio");
  } else {
    lines.push("- commercial game asset quality, clean readable design");
  }

  // Avoid
  lines.push("");
  lines.push("Avoid:");
  if (negatives.length > 0) {
    for (const n of negatives) lines.push(`- ${n}`);
  } else {
    lines.push("- anything that distracts from the main subject");
  }

  return lines.join("\n");
}

function buildMidjourney(input: PromptInput, model: ModelKey): string {
  const workKw = WORK_TYPE_KEYWORD[input.workType] ?? "illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);
  const ar = aspectRatioForMidjourney(input);
  const refs = activeReferences(input);

  const keywords: string[] = [];
  keywords.push(workKw);
  for (const t of main) keywords.push(t);
  if (eng) keywords.push(eng);
  if (style) keywords.push(style);
  keywords.push("clean composition", "polished design");

  // 참고 이미지 파라미터
  const refParams: string[] = [];
  for (const r of refs) {
    const p = REFERENCE_ROLE_MJ_PARAM[r.role] ?? REFERENCE_ROLE_MJ_PARAM.style;
    refParams.push(p);
  }

  // V8.x 추가 옵션
  let extra = "";
  if (model === "mj_v8_alpha") extra = " --hd";

  const base = keywords.join(", ");
  const noPart = negatives.length > 0 ? ` --no ${negatives.map((n) => n.replace(/^no /, "").replace(/^avoid /, "")).join(", ")}` : "";
  const refPart = refParams.length > 0 ? " " + refParams.join(" ") : "";
  return `${base} ${ar}${noPart}${refPart}${extra}`.replace(/\s+/g, " ").trim();
}

function buildNiji(input: PromptInput, model: ModelKey): string {
  const workKw = WORK_TYPE_KEYWORD[input.workType] ?? "illustration";
  const style = collectStyle(input);
  const main = collectMainTokens(input);
  const negatives = collectNegatives(input);
  const eng = englishSupplementClean(input);
  const ar = aspectRatioForMidjourney(input);
  const refs = activeReferences(input);

  const keywords: string[] = [];
  keywords.push("anime style");
  keywords.push(workKw);
  for (const t of main) keywords.push(t);
  if (eng) keywords.push(eng);
  if (style) keywords.push(style);
  keywords.push("clean character silhouette", "polished anime game illustration");

  const refParams: string[] = [];
  for (const r of refs) {
    const p = REFERENCE_ROLE_NIJI_PARAM[r.role] ?? REFERENCE_ROLE_NIJI_PARAM.style;
    refParams.push(p);
  }

  const nijiVersion = model === "niji_6" ? "--niji 6" : "--niji 7";
  const base = keywords.join(", ");
  const noPart = negatives.length > 0 ? ` --no ${negatives.map((n) => n.replace(/^no /, "").replace(/^avoid /, "")).join(", ")}` : "";
  const refPart = refParams.length > 0 ? " " + refParams.join(" ") : "";
  return `${base} ${nijiVersion} ${ar}${noPart}${refPart}`.replace(/\s+/g, " ").trim();
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
  if (wt) rows.push({ label: "작업 유형", value: wt.label });

  const styleLabel = resolveOptionLabel(STYLE_OPTIONS, input.style, input.styleCustom);
  if (styleLabel) rows.push({ label: "스타일", value: styleLabel });

  const ratio = resolveAspectRatio(input);
  rows.push({ label: "비율", value: ratio });

  if (input.workType === "character") {
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

  if (input.workType === "background") {
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

  if (input.workType === "frame" || input.workType === "icon" || input.workType === "object") {
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

  const negTags = input.negativeChecks
    .map((v) => NEGATIVE_OPTIONS.find((o) => o.value === v)?.label)
    .filter((x): x is string => !!x);
  const negCustom = (input.negativeCustom ?? "").trim();
  if (negCustom) negTags.push(negCustom);

  const refTags: string[] = [];
  input.references.forEach((r, i) => {
    if (!r.src) return;
    const label = REFERENCE_ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role;
    refTags.push(`이미지 ${i + 1}: ${label}`);
  });

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
