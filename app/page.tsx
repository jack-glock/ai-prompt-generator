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
  ChevronDown,
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
  buildGptImageKorean,
  buildNanoBananaKorean,
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
import { aiTranslateKoreanToEnglish, aiExtractOptions, aiAnalyzeImage, AiError, AiExtractHints } from "@/lib/aiClient";

// AI가 응답한 옵션 hints를 PromptInput에 병합한다.
// - null/undefined인 슬롯은 기존 값을 유지
// - 값이 있는 슬롯만 덮어쓰기
function mergeAiHints(prev: PromptInput, hints: AiExtractHints): PromptInput {
  const next: PromptInput = {
    ...prev,
    character: { ...prev.character },
    background: { ...prev.background },
    asset: { ...prev.asset, rules: [...prev.asset.rules] },
    references: prev.references.map((r) => ({ ...r })),
    enabled: { ...prev.enabled },
  };

  if (hints.workType) next.workType = hints.workType as WorkType;
  if (hints.style) next.style = hints.style;
  if (hints.styleCustom) next.styleCustom = hints.styleCustom;
  if (hints.aspectRatio) next.aspectRatio = hints.aspectRatio;
  if (hints.aspectRatioCustom) next.aspectRatioCustom = hints.aspectRatioCustom;

  const applyGroup = <T extends object>(target: T, src?: Record<string, string | null | undefined>) => {
    if (!src) return;
    for (const [k, v] of Object.entries(src)) {
      if (v == null) continue;
      (target as any)[k] = v;
    }
  };
  applyGroup(next.character, hints.character);
  applyGroup(next.background, hints.background);
  applyGroup(next.asset, hints.asset);

  return next;
}

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
  const gptOutputKo = useMemo(() => buildGptImageKorean(input), [input]);
  const nanoOutput = useMemo(() => buildPromptFor(nanoModel, input), [nanoModel, input]);
  const nanoOutputKo = useMemo(() => buildNanoBananaKorean(input, nanoModel), [input, nanoModel]);
  const mjOutput = useMemo(() => buildPromptFor(mjModel, input), [mjModel, input]);
  const nijiOutput = useMemo(() => buildPromptFor(nijiModel, input), [nijiModel, input]);
  const revisionOutput = useMemo(() => buildRevisionPrompt(input), [input]);

  // === 핸들러: AI 번역 ===
  const [translating, setTranslating] = useState(false);
  const [translateMessage, setTranslateMessage] = useState<string | null>(null);
  const [lastTranslatedMemo, setLastTranslatedMemo] = useState<string>("");
  const [lastExtractedKey, setLastExtractedKey] = useState<string>("");
  const [lastAnalyzedKey, setLastAnalyzedKey] = useState<Record<number, string>>({});
  const handleAiTranslate = async () => {
    const memo = input.koreanMemo.trim();
    if (!memo) {
      setTranslateMessage("먼저 한글 메모를 적어 주세요.");
      setTimeout(() => setTranslateMessage(null), 3000);
      return;
    }
    setTranslating(true);
    setTranslateMessage(null);
    try {
      const { english } = await aiTranslateKoreanToEnglish(memo);
      // 영어 보충 입력에 채우기 (기존 내용이 있으면 줄바꿈으로 추가)
      setInput((p) => ({
        ...p,
        englishSupplement: p.englishSupplement.trim()
          ? `${p.englishSupplement.trim()}\n${english}`
          : english,
      }));
      setLastTranslatedMemo(memo);
      setTranslateMessage("번역 완료. 영어 보충 입력에 채워졌습니다.");
    } catch (err) {
      const msg = err instanceof AiError ? err.message : "AI 호출 실패";
      setTranslateMessage(msg);
    } finally {
      setTranslating(false);
      setTimeout(() => setTranslateMessage(null), 4000);
    }
  };

  // === 핸들러: AI로 옵션 채우기 ===
  const [aiExtracting, setAiExtracting] = useState(false);
  const handleAiExtract = async () => {
    const memo = input.koreanMemo.trim();
    const eng = input.englishSupplement.trim();
    if (!memo && !eng) {
      setExtractMessage("먼저 한글 메모나 영어 보충 입력에 내용을 적어 주세요.");
      setTimeout(() => setExtractMessage(null), 3000);
      return;
    }
    setAiExtracting(true);
    setExtractMessage(null);
    try {
      const hints = await aiExtractOptions(memo, eng);
      setInput((p) => mergeAiHints(p, hints));
      setLastExtractedKey(`${memo}\n${eng}`);
      setExtractMessage("AI가 옵션을 채웠습니다. 필요하면 직접 수정하세요.");
    } catch (err) {
      setExtractMessage(err instanceof AiError ? err.message : "AI 호출 실패");
    } finally {
      setAiExtracting(false);
      setTimeout(() => setExtractMessage(null), 4000);
    }
  };

  // === 핸들러: 참고 이미지 분석 (슬롯별) ===
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  const handleAiAnalyzeImage = async (idx: number) => {
    const ref = input.references[idx];
    if (!ref?.src) {
      setExtractMessage("이미지가 없는 슬롯입니다.");
      setTimeout(() => setExtractMessage(null), 3000);
      return;
    }
    setAnalyzingIndex(idx);
    setExtractMessage(null);
    try {
      const hints = await aiAnalyzeImage(ref.src, ref.role);
      setInput((p) => mergeAiHints(p, hints));
      setLastAnalyzedKey((prev) => ({ ...prev, [idx]: `${ref.src}|${ref.role}` }));
      setExtractMessage(`이미지 ${idx + 1} 분석 완료. 해당 역할의 옵션을 채웠습니다.`);
    } catch (err) {
      setExtractMessage(err instanceof AiError ? err.message : "AI 호출 실패");
    } finally {
      setAnalyzingIndex(null);
      setTimeout(() => setExtractMessage(null), 4000);
    }
  };

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

  const setEnabled = (k: keyof PromptInput["enabled"], v: boolean) =>
    setInput((p) => ({ ...p, enabled: { ...p.enabled, [k]: v } }));

  // 사용/비사용 플래그를 localStorage에 저장 / 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem("apg.enabled");
      if (raw) {
        const saved = JSON.parse(raw);
        setInput((p) => ({ ...p, enabled: { ...p.enabled, ...saved } }));
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("apg.enabled", JSON.stringify(input.enabled)); } catch {}
  }, [input.enabled]);

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
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                메모 / 옵션 / 참고 이미지 중 원하는 것을 채우면 우측에 영어 프롬프트가 자동 생성됩니다.
                옵션 그룹의 토글을 끄면 그 그룹은 프롬프트에서 제외됩니다.
              </span>
            </div>
            <Section title="원본 한글 메모" hint="한글로 자유롭게 적어 주세요. 최종 복사 프롬프트에는 들어가지 않습니다.">
              <textarea
                value={input.koreanMemo}
                onChange={(e) => setField("koreanMemo", e.target.value)}
                placeholder="예: 20대 여성 캐릭터, 슬림 체형, 긴 흰색 웨이브 머리, 금색 판타지 갑옷, 전신, 비스듬한 각도"
                className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
              {(() => {
                const done = !!lastTranslatedMemo && lastTranslatedMemo === input.koreanMemo.trim();
                return (
                  <button
                    type="button"
                    onClick={handleAiTranslate}
                    disabled={translating}
                    title={done ? "이미 이 메모로 번역했습니다. 다시 누르면 새로 번역합니다." : "위 한글 메모를 자연스러운 영어로 번역해 아래 영어 보충 입력에 채워 줍니다 (Gemini 2.5 Flash, 1회 약 1~2원)."}
                    className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      done
                        ? "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                    }`}
                  >
                    {translating ? (
                      <><Wand2 size={14} className="animate-spin" /> 번역 중...</>
                    ) : done ? (
                      <><Check size={14} /> 번역됨 (다시 누르면 재번역)</>
                    ) : (
                      <><Wand2 size={14} /> AI로 영어 번역하기</>
                    )}
                  </button>
                );
              })()}
              {translateMessage && (
                <p className="mt-2 rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {translateMessage}
                </p>
              )}
            </Section>

            <Section title="영어 보충 입력 (선택)" hint="이 내용은 최종 영어 프롬프트에 그대로 들어갑니다.">
              <textarea
                value={input.englishSupplement}
                onChange={(e) => setField("englishSupplement", e.target.value)}
                placeholder="e.g. soft rim light from behind, gentle smile"
                className="h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </Section>

            {/* 위 두 입력에서 옵션을 채우는 버튼 그룹 — 영어 보충 바로 아래 */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExtract}
                  title="단순 키워드 매칭으로 옵션을 자동으로 채웁니다 (API 불필요, 즉시 동작)."
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Wand2 size={16} /> 키워드로 옵션 채우기
                </button>
                {(() => {
                  const currentKey = `${input.koreanMemo.trim()}\n${input.englishSupplement.trim()}`;
                  const done = !!lastExtractedKey && lastExtractedKey === currentKey;
                  return (
                    <button
                      type="button"
                      onClick={handleAiExtract}
                      disabled={aiExtracting}
                      title={done ? "이미 이 입력으로 분석했습니다. 다시 누르면 재분석합니다." : "LLM이 입력을 분석해 옵션 슬롯에 정확하게 분배합니다 (1회 약 2~4원). 정해진 값에 없으면 '직접 입력'으로 채워집니다."}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        done
                          ? "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                      }`}
                    >
                      {aiExtracting ? (
                        <><Wand2 size={16} className="animate-spin" /> 분석 중...</>
                      ) : done ? (
                        <><Check size={16} /> 옵션 채워짐 (재분석 가능)</>
                      ) : (
                        <><Wand2 size={16} /> AI로 옵션 채우기</>
                      )}
                    </button>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                키워드는 즉시·무료, AI는 정확도↑ (1회 ~3원).
              </p>
              {extractMessage && (
                <p className="rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {extractMessage}
                </p>
              )}
            </div>

            <Section
              title="참고 이미지"
              hint="이미지를 최대 3장까지 올릴 수 있습니다. 지금은 이미지 자체를 분석하지 않고 역할만 프롬프트에 반영됩니다."
              collapsible
              enabled={input.enabled.references}
              onEnabledChange={(v) => setEnabled("references", v)}
            >
              <div className="grid grid-cols-3 gap-2">
                {input.references.map((ref, i) => (
                  <ReferenceSlot
                    key={i}
                    index={i}
                    value={ref}
                    onChange={(patch) => setReference(i, patch)}
                    onAnalyze={() => handleAiAnalyzeImage(i)}
                    analyzing={analyzingIndex === i}
                    analyzed={!!ref.src && lastAnalyzedKey[i] === `${ref.src}|${ref.role}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                각 이미지의 역할을 정한 뒤 슬롯 안 분석 버튼을 누르면 그 역할에 해당하는 옵션만 채워집니다.
              </p>
            </Section>



            <Section
              title="작업 유형"
              collapsible
              enabled={input.enabled.workType}
              onEnabledChange={(v) => setEnabled("workType", v)}
            >
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
              enabled={input.enabled.style}
              onEnabledChange={(v) => setEnabled("style", v)}
            />

            <OptionPicker
              label="비율"
              hint="이미지 가로세로 비율입니다."
              options={ASPECT_RATIO_OPTIONS}
              value={input.aspectRatio}
              customText={input.aspectRatioCustom}
              onChange={(v, c) => setInput((p) => ({ ...p, aspectRatio: v, aspectRatioCustom: c }))}
              enabled={input.enabled.aspectRatio}
              onEnabledChange={(v) => setEnabled("aspectRatio", v)}
            />

            <Section
              title="빼고 싶은 것"
              hint="이미지에 나오지 않았으면 하는 요소입니다."
              collapsible
              enabled={input.enabled.negative}
              onEnabledChange={(v) => setEnabled("negative", v)}
            >
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
                placeholder="직접 입력 (영어 권장 — API 연결 후엔 한글도 가능)"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </Section>

            {/* 작업 유형별 옵션 — Section으로 감싸 다른 그룹과 동일 디자인 */}
            {input.workType === "character" && (
              <Section
                title="캐릭터 옵션"
                collapsible
                enabled={input.enabled.character}
                onEnabledChange={(v) => setEnabled("character", v)}
              >
                <CharacterOptionsBlock value={input.character} set={setCharField} />
              </Section>
            )}
            {input.workType === "background" && (
              <Section
                title="배경 옵션"
                collapsible
                enabled={input.enabled.background}
                onEnabledChange={(v) => setEnabled("background", v)}
              >
                <BackgroundOptionsBlock value={input.background} set={setBgField} />
              </Section>
            )}
            {(input.workType === "frame" ||
              input.workType === "icon" ||
              input.workType === "object") && (
              <Section
                title={input.workType === "frame" ? "프레임 옵션" : input.workType === "icon" ? "아이콘 옵션" : "오브젝트 옵션"}
                collapsible
                enabled={input.enabled.asset}
                onEnabledChange={(v) => setEnabled("asset", v)}
              >
                <AssetOptionsBlock
                  workType={input.workType}
                  value={input.asset}
                  set={setAssetField}
                  toggleRule={toggleAssetRule}
                />
              </Section>
            )}
          </aside>

          {/* 우측 결과 */}
          <main className="space-y-5">
            <SummaryCard summary={summary} koreanMemo={input.koreanMemo} />

            <ModelCard
              title="GPT Image"
              hint="문장형, 한/영 지원"
              options={GPT_OPTIONS}
              selected={gptModel}
              onSelect={setGptModel}
              content={gptOutput}
              koreanContent={gptOutputKo}
            />
            <ModelCard
              title="Nano Banana"
              hint="구조형(목표/디테일/스타일/구도/품질/제외), 한/영 지원"
              options={NANO_OPTIONS}
              selected={nanoModel}
              onSelect={setNanoModel}
              content={nanoOutput}
              koreanContent={nanoOutputKo}
            />
            <ModelCard
              title="Midjourney"
              hint="키워드만 — Discord/사이트에서 --ar, --no, --sref 등 직접 추가"
              options={MJ_OPTIONS}
              selected={mjModel}
              onSelect={setMjModel}
              content={mjOutput}
            />
            <ModelCard
              title="Niji"
              hint="애니 키워드만 — Discord/사이트에서 --niji, --ar, --no 등 직접 추가"
              options={NIJI_OPTIONS}
              selected={nijiModel}
              onSelect={setNijiModel}
              content={nijiOutput}
            />
            <ResultCard
              title="수정 요청용"
              hint="결과가 마음에 안 들 때 쓰는 수정 템플릿"
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
    <div className="space-y-4">
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
    <div className="space-y-4">
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
  return (
    <div className="space-y-4">
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
  enabled,
  onEnabledChange,
}: {
  label: string;
  hint?: string;
  options: OptionItem[];
  moreOptions?: OptionItem[];
  value: string;
  customText: string;
  onChange: (value: string, customText: string) => void;
  /** 정의되어 있으면 헤더에 "사용" 체크박스가 노출됩니다. */
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
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
  const tooltip = selectedDesc ?? hint;
  const isOff = enabled === false;
  const showToggle = enabled !== undefined && onEnabledChange !== undefined;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          title={tooltip}
          className={`text-sm font-bold ${
            isOff ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"
          } ${tooltip ? "cursor-help underline decoration-dotted underline-offset-4 decoration-slate-300 dark:decoration-slate-600" : ""}`}
        >
          {label}
        </label>
        {showToggle && (
          <label
            className="flex shrink-0 cursor-pointer items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange!(e.target.checked)}
              className="h-3.5 w-3.5 accent-slate-900 dark:accent-slate-100"
            />
            사용
          </label>
        )}
      </div>
      <div className={isOff ? "opacity-40" : ""}>
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
    </div>
  );
}

// ===== 참고 이미지 슬롯 =====

function ReferenceSlot({
  index,
  value,
  onChange,
  onAnalyze,
  analyzing,
  analyzed,
}: {
  index: number;
  value: ReferenceImageInput;
  onChange: (patch: Partial<ReferenceImageInput>) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzed: boolean;
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
    <div className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">#{index + 1}</div>
        {value.src && (
          <button
            type="button"
            onClick={() => onChange({ src: null })}
            title="제거"
            aria-label="이미지 제거"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900 dark:bg-slate-100/80 dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <X size={10} />
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
            title="클릭 또는 이미지를 끌어다 놓기"
            className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed transition ${
              dragOver
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-slate-400 bg-slate-200 text-slate-600 hover:bg-slate-300 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            <ImagePlus size={16} />
            <span className="text-[10px] font-semibold">클릭/드롭</span>
          </button>
        ) : (
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.src} alt={`참고 이미지 ${index + 1}`} className="h-full w-full object-contain" />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <select
        value={value.role}
        onChange={(e) => onChange({ role: e.target.value })}
        title="이미지의 역할 — 분석은 이 역할의 옵션만 채웁니다."
        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {REFERENCE_ROLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {value.src && (
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          title={analyzed ? "이 역할로 이미 분석했습니다. 다시 누르면 재분석합니다." : `이 이미지를 '${REFERENCE_ROLE_OPTIONS.find((o) => o.value === value.role)?.label ?? value.role}'로 분석해 해당 옵션만 채웁니다 (1회 약 2~4원).`}
          className={`mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            analyzed
              ? "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
          }`}
        >
          {analyzing ? (
            <><Wand2 size={11} className="animate-spin" /> 분석 중...</>
          ) : analyzed ? (
            <><Check size={11} /> 분석됨</>
          ) : (
            <><Wand2 size={11} /> {REFERENCE_ROLE_OPTIONS.find((o) => o.value === value.role)?.label ?? "분석"}로 분석</>
          )}
        </button>
      )}
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
  koreanContent,
}: {
  title: string;
  hint: string;
  options: ModelKey[];
  selected: ModelKey;
  onSelect: (m: ModelKey) => void;
  content: string;
  /** 정의되어 있으면 카드에 한/영 토글이 노출되고, 표시 중인 언어로 복사됩니다. */
  koreanContent?: string;
}) {
  return (
    <CardShell title={title} hint={hint} content={content} koreanContent={koreanContent}>
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
  koreanContent,
  children,
}: {
  title: string;
  hint: string;
  content: string;
  koreanContent?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "ko">("en");
  const displayed = lang === "ko" && koreanContent ? koreanContent : content;
  useEffect(() => { setCopied(false); }, [displayed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = displayed;
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
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        {koreanContent && (
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1.5 text-[11px] font-semibold transition ${
                lang === "en"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ko")}
              className={`px-2.5 py-1.5 text-[11px] font-semibold transition ${
                lang === "ko"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              한국어
            </button>
          </div>
        )}
        {children}
      </div>
      <div className="relative min-h-[120px] whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 pr-24 font-mono text-sm leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <button
          type="button"
          onClick={handleCopy}
          className={`absolute right-2 top-2 inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            copied
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-300"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "복사됨" : "복사"}
        </button>
        {displayed}
      </div>
    </div>
  );
}

// ===== 작은 UI 부품 =====

function Section({
  title,
  hint,
  children,
  collapsible = false,
  defaultOpen = true,
  enabled,
  onEnabledChange,
}: {
  title: string;
  /** 마우스 hover 시 헤더 툴팁으로 표시. 화면 텍스트로는 노출하지 않음. */
  hint?: string;
  children: React.ReactNode;
  /** true면 헤더 클릭으로 본문을 접고 펼 수 있음. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** 정의되어 있으면 헤더에 사용 토글 스위치가 노출됩니다. false면 본문이 dim 처리됩니다. */
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOff = enabled === false;
  const showToggle = enabled !== undefined && onEnabledChange !== undefined;

  const headerClass = `flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
    isOff
      ? "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80"
      : "border-slate-200 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/50"
  } ${collapsible ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""}`;

  const titleText = (
    <span
      title={hint}
      className={`text-sm font-bold ${
        isOff ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
      } ${hint ? "cursor-help underline decoration-dotted underline-offset-4 decoration-slate-400/60 dark:decoration-slate-500/60" : ""}`}
    >
      {title}
    </span>
  );

  return (
    <section>
      <div className={headerClass}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="flex flex-1 items-center gap-2 text-left"
            aria-expanded={open}
          >
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-500 transition-transform ${open ? "" : "-rotate-90"}`}
            />
            {titleText}
          </button>
        ) : (
          <div className="flex flex-1 items-center gap-2 px-1">{titleText}</div>
        )}
        {showToggle && (
          <ToggleSwitch
            checked={!!enabled}
            onChange={(v) => onEnabledChange!(v)}
            label={enabled ? "사용 중" : "꺼짐"}
          />
        )}
      </div>
      {(!collapsible || open) && (
        <div className={`pt-3 ${isOff ? "pointer-events-none opacity-50" : ""}`}>{children}</div>
      )}
    </section>
  );
}

/** iOS 스타일 토글 스위치. 체크박스보다 ON/OFF가 한눈에 보입니다. */
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="flex shrink-0 items-center gap-1.5"
    >
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          checked
            ? "bg-emerald-500 dark:bg-emerald-500"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      {label && (
        <span className={`text-[10px] font-semibold ${checked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
          {label}
        </span>
      )}
    </button>
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
