// 입력 내용을 옵션으로 정리하기 (키워드 매칭 1차 구현)
// - API 미사용. 한글/영어 자유입력 텍스트에 등장하는 키워드를 감지해서
//   PromptInput 옵션을 자동으로 채웁니다.
// - 사용자는 자동 채워진 결과를 다시 수정할 수 있습니다.
// - 향후 OpenAI/Gemini API 연결 시 이 함수를 교체할 수 있도록
//   동일한 시그니처(extractOptions)를 유지합니다.

import {
  PromptInput,
  CharacterInput,
  BackgroundInput,
  AssetInput,
  WorkType,
} from "./promptBuilder";

interface ExtractedHints {
  workType?: WorkType;
  style?: string;
  character: Partial<CharacterInput>;
  background: Partial<BackgroundInput>;
  asset: Partial<AssetInput>;
  negativeAdds: string[];
}

// 키워드 → 옵션 매핑 (한국어 + 일부 영어)
type Rule = { tokens: string[]; apply: (h: ExtractedHints) => void };

const RULES: Rule[] = [
  // 작업 유형
  { tokens: ["캐릭터", "character"], apply: (h) => (h.workType = "character") },
  { tokens: ["배경", "background", "scenery", "환경"], apply: (h) => (h.workType = "background") },
  { tokens: ["프레임", "frame", "테두리"], apply: (h) => (h.workType = "frame") },
  { tokens: ["아이콘", "icon"], apply: (h) => (h.workType = "icon") },
  { tokens: ["오브젝트", "소품", "object", "prop"], apply: (h) => (h.workType = "object") },

  // 스타일
  { tokens: ["판타지"], apply: (h) => (h.style = "premium_fantasy") },
  { tokens: ["고급"], apply: (h) => (h.style = "premium_fantasy") },
  { tokens: ["프리미엄", "premium"], apply: (h) => (h.style = "premium_gold") },
  { tokens: ["네온", "neon"], apply: (h) => (h.style = "neon") },
  { tokens: ["픽셀", "pixel"], apply: (h) => (h.style = "pixel_art") },
  { tokens: ["레트로", "retro"], apply: (h) => (h.style = "retro") },
  { tokens: ["애니", "망가", "anime", "manga"], apply: (h) => (h.style = "anime_manga") },
  { tokens: ["디즈니", "픽사", "pixar", "disney", "3d 애니메이션", "3d animation"], apply: (h) => (h.style = "stylized_3d") },
  { tokens: ["카툰", "cartoon"], apply: (h) => (h.style = "cartoon") },
  { tokens: ["실사", "photoreal", "realistic"], apply: (h) => (h.style = "realistic") },
  { tokens: ["반실사", "semi-real"], apply: (h) => (h.style = "semi_realistic") },
  { tokens: ["로우폴리", "low poly"], apply: (h) => (h.style = "low_poly") },
  { tokens: ["클레이", "clay"], apply: (h) => (h.style = "clay") },
  { tokens: ["토이", "toy"], apply: (h) => (h.style = "toy") },
  { tokens: ["아이소메트릭", "isometric"], apply: (h) => (h.style = "isometric") },
  { tokens: ["2.5d"], apply: (h) => (h.style = "2_5d") },
  { tokens: ["캐주얼", "모바일 게임"], apply: (h) => (h.style = "casual_game") },

  // 캐릭터 - 성별
  { tokens: ["여성", "여자", "여캐", "female", "girl", "woman"], apply: (h) => (h.character.gender = "female") },
  { tokens: ["남성", "남자", "남캐", "male", "boy", "man"], apply: (h) => (h.character.gender = "male") },

  // 캐릭터 - 나이대
  { tokens: ["어린이", "아이", "child"], apply: (h) => (h.character.ageRange = "child") },
  { tokens: ["10대", "teen"], apply: (h) => (h.character.ageRange = "teen") },
  { tokens: ["20대"], apply: (h) => (h.character.ageRange = "20s") },
  { tokens: ["30대"], apply: (h) => (h.character.ageRange = "30s") },
  { tokens: ["중년"], apply: (h) => (h.character.ageRange = "middle") },
  { tokens: ["노년", "노인", "elder"], apply: (h) => (h.character.ageRange = "elder") },

  // 캐릭터 - 체형
  { tokens: ["슬림", "slim"], apply: (h) => (h.character.bodyType = "slim") },
  { tokens: ["근육", "muscular"], apply: (h) => (h.character.bodyType = "muscular") },
  { tokens: ["탄탄", "athletic"], apply: (h) => (h.character.bodyType = "athletic") },
  { tokens: ["통통", "chubby"], apply: (h) => (h.character.bodyType = "chubby") },
  { tokens: ["치비", "chibi", "sd"], apply: (h) => (h.character.bodyType = "chibi") },
  { tokens: ["키 큰", "tall"], apply: (h) => (h.character.bodyType = "tall") },

  // 캐릭터 - 머리 (대표적인 것만)
  { tokens: ["긴 머리", "long hair"], apply: (h) => (h.character.hair = "long") },
  { tokens: ["짧은 머리", "short hair"], apply: (h) => (h.character.hair = "short") },
  { tokens: ["흰 머리", "white hair"], apply: (h) => (h.character.hair = "white") },
  { tokens: ["은색 머리", "silver hair"], apply: (h) => (h.character.hair = "silver") },
  { tokens: ["금발", "blonde"], apply: (h) => (h.character.hair = "blonde") },
  { tokens: ["검은 머리", "black hair"], apply: (h) => (h.character.hair = "black") },
  { tokens: ["갈색 머리", "brown hair"], apply: (h) => (h.character.hair = "brown") },
  { tokens: ["웨이브"], apply: (h) => (h.character.hair = "wavy") },
  { tokens: ["포니테일", "ponytail"], apply: (h) => (h.character.hair = "ponytail") },
  { tokens: ["분홍 머리", "pink hair"], apply: (h) => (h.character.hair = "pink") },
  { tokens: ["파란 머리", "blue hair"], apply: (h) => (h.character.hair = "blue") },
  { tokens: ["보라 머리", "purple hair"], apply: (h) => (h.character.hair = "purple") },
  { tokens: ["곱슬"], apply: (h) => (h.character.hair = "curly") },

  // 캐릭터 - 의상
  { tokens: ["갑옷", "armor"], apply: (h) => (h.character.outfit = "armor") },
  { tokens: ["드레스", "dress"], apply: (h) => (h.character.outfit = "dress") },
  { tokens: ["로브", "robe"], apply: (h) => (h.character.outfit = "wizard_robe") },
  { tokens: ["정장", "suit"], apply: (h) => (h.character.outfit = "suit") },
  { tokens: ["캐주얼 의상"], apply: (h) => (h.character.outfit = "casual") },
  { tokens: ["판타지 의상"], apply: (h) => (h.character.outfit = "fantasy") },
  { tokens: ["모험가"], apply: (h) => (h.character.outfit = "adventurer") },
  { tokens: ["왕족", "royal"], apply: (h) => (h.character.outfit = "royal") },
  { tokens: ["전통 의상", "한복"], apply: (h) => (h.character.outfit = "traditional") },
  { tokens: ["미래", "futuristic"], apply: (h) => (h.character.outfit = "futuristic") },
  { tokens: ["스포츠 의상"], apply: (h) => (h.character.outfit = "sportswear") },
  { tokens: ["교복"], apply: (h) => (h.character.outfit = "school_uniform") },
  { tokens: ["가죽 의상"], apply: (h) => (h.character.outfit = "leather") },

  // 캐릭터 - 포즈
  { tokens: ["정면으로 서"], apply: (h) => (h.character.pose = "standing_front") },
  { tokens: ["서 있"], apply: (h) => (h.character.pose = "standing_front") },
  { tokens: ["앉아", "sitting"], apply: (h) => (h.character.pose = "sitting") },
  { tokens: ["걷는", "walking"], apply: (h) => (h.character.pose = "walking") },
  { tokens: ["달리", "running"], apply: (h) => (h.character.pose = "running") },
  { tokens: ["액션 포즈", "action pose"], apply: (h) => (h.character.pose = "action") },
  { tokens: ["점프", "jump"], apply: (h) => (h.character.pose = "jumping") },
  { tokens: ["팔짱"], apply: (h) => (h.character.pose = "arms_crossed") },
  { tokens: ["무기를 들"], apply: (h) => (h.character.pose = "holding_weapon") },
  { tokens: ["마법을"], apply: (h) => (h.character.pose = "casting_magic") },

  // 캐릭터 - 보이는 범위
  { tokens: ["전신", "full body"], apply: (h) => (h.character.visibleRange = "full_body") },
  { tokens: ["반신", "half body"], apply: (h) => (h.character.visibleRange = "half_body") },
  { tokens: ["상반신", "upper body"], apply: (h) => (h.character.visibleRange = "upper_body") },
  { tokens: ["얼굴 클로즈업", "close-up"], apply: (h) => (h.character.visibleRange = "face_close") },

  // 캐릭터 - 보는 각도
  { tokens: ["눈높이"], apply: (h) => (h.character.viewingAngle = "eye_level") },
  { tokens: ["비스듬", "three-quarter", "3/4"], apply: (h) => (h.character.viewingAngle = "three_quarter") },
  { tokens: ["위에서 내려"], apply: (h) => (h.character.viewingAngle = "top_down") },
  { tokens: ["아래에서 올려"], apply: (h) => (h.character.viewingAngle = "looking_up") },

  // 캐릭터 - 시트
  { tokens: ["턴어라운드", "turnaround"], apply: (h) => (h.character.characterSheet = "turnaround") },
  { tokens: ["표정 시트"], apply: (h) => (h.character.characterSheet = "expression_sheet") },
  { tokens: ["포즈 시트"], apply: (h) => (h.character.characterSheet = "pose_sheet") },
  { tokens: ["캐릭터 시트", "character sheet"], apply: (h) => (h.character.characterSheet = "design_sheet") },

  // 배경 - 장소
  { tokens: ["숲", "forest"], apply: (h) => (h.background.place = "forest") },
  { tokens: ["마법 숲"], apply: (h) => (h.background.place = "magical_forest") },
  { tokens: ["마을", "village"], apply: (h) => (h.background.place = "village") },
  { tokens: ["성", "castle"], apply: (h) => (h.background.place = "castle") },
  { tokens: ["도시", "city"], apply: (h) => (h.background.place = "city") },
  { tokens: ["미래 도시"], apply: (h) => (h.background.place = "futuristic_city") },
  { tokens: ["동굴", "cave"], apply: (h) => (h.background.place = "cave") },
  { tokens: ["던전", "dungeon"], apply: (h) => (h.background.place = "dungeon") },
  { tokens: ["신전", "temple"], apply: (h) => (h.background.place = "temple") },
  { tokens: ["해변", "beach"], apply: (h) => (h.background.place = "beach") },
  { tokens: ["바다", "ocean"], apply: (h) => (h.background.place = "ocean") },
  { tokens: ["설산"], apply: (h) => (h.background.place = "snowy_mountain") },
  { tokens: ["사막", "desert"], apply: (h) => (h.background.place = "desert") },
  { tokens: ["하늘섬"], apply: (h) => (h.background.place = "sky_island") },
  { tokens: ["우주", "space"], apply: (h) => (h.background.place = "space") },
  { tokens: ["카페", "cafe"], apply: (h) => (h.background.place = "cafe") },
  { tokens: ["폐허", "ruins"], apply: (h) => (h.background.place = "ruins") },

  // 배경 - 시간대
  { tokens: ["아침", "morning"], apply: (h) => (h.background.timeOfDay = "morning") },
  { tokens: ["낮"], apply: (h) => (h.background.timeOfDay = "day") },
  { tokens: ["석양", "sunset"], apply: (h) => (h.background.timeOfDay = "sunset") },
  { tokens: ["저녁", "evening"], apply: (h) => (h.background.timeOfDay = "evening") },
  { tokens: ["밤", "night"], apply: (h) => (h.background.timeOfDay = "night") },
  { tokens: ["새벽", "dawn"], apply: (h) => (h.background.timeOfDay = "dawn") },
  { tokens: ["비 오는", "rainy"], apply: (h) => (h.background.timeOfDay = "rainy") },
  { tokens: ["눈 오는", "snowy"], apply: (h) => (h.background.timeOfDay = "snowy") },
  { tokens: ["안개", "foggy"], apply: (h) => (h.background.timeOfDay = "foggy") },

  // 배경 - 분위기
  { tokens: ["고급스러운", "luxurious"], apply: (h) => (h.background.mood = "luxurious") },
  { tokens: ["귀여운", "cute"], apply: (h) => (h.background.mood = "cute") },
  { tokens: ["신비로운", "mystical"], apply: (h) => (h.background.mood = "mystical") },
  { tokens: ["따뜻한", "warm"], apply: (h) => (h.background.mood = "warm") },
  { tokens: ["차가운", "cold"], apply: (h) => (h.background.mood = "cold") },
  { tokens: ["어두운", "dark"], apply: (h) => (h.background.mood = "dark") },
  { tokens: ["웅장한", "grand"], apply: (h) => (h.background.mood = "grand") },
  { tokens: ["평화로운", "peaceful"], apply: (h) => (h.background.mood = "peaceful") },
  { tokens: ["모험적", "adventur"], apply: (h) => (h.background.mood = "adventurous") },
  { tokens: ["긴장감", "tense"], apply: (h) => (h.background.mood = "tense") },

  // 배경 - 빛
  { tokens: ["노을빛", "노을"], apply: (h) => (h.background.lighting = "sunset") },
  { tokens: ["달빛", "moonlight"], apply: (h) => (h.background.lighting = "moon") },
  { tokens: ["네온 느낌"], apply: (h) => (h.background.lighting = "neon") },
  { tokens: ["극적인 조명", "dramatic"], apply: (h) => (h.background.lighting = "dramatic") },
  { tokens: ["마법 glow", "magical glow"], apply: (h) => (h.background.lighting = "magic_glow") },

  // 배경 - 색감
  { tokens: ["파스텔"], apply: (h) => (h.background.colorPalette = "pastel") },
  { tokens: ["골드", "gold"], apply: (h) => (h.background.colorPalette = "gold") },
  { tokens: ["블랙 골드"], apply: (h) => (h.background.colorPalette = "black_gold") },

  // 에셋 - 형태
  { tokens: ["원형", "circular"], apply: (h) => (h.asset.shape = "circle") },
  { tokens: ["사각형", "square"], apply: (h) => (h.asset.shape = "square") },
  { tokens: ["둥근 사각형"], apply: (h) => (h.asset.shape = "rounded_square") },
  { tokens: ["방패", "shield"], apply: (h) => (h.asset.shape = "shield") },
  { tokens: ["별 모양", "star"], apply: (h) => (h.asset.shape = "star") },
  { tokens: ["리본", "ribbon"], apply: (h) => (h.asset.shape = "ribbon") },

  // 에셋 - 표면
  { tokens: ["금속", "metal"], apply: (h) => (h.asset.surface = "metal") },
  { tokens: ["나무", "wood"], apply: (h) => (h.asset.surface = "wood") },
  { tokens: ["돌", "stone"], apply: (h) => (h.asset.surface = "stone") },
  { tokens: ["유리", "glass"], apply: (h) => (h.asset.surface = "glass") },
  { tokens: ["크리스탈", "crystal"], apply: (h) => (h.asset.surface = "crystal") },
  { tokens: ["보석", "gem"], apply: (h) => (h.asset.surface = "gem") },
  { tokens: ["젤리", "jelly"], apply: (h) => (h.asset.surface = "jelly") },

  // 에셋 - 배경 처리
  { tokens: ["투명 배경", "transparent"], apply: (h) => (h.asset.backgroundTreatment = "transparent") },
  { tokens: ["흰 배경", "white background"], apply: (h) => (h.asset.backgroundTreatment = "white") },
];

function makeEmptyHints(): ExtractedHints {
  return {
    character: {},
    background: {},
    asset: {},
    negativeAdds: [],
  };
}

/**
 * 입력 텍스트(한글 + 영어)에서 옵션 힌트를 뽑아냅니다.
 * 같은 슬롯에 여러 키워드가 매칭되면 마지막 매칭이 이깁니다.
 */
export function extractOptions(koreanMemo: string, englishSupplement: string): ExtractedHints {
  const text = `${koreanMemo}\n${englishSupplement}`.toLowerCase();
  const hints = makeEmptyHints();
  for (const rule of RULES) {
    const matched = rule.tokens.some((t) => text.includes(t.toLowerCase()));
    if (matched) rule.apply(hints);
  }
  return hints;
}

/**
 * 추출된 힌트를 PromptInput에 적용합니다.
 * - 사용자가 이미 직접 고른 값(자동이 아닌 값)은 절대 덮어쓰지 않습니다.
 * - 자동(auto)인 슬롯에만 힌트를 주입합니다.
 */
export function applyHintsToInput(input: PromptInput, hints: ExtractedHints): PromptInput {
  const next: PromptInput = {
    ...input,
    character: { ...input.character },
    background: { ...input.background },
    asset: { ...input.asset, rules: [...input.asset.rules] },
    references: input.references.map((r) => ({ ...r })),
  };

  if (hints.workType && next.workType === input.workType) {
    next.workType = hints.workType;
  }
  if (hints.style && next.style === "auto") next.style = hints.style;

  // 캐릭터: auto일 때만 채우기
  const c = next.character;
  const hc = hints.character;
  if (hc.gender && c.gender === "auto") c.gender = hc.gender;
  if (hc.ageRange && c.ageRange === "auto") c.ageRange = hc.ageRange;
  if (hc.bodyType && c.bodyType === "auto") c.bodyType = hc.bodyType;
  if (hc.hair && c.hair === "auto") c.hair = hc.hair;
  if (hc.outfit && c.outfit === "auto") c.outfit = hc.outfit;
  if (hc.pose && c.pose === "auto") c.pose = hc.pose;
  if (hc.visibleRange && c.visibleRange === "auto") c.visibleRange = hc.visibleRange;
  if (hc.viewingAngle && c.viewingAngle === "auto") c.viewingAngle = hc.viewingAngle;
  if (hc.characterDirection && c.characterDirection === "auto") c.characterDirection = hc.characterDirection;
  if (hc.characterSheet && c.characterSheet === "single") c.characterSheet = hc.characterSheet;

  // 배경: auto일 때만 채우기
  const b = next.background;
  const hb = hints.background;
  if (hb.place && b.place === "auto") b.place = hb.place;
  if (hb.timeOfDay && b.timeOfDay === "auto") b.timeOfDay = hb.timeOfDay;
  if (hb.mood && b.mood === "auto") b.mood = hb.mood;
  if (hb.lighting && b.lighting === "auto") b.lighting = hb.lighting;
  if (hb.colorPalette && b.colorPalette === "auto") b.colorPalette = hb.colorPalette;
  if (hb.depth && b.depth === "auto") b.depth = hb.depth;
  if (hb.complexity && b.complexity === "auto") b.complexity = hb.complexity;
  if (hb.layout && b.layout === "auto") b.layout = hb.layout;
  if (hb.viewingAngle && b.viewingAngle === "auto") b.viewingAngle = hb.viewingAngle;
  if (hb.visibleRange && b.visibleRange === "auto") b.visibleRange = hb.visibleRange;

  // 에셋: auto일 때만 채우기
  const a = next.asset;
  const ha = hints.asset;
  if (ha.shape && a.shape === "auto") a.shape = ha.shape;
  if (ha.surface && a.surface === "auto") a.surface = ha.surface;
  if (ha.dimension && a.dimension === "auto") a.dimension = ha.dimension;
  if (ha.decorationLevel && a.decorationLevel === "auto") a.decorationLevel = ha.decorationLevel;
  if (ha.backgroundTreatment && a.backgroundTreatment === "auto") a.backgroundTreatment = ha.backgroundTreatment;

  return next;
}

/**
 * 사용자가 새로 채운 항목 수 (변경 감지용)
 */
export function countAppliedHints(before: PromptInput, after: PromptInput): number {
  let n = 0;
  if (before.style === "auto" && after.style !== "auto") n++;

  const cb = before.character, ca = after.character;
  for (const k of Object.keys(cb) as (keyof CharacterInput)[]) {
    if (k.endsWith("Custom")) continue;
    if (k === "characterSheet") {
      if (cb[k] === "single" && ca[k] !== "single") n++;
    } else if (cb[k] === "auto" && ca[k] !== "auto") {
      n++;
    }
  }

  const bb = before.background, ba = after.background;
  for (const k of Object.keys(bb) as (keyof BackgroundInput)[]) {
    if (k.endsWith("Custom")) continue;
    if (bb[k] === "auto" && ba[k] !== "auto") n++;
  }

  const ab = before.asset, aa = after.asset;
  for (const k of Object.keys(ab) as (keyof AssetInput)[]) {
    if (k === "rules" || k.endsWith("Custom")) continue;
    if ((ab as any)[k] === "auto" && (aa as any)[k] !== "auto") n++;
  }
  return n;
}
