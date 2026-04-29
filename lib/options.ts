// 모든 선택 옵션의 한글 라벨 → 영어 표현 매핑
// - value: 내부 키 (state 저장용)
// - label: UI에 표시할 한글
// - en:    최종 영어 프롬프트에 들어갈 표현. 빈 문자열이면 무시(자동).
//          "__custom__" 이면 사용자의 직접 입력 텍스트를 사용.
// 한글은 절대 영어 프롬프트에 들어가지 않습니다.

export interface OptionItem {
  value: string;
  label: string;
  en: string;
  /** 마우스 hover 툴팁용 한 줄 설명 (선택). UI에만 노출되며 영어 프롬프트에는 들어가지 않음. */
  desc?: string;
}

// === 작업 유형 ===
export const WORK_TYPE_OPTIONS: OptionItem[] = [
  { value: "character", label: "캐릭터", en: "a game character illustration" },
  { value: "background", label: "배경", en: "a background scene illustration" },
  { value: "frame", label: "프레임", en: "a decorative UI frame asset" },
  { value: "icon", label: "아이콘", en: "a single game icon asset" },
  { value: "object", label: "오브젝트", en: "a single game object asset" },
];

// 짧은 키워드 버전 (Midjourney/Niji용)
export const WORK_TYPE_KEYWORD: Record<string, string> = {
  character: "game character art",
  background: "background environment art",
  frame: "decorative UI frame, ornamental border",
  icon: "single game icon",
  object: "single isolated game object",
};

// === 스타일 ===
// 정리 기준:
// - "캐주얼 게임"과 "모바일 게임"이 표현이 거의 같아 통합 → "캐주얼 게임" 하나만 유지
// - 기존 "애니메이션"은 일본식/픽사식 모호 → "애니/망가"(일본식)와
//   "디즈니·픽사 스타일"(서양 3D 패밀리 애니메이션)로 분리
// - 영어 표현은 브랜드명을 직접 쓰지 않습니다 (스펙: 특정 브랜드 연결 금지)
export const STYLE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "", desc: "스타일을 비워서 모델이 알아서 정하게 합니다." },
  { value: "casual_game", label: "캐주얼 게임", en: "casual mobile game art, vibrant flat colors, friendly rounded shapes", desc: "둥글둥글하고 친근한 캐주얼 모바일 게임 그림체." },
  { value: "2_5d", label: "2.5D 게임 아트", en: "2.5D game art, semi-3D look, painted textures, soft shadows", desc: "그림 같으면서 살짝 입체감 있는 게임 일러스트." },
  { value: "cartoon", label: "카툰", en: "western cartoon style, bold outlines, flat saturated colors", desc: "굵은 외곽선과 강한 색감의 서양 만화 느낌." },
  { value: "anime_manga", label: "애니/망가", en: "Japanese anime and manga style, cel shading, expressive eyes, clean linework", desc: "또렷한 눈과 깔끔한 선의 일본 애니/만화 느낌." },
  { value: "stylized_3d", label: "3D animation", en: "modern stylized 3D family animation style, expressive cartoon characters, large eyes, soft cinematic lighting, warm color grading", desc: "픽사·디즈니 영화 같은 3D 애니메이션 느낌." },
  { value: "semi_realistic", label: "반실사", en: "semi-realistic painterly style, refined textures, polished finish", desc: "사진은 아니지만 정교하게 그린 일러스트." },
  { value: "realistic", label: "실사", en: "photorealistic, hyper-detailed textures, natural lighting", desc: "사진처럼 보이는 사실적인 그림." },
  { value: "premium_fantasy", label: "고급 판타지", en: "premium fantasy art, cinematic lighting, polished finish", desc: "영화 포스터 같은 고급스러운 판타지 분위기." },
  { value: "premium_gold", label: "프리미엄 골드", en: "premium gold style, luxurious gold accents, polished metallic finish", desc: "황금빛이 강조된 럭셔리 느낌." },
  { value: "neon", label: "네온", en: "neon glow style, vivid magenta and cyan accents, glowing edges", desc: "어두운 배경에 네온빛이 강하게 빛나는 느낌." },
  { value: "retro", label: "레트로", en: "retro arcade aesthetic, vintage palette, subtle scanlines", desc: "옛날 오락실 게임 같은 빈티지 느낌." },
  { value: "pixel_art", label: "픽셀 아트", en: "pixel art, 16-bit, hard pixel edges, limited palette", desc: "도트로 찍은 16비트 픽셀 게임 스타일." },
  { value: "low_poly", label: "로우폴리", en: "low-poly 3D style, faceted geometry, flat shading", desc: "면이 각진 단순한 3D 모양." },
  { value: "clay", label: "클레이 스타일", en: "claymation style, soft sculpted look, handmade clay texture", desc: "찰흙 인형으로 만든 듯한 부드러운 느낌." },
  { value: "toy", label: "토이 스타일", en: "collectible toy figure style, plastic finish, soft studio lighting", desc: "수집용 피규어/장난감 같은 광택 있는 느낌." },
  { value: "isometric", label: "아이소메트릭", en: "isometric view, clean isometric perspective", desc: "위에서 비스듬히 내려다보는 미니어처 느낌." },
  { value: "ui_icon", label: "UI 아이콘 스타일", en: "UI icon style, clean readable design, app icon friendly", desc: "앱 아이콘처럼 깔끔하고 작아도 잘 보이는 디자인." },
  { value: "custom", label: "직접 입력", en: "__custom__", desc: "원하는 스타일을 영어로 직접 적습니다." },
];

// === 비율 ===
export const ASPECT_RATIO_OPTIONS: OptionItem[] = [
  { value: "16:9", label: "16:9", en: "16:9" },
  { value: "4:3", label: "4:3", en: "4:3" },
  { value: "1:1", label: "1:1", en: "1:1" },
  { value: "3:4", label: "3:4", en: "3:4" },
  { value: "1000x600", label: "1000x600", en: "1000x600" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

// === 빼고 싶은 것 (체크박스) ===
export const NEGATIVE_OPTIONS: OptionItem[] = [
  { value: "text", label: "텍스트", en: "no text" },
  { value: "logo", label: "로고", en: "no logo" },
  { value: "watermark", label: "워터마크", en: "no watermark" },
  { value: "signature", label: "서명", en: "no signature" },
  { value: "noise", label: "노이즈", en: "no noise" },
  { value: "blur", label: "흐릿함", en: "no blur" },
  { value: "low_res", label: "저해상도 느낌", en: "no low-resolution look" },
  { value: "messy_texture", label: "지저분한 텍스처", en: "no messy textures" },
  { value: "over_detail", label: "과한 디테일", en: "avoid excessive detail" },
  { value: "over_sparkle", label: "과한 반짝이", en: "no excessive sparkles" },
  { value: "over_shadow", label: "과한 그림자", en: "no excessive shadows" },
  { value: "distorted_hand", label: "이상한 손", en: "no distorted hands" },
  { value: "distorted_face", label: "왜곡된 얼굴", en: "no distorted face" },
  { value: "cropped", label: "잘린 오브젝트", en: "no cropped objects" },
  { value: "complex_bg", label: "복잡한 배경", en: "no overly complex background" },
];

// ===== 캐릭터 옵션 =====

export const GENDER_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "female", label: "여성", en: "female character" },
  { value: "male", label: "남성", en: "male character" },
  { value: "androgynous", label: "중성적", en: "androgynous character" },
  { value: "unspecified", label: "미지정", en: "non-specific gender" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const AGE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "child", label: "어린이", en: "child" },
  { value: "teen", label: "10대", en: "teenager" },
  { value: "20s", label: "20대", en: "young adult" },
  { value: "30s", label: "30대", en: "adult in their thirties" },
  { value: "middle", label: "중년", en: "middle-aged" },
  { value: "elder", label: "노년", en: "elderly" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const BODY_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "small_cute", label: "작고 귀여운 체형", en: "small cute body" },
  { value: "slim", label: "슬림한 체형", en: "slim body" },
  { value: "average", label: "평균 체형", en: "average build" },
  { value: "athletic", label: "탄탄한 체형", en: "athletic build" },
  { value: "muscular", label: "근육질 체형", en: "muscular build" },
  { value: "chubby", label: "통통한 체형", en: "chubby build" },
  { value: "tall", label: "키가 큰 체형", en: "tall build" },
  { value: "chibi", label: "SD·치비 비율", en: "chibi proportions" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const HAIR_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "short", label: "짧은 머리", en: "short hair" },
  { value: "medium", label: "중간 길이", en: "medium length hair" },
  { value: "long", label: "긴 머리", en: "long hair" },
  { value: "black", label: "검은 머리", en: "black hair" },
  { value: "brown", label: "갈색 머리", en: "brown hair" },
  { value: "blonde", label: "금발", en: "blonde hair" },
  { value: "white", label: "흰 머리", en: "white hair" },
  { value: "silver", label: "은색 머리", en: "silver hair" },
  { value: "wavy", label: "웨이브 머리", en: "wavy hair" },
  { value: "straight", label: "생머리", en: "straight hair" },
  { value: "ponytail", label: "포니테일", en: "ponytail" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const HAIR_MORE_OPTIONS: OptionItem[] = [
  { value: "pink", label: "분홍 머리", en: "pink hair" },
  { value: "blue", label: "파란 머리", en: "blue hair" },
  { value: "purple", label: "보라 머리", en: "purple hair" },
  { value: "curly", label: "곱슬머리", en: "curly hair" },
  { value: "twin_tails", label: "양갈래", en: "twin tails" },
  { value: "braided", label: "땋은 머리", en: "braided hair" },
  { value: "tied_up", label: "묶은 머리", en: "tied-up hair" },
  { value: "with_bangs", label: "앞머리 있음", en: "with bangs" },
  { value: "no_bangs", label: "앞머리 없음", en: "no bangs" },
];

export const OUTFIT_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "casual", label: "캐주얼 의상", en: "casual outfit" },
  { value: "fantasy", label: "판타지 의상", en: "fantasy outfit" },
  { value: "armor", label: "갑옷", en: "armor" },
  { value: "wizard_robe", label: "마법사 로브", en: "wizard robe" },
  { value: "dress", label: "드레스", en: "dress" },
  { value: "suit", label: "정장", en: "formal suit" },
  { value: "adventurer", label: "모험가 의상", en: "adventurer outfit" },
  { value: "royal", label: "왕족 의상", en: "royal outfit" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const OUTFIT_MORE_OPTIONS: OptionItem[] = [
  { value: "traditional", label: "전통 의상", en: "traditional outfit" },
  { value: "futuristic", label: "미래형 슈트", en: "futuristic suit" },
  { value: "sportswear", label: "스포츠 의상", en: "sportswear" },
  { value: "school_uniform", label: "교복 느낌", en: "school uniform style" },
  { value: "leather", label: "가죽 의상", en: "leather outfit" },
  { value: "fabric", label: "천 소재 의상", en: "fabric-based outfit" },
  { value: "metal_decor", label: "금속 장식 의상", en: "outfit with metal ornaments" },
];

export const POSE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "standing_front", label: "정면으로 서 있음", en: "standing facing front" },
  { value: "standing_side", label: "살짝 옆으로 서 있음", en: "standing in a slight side stance" },
  { value: "sitting", label: "앉아 있음", en: "sitting" },
  { value: "walking", label: "걷는 중", en: "walking" },
  { value: "running", label: "달리는 중", en: "running" },
  { value: "action", label: "액션 포즈", en: "dynamic action pose" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const POSE_MORE_OPTIONS: OptionItem[] = [
  { value: "jumping", label: "점프", en: "jumping" },
  { value: "arms_crossed", label: "팔짱", en: "arms crossed" },
  { value: "raise_one_hand", label: "한 손을 들고 있음", en: "raising one hand" },
  { value: "waving", label: "손을 흔듦", en: "waving hand" },
  { value: "holding_something", label: "무언가를 들고 있음", en: "holding something" },
  { value: "holding_weapon", label: "무기를 들고 있음", en: "holding a weapon" },
  { value: "casting_magic", label: "마법을 시전함", en: "casting magic" },
  { value: "cute_pose", label: "귀여운 포즈", en: "cute pose" },
  { value: "victory_pose", label: "승리 포즈", en: "victory pose" },
  { value: "looking_back", label: "뒤돌아보기", en: "looking back" },
];

export const VISIBLE_RANGE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "full_body", label: "전신", en: "full body" },
  { value: "knee_up", label: "무릎 위", en: "knee up" },
  { value: "half_body", label: "반신", en: "half body" },
  { value: "upper_body", label: "상반신", en: "upper body" },
  { value: "face_close", label: "얼굴 클로즈업", en: "face close-up" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const VISIBLE_RANGE_MORE_OPTIONS: OptionItem[] = [
  { value: "chest_up", label: "가슴 위", en: "chest up" },
  { value: "shoulders_up", label: "어깨 위", en: "shoulders up" },
  { value: "extreme_close", label: "매우 가까운 클로즈업", en: "extreme close-up" },
  { value: "select_screen", label: "캐릭터 선택창용 전신", en: "full body for a character select screen" },
];

export const VIEW_ANGLE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "eye_level", label: "눈높이", en: "eye-level view" },
  { value: "three_quarter", label: "비스듬한 각도", en: "three-quarter view" },
  { value: "slight_high", label: "살짝 위에서", en: "slightly high angle" },
  { value: "slight_low", label: "살짝 아래에서", en: "slightly low angle" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const VIEW_ANGLE_MORE_OPTIONS: OptionItem[] = [
  { value: "top_down", label: "위에서 내려다보기", en: "top-down view, high angle" },
  { value: "looking_up", label: "아래에서 올려다보기", en: "low angle, looking up" },
  { value: "side", label: "옆에서", en: "side view" },
  { value: "isometric", label: "아이소메트릭 느낌", en: "isometric perspective" },
];

export const CHARACTER_DIRECTION_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "front", label: "정면", en: "front facing" },
  { value: "slight_side", label: "살짝 옆", en: "slightly turned to the side" },
  { value: "side_profile", label: "옆모습", en: "side profile" },
  { value: "looking_back", label: "뒤돌아봄", en: "looking back over the shoulder" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const CHARACTER_DIRECTION_MORE_OPTIONS: OptionItem[] = [
  { value: "rear", label: "후면", en: "rear view" },
  { value: "three_view", label: "3방향 보기", en: "three view orientation" },
  { value: "front_side_back", label: "정면+측면+후면", en: "front, side, and back orientations" },
];

export const CHARACTER_SHEET_OPTIONS: OptionItem[] = [
  { value: "single", label: "단일 캐릭터", en: "single character illustration" },
  { value: "design_sheet", label: "캐릭터 시트", en: "character design sheet" },
  { value: "turnaround", label: "턴어라운드 시트", en: "turnaround character sheet" },
  { value: "expression_sheet", label: "표정 시트", en: "expression sheet" },
  { value: "pose_sheet", label: "포즈 시트", en: "pose sheet" },
  { value: "outfit_sheet", label: "의상 시트", en: "outfit variation sheet" },
  { value: "equipment_sheet", label: "장비·소품 시트", en: "equipment and prop sheet" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const CHARACTER_SHEET_MORE_OPTIONS: OptionItem[] = [
  { value: "color_guide", label: "컬러 가이드", en: "color guide sheet" },
  { value: "body_face", label: "전신+얼굴 클로즈업", en: "full body plus face close-up" },
  { value: "body_expressions", label: "전신+표정 여러 개", en: "full body plus multiple expressions" },
  { value: "body_poses", label: "전신+포즈 여러 개", en: "full body plus multiple poses" },
  { value: "front_side_back", label: "정면+측면+후면", en: "front, side, and back views" },
];

// 캐릭터 시트가 single이 아닐 때 강제로 추가될 키워드들
export const CHARACTER_SHEET_EXTRA_KEYWORDS = [
  "character design sheet",
  "clean neutral background",
  "consistent character design",
  "front view, side view, back view",
  "expression variations",
  "pose variations",
];

// ===== 배경 옵션 =====

export const PLACE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "forest", label: "숲", en: "forest" },
  { value: "magical_forest", label: "마법 숲", en: "magical forest" },
  { value: "village", label: "마을", en: "village" },
  { value: "castle", label: "성", en: "castle" },
  { value: "city", label: "도시", en: "city" },
  { value: "futuristic_city", label: "미래 도시", en: "futuristic city" },
  { value: "cave", label: "동굴", en: "cave" },
  { value: "dungeon", label: "던전", en: "dungeon" },
  { value: "temple", label: "신전", en: "temple" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const PLACE_MORE_OPTIONS: OptionItem[] = [
  { value: "garden", label: "정원", en: "garden" },
  { value: "beach", label: "해변", en: "beach" },
  { value: "ocean", label: "바다", en: "ocean" },
  { value: "snowy_mountain", label: "설산", en: "snowy mountain" },
  { value: "desert", label: "사막", en: "desert" },
  { value: "sky_island", label: "하늘섬", en: "floating sky island" },
  { value: "space", label: "우주", en: "outer space" },
  { value: "interior", label: "실내", en: "interior room" },
  { value: "shop", label: "상점", en: "shop interior" },
  { value: "cafe", label: "카페", en: "cafe interior" },
  { value: "bedroom", label: "방", en: "bedroom" },
  { value: "stage", label: "무대", en: "stage" },
  { value: "ruins", label: "폐허", en: "ruins" },
  { value: "palace", label: "왕궁", en: "royal palace" },
  { value: "lake", label: "호수", en: "lake" },
  { value: "riverside", label: "강가", en: "riverside" },
];

export const TIME_OF_DAY_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "morning", label: "아침", en: "morning" },
  { value: "day", label: "낮", en: "daytime" },
  { value: "afternoon", label: "오후", en: "afternoon" },
  { value: "sunset", label: "석양", en: "sunset" },
  { value: "evening", label: "저녁", en: "evening" },
  { value: "night", label: "밤", en: "night" },
  { value: "dawn", label: "새벽", en: "dawn" },
  { value: "rainy", label: "비 오는 날", en: "rainy day" },
  { value: "snowy", label: "눈 오는 날", en: "snowy day" },
  { value: "foggy", label: "안개 낀 날", en: "foggy day" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const MOOD_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "bright", label: "밝은", en: "bright atmosphere" },
  { value: "cute", label: "귀여운", en: "cute atmosphere" },
  { value: "luxurious", label: "고급스러운", en: "luxurious atmosphere" },
  { value: "mystical", label: "신비로운", en: "mystical atmosphere" },
  { value: "warm", label: "따뜻한", en: "warm atmosphere" },
  { value: "cold", label: "차가운", en: "cold atmosphere" },
  { value: "dark", label: "어두운", en: "dark atmosphere" },
  { value: "grand", label: "웅장한", en: "grand atmosphere" },
  { value: "peaceful", label: "평화로운", en: "peaceful atmosphere" },
  { value: "adventurous", label: "모험적인", en: "adventurous atmosphere" },
  { value: "tense", label: "긴장감 있는", en: "tense atmosphere" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const LIGHTING_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "bright_soft", label: "밝고 부드럽게", en: "bright and soft lighting" },
  { value: "warm", label: "따뜻하게", en: "warm lighting" },
  { value: "cool", label: "차갑게", en: "cool lighting" },
  { value: "sunset", label: "노을빛", en: "sunset lighting" },
  { value: "moon", label: "달빛", en: "moonlight" },
  { value: "neon", label: "네온 느낌", en: "neon lighting" },
  { value: "back", label: "뒤에서 빛나는 느낌", en: "backlighting" },
  { value: "dramatic", label: "극적인 조명", en: "dramatic lighting" },
  { value: "magic_glow", label: "마법 glow", en: "magical glow" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const COLOR_PALETTE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "pastel", label: "파스텔톤", en: "pastel tones" },
  { value: "warm", label: "따뜻한 톤", en: "warm color palette" },
  { value: "cool", label: "차가운 톤", en: "cool color palette" },
  { value: "gold", label: "골드톤", en: "gold tone palette" },
  { value: "purple", label: "보라톤", en: "purple tone palette" },
  { value: "blue", label: "블루톤", en: "blue tone palette" },
  { value: "pink", label: "핑크톤", en: "pink tone palette" },
  { value: "green", label: "그린톤", en: "green tone palette" },
  { value: "neon", label: "네온 컬러", en: "neon color palette" },
  { value: "black_gold", label: "고급 블랙 골드", en: "premium black and gold palette" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const DEPTH_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "flat", label: "평면적인 배경", en: "flat background depth" },
  { value: "slight", label: "약간의 깊이감", en: "slight depth" },
  { value: "layered", label: "앞·중간·뒤가 구분되는 배경", en: "foreground, midground, and background separation" },
  { value: "deep", label: "멀리까지 보이는 깊은 배경", en: "deep distant background" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const COMPLEXITY_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "very_minimal", label: "아주 단순하게", en: "very minimal background" },
  { value: "clean", label: "깔끔하게", en: "clean background" },
  { value: "moderate", label: "보통", en: "moderate background detail" },
  { value: "detailed", label: "디테일 있게", en: "detailed background" },
  { value: "rich", label: "풍부하게", en: "rich background detail" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const LAYOUT_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "center", label: "중앙 배치", en: "center composition" },
  { value: "left_space", label: "왼쪽 여백", en: "left negative space" },
  { value: "right_space", label: "오른쪽 여백", en: "right negative space" },
  { value: "empty_center", label: "중앙 비우기", en: "empty center" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const BG_VIEW_ANGLE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "front", label: "정면", en: "front view" },
  { value: "three_quarter", label: "비스듬한 각도", en: "three-quarter angle" },
  { value: "slight_high", label: "살짝 위에서", en: "slightly high angle" },
  { value: "slight_low", label: "살짝 아래에서", en: "slightly low angle" },
  { value: "top_down", label: "위에서 내려다보기", en: "top-down view" },
  { value: "looking_up", label: "아래에서 올려다보기", en: "looking up from below" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const BG_VISIBLE_RANGE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "close", label: "가까이 보이게", en: "close shot" },
  { value: "medium", label: "중간 거리", en: "medium distance shot" },
  { value: "wide", label: "넓게 보이게", en: "wide shot" },
  { value: "extra_wide", label: "아주 넓게 보이게", en: "extra wide shot" },
  { value: "panoramic", label: "파노라마 느낌", en: "panoramic view" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

// ===== 에셋 옵션 (프레임/아이콘/오브젝트 공통) =====

export const SHAPE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "circle", label: "원형", en: "circular shape" },
  { value: "square", label: "사각형", en: "square shape" },
  { value: "rounded_square", label: "둥근 사각형", en: "rounded square shape" },
  { value: "shield", label: "방패형", en: "shield shape" },
  { value: "star", label: "별 모양", en: "star shape" },
  { value: "ribbon", label: "리본형", en: "ribbon shape" },
  { value: "irregular", label: "비정형", en: "irregular shape" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const SURFACE_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "metal", label: "금속", en: "metal surface" },
  { value: "gold", label: "금", en: "gold surface" },
  { value: "silver", label: "은", en: "silver surface" },
  { value: "wood", label: "나무", en: "wooden surface" },
  { value: "stone", label: "돌", en: "stone surface" },
  { value: "glass", label: "유리", en: "glass surface" },
  { value: "crystal", label: "크리스탈", en: "crystal surface" },
  { value: "gem", label: "보석", en: "gemstone surface" },
  { value: "fabric", label: "천", en: "fabric surface" },
  { value: "leather", label: "가죽", en: "leather surface" },
  { value: "jelly", label: "젤리", en: "jelly surface" },
  { value: "magic_glow", label: "마법 glow", en: "magical glowing surface" },
  { value: "glossy", label: "광택 있음", en: "glossy finish" },
  { value: "matte", label: "무광", en: "matte finish" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const DIMENSION_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "flat", label: "평면 아이콘 느낌", en: "flat icon look" },
  { value: "slight_3d", label: "살짝 입체감", en: "slight 3D feel" },
  { value: "2_5d", label: "2.5D 느낌", en: "2.5D look" },
  { value: "full_3d", label: "3D 느낌", en: "fully 3D look" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const DECORATION_LEVEL_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "very_simple", label: "아주 심플하게", en: "very simple decoration" },
  { value: "clean", label: "깔끔하게", en: "clean decoration" },
  { value: "moderate", label: "보통", en: "moderate decoration" },
  { value: "ornate", label: "화려하게", en: "ornate decoration" },
  { value: "premium", label: "프리미엄하게", en: "premium decoration" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

export const BG_TREATMENT_OPTIONS: OptionItem[] = [
  { value: "auto", label: "자동", en: "" },
  { value: "transparent", label: "투명 배경", en: "transparent background" },
  { value: "white", label: "흰 배경", en: "white background" },
  { value: "solid", label: "단색 배경", en: "solid color background" },
  { value: "none", label: "배경 없음", en: "no background" },
  { value: "custom", label: "직접 입력", en: "__custom__" },
];

// 에셋 조건 (체크박스)
export const ASSET_RULES_OPTIONS: OptionItem[] = [
  { value: "centered", label: "중앙 배치", en: "centered composition" },
  { value: "clear_outline", label: "외곽선 선명", en: "clear outline" },
  { value: "readable_small", label: "작게 봐도 잘 보임", en: "readable at small size" },
  { value: "ui_separable", label: "UI와 잘 분리됨", en: "well separated from UI" },
  { value: "clean_silhouette", label: "깔끔한 실루엣", en: "clean silhouette" },
  { value: "reduce_detail", label: "과한 디테일 줄이기", en: "reduce excessive detail" },
];

// 작업 유형별 추가 강조 키워드
export const ASSET_TYPE_EXTRA: Record<string, string[]> = {
  frame: [
    "decorative frame asset",
    "hollow center for content",
    "balanced ornamental border",
  ],
  icon: [
    "single icon asset",
    "readable at small size",
    "clean silhouette",
    "clear outline",
    "centered subject",
  ],
  object: [
    "single isolated object",
    "independent prop",
    "slight three-quarter angle",
  ],
};

// ===== 참고 이미지 역할 =====
export const REFERENCE_ROLE_OPTIONS: OptionItem[] = [
  { value: "style", label: "스타일 참고", en: "style" },
  { value: "composition", label: "구도 참고", en: "composition" },
  { value: "color", label: "색감 참고", en: "color" },
  { value: "character", label: "캐릭터 참고", en: "character" },
  { value: "pose", label: "포즈 참고", en: "pose" },
  { value: "material", label: "재질 참고", en: "material" },
  { value: "outfit", label: "의상 참고", en: "outfit" },
  { value: "background", label: "배경 참고", en: "background" },
];

// 역할별 영어 안내문 (GPT/Nano용 문장형)
export const REFERENCE_ROLE_SENTENCE: Record<string, string> = {
  style: "Use the attached reference image as a style reference.",
  composition: "Use the attached reference image to follow its composition and layout.",
  color: "Use the attached reference image to match its color palette and tonal mood.",
  character: "Use the attached reference image to preserve the character identity and key features.",
  pose: "Use the attached reference image to match the pose.",
  material: "Use the attached reference image to match the material qualities and surface textures.",
  outfit: "Use the attached reference image to match the outfit design.",
  background: "Use the attached reference image to match the background scene.",
};

// MJ/Niji 파라미터 매핑 (실제 URL은 placeholder)
export const REFERENCE_ROLE_MJ_PARAM: Record<string, string> = {
  style: "--sref [style_reference_url]",
  composition: "--sref [composition_reference_url]",
  color: "--sref [color_reference_url]",
  character: "--oref [character_reference_url]",
  pose: "--oref [pose_reference_url]",
  material: "--sref [material_reference_url]",
  outfit: "--oref [outfit_reference_url]",
  background: "--sref [background_reference_url]",
};

export const REFERENCE_ROLE_NIJI_PARAM: Record<string, string> = {
  style: "--sref [style_reference_url]",
  composition: "--sref [composition_reference_url]",
  color: "--sref [color_reference_url]",
  character: "--cref [character_reference_url]",
  pose: "--cref [pose_reference_url]",
  material: "--sref [material_reference_url]",
  outfit: "--cref [outfit_reference_url]",
  background: "--sref [background_reference_url]",
};

// ===== 모델 라벨 =====

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

export const GPT_OPTIONS: ModelKey[] = ["gpt_image_2", "gpt_image_1_5", "gpt_image_1", "gpt_image_1_mini"];
export const NANO_OPTIONS: ModelKey[] = ["nano_banana", "nano_banana_2", "nano_banana_pro"];
export const MJ_OPTIONS: ModelKey[] = ["mj_v7", "mj_v8_alpha", "mj_v8_1_alpha"];
export const NIJI_OPTIONS: ModelKey[] = ["niji_6", "niji_7"];

// ===== 헬퍼 =====

const KOREAN_RE = /[ㄱ-힝]/;

export function containsKorean(s: string): boolean {
  return KOREAN_RE.test(s);
}

/**
 * 옵션의 영어 표현을 가져옵니다.
 * - 자동(en === ""): 빈 문자열 반환 → 빌더에서 무시
 * - 직접 입력(en === "__custom__"): customText를 사용. 단, 한글이 섞이면 무시.
 * - 그 외: en 그대로 반환
 */
export function resolveOptionEn(
  options: OptionItem[],
  value: string,
  customText: string = ""
): string {
  const item = options.find((o) => o.value === value);
  if (!item) return "";
  if (item.en === "__custom__") {
    const t = (customText ?? "").trim();
    if (!t) return "";
    if (containsKorean(t)) return ""; // 한글은 영어 프롬프트에 포함 금지
    return t;
  }
  return item.en;
}

/**
 * UI 표시용: 옵션의 한글 라벨을 가져옵니다.
 * 직접 입력일 때는 입력값을 그대로 보여줍니다 (한글이어도 OK - 표시만).
 */
export function resolveOptionLabel(
  options: OptionItem[],
  value: string,
  customText: string = ""
): string {
  const item = options.find((o) => o.value === value);
  if (!item) return "";
  if (item.en === "__custom__") {
    const t = (customText ?? "").trim();
    return t || "직접 입력";
  }
  if (item.en === "") return "";
  return item.label;
}
