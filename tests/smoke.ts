/* eslint-disable no-console */
// 기본 스모크 테스트.
// 사용법: npx ts-node tests/smoke.ts (또는 npx tsx tests/smoke.ts)
// 외부 라이브러리 없이 기본 assert만 사용합니다.

import assert from "node:assert/strict";
import {
  DEFAULT_INPUT,
  PromptInput,
  buildPromptFor,
  buildSummary,
  buildRevisionPrompt,
  hasKoreanInOutput,
} from "../lib/promptBuilder";

let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures++;
    console.error(`  ✗ ${name}\n     ${(e as Error).message}`);
  }
}

console.log("--- Smoke tests ---");

// 1. 기본 입력으로 모든 모델 출력에 한글이 섞이지 않아야 한다
const baseInput: PromptInput = {
  ...DEFAULT_INPUT,
  workType: "character",
  style: "premium_fantasy",
  styleCustom: "",
  aspectRatio: "3:4",
  englishSupplement: "soft rim light from behind",
  character: {
    ...DEFAULT_INPUT.character,
    gender: "female",
    ageRange: "20s",
    bodyType: "slim",
    hair: "long",
    outfit: "armor",
    pose: "standing_front",
    visibleRange: "full_body",
    viewingAngle: "three_quarter",
    characterDirection: "slight_side",
  },
  koreanMemo: "20대 여성 캐릭터, 슬림한 체형, 긴 흰색 머리, 금색 갑옷",
};

const models = [
  "gpt_image_2",
  "gpt_image_1_5",
  "gpt_image_1",
  "gpt_image_1_mini",
  "nano_banana",
  "nano_banana_2",
  "nano_banana_pro",
  "mj_v7",
  "mj_v8_alpha",
  "mj_v8_1_alpha",
  "niji_6",
  "niji_7",
] as const;

for (const m of models) {
  check(`output for ${m} has no Korean`, () => {
    const out = buildPromptFor(m, baseInput);
    assert.equal(
      hasKoreanInOutput(out),
      false,
      `Korean text found in ${m} output:\n${out}`
    );
  });
}

// 2. 영어 보충 입력은 모든 모델에 반영
for (const m of models) {
  check(`englishSupplement appears in ${m} output`, () => {
    const out = buildPromptFor(m, baseInput);
    assert.ok(
      out.includes("soft rim light"),
      `englishSupplement missing in ${m} output`
    );
  });
}

// 3. Midjourney/Niji 출력에 --ar / --no 포함
for (const m of ["mj_v7", "mj_v8_alpha", "mj_v8_1_alpha"] as const) {
  check(`${m} has --ar`, () => {
    const out = buildPromptFor(m, baseInput);
    assert.ok(out.includes("--ar"), `--ar missing in ${m}`);
  });
  check(`${m} has --no`, () => {
    const out = buildPromptFor(m, baseInput);
    assert.ok(out.includes("--no"), `--no missing in ${m}`);
  });
}
for (const m of ["niji_6", "niji_7"] as const) {
  check(`${m} has --niji + --ar + --no`, () => {
    const out = buildPromptFor(m, baseInput);
    assert.ok(out.includes("--niji"), `--niji missing`);
    assert.ok(out.includes("--ar"), `--ar missing`);
    assert.ok(out.includes("--no"), `--no missing`);
  });
}

// 4. 1000x600 → --ar 5:3 변환
check("1000x600 ratio converts to --ar 5:3 in MJ", () => {
  const inp: PromptInput = { ...baseInput, aspectRatio: "1000x600" };
  const out = buildPromptFor("mj_v8_1_alpha", inp);
  assert.ok(out.includes("--ar 5:3"), `expected --ar 5:3, got: ${out}`);
});

// 5. 한글 직접 입력은 영어 프롬프트에 안 들어감
check("Korean styleCustom is filtered out", () => {
  const inp: PromptInput = {
    ...baseInput,
    style: "custom",
    styleCustom: "한국 전통 느낌으로",
  };
  const out = buildPromptFor("gpt_image_1_5", inp);
  assert.equal(hasKoreanInOutput(out), false, "Korean leaked into output");
});
check("English styleCustom is included", () => {
  const inp: PromptInput = {
    ...baseInput,
    style: "custom",
    styleCustom: "studio ghibli inspired",
  };
  const out = buildPromptFor("gpt_image_1_5", inp);
  assert.ok(out.includes("studio ghibli inspired"), "English custom missing");
});

// 6. 한글 메모는 어떤 모델 출력에도 안 들어감
check("koreanMemo never leaks into outputs", () => {
  for (const m of models) {
    const out = buildPromptFor(m, baseInput);
    assert.ok(
      !out.includes("20대"),
      `koreanMemo leaked in ${m}`
    );
  }
});

// 7. 작업 유형 변경 시 적절한 옵션이 빌더에 들어감
check("background workType uses background tokens", () => {
  const inp: PromptInput = {
    ...DEFAULT_INPUT,
    workType: "background",
    background: {
      ...DEFAULT_INPUT.background,
      place: "forest",
      timeOfDay: "sunset",
    },
  };
  const out = buildPromptFor("gpt_image_1_5", inp);
  assert.ok(out.includes("forest"), "place not in background output");
  assert.ok(out.includes("sunset"), "timeOfDay not in background output");
});

check("frame workType uses frame keywords", () => {
  const inp: PromptInput = {
    ...DEFAULT_INPUT,
    workType: "frame",
    asset: { ...DEFAULT_INPUT.asset, shape: "shield" },
  };
  const out = buildPromptFor("mj_v8_1_alpha", inp);
  assert.ok(out.includes("shield shape") || out.includes("decorative frame"), `frame keywords missing: ${out}`);
});

// 8. 요약 카드는 한글 라벨로 출력
check("summary returns Korean labels", () => {
  const s = buildSummary(baseInput);
  assert.ok(s.rows.length > 0, "summary rows empty");
  assert.ok(s.rows.some((r) => r.label === "작업 유형"), "missing work type row");
});

// 9. 수정 요청용 프롬프트 출력
check("revision prompt has Keep/Change/Remove", () => {
  const out = buildRevisionPrompt(baseInput);
  assert.ok(out.includes("Keep:"), "Keep missing");
  assert.ok(out.includes("Change:"), "Change missing");
  assert.ok(out.includes("Remove:"), "Remove missing");
  assert.equal(hasKoreanInOutput(out), false, "Korean in revision");
});

// 10. 참고 이미지 미사용 → MJ에 --sref/--oref가 안 붙어야
check("no --sref/--oref when no reference uploaded", () => {
  const out = buildPromptFor("mj_v8_1_alpha", baseInput);
  assert.ok(!out.includes("--sref"), "--sref unexpectedly present");
  assert.ok(!out.includes("--oref"), "--oref unexpectedly present");
});

// 11. 참고 이미지 업로드 시 placeholder 파라미터 포함
check("reference image adds placeholder param", () => {
  const inp: PromptInput = {
    ...baseInput,
    references: [
      { src: "data:fake", role: "character" },
      { src: null, role: "style" },
      { src: null, role: "style" },
    ],
  };
  const mj = buildPromptFor("mj_v8_1_alpha", inp);
  assert.ok(mj.includes("--oref [character_reference_url]"), `MJ char ref missing: ${mj}`);
  const niji = buildPromptFor("niji_7", inp);
  assert.ok(niji.includes("--cref [character_reference_url]"), `Niji char ref missing`);
});

console.log("");
if (failures > 0) {
  console.error(`✗ ${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log("All smoke tests passed.");
}
