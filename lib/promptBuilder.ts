// 프롬프트 생성 로직
// 외부 API 없이 문자열 조합으로만 동작합니다.

export type WorkType = "banner" | "character" | "frame" | "background" | "icon";
export type StyleType =
  | "casual_game"
  | "realistic"
  | "cartoon"
  | "2_5d"
  | "retro"
  | "neon"
  | "premium_gold";
export type RatioType = "16:9" | "4:3" | "1:1" | "3:4" | "1000x600" | "custom";
export type ReferenceRole =
  | "style"
  | "composition"
  | "color"
  | "character"
  | "material";

export interface PromptInput {
  request: string;          // 한글 요청
  workType: WorkType;
  style: StyleType;
  ratio: RatioType;
  customRatio: string;      // ratio === "custom" 일 때 사용 (예: "1920x1080")
  referenceRole: ReferenceRole;
  hasReferenceImage: boolean; // 이미지가 업로드되어 있는지
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

// === 한글 라벨 매핑 ===
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
};

export const REFERENCE_ROLE_LABEL: Record<ReferenceRole, string> = {
  style: "스타일 참고",
  composition: "구도 참고",
  color: "색감 참고",
  character: "캐릭터 유지",
  material: "재질 참고",
};

// === 영어 키워드 매핑 ===
const WORK_TYPE_EN: Record<WorkType, { sentence: string; keyword: string }> = {
  banner: {
    sentence: "a promotional game banner illustration",
    keyword: "game banner, promotional artwork",
  },
  character: {
    sentence: "a game character illustration",
    keyword: "game character, character art",
  },
  frame: {
    sentence: "a decorative UI frame asset",
    keyword: "decorative UI frame, ornamental border",
  },
  background: {
    sentence: "a background scene illustration",
    keyword: "background scene, environment art",
  },
  icon: {
    sentence: "a single game icon asset",
    keyword: "game icon, single asset",
  },
};

const STYLE_EN: Record<
  StyleType,
  { sentence: string; keyword: string }
> = {
  casual_game: {
    sentence:
      "rendered in a clean casual mobile game art style, soft shading, friendly and approachable",
    keyword: "casual mobile game art, clean shapes, soft shading",
  },
  realistic: {
    sentence:
      "rendered in a photorealistic style with believable lighting and textures",
    keyword: "photorealistic, realistic lighting, detailed textures",
  },
  cartoon: {
    sentence:
      "rendered in a stylized cartoon style with bold outlines and flat colors",
    keyword: "cartoon style, bold outlines, flat colors",
  },
  "2_5d": {
    sentence:
      "rendered in a 2.5D game art style, semi-3D look with painted textures",
    keyword: "2.5D game art, semi-3D, painted textures",
  },
  retro: {
    sentence:
      "rendered in a retro pixel-art inspired style with limited color palette",
    keyword: "retro art, pixel-inspired, limited palette",
  },
  neon: {
    sentence:
      "rendered with vivid neon lighting, glowing edges, and a cyberpunk atmosphere",
    keyword: "neon lighting, glowing edges, cyberpunk mood",
  },
  premium_gold: {
    sentence:
      "rendered in a premium gold luxury style with polished metal, gold accents, and elegant composition",
    keyword: "premium gold, luxury, polished metal, elegant",
  },
};

const REFERENCE_ROLE_EN: Record<ReferenceRole, string> = {
  style: "match the overall style and rendering of the reference image",
  composition: "follow the composition and layout of the reference image",
  color: "match the color palette and tonal mood of the reference image",
  character: "preserve the character identity and key features from the reference image",
  material: "match the material qualities and surface textures of the reference image",
};

// === 비율 처리 ===
function resolveRatio(input: PromptInput): string {
  if (input.ratio === "custom") {
    return input.customRatio.trim() || "1:1";
  }
  return input.ratio;
}

function ratioForGptSentence(input: PromptInput): string {
  const r = resolveRatio(input);
  if (/^\d+x\d+$/i.test(r)) return `${r} pixels`;
  return `${r} aspect ratio`;
}

function ratioForMidjourney(input: PromptInput): string {
  const r = resolveRatio(input);
  // Midjourney --ar 파라미터
  if (r === "1000x600") return "--ar 5:3";
  // 1920x1080 처럼 픽셀이면 가장 단순한 비율로
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

// === 금지 요소 ===
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

// === 한글 요약 ===
function buildKoreanSummary(input: PromptInput): string {
  const lines: string[] = [];
  lines.push(`작업 유형: ${WORK_TYPE_LABEL[input.workType]}`);
  lines.push(`스타일: ${STYLE_LABEL[input.style]}`);
  lines.push(`비율: ${resolveRatio(input)}`);
  if (input.hasReferenceImage) {
    lines.push(`참고 이미지 역할: ${REFERENCE_ROLE_LABEL[input.referenceRole]}`);
  }
  lines.push(`요청 내용: ${input.request.trim() || "(미입력)"}`);
  const forbids = forbidToKorean(input.forbid);
  if (forbids.length > 0) {
    lines.push(`금지 요소: ${forbids.join(", ")}`);
  }
  return lines.join("\n");
}

// === GPT Image용: 문장형 지시문 ===
function buildGptImage(input: PromptInput): string {
  const work = WORK_TYPE_EN[input.workType].sentence;
  const style = STYLE_EN[input.style].sentence;
  const ratio = ratioForGptSentence(input);
  const forbids = forbidToEnglish(input.forbid);
  const userRequest = input.request.trim();

  const parts: string[] = [];
  parts.push(`Create ${work}.`);
  if (input.hasReferenceImage) {
    parts.push(
      `Use the attached reference image to ${REFERENCE_ROLE_EN[input.referenceRole]}.`
    );
  }
  if (userRequest) {
    parts.push(`The concept from the designer is: "${userRequest}".`);
  }
  parts.push(`It should be ${style}.`);
  parts.push(
    `Compose the image at ${ratio}, with a clear focal point and balanced composition.`
  );
  if (forbids.length > 0) {
    parts.push(`Important constraints: ${forbids.join(", ")}.`);
  }
  parts.push(
    "Keep the result production-ready for game art use, with clean edges and consistent lighting."
  );
  return parts.join(" ");
}

// === Nano Banana용: Keep / Change / Remove ===
function buildNanoBanana(input: PromptInput): string {
  const userRequest = input.request.trim();
  const styleKeyword = STYLE_EN[input.style].keyword;
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const ratio = resolveRatio(input);

  const keepLines = [
    workKeyword,
    styleKeyword,
    `aspect ratio ${ratio}`,
    "clean composition, balanced lighting",
  ];
  if (input.hasReferenceImage) {
    keepLines.unshift(
      `from the reference image: ${REFERENCE_ROLE_EN[input.referenceRole]}`
    );
  }

  const changeLines: string[] = [];
  if (userRequest) {
    changeLines.push(`apply this concept: ${userRequest}`);
  }
  changeLines.push(`adjust visual mood to match ${STYLE_LABEL[input.style]} style`);

  const removeLines = forbidToEnglish(input.forbid);
  if (removeLines.length === 0) {
    removeLines.push("anything that distracts from the main subject");
  }

  const block = (label: string, lines: string[]) =>
    `${label}:\n` + lines.map((l) => `- ${l}`).join("\n");

  return [
    block("Keep", keepLines),
    block("Change", changeLines),
    block("Remove", removeLines),
  ].join("\n\n");
}

// === Midjourney용: 키워드 중심 + --ar ===
function buildMidjourney(input: PromptInput): string {
  const userRequest = input.request.trim();
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const styleKeyword = STYLE_EN[input.style].keyword;
  const ar = ratioForMidjourney(input);

  const keywords: string[] = [];
  if (userRequest) keywords.push(userRequest);
  keywords.push(workKeyword);
  keywords.push(styleKeyword);
  keywords.push("high quality", "clean composition");

  const negatives = forbidToEnglish(input.forbid);
  let base = keywords.join(", ");
  if (negatives.length > 0) {
    base += `, ${negatives.join(", ")}`;
  }
  // 참고 이미지가 있으면 --cref 자리표시 안내 (실제 URL은 사용자가 붙여야 함)
  const refHint = input.hasReferenceImage ? " --cref [reference_image_url]" : "";
  return `${base} ${ar}${refHint}`;
}

// === 수정 요청용 프롬프트 (영문) ===
function buildRevision(input: PromptInput): string {
  const userRequest = input.request.trim();
  const workKeyword = WORK_TYPE_EN[input.workType].keyword;
  const styleKeyword = STYLE_EN[input.style].keyword;
  const ratio = resolveRatio(input);
  const forbids = forbidToEnglish(input.forbid);

  const lines: string[] = [];
  lines.push("Revise the previous image result.");
  lines.push(
    "Make the image cleaner and easier to read. Reduce messy texture, noise, clutter, and excessive details."
  );
  lines.push("");

  lines.push("Original brief:");
  lines.push(`- Work type: ${workKeyword}`);
  lines.push(`- Style: ${styleKeyword}`);
  lines.push(`- Aspect ratio: ${ratio}`);
  if (userRequest) {
    lines.push(`- Concept (in Korean): "${userRequest}"`);
  }
  lines.push("");

  lines.push("What to change:");
  lines.push(
    "- (Describe what to improve here. e.g. warmer color tone, softer character expression, more empty space in the center)"
  );
  lines.push("");

  lines.push("What to keep:");
  lines.push("- Overall composition and focal point");
  lines.push("- Style consistency with the original direction");
  if (input.hasReferenceImage) {
    lines.push(
      `- The ${REFERENCE_ROLE_LABEL[input.referenceRole]} guidance from the reference image`
    );
  }
  lines.push("");

  lines.push("Must avoid:");
  if (forbids.length > 0) {
    forbids.forEach((f) => lines.push(`- ${f}`));
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
