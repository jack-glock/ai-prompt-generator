/* eslint-disable no-console */
// 실제 사용자 시나리오 — 결과 프롬프트를 직접 보여주는 테스트.
// 스펙 13번의 예시 데이터를 그대로 입력하고 4개 모델 출력을 확인합니다.

import {
  DEFAULT_INPUT,
  PromptInput,
  buildPromptFor,
  buildSummary,
  buildRevisionPrompt,
  hasKoreanInOutput,
} from "../lib/promptBuilder";
import { extractOptions, applyHintsToInput } from "../lib/keywordExtract";

// 시나리오 1: 캐릭터 작업
const characterScenario: PromptInput = {
  ...DEFAULT_INPUT,
  workType: "character",
  koreanMemo: "20대 여성 캐릭터, 슬림한 체형, 긴 흰색 웨이브 머리, 금색 판타지 갑옷, 전신, 비스듬한 각도",
  englishSupplement: "soft rim light from behind",
  style: "premium_fantasy",
  aspectRatio: "3:4",
  negativeChecks: ["text", "logo", "distorted_hand"],
  character: {
    ...DEFAULT_INPUT.character,
    gender: "female",
    ageRange: "20s",
    bodyType: "slim",
    hair: "wavy",
    hairCustom: "",
    outfit: "armor",
    pose: "standing_front",
    visibleRange: "full_body",
    viewingAngle: "three_quarter",
    characterDirection: "slight_side",
  },
};

function divider(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(" " + title);
  console.log("=".repeat(60));
}

function showOutput(label: string, content: string) {
  console.log(`\n--- [${label}] ---`);
  console.log(content);
  if (hasKoreanInOutput(content)) {
    console.log(`\n!!! 경고: 한글이 섞여 있습니다 !!!`);
  } else {
    console.log(`\n[검증] 한글 미포함 ✓`);
  }
}

divider("시나리오 1: 캐릭터 작업");
console.log("\n[원본 한글 메모]");
console.log(characterScenario.koreanMemo);
console.log("\n[영어 보충]");
console.log(characterScenario.englishSupplement);

const summary = buildSummary(characterScenario);
console.log("\n[요약 카드 행]");
for (const r of summary.rows) {
  console.log(`  ${r.label.padEnd(20, " ")} ${r.value}`);
}
console.log(`  ${summary.negative.label}: ${summary.negative.tags.join(" / ")}`);

showOutput("GPT Image 1.5", buildPromptFor("gpt_image_1_5", characterScenario));
showOutput("Nano Banana 2", buildPromptFor("nano_banana_2", characterScenario));
showOutput("Midjourney V8.1 Alpha", buildPromptFor("mj_v8_1_alpha", characterScenario));
showOutput("Niji 7", buildPromptFor("niji_7", characterScenario));
showOutput("수정 요청용", buildRevisionPrompt(characterScenario));

// 시나리오 2: 자동 정리 기능
divider("시나리오 2: '입력 내용을 옵션으로 정리하기' 동작");
const blank: PromptInput = {
  ...DEFAULT_INPUT,
  workType: "background",
  koreanMemo: "노을빛이 비추는 마법 숲 배경, 고급스러운 분위기, 골드톤 색감",
  englishSupplement: "",
};
console.log("\n[입력 전 background 옵션] - 모두 auto");
console.log(JSON.stringify({
  place: blank.background.place,
  timeOfDay: blank.background.timeOfDay,
  mood: blank.background.mood,
  lighting: blank.background.lighting,
  colorPalette: blank.background.colorPalette,
}, null, 2));

const hints = extractOptions(blank.koreanMemo, blank.englishSupplement);
const after = applyHintsToInput(blank, hints);

console.log("\n[자동 정리 후]");
console.log(JSON.stringify({
  place: after.background.place,
  timeOfDay: after.background.timeOfDay,
  mood: after.background.mood,
  lighting: after.background.lighting,
  colorPalette: after.background.colorPalette,
}, null, 2));

console.log("\n[배경 시나리오 - GPT Image 출력]");
console.log(buildPromptFor("gpt_image_1_5", after));

// 시나리오 3: 비율 변환 검증
divider("시나리오 3: 1000x600 비율 -> Midjourney");
const ratioTest: PromptInput = {
  ...characterScenario,
  aspectRatio: "1000x600",
};
const mjOut = buildPromptFor("mj_v8_1_alpha", ratioTest);
console.log("\n출력에 --ar 5:3 포함:", mjOut.includes("--ar 5:3") ? "✓" : "✗");
console.log("끝부분:", mjOut.slice(-80));

// 시나리오 4: 한글 직접 입력 차단 검증
divider("시나리오 4: 한글 직접 입력 → 영어 프롬프트 차단");
const koCustom: PromptInput = {
  ...characterScenario,
  style: "custom",
  styleCustom: "한국 전통 동양 판타지 느낌",
};
const out1 = buildPromptFor("gpt_image_1_5", koCustom);
console.log("\n[한글 직접 입력]:", koCustom.styleCustom);
console.log("결과 한글 포함:", hasKoreanInOutput(out1) ? "✗ FAIL" : "✓ PASS (차단됨)");

const enCustom: PromptInput = {
  ...characterScenario,
  style: "custom",
  styleCustom: "studio ghibli inspired soft watercolor",
};
const out2 = buildPromptFor("gpt_image_1_5", enCustom);
console.log("\n[영어 직접 입력]:", enCustom.styleCustom);
console.log("결과에 포함:", out2.includes("studio ghibli inspired") ? "✓ PASS" : "✗ FAIL");

// 시나리오 5: 참고 이미지 3장 + 역할
divider("시나리오 5: 참고 이미지 3장 (스타일/캐릭터/포즈)");
const refTest: PromptInput = {
  ...characterScenario,
  references: [
    { src: "data:fake1", role: "style" },
    { src: "data:fake2", role: "character" },
    { src: "data:fake3", role: "pose" },
  ],
};
const mjRef = buildPromptFor("mj_v8_1_alpha", refTest);
const nijiRef = buildPromptFor("niji_7", refTest);
console.log("\n[MJ 참고 파라미터]");
const mjRefMatch = mjRef.match(/--(?:sref|oref)\s\[[^\]]+\]/g);
console.log(mjRefMatch?.join("\n") ?? "(없음)");

console.log("\n[Niji 참고 파라미터]");
const nijiRefMatch = nijiRef.match(/--(?:sref|cref)\s\[[^\]]+\]/g);
console.log(nijiRefMatch?.join("\n") ?? "(없음)");

console.log("\n\n=== 검증 완료 ===");
