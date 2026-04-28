// 프롬프트 생성 로직
// v0.4: 스타일 16종 + 모델 12종 분기 + 결과 파란색 하이라이트 토큰
// 정책 근거: docs/design-docs/PROMPT_STRATEGY.md §2 (재개정판)
// 모델 사양: docs/model-specs/
//
// 하이라이트 토큰: 사용자가 선택/입력한 부분은 [[B]]...[[/B]]로 감싸짐.
// 결과 카드 컴포넌트(app/page.tsx)가 토큰을 파싱해 파란색 span으로 렌더링.
// 복사 시는 stripHighlight()로 토큰 제거 후 클립보드 복사.

export type WorkType = "banner" | "character" | "frame" | "background" | "icon";

export type StyleType =
  | "casual_game"
  | "realistic"
  | "cartoon"
  | "2_5d"
  | "retro"
  | "neon"
  | "premium_gold"
  | "anime_manga"
  | "chibi"
  | "pixel_art"
  | "concept_art"
  | "flat_vector"
  | "cyberpunk"
  | "dark_fantasy"
  | "slot_premium"
  | "disney_pixar";

export type RatioType = "16:9" | "4:3" | "1:1" | "3:4" | "1000x600" | "custom";
export type ReferenceRole =
  | "style"
  | "composition"
  | "color"
  | "character"
  | "material";

export interface PromptInput {
  request: string;
  englishRequest?: string;
  workType: WorkType;
  style: StyleType;
  ratio: RatioType;
  customRatio: string;
  referenceRole: ReferenceRole;
  hasReferenceImage: boolean;
  forbid: {
    text: boolean;
    logo: boolean;
    noise: boolean;
    messyTexture: boolean;
    sparkle: boolean;
    overDetail: boolean;
  };
}

export interface PromptOutput {
  koreanSummary: string;
  gptImage: string;
  nanoBanana: string;
  midjourney: string;
  revision: string;
}

export type ModelKey =
  | "gpt_image_2"
  | "gpt_image_1_5"
  | "gpt_image_1"
  | "gpt_image_1_mini"
  | "nano_banana"
  | "nano_banana_2"
  | "nano_banana_pro"
  | "mj_v7"
  | "mj_v8_alpha"
  | "mj_v8_1_alpha"
  | "niji_6"
  | "niji_7";

export const MODEL_LABEL: Record<ModelKey, string> = {
  gpt_image_2: "GPT Image 2 (최신 권장)",
  gpt_image_1_5: "GPT Image 1.5",
  gpt_image_1: "GPT Image 1",
  gpt_image_1_mini: "GPT Image 1-mini",
  nano_banana: "Nano Banana",
  nano_banana_2: "Nano Banana 2",
  nano_banana_pro: "Nano Banana Pro",
  mj_v7: "Midjourney V7",
  mj_v8_alpha: "Midjourney V8 Alpha",
  mj_v8_1_alpha: "Midjourney V8.1 Alpha",
  niji_6: "Niji 6",
  niji_7: "Niji 7",
};

export type ModelGroup = "gpt" | "nano" | "mj" | "niji";

export const MODEL_GROUP: Record<ModelKey, ModelGroup> = {
  gpt_image_2: "gpt",
  gpt_image_1_5: "gpt",
  gpt_image_1: "gpt",
  gpt_image_1_mini: "gpt",
  nano_banana: "nano",
  nano_banana_2: "nano",
  nano_banana_pro: "nano",
  mj_v7: "mj",
  mj_v8_alpha: "mj",
  mj_v8_1_alpha: "mj",
  niji_6: "niji",
  niji_7: "niji",
};

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  banner: "배너",
  character: "캐릭터",
  frame: "프레임",
  background: "배경",
  icon: "아이콘",
};

export const STYLE_LABEL: Record<StyleType, string> = {
  casual_game: "캐주얼 게임",
  realistic: "실사",
  cartoon: "카툰",
  "2_5d": "2.5D",
  retro: "레트로",
  neon: "네온",
  premium_gold: "프리미엄 골드",
  anime_manga: "애니/망가",
  chibi: "치비",
  pixel_art: "픽셀 아트",
  concept_art: "콘셉트 아트",
  flat_vector: "플랫/벡터",
  cyberpunk: "사이버펑크",
  dark_fantasy: "다크 판타지",
  slot_premium: "슬롯 프리미엄",
  disney_pixar: "디즈니/픽사",
};

export const REFERENCE_ROLE_LABEL: Record<ReferenceRole, string> = {
  style: "스타일 참고",
  composition: "구도 참고",
  color: "색감 참고",
  character: "캐릭터 유지",
  material: "재질 참고",
};

const WORK_TYPE_EN: Record<WorkType, { sentence: string; keyword: string }> = {
  banner: { sentence: "a promotional game banner illustration", keyword: "game banner, promotional artwork" },
  character: { sentence: "a game character illustration", keyword: "game character, character art" },
  frame: { sentence: "a decorative UI frame asset", keyword: "decorative UI frame, ornamental border" },
  background: { sentence: "a background scene illustration", keyword: "background scene, environment art" },
  icon: { sentence: "a single game icon asset", keyword: "game icon, single asset" },
};

const STYLE_EN: Record<StyleType, { sentence: string; keyword: string }> = {
  casual_game: {
    sentence: "rendered in a clean casual mobile game art style with vibrant flat colors, bouncy proportions, soft rim lighting, and friendly approachable shapes",
    keyword: "casual mobile game art, vibrant flat colors, bouncy proportions, clean shapes, soft rim lighting",
  },
  realistic: {
    sentence: "rendered in a photorealistic style with hyper-detailed textures, natural lighting, shallow depth of field, and 8k render quality",
    keyword: "photorealistic, hyper-detailed textures, natural lighting, shallow depth of field, 8k render",
  },
  cartoon: {
    sentence: "rendered in a western cartoon style with bold black outlines, flat saturated colors, and exaggerated expressions",
    keyword: "western cartoon style, bold black outlines, flat saturated colors, exaggerated expressions",
  },
  "2_5d": {
    sentence: "rendered in a 2.5D isometric game art style with painted hand-drawn textures, semi-3D look, and soft directional shadows",
    keyword: "2.5D isometric game art, painted hand-drawn textures, semi-3D look, soft shadows",
  },
  retro: {
    sentence: "rendered in a retro arcade aesthetic inspired by vintage 80s game art, with limited color palette and subtle scanline overlay",
    keyword: "retro arcade aesthetic, vintage 80s game art, limited color palette, scanline overlay",
  },
  neon: {
    sentence: "rendered with vivid neon glow lighting, vibrant magenta and cyan accents, glowing edges, and a dark contrasting background",
    keyword: "neon glow lighting, vibrant magenta and cyan, glowing edges, dark contrasting background",
  },
  premium_gold: {
    sentence: "rendered in a premium gold luxury aesthetic with polished metallic surfaces, elegant ornaments, and a soft golden glow",
    keyword: "premium gold luxury, polished metallic surfaces, elegant ornaments, soft golden glow",
  },
  anime_manga: {
    sentence: "rendered in a vibrant Japanese anime and manga style with cel shading, expressive eyes, clean linework, and dynamic posing",
    keyword: "anime style, manga style, cel shading, expressive eyes, clean linework, vibrant colors",
  },
  chibi: {
    sentence: "rendered as a chibi-style illustration with small body proportions, oversized head, large sparkling eyes, and cute pastel colors",
    keyword: "chibi style, super-deformed, small body, big head, sparkling eyes, cute pastel colors",
  },
  pixel_art: {
    sentence: "rendered as a crisp pixel art piece with hard pixel edges, a strictly limited palette, and 16-bit retro game aesthetics",
    keyword: "pixel art, 16-bit, hard pixel edges, limited palette, retro game sprite",
  },
  concept_art: {
    sentence: "rendered as a high-quality concept art painting with painterly brushstrokes, dynamic dramatic lighting, and cinematic composition",
    keyword: "concept art, painterly brushstrokes, dynamic lighting, cinematic composition, key visual",
  },
  flat_vector: {
    sentence: "rendered in a clean flat vector style with simple geometric shapes, bold solid colors, and minimal or no shading",
    keyword: "flat vector style, geometric shapes, bold solid colors, minimal shading, clean crisp lines",
  },
  cyberpunk: {
    sentence: "rendered in a cyberpunk style with a neon-lit dystopian cityscape, holographic signage, rain-soaked streets, and futuristic technology",
    keyword: "cyberpunk, neon-lit dystopian, holographic signage, rain-soaked streets, futuristic technology",
  },
  dark_fantasy: {
    sentence: "rendered in a dark fantasy style with a moody gothic atmosphere, dramatic shadows, ominous lighting, and weathered medieval details",
    keyword: "dark fantasy, gothic atmosphere, moody, dramatic shadows, ominous lighting, weathered medieval",
  },
  slot_premium: {
    sentence: "rendered as a premium slot machine asset with glossy ornate frames, sparkling jewels, gold and gem accents, and high-polish casino game UI feel",
    keyword: "slot machine asset, glossy ornate frame, sparkling jewels, gold and gem accents, casino UI polish",
  },
  disney_pixar: {
    sentence: "rendered in a polished modern stylized 3D family animation style with expressive cartoon characters, large eyes, soft cinematic lighting, and warm color grading",
    keyword: "modern stylized 3D animation, expressive cartoon characters, large eyes, soft cinematic lighting, warm color grading",
  },
};

const REFERENCE_ROLE_EN: Record<ReferenceRole, string> = {
  style: "match the overall style and rendering of the reference image",
  composition: "follow the composition and layout of the reference image",
  color: "match the color palette and tonal mood of the reference image",
  character: "preserve the character identity and key features from the reference image",
  material: "match the material qualities and surface textures of the reference image",
};

// === 하이라이트 토큰 ===
const B = "[[B]]";
const E = "[[/B]]";
function hi(text: string): string {
  if (!text) return text;
  return `${B}${text}${E}`;
}

/** 결과 카드 복사 시 토큰 제거용 헬퍼 (page.tsx에서 import해서 사용) */
export function stripHighlight(s: string): string {
  return s.replace(/\[\[\/?B\]\]/g, "");
}

function resolveRatio(input: PromptInput): string {
  if (input.ratio === "custom") return input.customRatio.trim() || "1:1";
  return input.ratio;
}

function ratioForGptSentence(input: PromptInput): string {
  const r = resolveRatio(input);
  if (/^\d+x\d+$/i.test(r)) return `${r} pixels`;
  return `${r} aspect ratio`;
}

function ratioForMidjourney(input: PromptInput): string {
  const r = resolveRatio(input);
  if (r === "1000x600") return "--ar 5:3";
  const pxMatch = r.match(/^(\d+)x(\d+)$/i);
  if (pxMatch) {
    const w = parseInt(pxMatch[1], 10);
    const h = parseInt(pxMatch[2], 10);
    const g = gcd(w, h);
    return `--ar ${w / g}:${h / g}`;
  }
  return `--ar ${r}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function forbidToEnglish(forbid: PromptInput["forbid"]): string[] {
  const list: string[] = [];
  if (forbid.text) list.push("no text");
  if (forbid.logo) list.push("no logo");
  if (forbid.noise) list.push("no noise");
  if (forbid.messyTexture) list.push("no messy or dirty textures");
  if (forbid.sparkle) list.push("no sparkles or glitter");
  if (forbid.overDetail) list.push("avoid excessive detail, keep it clean");
  return list;
}

function forbidToKorean(forbid: PromptInput["forbid"]): string[] {
  const list: string[] = [];
  if (forbid.text) list.push("텍스트 금지");
  if (forbid.logo) list.push("로고 금지");
  if (forbid.noise) list.push("노이즈 금지");
  if (forbid.messyTexture) list.push("지저분한 텍스처 금지");
  if (forbid.sparkle) list.push("반짝이 금지");
  if (forbid.overDetail) list.push("과한 디테일 금지");
  return list;
}

function buildKoreanSummary(input: PromptInput): string {
  const lines: string[] = [];
  lines.push(`작업 유형: ${hi(WORK_TYPE_LABEL[input.workType])}`);
  lines.push(`스타일: ${hi(STYLE_LABEL[input.style])}`);
  lines.push(`비율: ${hi(resolveRatio(input))}`);
  if (input.hasReferenceImage) {
    lines.push(`참고 이미지 역할: ${hi(REFERENCE_ROLE_LABEL[input.referenceRole])}`);
  }
  lines.push(`요청 내용: ${hi(input.request.trim() || "(미입력)")}`);
  const forbids = forbidToKorean(input.forbid);
  if (forbids.length > 0) lines.push(`금지 요소: ${hi(forbids.join(", "))}`);
  return lines.join("\n");
}

function buildGptImage(input: PromptInput): string {
  const work = WORK_TYPE_EN[input.workType].sentence;
  const style = STYLE_EN[input.style].sentence;
  const ratio = ratioForGptSentence(input);
  const forbids = forbidToEnglish(input.forbid);
  const koRequest = input.request.trim();
  const enRequest = (input.englishRequest ?? "").trim();

  const parts: string[] = [];
  parts.push(`Create ${hi(work)}.`);
  if (input.hasReferenceImage) {
    parts.push(`Use the attached reference image to ${hi(REFERENCE_ROLE_EN[input.referenceRole])}.`);
  }
  if (enRequest && koRequest) {
    parts.push(`The concept from the designer is: "${hi(enRequest)}".`);
    parts.push(`Original Korean brief for nuance: "${hi(koRequest)}".`);
  } else if (koRequest) {
    parts.push(`The concept from the designer is: "${hi(koRequest)}".`);
  }
  parts.push(`It should be ${hi(style)}.`);
  parts.push(`Compose the image at ${hi(ratio)}, with a clear focal point and balanced composition.`);
  if (forbids.length > 0) parts.push(`Important constraints: ${hi(forbids.join(", "))}.`);
  parts.push("Keep the result production-ready for game art use, with clean edges and consistent lighting.");
  return parts.join(" ");
}

function buildNanoBanana(
  input: PromptInput,
  model: "nano_banana" | "nano_banana_2" | "nano_banana_pro" = "nano_banana"
): string {
  const koRequest = input.request.trim();
  const enRequest = (input.englishRequest ?? "").trim();
  const styleKeyword = STYLE_EN[input.style].keyword;
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const ratio = resolveRatio(input);

  const keepLines = [
    hi(workKeyword),
    hi(styleKeyword),
    `aspect ratio ${hi(ratio)}`,
    "clean composition, balanced lighting",
  ];
  if (input.hasReferenceImage) {
    keepLines.unshift(`from the reference image: ${hi(REFERENCE_ROLE_EN[input.referenceRole])}`);
  }
  if (model === "nano_banana_2") {
    keepLines.push("target resolution: 2K (or higher)");
    keepLines.push(`aspect ratio precise: ${hi(ratio)}`);
  } else if (model === "nano_banana_pro") {
    keepLines.push("target resolution: 4K, professional print-ready");
    keepLines.push("text rendering: enabled, multilingual");
    if (input.hasReferenceImage) {
      keepLines.push("maintain identity across all reference images, up to 5 people");
    }
  }

  const changeLines: string[] = [];
  if (enRequest) {
    changeLines.push(`apply this concept: ${hi(enRequest)}`);
    if (koRequest) changeLines.push(`(original Korean: ${hi(koRequest)})`);
  } else if (koRequest) {
    changeLines.push(`apply this concept: ${hi(koRequest)}`);
  }
  changeLines.push(`adjust visual mood to match ${hi(STYLE_LABEL[input.style])} style`);

  const removeLinesRaw = forbidToEnglish(input.forbid);
  const removeLines =
    removeLinesRaw.length === 0
      ? ["anything that distracts from the main subject"]
      : removeLinesRaw.map(hi);

  const block = (label: string, lines: string[]) =>
    `${label}:\n` + lines.map((l) => `- ${l}`).join("\n");

  return [
    block("Keep", keepLines),
    block("Change", changeLines),
    block("Remove", removeLines),
  ].join("\n\n");
}

function buildMidjourney(
  input: PromptInput,
  model: "mj_v7" | "mj_v8_alpha" | "mj_v8_1_alpha" = "mj_v7"
): string {
  const koRequest = input.request.trim();
  const enRequest = (input.englishRequest ?? "").trim();
  const userRequest = enRequest || koRequest;
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const styleKeyword = STYLE_EN[input.style].keyword;
  const ar = ratioForMidjourney(input);

  const keywords: string[] = [];
  if (userRequest) keywords.push(hi(userRequest));
  keywords.push(hi(workKeyword));
  keywords.push(hi(styleKeyword));
  keywords.push("high quality", "clean composition");

  const negatives = forbidToEnglish(input.forbid);
  let base = keywords.join(", ");
  if (negatives.length > 0) base += `, ${hi(negatives.join(", "))}`;

  const refHint = input.hasReferenceImage
    ? ` ${hi("--oref [reference_image_url] --ow 100")}`
    : "";

  let suffix = "";
  let comment = "";
  if (model === "mj_v8_alpha") {
    suffix = ` ${hi("--hd")}`;
    comment = "\n// generated for alpha.midjourney.com (V8 Alpha)";
  } else if (model === "mj_v8_1_alpha") {
    comment = "\n// generated for alpha.midjourney.com (V8.1 Alpha, default HD)";
  }

  return `${base} ${hi(ar)}${refHint}${suffix}${comment}`;
}

function buildNiji(
  input: PromptInput,
  model: "niji_6" | "niji_7" = "niji_7"
): string {
  const koRequest = input.request.trim();
  const enRequest = (input.englishRequest ?? "").trim();
  const userRequest = enRequest || koRequest;
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const styleKeyword = STYLE_EN[input.style].keyword;
  const ar = ratioForMidjourney(input);

  const keywords: string[] = [];
  if (userRequest) keywords.push(hi(userRequest));
  keywords.push(hi(workKeyword));
  keywords.push(hi(styleKeyword));
  keywords.push("anime style", "key visual", "clean composition");

  const negatives = forbidToEnglish(input.forbid);
  let base = keywords.join(", ");
  if (negatives.length > 0) base += `, ${hi(negatives.join(", "))}`;

  const refHint = input.hasReferenceImage
    ? ` ${hi("--cref [reference_image_url] --cw 100")}`
    : "";

  const nijiVersion = model === "niji_6" ? "--niji 6" : "--niji 7";
  return `${base} ${hi(ar)} ${hi(nijiVersion)}${refHint}`;
}

function appendModelComment(body: string, model: ModelKey): string {
  const idMap: Record<ModelKey, string> = {
    gpt_image_2: "gpt-image-2",
    gpt_image_1_5: "gpt-image-1.5",
    gpt_image_1: "gpt-image-1",
    gpt_image_1_mini: "gpt-image-1-mini",
    nano_banana: "gemini-2.5-flash-image",
    nano_banana_2: "gemini-3.1-flash-image-preview",
    nano_banana_pro: "gemini-3-pro-image-preview",
    mj_v7: "midjourney-v7",
    mj_v8_alpha: "midjourney-v8-alpha",
    mj_v8_1_alpha: "midjourney-v8.1-alpha",
    niji_6: "niji-6",
    niji_7: "niji-7",
  };
  return `${body}\n\n// model: ${idMap[model]}`;
}

export function buildPromptFor(model: ModelKey, input: PromptInput): string {
  switch (model) {
    case "gpt_image_2":
    case "gpt_image_1_5":
    case "gpt_image_1":
    case "gpt_image_1_mini":
      return appendModelComment(buildGptImage(input), model);
    case "nano_banana":
    case "nano_banana_2":
    case "nano_banana_pro":
      return appendModelComment(buildNanoBanana(input, model), model);
    case "mj_v7":
    case "mj_v8_alpha":
    case "mj_v8_1_alpha":
      return buildMidjourney(input, model);
    case "niji_6":
    case "niji_7":
      return buildNiji(input, model);
  }
}

function buildRevision(input: PromptInput): string {
  const koRequest = input.request.trim();
  const enRequest = (input.englishRequest ?? "").trim();
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const styleKeyword = STYLE_EN[input.style].keyword;
  const ratio = resolveRatio(input);
  const forbids = forbidToEnglish(input.forbid);

  const lines: string[] = [];
  lines.push("Revise the previous image result.");
  lines.push("Make the image cleaner and easier to read. Reduce messy texture, noise, clutter, and excessive details.");
  lines.push("");
  lines.push("Original brief:");
  lines.push(`- Work type: ${hi(workKeyword)}`);
  lines.push(`- Style: ${hi(styleKeyword)}`);
  lines.push(`- Aspect ratio: ${hi(ratio)}`);
  if (enRequest) {
    lines.push(`- Concept: "${hi(enRequest)}"`);
    if (koRequest) lines.push(`- Original Korean: "${hi(koRequest)}"`);
  } else if (koRequest) {
    lines.push(`- Concept (in Korean): "${hi(koRequest)}"`);
  }
  lines.push("");
  lines.push("What to change:");
  lines.push("- (Describe what to improve here. e.g. warmer color tone, softer character expression, more empty space in the center)");
  lines.push("");
  lines.push("What to keep:");
  lines.push("- Overall composition and focal point");
  lines.push("- Style consistency with the original direction");
  if (input.hasReferenceImage) {
    lines.push(`- The ${hi(REFERENCE_ROLE_LABEL[input.referenceRole])} guidance from the reference image`);
  }
  lines.push("");
  lines.push("Must avoid:");
  if (forbids.length > 0) {
    forbids.forEach((f) => lines.push(`- ${hi(f)}`));
  } else {
    lines.push("- anything that distracts from the main subject");
  }
  return lines.join("\n");
}

export function buildPrompts(input: PromptInput): PromptOutput {
  return {
    koreanSummary: buildKoreanSummary(input),
    gptImage: buildGptImage(input),
    nanoBanana: buildNanoBanana(input),
    midjourney: buildMidjourney(input),
    revision: buildRevision(input),
  };
}
