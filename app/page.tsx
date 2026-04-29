"use client";

// AI Prompt Generator v0.6 (rebuild)
// - 작업 유형 5종(캐릭터/배경/프레임/아이콘/오브젝트), 배너 제거
// - 한글 자유입력은 "원본 한글 메모"로만 표시되고 최종 영어 프롬프트에 포함되지 않음
// - 영어 보충 입력만 실제 모델 프롬프트에 반영
// - "입력 내용을 옵션으로 정리하기" 버튼: 키워드 매칭으로 옵션 자동 채우기 (API 미사용)
// - 참고 이미지 최대 3장, 각 이미지마다 역할 선택
// - 모델 카드 4종 + 정리된 요청 요약 + 수정 요청용

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Copy,
  ImagePlus,
  Wand2,
  RefreshCcw,
  Check,
  X,
  Info,
  Sun,
  Moon,
  Plus,
} from "lucide-react";

import {
  PromptInput,
  WorkType,
  CharacterInput,
  BackgroundInput,
  AssetInput,
  ReferenceImageInput,
  EMPTY_CHARACTER,
  EMPTY_BACKGROUND,
  EMPTY_ASSET,
  EMPTY_REFERENCES,
  DEFAULT_INPUT,
  buildPromptFor,
  buildSummary,
  buildRevisionPrompt,
} from "@/lib/promptBuilder";

import {
  OptionItem,
  ModelKey,
  WORK_TYPE_OPTIONS,
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
  REFERENCE_ROLE_OPTIONS,
  MODEL_LABEL,
  GPT_OPTIONS,
  NANO_OPTIONS,
  MJ_OPTIONS,
  NIJI_OPTIONS,
} from "@/lib/options";

import { extractOptions, applyHintsToInput, countAppliedHints } from "@/lib/keywordExtract";

export default function HomePage() {
  const [input, setInput] = useState<PromptInput>(DEFAULT_INPUT);

  const [gptModel, setGptModel] = useState<ModelKey>("gpt_image_2");
  const [nanoModel, setNanoModel] = useState<ModelKey>("nano_banana_2");
  const [mjModel, setMjModel] = useState<ModelKey>("mj_v8_1_alpha");
  const [nijiModel, setNijiModel] = useState<ModelKey>("niji_7");

  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("theme", "dark"); } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch {}
    }
  };

  const summary = useMemo(() => buildSummary(input), [input]);
  const gptOutput = useMemo(() => buildPromptFor(gptModel, input), [gptModel, input]);
  const nanoOutput = useMemo(() => buildPromptFor(nanoModel, input), [nanoModel, input]);
  const mjOutput = useMemo(() => buildPromptFor(mjModel, input), [mjModel, input]);
  const nijiOutput = useMemo(() => buildPromptFor(nijiModel, input), [nijiModel, input]);
  const revisionOutput = useMemo(() => buildRevisionPrompt(input), [input]);

  // === 핸들러: 옵션 정리 ===
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const handleExtract = () => {
    const before = input;
    const hints = extractOptions(input.koreanMemo, input.englishSupplement);
    const after = applyHintsToInput(before, hints);
    const n = countAppliedHints(before, after);
    setInput(after);
    setExtractMessage(
      n > 0
        ? `${n}개 항목을 자동으로 채웠습니다. 결과를 확인하고 자유롭게 수정하세요.`
        : "감지된 키워드가 없습니다. 한글 메모나 영어 보충 입력에 더 구체적인 단어를 적어 주세요."
    );
    setTimeout(() => setExtractMessage(null), 4000);
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setExtractMessage(null);
  };

  // === 입력 업데이트 헬퍼 ===
  const setField = <K extends keyof PromptInput>(k: K, v: PromptInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const setCharField = <K extends keyof CharacterInput>(k: K, v: CharacterInput[K]) =>
    setInput((p) => ({ ...p, character: { ...p.character, [k]: v } }));

  const setBgField = <K extends keyof BackgroundInput>(k: K, v: BackgroundInput[K]) =>
    setInput((p) => ({ ...p, background: { ...p.background, [k]: v } }));

  const setAssetField = <K extends keyof AssetInput>(k: K, v: AssetInput[K]) =>
    setInput((p) => ({ ...p, asset: { ...p.asset, [k]: v } }));

  const toggleNegative = (v: string) =>
    setInput((p) => ({
      ...p,
      negativeChecks: p.negativeChecks.includes(v)
        ? p.negativeChecks.filter((x) => x !== v)
        : [...p.negativeChecks, v],
    }));

  const toggleAssetRule = (v: string) =>
    setInput((p) => {
      const has = p.asset.rules.includes(v);
      return {
        ...p,
        asset: {
          ...p.asset,
          rules: has ? p.asset.rules.filter((x) => x !== v) : [...p.asset.rules, v],
        },
      };
    });

  const setReference = (idx: number, patch: Partial<ReferenceImageInput>) =>
    setInput((p) => ({
      ...p,
      references: p.references.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">AI Prompt Generator</p>
            <h1 className="text-3xl font-black tracking-tight">멀티 모델 이미지 프롬프트 도구</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              간단 요청 + 선택 옵션 → GPT Image / Nano Banana / Midjourney / Niji 용 영문 프롬프트로 변환합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleDark}
              aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {dark ? "라이트" : "다크"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <RefreshCcw size={18} /> 초기화
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
          {/* 좌측 입력 */}
          <aside className="space-y-5 rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
            <Section title="원본 한글 메모" hint="한글로 자유롭게 적어 주세요. 최종 복사 프롬프트에는 들어가지 않습니다.">
              <textarea
                value={input.koreanMemo}
                onChange={(e) => setField("koreanMemo", e.target.value)}
                placeholder="예: 20대 여성 캐릭터, 슬림 체형, 긴 흰색 웨이브 머리, 금색 판타지 갑옷, 전신, 비스듬한 각도"
                className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </Section>

            <Section title="영어 보충 입력 (선택)" hint="이 내용은 최종 영어 프롬프트에 그대로 들어갑니다.">
              <textarea
                value={input.englishSupplement}
                onChange={(e) => setField("englishSupplement", e.target.value)}
                placeholder="e.g. soft rim light from behind, gentle smile"
                className="h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </Section>

            <div>
              <button
                type="button"
                onClick={handleExtract}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Wand2 size={18} /> 입력 내용을 옵션으로 정리하기
              </button>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                위 두 입력에서 키워드를 감지해 아래 옵션을 자동으로 채워 줍니다. 자동 채워진 항목은 직접 다시 수정할 수 있습니다.
                (1차 구현은 키워드 매칭, 향후 AI 분석으로 확장 예정)
              </p>
              {extractMessage && (
                <p className="mt-2 rounded-xl bg-blue-50 p-2 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {extractMessage}
                </p>
              )}
            </div>

            <Section title="작업 유형">
              <div className="grid grid-cols-5 gap-2">
                {WORK_TYPE_OPTIONS.map((w) => (
                  <ChipSm
                    key={w.value}
                    label={w.label}
                    active={input.workType === w.value}
                    onClick={() => setField("workType", w.value as WorkType)}
                  />
                ))}
              </div>
            </Section>

            <OptionPicker
              label="스타일"
              hint="이미지의 전체적인 그림 스타일입니다."
              options={STYLE_OPTIONS}
              value={input.style}
              customText={input.styleCustom}
              onChange={(v, c) => setInput((p) => ({ ...p, style: v, styleCustom: c }))}
            />

            <OptionPicker
              label="비율"
              hint="이미지 가로세로 비율입니다."
              options={ASPECT_RATIO_OPTIONS}
              value={input.aspectRatio}
              customText={input.aspectRatioCustom}
              onChange={(v, c) => setInput((p) => ({ ...p, aspectRatio: v, aspectRatioCustom: c }))}
            />

            <Section title="빼고 싶은 것" hint="이미지에 나오지 않았으면 하는 요소입니다.">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {NEGATIVE_OPTIONS.map((n) => (
                  <CheckChip
                    key={n.value}
                    label={n.label}
                    checked={input.negativeChecks.includes(n.value)}
                    onChange={() => toggleNegative(n.value)}
                  />
                ))}
              </div>
              <input
                type="text"
                value={input.negativeCustom}
                onChange={(e) => setField("negativeCustom", e.target.value)}
                placeholder="직접 입력 (영어로 적어 주세요)"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </Section>

            {/* 작업 유형별 옵션 */}
            {input.workType === "character" && (
              <CharacterOptionsBlock
                value={input.character}
                set={setCharField}
              />
            )}
            {input.workType === "background" && (
              <BackgroundOptionsBlock
                value={input.background}
                set={setBgField}
              />
            )}
            {(input.workType === "frame" ||
              input.workType === "icon" ||
              input.workType === "object") && (
              <AssetOptionsBlock
                workType={input.workType}
                value={input.asset}
                set={setAssetField}
                toggleRule={toggleAssetRule}
              />
            )}

            <Section title="참고 이미지 (최대 3장)" hint="실제 이미지 분석은 하지 않습니다. 역할만 프롬프트에 반영됩니다.">
              <div className="space-y-3">
                {input.references.map((ref, i) => (
                  <ReferenceSlot
                    key={i}
                    index={i}
                    value={ref}
                    onChange={(patch) => setReference(i, patch)}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled
                title="향후 OpenAI/Gemini 연결 시 활성화 예정"
                className="mt-3 w-full cursor-not-allowed rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
              >
                AI로 참고 이미지 분석하기 (준비 중)
              </button>
            </Section>
          </aside>

          {/* 우측 결과 */}
          <main className="space-y-5">
            <SummaryCard summary={summary} koreanMemo={input.koreanMemo} />

            <ModelCard
              title="GPT Image"
              hint="문장형 지시문 (영어만)"
              options={GPT_OPTIONS}
              selected={gptModel}
              onSelect={setGptModel}
              content={gptOutput}
            />
            <ModelCard
              title="Nano Banana"
              hint="Goal / Subject / Style / Composition / Quality / Avoid 구조"
              options={NANO_OPTIONS}
              selected={nanoModel}
              onSelect={setNanoModel}
              content={nanoOutput}
            />
            <ModelCard
              title="Midjourney"
              hint="키워드 + --ar / --no / --sref / --oref"
              options={MJ_OPTIONS}
              selected={mjModel}
              onSelect={setMjModel}
              content={mjOutput}
            />
            <ModelCard
              title="Niji"
              hint="애니/캐릭터 키워드 + --niji + --ar / --no / --cref"
              options={NIJI_OPTIONS}
              selected={nijiModel}
              onSelect={setNijiModel}
              content={nijiOutput}
            />
            <ResultCard
              title="수정 요청용"
              hint="결과 이미지가 마음에 안 들 때 쓰는 수정 지시 템플릿"
              content={revisionOutput}
            />
          </main>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          v0.6 · 5종 작업 유형 · 17종 스타일 · 모델 12종 · 다크 모드
        </footer>
      </div>
    </div>
  );
}

// ===== 작업 유형별 옵션 블록 =====

function CharacterOptionsBlock({
  value,
  set,
}: {
  value: CharacterInput;
  set: <K extends keyof CharacterInput>(k: K, v: CharacterInput[K]) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">캐릭터 옵션</div>
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="성별" options={GENDER_OPTIONS}
          value={value.gender} customText={value.genderCustom}
          onChange={(v, c) => { set("gender", v); set("genderCustom", c); }} />
        <OptionPicker label="나이대" options={AGE_OPTIONS}
          value={value.ageRange} customText={value.ageRangeCustom}
          onChange={(v, c) => { set("ageRange", v); set("ageRangeCustom", c); }} />
      </div>
      <OptionPicker label="체형" options={BODY_OPTIONS}
        value={value.bodyType} customText={value.bodyTypeCustom}
        onChange={(v, c) => { set("bodyType", v); set("bodyTypeCustom", c); }} />
      <OptionPicker label="머리" options={HAIR_OPTIONS} moreOptions={HAIR_MORE_OPTIONS}
        value={value.hair} customText={value.hairCustom}
        onChange={(v, c) => { set("hair", v); set("hairCustom", c); }} />
      <OptionPicker label="의상" options={OUTFIT_OPTIONS} moreOptions={OUTFIT_MORE_OPTIONS}
        value={value.outfit} customText={value.outfitCustom}
        onChange={(v, c) => { set("outfit", v); set("outfitCustom", c); }} />
      <OptionPicker label="포즈" options={POSE_OPTIONS} moreOptions={POSE_MORE_OPTIONS}
        value={value.pose} customText={value.poseCustom}
        onChange={(v, c) => { set("pose", v); set("poseCustom", c); }} />
      <OptionPicker label="보이는 범위" hint="캐릭터가 화면에 얼마나 보이는지 정합니다."
        options={VISIBLE_RANGE_OPTIONS} moreOptions={VISIBLE_RANGE_MORE_OPTIONS}
        value={value.visibleRange} customText={value.visibleRangeCustom}
        onChange={(v, c) => { set("visibleRange", v); set("visibleRangeCustom", c); }} />
      <OptionPicker label="보는 각도" hint="이미지를 어느 위치에서 바라보는지 정합니다."
        options={VIEW_ANGLE_OPTIONS} moreOptions={VIEW_ANGLE_MORE_OPTIONS}
        value={value.viewingAngle} customText={value.viewingAngleCustom}
        onChange={(v, c) => { set("viewingAngle", v); set("viewingAngleCustom", c); }} />
      <OptionPicker label="캐릭터 방향" hint="캐릭터 몸이 어느 방향을 향하는지 정합니다."
        options={CHARACTER_DIRECTION_OPTIONS} moreOptions={CHARACTER_DIRECTION_MORE_OPTIONS}
        value={value.characterDirection} customText={value.characterDirectionCustom}
        onChange={(v, c) => { set("characterDirection", v); set("characterDirectionCustom", c); }} />
      <OptionPicker label="캐릭터 제작 형태" options={CHARACTER_SHEET_OPTIONS} moreOptions={CHARACTER_SHEET_MORE_OPTIONS}
        value={value.characterSheet} customText={value.characterSheetCustom}
        onChange={(v, c) => { set("characterSheet", v); set("characterSheetCustom", c); }} />
    </div>
  );
}

function BackgroundOptionsBlock({
  value,
  set,
}: {
  value: BackgroundInput;
  set: <K extends keyof BackgroundInput>(k: K, v: BackgroundInput[K]) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">배경 옵션</div>
      <OptionPicker label="장소" options={PLACE_OPTIONS} moreOptions={PLACE_MORE_OPTIONS}
        value={value.place} customText={value.placeCustom}
        onChange={(v, c) => { set("place", v); set("placeCustom", c); }} />
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="시간대" options={TIME_OF_DAY_OPTIONS}
          value={value.timeOfDay} customText={value.timeOfDayCustom}
          onChange={(v, c) => { set("timeOfDay", v); set("timeOfDayCustom", c); }} />
        <OptionPicker label="분위기" options={MOOD_OPTIONS}
          value={value.mood} customText={value.moodCustom}
          onChange={(v, c) => { set("mood", v); set("moodCustom", c); }} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="빛 느낌" options={LIGHTING_OPTIONS}
          value={value.lighting} customText={value.lightingCustom}
          onChange={(v, c) => { set("lighting", v); set("lightingCustom", c); }} />
        <OptionPicker label="색감" options={COLOR_PALETTE_OPTIONS}
          value={value.colorPalette} customText={value.colorPaletteCustom}
          onChange={(v, c) => { set("colorPalette", v); set("colorPaletteCustom", c); }} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="깊이감" options={DEPTH_OPTIONS}
          value={value.depth} customText={value.depthCustom}
          onChange={(v, c) => { set("depth", v); set("depthCustom", c); }} />
        <OptionPicker label="배경 복잡도" options={COMPLEXITY_OPTIONS}
          value={value.complexity} customText={value.complexityCustom}
          onChange={(v, c) => { set("complexity", v); set("complexityCustom", c); }} />
      </div>
      <OptionPicker label="여백 / 배치" options={LAYOUT_OPTIONS}
        value={value.layout} customText={value.layoutCustom}
        onChange={(v, c) => { set("layout", v); set("layoutCustom", c); }} />
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="보는 각도" options={BG_VIEW_ANGLE_OPTIONS}
          value={value.viewingAngle} customText={value.viewingAngleCustom}
          onChange={(v, c) => { set("viewingAngle", v); set("viewingAngleCustom", c); }} />
        <OptionPicker label="보이는 범위" options={BG_VISIBLE_RANGE_OPTIONS}
          value={value.visibleRange} customText={value.visibleRangeCustom}
          onChange={(v, c) => { set("visibleRange", v); set("visibleRangeCustom", c); }} />
      </div>
    </div>
  );
}

function AssetOptionsBlock({
  workType,
  value,
  set,
  toggleRule,
}: {
  workType: WorkType;
  value: AssetInput;
  set: <K extends keyof AssetInput>(k: K, v: AssetInput[K]) => void;
  toggleRule: (v: string) => void;
}) {
  const labelMap: Record<string, string> = {
    frame: "프레임 옵션",
    icon: "아이콘 옵션",
    object: "오브젝트 옵션",
  };
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{labelMap[workType] ?? "에셋 옵션"}</div>
      <OptionPicker label="형태" options={SHAPE_OPTIONS}
        value={value.shape} customText={value.shapeCustom}
        onChange={(v, c) => { set("shape", v); set("shapeCustom", c); }} />
      <OptionPicker label="표면 느낌" hint="재질이 어떻게 보이는지 정합니다." options={SURFACE_OPTIONS}
        value={value.surface} customText={value.surfaceCustom}
        onChange={(v, c) => { set("surface", v); set("surfaceCustom", c); }} />
      <div className="grid gap-3 md:grid-cols-2">
        <OptionPicker label="입체감" options={DIMENSION_OPTIONS}
          value={value.dimension} customText={value.dimensionCustom}
          onChange={(v, c) => { set("dimension", v); set("dimensionCustom", c); }} />
        <OptionPicker label="장식 정도" options={DECORATION_LEVEL_OPTIONS}
          value={value.decorationLevel} customText={value.decorationLevelCustom}
          onChange={(v, c) => { set("decorationLevel", v); set("decorationLevelCustom", c); }} />
      </div>
      <OptionPicker label="배경 처리" options={BG_TREATMENT_OPTIONS}
        value={value.backgroundTreatment} customText={value.backgroundTreatmentCustom}
        onChange={(v, c) => { set("backgroundTreatment", v); set("backgroundTreatmentCustom", c); }} />
      <Section title="에셋 조건">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {ASSET_RULES_OPTIONS.map((r) => (
            <CheckChip
              key={r.value}
              label={r.label}
              checked={value.rules.includes(r.value)}
              onChange={() => toggleRule(r.value)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ===== 옵션 선택 컴포넌트 =====

function OptionPicker({
  label,
  hint,
  options,
  moreOptions,
  value,
  customText,
  onChange,
}: {
  label: string;
  hint?: string;
  options: OptionItem[];
  moreOptions?: OptionItem[];
  value: string;
  customText: string;
  onChange: (value: string, customText: string) => void;
}) {
  const [showMore, setShowMore] = useState(false);

  // 더보기에서 선택된 값이 있으면 자동으로 펼침
  useEffect(() => {
    if (moreOptions && moreOptions.some((o) => o.value === value)) setShowMore(true);
  }, [value, moreOptions]);

  const selectedOption =
    options.find((o) => o.value === value) ||
    moreOptions?.find((o) => o.value === value);
  const isCustom = selectedOption?.en === "__custom__";
  const selectedDesc = selectedOption?.desc;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>
        {(selectedDesc || hint) && (
          <span className="truncate text-[10px] text-slate-400 dark:text-slate-500">
            {selectedDesc ?? hint}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <ChipXs
            key={o.value}
            label={o.label}
            active={value === o.value}
            title={o.desc}
            onClick={() => onChange(o.value, customText)}
          />
        ))}
        {moreOptions && moreOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-[11px] transition ${
              showMore
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Plus size={10} /> {showMore ? "더보기 접기" : "더보기"}
          </button>
        )}
      </div>
      {showMore && moreOptions && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
          {moreOptions.map((o) => (
            <ChipXs
              key={o.value}
              label={o.label}
              active={value === o.value}
              title={o.desc}
              onClick={() => onChange(o.value, customText)}
            />
          ))}
        </div>
      )}
      {isCustom && (
        <input
          type="text"
          value={customText}
          onChange={(e) => onChange(value, e.target.value)}
          placeholder="직접 입력 (영어로 적으면 프롬프트에 반영됩니다)"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
        />
      )}
    </div>
  );
}

// ===== 참고 이미지 슬롯 =====

function ReferenceSlot({
  index,
  value,
  onChange,
}: {
  index: number;
  value: ReferenceImageInput;
  onChange: (patch: Partial<ReferenceImageInput>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ src: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ src: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">이미지 {index + 1}</div>
        {value.src && (
          <button
            type="button"
            onClick={() => onChange({ src: null })}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-900 dark:bg-slate-100/80 dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <X size={10} /> 제거
          </button>
        )}
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={handleDrop}
      >
        {!value.src ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-20 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition ${
              dragOver
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            <ImagePlus size={18} />
            <span className="text-[11px] font-semibold">클릭 또는 끌어다 놓기</span>
          </button>
        ) : (
          <div className="h-20 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.src} alt={`참고 이미지 ${index + 1}`} className="h-full w-full object-contain" />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <div className="mt-2">
        <label className="mb-1 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">역할</label>
        <select
          value={value.role}
          onChange={(e) => onChange({ role: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {REFERENCE_ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ===== 결과 카드 =====

function SummaryCard({ summary, koreanMemo }: { summary: ReturnType<typeof buildSummary>; koreanMemo: string }) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? summary.rows : summary.rows.slice(0, 12);
  const hasMore = summary.rows.length > 12;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">정리된 요청 요약</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">선택한 옵션과 입력 내용을 한눈에 확인합니다 (복사 안 됨).</p>
      </div>
      {summary.rows.length === 0 ? (
        <p className="text-sm text-slate-500">아직 선택된 옵션이 없습니다.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          {visibleRows.map((row, i) => (
            <div key={i} className="flex items-baseline gap-3 border-b border-slate-100 py-1.5 dark:border-slate-800">
              <span className="w-32 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{row.label}</span>
              <span className="flex-1 break-words text-sm text-slate-800 dark:text-slate-200">{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          {showAll ? "접기" : `더보기 (+${summary.rows.length - 12}개)`}
        </button>
      )}

      {summary.negative.tags.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{summary.negative.label}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {summary.negative.tags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
          </div>
        </div>
      )}
      {summary.references.tags.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{summary.references.label}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {summary.references.tags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
          </div>
        </div>
      )}

      {koreanMemo.trim() && (
        <details className="mt-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
          <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
            원본 한글 메모 (참고용 · 복사 안 됨)
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{koreanMemo}</p>
        </details>
      )}
    </div>
  );
}

function ModelCard({
  title,
  hint,
  options,
  selected,
  onSelect,
  content,
}: {
  title: string;
  hint: string;
  options: ModelKey[];
  selected: ModelKey;
  onSelect: (m: ModelKey) => void;
  content: string;
}) {
  return (
    <CardShell title={title} hint={hint} content={content}>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as ModelKey)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{MODEL_LABEL[opt]}</option>
        ))}
      </select>
    </CardShell>
  );
}

function ResultCard({ title, hint, content }: { title: string; hint: string; content: string }) {
  return <CardShell title={title} hint={hint} content={content} />;
}

function CardShell({
  title,
  hint,
  content,
  children,
}: {
  title: string;
  hint: string;
  content: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCopied(false); }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <div className="min-h-[120px] whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {content}
      </div>
    </div>
  );
}

// ===== 작은 UI 부품 =====

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">{title}</h2>
        {hint && <span className="truncate text-[10px] text-slate-400 dark:text-slate-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function ChipSm({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-full border px-2 py-2 text-sm transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function ChipXs({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-full border px-2.5 py-1.5 text-[11px] transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function CheckChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-slate-900 dark:accent-slate-100"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}
