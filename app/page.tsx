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
  STYLE_CATEGORIES,
  StyleCategory,
  ASPECT_RATIO_OPTIONS,
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
import { aiTranslateKoreanToEnglish, aiExtractOptions, aiAnalyzeImage, mergeAiHints, AiError } from "@/lib/aiClient";
import { resizeImageDataUrl } from "@/lib/imageUtils";

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
      // 디버깅: 응답 형식 확인용 (개발자도구 콘솔)
      // eslint-disable-next-line no-console
      console.log("[AI extract hints]", hints);
      setInput((p) => mergeAiHints(p, hints));
      setLastExtractedKey(`${memo}\n${eng}`);
      setExtractMessage("✓ AI 옵션 채우기 완료. 아래 옵션 그룹을 펼쳐서 확인하세요.");
    } catch (err) {
      setExtractMessage(err instanceof AiError ? err.message : "AI 호출 실패");
    } finally {
      setAiExtracting(false);
      setTimeout(() => setExtractMessage(null), 7000);
    }
  };

  // === 핸들러: 참고 이미지 분석 (슬롯별) ===
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  // 슬롯별 AI 한글 설명 (편집 가능)
  const [imageDescriptions, setImageDescriptions] = useState<Record<number, string>>({});
  // 슬롯별 활성/비활성. #1은 항상 표시(true), #2와 #3는 헤더의 토글 버튼으로 켜고 끔.
  const [activeSlots, setActiveSlots] = useState<boolean[]>([true, false, false]);
  const toggleSlot = (idx: number) => {
    setActiveSlots((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    // 슬롯을 끄면 그 슬롯의 이미지와 한글 설명도 같이 정리
    if (activeSlots[idx]) {
      setReference(idx, { src: null });
      setImageDescriptions((prev) => ({ ...prev, [idx]: "" }));
      setLastAnalyzedKey((prev) => ({ ...prev, [idx]: "" }));
    }
  };
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
      const result = await aiAnalyzeImage(ref.src, ref.role);
      // 디버깅: 응답 형식 확인용 (개발자도구 콘솔)
      // eslint-disable-next-line no-console
      console.log(`[AI image #${idx + 1} result]`, result);
      setInput((p) => mergeAiHints(p, result.hints));
      setLastAnalyzedKey((prev) => ({ ...prev, [idx]: `${ref.src}|${ref.role}` }));
      setImageDescriptions((prev) => ({ ...prev, [idx]: result.description ?? "" }));
      setExtractMessage(`✓ 이미지 ${idx + 1} 분석 완료. 해당 역할의 옵션을 펼쳐서 확인하세요.`);
    } catch (err) {
      setExtractMessage(err instanceof AiError ? err.message : "AI 호출 실패");
    } finally {
      setAnalyzingIndex(null);
      setTimeout(() => setExtractMessage(null), 7000);
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
    setTimeout(() => setExtractMessage(null), 7000);
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

  const setReference = (idx: number, patch: Partial<ReferenceImageInput>) => {
    setInput((p) => ({
      ...p,
      references: p.references.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
    // 이미지가 바뀌거나 제거되면 해당 슬롯의 AI 설명도 리셋
    if ("src" in patch) {
      setImageDescriptions((prev) => {
        if (!prev[idx]) return prev;
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

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
    <div className="min-h-screen p-4 md:p-6" style={{ color: "var(--clay-black)" }}>
      <div className="mx-auto max-w-7xl">
        <header className="clay-shadow mb-6 flex flex-col gap-3 rounded-[24px] border border-[#dad4c8] bg-white px-6 py-4 dark:border-[#3a352e] dark:bg-[#2a2723] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9f9b93]">AI Prompt Generator</p>
            <h1 className="text-2xl font-black tracking-tight">멀티 모델 이미지 프롬프트 도구</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleDark}
              aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="clay-hover inline-flex items-center gap-2 rounded-full border border-[#dad4c8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee]"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              {dark ? "라이트" : "다크"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="clay-hover inline-flex items-center gap-2 rounded-full border border-[#dad4c8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee]"
            >
              <RefreshCcw size={16} /> 초기화
            </button>
          </div>
        </header>

        {/* Sticky 옵션 헤더: 작업 유형 / 스타일 / 비율 / 안내문 */}
        <div className="clay-shadow sticky top-4 z-30 mb-6 space-y-3 rounded-[24px] border border-[#dad4c8] bg-white p-5 dark:border-[#3a352e] dark:bg-[#2a2723]">
          {/* 1행: 작업 유형(좌, 500px — 좌측 aside 폭과 정렬) + 스타일(우, 1fr — 우측 결과 카드 폭과 정렬) */}
          <div className="grid gap-6 lg:grid-cols-[500px_1fr]">
            <Section
              title="작업 유형"
              collapsible
              enabled={input.enabled.workType}
              onEnabledChange={(v) => setEnabled("workType", v)}
            >
              <div className="grid grid-cols-5 gap-1.5">
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

            <StylePicker
              value={input.style}
              customText={input.styleCustom}
              onChange={(v, c) => setInput((p) => ({ ...p, style: v, styleCustom: c }))}
              enabled={input.enabled.style}
              onEnabledChange={(v) => setEnabled("style", v)}
            />
          </div>

          {/* 2행: 비율 */}
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

          {/* 3행: 안내문 한 줄 (박스 없이 텍스트만) */}
          <div className="flex items-center gap-2 px-1 text-xs text-[#9f9b93] dark:text-[#8a8479]">
            <Info size={14} className="shrink-0 text-[#078a52] dark:text-[#84e7a5]" />
            <span className="truncate">
              메모 / 옵션 / 참고 이미지를 채우면 우측에 영어 프롬프트가 자동 생성됩니다. 옵션 그룹 토글을 끄면 그 그룹은 제외됩니다.
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[500px_1fr]">
          {/* 좌측 입력 */}
          <aside className="clay-shadow space-y-5 rounded-[24px] border border-[#dad4c8] bg-white p-5 dark:border-[#3a352e] dark:bg-[#2a2723]">
            {/* 원본 한글 메모 — placeholder가 라벨 역할 */}
            <div>
              <textarea
                value={input.koreanMemo}
                onChange={(e) => setField("koreanMemo", e.target.value)}
                placeholder="원본 한글 메모 — 한글로 자유롭게 적어 주세요 (예: 20대 여성 캐릭터, 슬림 체형, 긴 흰색 웨이브 머리, 금색 판타지 갑옷, 전신)"
                className="h-24 w-full resize-none rounded-2xl border border-[#dad4c8] bg-white p-3 text-sm leading-6 outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#f5f3ee] dark:focus:border-[#dad4c8]"
              />
              {(() => {
                const done = !!lastTranslatedMemo && lastTranslatedMemo === input.koreanMemo.trim();
                return (
                  <button
                    type="button"
                    onClick={handleAiTranslate}
                    disabled={translating}
                    title={done ? "이미 이 메모로 번역했습니다. 다시 누르면 새로 번역합니다." : "위 한글 메모를 자연스러운 영어로 번역해 아래 영어 보충 입력에 채워 줍니다 (Gemini 2.5 Flash, 1회 약 1~2원)."}
                    className={`clay-hover mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      done
                        ? "border-[#dad4c8] bg-[#eee9df] text-[#55534e] hover:bg-[#dad4c8] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#b3aea3] dark:hover:bg-[#352f29]"
                        : "border-[#fc7981] bg-[#fff0f1] text-[#1a1a1a] hover:bg-[#ffe1e3] dark:border-[#fc7981] dark:bg-[#fc7981]/15 dark:text-[#f5f3ee] dark:hover:bg-[#fc7981]/25"
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
            </div>

            {/* 영어 보충 입력 — placeholder가 라벨 역할 */}
            <textarea
              value={input.englishSupplement}
              onChange={(e) => setField("englishSupplement", e.target.value)}
              placeholder="영어 보충 입력 (선택) — 영어로 적은 내용은 그대로 프롬프트에 들어갑니다 (e.g. soft rim light from behind, gentle smile)"
              className="h-20 w-full resize-none rounded-2xl border border-[#dad4c8] bg-white p-3 text-sm leading-6 outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#f5f3ee] dark:focus:border-[#dad4c8]"
            />

            {/* 위 두 입력에서 옵션을 채우는 버튼 그룹 — 메인(키워드) + 보조(AI) 위계 */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExtract}
                title="단순 키워드 매칭으로 옵션을 자동으로 채웁니다 (API 불필요, 즉시·무료)."
                className="clay-hover-strong inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#078a52] bg-[#078a52] px-4 py-3.5 text-base font-bold text-white transition hover:bg-[#02492a] dark:border-[#078a52] dark:bg-[#078a52] dark:text-white dark:hover:bg-[#02492a]"
              >
                <Wand2 size={18} /> 키워드로 옵션 채우기
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
                    className={`clay-hover inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      done
                        ? "border-[#dad4c8] bg-[#eee9df] text-[#55534e] hover:bg-[#dad4c8] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#b3aea3] dark:hover:bg-[#352f29]"
                        : "border-[#fc7981] bg-[#fff0f1] text-[#1a1a1a] hover:bg-[#ffe1e3] dark:border-[#fc7981] dark:bg-[#fc7981]/15 dark:text-[#f5f3ee] dark:hover:bg-[#fc7981]/25"
                    }`}
                  >
                    {aiExtracting ? (
                      <><Wand2 size={12} className="animate-spin" /> AI 분석 중...</>
                    ) : done ? (
                      <><Check size={12} /> AI 옵션 채워짐 (재분석 가능)</>
                    ) : (
                      <><Wand2 size={12} /> 더 풍부하게 — AI로 옵션 채우기 (~6원)</>
                    )}
                  </button>
                );
              })()}
              {extractMessage && (
                <p className="rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {extractMessage}
                </p>
              )}
            </div>

            {/* 참고 이미지 — 헤더에 #2 #3 슬롯 토글 버튼이 인라인으로 들어간 커스텀 섹션 */}
            <section>
              <div
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition ${
                  input.enabled.references === false
                    ? "border-[#dad4c8] bg-[#eee9df]/60 dark:border-[#3a352e] dark:bg-[#2c2925]/80"
                    : "border-[#dad4c8] bg-[#eee9df] dark:border-[#3a352e] dark:bg-[#2c2925]/60"
                }`}
              >
                <span
                  title="이미지를 최대 3장까지 올릴 수 있습니다. 각 슬롯의 역할을 정한 뒤 분석 버튼을 누르면 해당 역할의 옵션만 채워집니다."
                  className={`flex-1 cursor-help text-sm font-bold underline decoration-dotted underline-offset-4 decoration-[#9f9b93]/60 dark:decoration-[#8a8479]/60 ${
                    input.enabled.references === false
                      ? "text-[#9f9b93] dark:text-[#8a8479]"
                      : "text-[#1a1a1a] dark:text-[#f5f3ee]"
                  }`}
                >
                  참고 이미지
                </span>
                {/* #2, #3 슬롯 토글 chip — #1은 항상 표시이므로 토글 없음 */}
                {[1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSlot(idx)}
                    title={activeSlots[idx] ? `슬롯 #${idx + 1} 닫기 (이미지·분석 결과 같이 정리)` : `슬롯 #${idx + 1} 추가`}
                    className={`min-w-[40px] rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      activeSlots[idx]
                        ? "border-[#43089f] bg-[#43089f] text-white dark:border-[#c1b0ff] dark:bg-[#43089f] dark:text-white"
                        : "border-[#dad4c8] bg-white text-[#55534e] hover:border-[#43089f] hover:text-[#43089f] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#b3aea3]"
                    }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
                <ToggleSwitch
                  checked={!!input.enabled.references}
                  onChange={(v) => setEnabled("references", v)}
                  label={input.enabled.references ? "사용 중" : "사용 안 함"}
                />
              </div>
              <div className={`mt-2 ${input.enabled.references === false ? "opacity-40" : ""}`}>
                <div className="flex flex-col gap-3">
                  {input.references.map((ref, i) =>
                    activeSlots[i] ? (
                      <ReferenceSlot
                        key={i}
                        index={i}
                        value={ref}
                        onChange={(patch) => setReference(i, patch)}
                        onAnalyze={() => handleAiAnalyzeImage(i)}
                        analyzing={analyzingIndex === i}
                        analyzed={!!ref.src && lastAnalyzedKey[i] === `${ref.src}|${ref.role}`}
                        description={imageDescriptions[i] ?? ""}
                        onDescriptionChange={(v) =>
                          setImageDescriptions((prev) => ({ ...prev, [i]: v }))
                        }
                      />
                    ) : null,
                  )}
                </div>
              </div>
            </section>



            {/* 작업 유형 / 스타일 / 비율은 페이지 상단의 sticky 헤더로 이동되었습니다 (v0.8 D-수정안). */}
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
              langStorageKey="apg.lang.gpt"
            />
            <ModelCard
              title="Nano Banana"
              hint="구조형(목표/디테일/스타일/구도/품질/제외), 한/영 지원"
              options={NANO_OPTIONS}
              selected={nanoModel}
              onSelect={setNanoModel}
              content={nanoOutput}
              koreanContent={nanoOutputKo}
              langStorageKey="apg.lang.nano"
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

        <footer className="mt-8 text-center text-xs text-[#9f9b93] dark:text-[#9f9b93]">
          v0.8 · 5종 작업 유형 · 17종 스타일 · 모델 12종 · 다크 모드
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
        <OptionPicker label="연령" options={AGE_OPTIONS}
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
            isOff ? "text-[#9f9b93] dark:text-[#9f9b93]" : "text-[#55534e] dark:text-[#b3aea3]"
          } ${tooltip ? "cursor-help underline decoration-dotted underline-offset-4 decoration-[#dad4c8] dark:decoration-[#3a352e]" : ""}`}
        >
          {label}
        </label>
        {showToggle && (
          <ToggleSwitch
            checked={!!enabled}
            onChange={(v) => onEnabledChange!(v)}
            label={enabled ? "사용 중" : "사용 안 함"}
          />
        )}
      </div>
      <div className={isOff ? "opacity-40" : ""}>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const chip = (
            <ChipXs
              key={o.value}
              label={o.label}
              active={value === o.value}
              title={o.desc}
              onClick={() => {
                // 같은 chip을 다시 누르면 자동으로 토글 (직접 입력 닫기 등)
                if (value === o.value && o.value !== "auto") {
                  onChange("auto", "");
                } else {
                  onChange(o.value, customText);
                }
              }}
            />
          );
          // 직접 입력이 활성 상태이면 chip 바로 옆에 inline 입력칸을 렌더한다.
          if (o.value === "custom" && isCustom) {
            return [
              chip,
              <input
                key={`${o.value}-input`}
                type="text"
                value={customText}
                onChange={(e) => onChange(value, e.target.value)}
                placeholder="영어로 적으면 프롬프트에 반영됩니다"
                autoFocus
                className="min-w-[160px] flex-1 rounded-full border border-[#dad4c8] bg-white px-3 py-1.5 text-[11px] outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#f5f3ee] dark:focus:border-[#dad4c8]"
              />,
            ];
          }
          return chip;
        })}
        {moreOptions && moreOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-[11px] transition ${
              showMore
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-[#dad4c8] bg-white text-[#1a1a1a] hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
            }`}
          >
            <Plus size={10} /> {showMore ? "더보기 접기" : "더보기"}
          </button>
        )}
      </div>
      {showMore && moreOptions && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl bg-[#faf9f7] p-2 dark:bg-[#2c2925]">
          {moreOptions.map((o) => (
            <ChipXs
              key={o.value}
              label={o.label}
              active={value === o.value}
              title={o.desc}
              onClick={() => {
                if (value === o.value && o.value !== "auto") {
                  onChange("auto", "");
                } else {
                  onChange(o.value, customText);
                }
              }}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// ===== 스타일 선택 (카테고리화 + 1단계 펼침) =====

function StylePicker({
  value,
  customText,
  onChange,
  enabled,
  onEnabledChange,
}: {
  value: string;
  customText: string;
  onChange: (value: string, customText: string) => void;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
}) {
  const isOff = !enabled;
  const autoOption = STYLE_OPTIONS.find((o) => o.value === "auto");
  const customOption = STYLE_OPTIONS.find((o) => o.value === "custom");
  const isCustom = value === "custom";

  // 현재 선택된 스타일이 어느 카테고리에 속하는지 찾는다
  const findCategoryOf = (v: string): StyleCategory | null => {
    for (const cat of STYLE_CATEGORIES) {
      if (cat.styles.includes(v)) return cat.key;
    }
    return null;
  };

  const initialOpen = findCategoryOf(value);
  const [openCategory, setOpenCategory] = useState<StyleCategory | null>(initialOpen);

  // value가 외부에서 바뀌어 다른 카테고리에 속하면 자동으로 그 카테고리를 펼친다
  useEffect(() => {
    const cat = findCategoryOf(value);
    if (cat) setOpenCategory(cat);
  }, [value]);

  const selectedOption = STYLE_OPTIONS.find((o) => o.value === value);
  const tooltip = selectedOption?.desc ?? "이미지의 전체적인 그림 스타일입니다.";

  const handleCategoryClick = (cat: StyleCategory) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          title={tooltip}
          className={`text-sm font-bold ${
            isOff ? "text-[#9f9b93] dark:text-[#9f9b93]" : "text-[#55534e] dark:text-[#b3aea3]"
          } cursor-help underline decoration-dotted underline-offset-4 decoration-[#dad4c8] dark:decoration-[#3a352e]`}
        >
          스타일
        </label>
        <ToggleSwitch
          checked={enabled}
          onChange={(v) => onEnabledChange(v)}
          label={enabled ? "사용 중" : "사용 안 함"}
        />
      </div>
      <div className={isOff ? "opacity-40" : ""}>
        {/* 1단계: 자동 / 카테고리 4개 / 직접 입력 */}
        <div className="flex flex-wrap gap-1.5">
          {autoOption && (
            <ChipXs
              label={autoOption.label}
              active={value === "auto"}
              title={autoOption.desc}
              onClick={() => onChange("auto", customText)}
            />
          )}
          {STYLE_CATEGORIES.map((cat) => {
            const containsSelected = cat.styles.includes(value);
            const isOpen = openCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryClick(cat.key)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] transition ${
                  containsSelected
                    ? "border-[#078a52] bg-[#078a52] text-white dark:border-[#84e7a5] dark:bg-[#078a52] dark:text-white"
                    : isOpen
                    ? "border-[#43089f] bg-[#ede4ff] text-[#43089f] dark:border-[#c1b0ff] dark:bg-[#43089f]/30 dark:text-[#c1b0ff]"
                    : "border-[#dad4c8] bg-white text-[#1a1a1a] hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
                }`}
              >
                <ChevronDown size={10} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                {cat.label}
              </button>
            );
          })}
          {customOption && (
            <ChipXs
              label={customOption.label}
              active={value === "custom"}
              title={customOption.desc}
              onClick={() => {
                // 이미 직접 입력 상태면 다시 누를 때 자동으로 닫기
                if (value === "custom") {
                  onChange("auto", "");
                } else {
                  onChange("custom", customText);
                }
              }}
            />
          )}
          {/* 직접 입력 활성 시 chip 옆 inline 입력칸 */}
          {isCustom && (
            <input
              type="text"
              value={customText}
              onChange={(e) => onChange("custom", e.target.value)}
              placeholder="영어로 적으면 프롬프트에 반영됩니다"
              autoFocus
              className="min-w-[180px] flex-1 rounded-full border border-[#dad4c8] bg-white px-3 py-1.5 text-[11px] outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#f5f3ee] dark:focus:border-[#dad4c8]"
            />
          )}
        </div>

        {/* 2단계: 펼친 카테고리의 스타일 */}
        {openCategory && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl bg-[#faf9f7] p-2 dark:bg-[#2c2925]">
            {STYLE_CATEGORIES.find((c) => c.key === openCategory)?.styles.map((styleValue) => {
              const opt = STYLE_OPTIONS.find((o) => o.value === styleValue);
              if (!opt) return null;
              return (
                <ChipXs
                  key={opt.value}
                  label={opt.label}
                  active={value === opt.value}
                  title={opt.desc}
                  onClick={() => {
                    if (value === opt.value) {
                      onChange("auto", "");
                    } else {
                      onChange(opt.value, customText);
                    }
                  }}
                />
              );
            })}
          </div>
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
  description,
  onDescriptionChange,
}: {
  index: number;
  value: ReferenceImageInput;
  onChange: (patch: Partial<ReferenceImageInput>) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzed: boolean;
  /** AI가 분석해서 만든 한국어 설명 (편집 가능). */
  description: string;
  onDescriptionChange: (v: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [descCopied, setDescCopied] = useState(false);

  // 분석이 완료되면 결과 영역을 자동으로 펼친다.
  // description이 비어 있어도 분석 자체가 끝났으면 펼쳐서 사용자가 상태를 알 수 있게 한다.
  useEffect(() => {
    if (analyzed) setShowDescription(true);
    else setShowDescription(false);
  }, [analyzed]);

  const applyImage = async (raw: string) => {
    try {
      const resized = await resizeImageDataUrl(raw, 1024);
      onChange({ src: resized });
    } catch {
      onChange({ src: raw });
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      if (raw) void applyImage(raw);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      if (raw) void applyImage(raw);
    };
    reader.readAsDataURL(file);
  };

  // 클립보드 붙여넣기(Ctrl+V) — 슬롯에 포커스가 있을 때 클립보드의 이미지를 자동 첨부.
  // 미드저니 sref와 동일한 워크플로우.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const raw = ev.target?.result as string;
          if (raw) void applyImage(raw);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  const handleCopyDescription = async () => {
    if (!description) return;
    try {
      await navigator.clipboard.writeText(description);
      setDescCopied(true);
      setTimeout(() => setDescCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const roleLabel =
    REFERENCE_ROLE_OPTIONS.find((o) => o.value === value.role)?.label ?? value.role;

  return (
    <div
      tabIndex={0}
      onPaste={handlePaste}
      className="rounded-2xl border border-[#dad4c8] p-3 outline-none transition focus:border-[#43089f] focus:ring-2 focus:ring-[#43089f]/30 dark:border-[#3a352e] dark:focus:border-[#c1b0ff] dark:focus:ring-[#c1b0ff]/20"
    >
      <div className="flex gap-3">
        {/* 좌측: 이미지 영역 (고정 폭) — #N 라벨/X 버튼은 이미지 위 오버레이로 통합해 공간 절약 */}
        <div className="w-[100px] shrink-0">
          <div
            className="relative"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleDrop}
          >
            {!value.src ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="클릭, 끌어다 놓기, 또는 슬롯에 포커스 후 Ctrl+V로 붙여넣기"
                className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition ${
                  dragOver
                    ? "border-[#43089f] bg-[#ede4ff] text-[#43089f] dark:border-[#c1b0ff] dark:bg-[#43089f]/30 dark:text-[#c1b0ff]"
                    : "border-[#dad4c8] bg-[#faf9f7] text-[#55534e] hover:bg-[#eee9df] dark:border-[#3a352e] dark:bg-[#1c1a17] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
                }`}
              >
                <ImagePlus size={20} />
                <span className="text-[10px] font-semibold leading-tight">클릭/드롭<br/>Ctrl+V</span>
              </button>
            ) : (
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#eee9df] dark:bg-[#2c2925]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.src} alt={`참고 이미지 ${index + 1}`} className="h-full w-full object-contain" />
              </div>
            )}
            {/* #N 작은 라벨 — 이미지 좌상단 모서리 오버레이 */}
            <span className="pointer-events-none absolute left-1 top-1 inline-flex items-center rounded-md bg-[#1a1a1a]/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
              #{index + 1}
            </span>
            {/* 이미지 제거 X — 이미지가 있을 때만 우상단 오버레이 */}
            {value.src && (
              <button
                type="button"
                onClick={() => onChange({ src: null })}
                title="이미지 제거"
                aria-label="이미지 제거"
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1a]/80 text-white hover:bg-[#1a1a1a]"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        {/* 우측: 역할 선택 + 분석 버튼 + AI 한국어 설명 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <select
            value={value.role}
            onChange={(e) => onChange({ role: e.target.value })}
            title="이미지의 역할 — 분석은 이 역할의 옵션만 채웁니다."
            className="w-full rounded-md border border-[#dad4c8] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#f5f3ee]"
          >
            {REFERENCE_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {value.src ? (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={analyzing}
              title={analyzed ? "이 역할로 이미 분석했습니다. 다시 누르면 재분석합니다." : `이 이미지를 '${roleLabel}'로 분석해 해당 옵션만 채웁니다 (1회 약 2~4원).`}
              className={`clay-hover inline-flex w-full items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                analyzed
                  ? "border-[#dad4c8] bg-[#eee9df] text-[#55534e] hover:bg-[#dad4c8] dark:border-[#3a352e] dark:bg-[#2c2925] dark:text-[#b3aea3]"
                  : "border-[#fc7981] bg-[#fff0f1] text-[#1a1a1a] hover:bg-[#ffe1e3] dark:border-[#fc7981] dark:bg-[#fc7981]/15 dark:text-[#f5f3ee] dark:hover:bg-[#fc7981]/25"
              }`}
            >
              {analyzing ? (
                <><Wand2 size={12} className="animate-spin" /> AI 분석 중...</>
              ) : analyzed ? (
                <><Check size={12} /> AI 분석됨 — 재분석</>
              ) : (
                <><Wand2 size={12} /> {roleLabel}로 AI 분석 (~3원)</>
              )}
            </button>
          ) : (
            <div className="rounded-md border border-dashed border-[#dad4c8] px-2 py-1.5 text-center text-[11px] text-[#9f9b93] dark:border-[#3a352e] dark:text-[#9f9b93]">
              이미지를 첨부하면 분석할 수 있어요
            </div>
          )}
          {value.src && analyzed && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowDescription((s) => !s)}
                className="inline-flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-left text-[11px] font-semibold text-[#55534e] hover:bg-[#eee9df] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
                aria-expanded={showDescription}
              >
                <ChevronDown
                  size={12}
                  className={`shrink-0 text-[#9f9b93] transition-transform ${showDescription ? "" : "-rotate-90"}`}
                />
                AI가 본 이미지
              </button>
              {showDescription && (
                <div className="space-y-1 rounded-md bg-[#faf9f7] p-2 dark:bg-[#2c2925]">
                  {description ? (
                    <textarea
                      value={description}
                      onChange={(e) => onDescriptionChange(e.target.value)}
                      rows={5}
                      className="w-full resize-y rounded border border-[#dad4c8] bg-white p-2 text-[11px] leading-relaxed text-[#1a1a1a] outline-none focus:border-[#43089f] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee] dark:focus:border-[#dad4c8]"
                    />
                  ) : (
                    <div className="rounded border border-dashed border-[#dad4c8] bg-white p-2 text-[11px] leading-relaxed text-[#9f9b93] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#9f9b93]">
                      AI 설명이 비어 있습니다. 재분석을 시도하거나, 역할을 다른 값으로 바꿔서 다시 분석해 보세요. (브라우저 콘솔 F12 → Console 탭에서 <code className="rounded bg-[#eee9df] px-1 py-0.5 text-[10px] dark:bg-[#2c2925]">[AI image #N result]</code> 로그도 확인할 수 있어요)
                    </div>
                  )}
                  {description && (
                    <button
                      type="button"
                      onClick={handleCopyDescription}
                      className={`inline-flex w-full items-center justify-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold transition ${
                        descCopied
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-300"
                          : "border-[#dad4c8] bg-white text-[#1a1a1a] hover:bg-[#eee9df] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
                      }`}
                    >
                      {descCopied ? <Check size={11} /> : <Copy size={11} />}
                      {descCopied ? "복사됨" : "복사"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
    <div className="clay-shadow rounded-[24px] border border-[#dad4c8] bg-white p-5 dark:border-[#3a352e] dark:bg-[#2a2723]">
      <div className="mb-3">
        <h3 className="text-base font-bold text-[#1a1a1a] dark:text-[#f5f3ee]">정리된 요청 요약</h3>
        <p className="text-xs text-[#9f9b93] dark:text-[#8a8479]">선택한 옵션과 입력 내용을 한눈에 확인합니다 (복사 안 됨).</p>
      </div>
      {summary.rows.length === 0 ? (
        <p className="text-sm text-[#9f9b93]">아직 선택된 옵션이 없습니다.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          {visibleRows.map((row, i) => (
            <div key={i} className="flex items-baseline gap-3 border-b border-dashed border-[#eee9df] py-1.5 dark:border-[#2c2925]">
              <span className="w-32 shrink-0 text-xs font-semibold text-[#9f9b93] dark:text-[#8a8479]">{row.label}</span>
              <span className="flex-1 break-words text-sm text-[#1a1a1a] dark:text-[#f5f3ee]">{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 text-xs font-semibold text-[#078a52] hover:underline dark:text-[#84e7a5]"
        >
          {showAll ? "접기" : `더보기 (+${summary.rows.length - 12}개)`}
        </button>
      )}

      {summary.references.tags.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-[#9f9b93] dark:text-[#9f9b93]">{summary.references.label}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {summary.references.tags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
          </div>
        </div>
      )}

      {koreanMemo.trim() && (
        <details className="mt-3 rounded-xl bg-[#faf9f7] p-3 text-xs dark:bg-[#2c2925]">
          <summary className="cursor-pointer font-semibold text-[#55534e] dark:text-[#b3aea3]">
            원본 한글 메모 (참고용 · 복사 안 됨)
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-[#1a1a1a] dark:text-[#b3aea3]">{koreanMemo}</p>
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
  langStorageKey,
}: {
  title: string;
  hint: string;
  options: ModelKey[];
  selected: ModelKey;
  onSelect: (m: ModelKey) => void;
  content: string;
  /** 정의되어 있으면 카드에 한/영 토글이 노출되고, 표시 중인 언어로 복사됩니다. */
  koreanContent?: string;
  /** 정의되어 있으면 localStorage에 마지막 선택 언어를 저장/복원합니다. */
  langStorageKey?: string;
}) {
  return (
    <CardShell title={title} hint={hint} content={content} koreanContent={koreanContent} langStorageKey={langStorageKey}>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as ModelKey)}
        className="rounded-xl border border-[#dad4c8] bg-white px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#faf9f7] focus:border-[#43089f] focus:outline-none dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
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
  langStorageKey,
  children,
}: {
  title: string;
  hint: string;
  content: string;
  koreanContent?: string;
  /** localStorage에 마지막 선택 언어를 저장/복원할 키. */
  langStorageKey?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  // GPT/Nano 카드는 한국어가 기본 — localStorage에 저장된 값이 있으면 우선
  const [lang, setLang] = useState<"en" | "ko">(koreanContent ? "ko" : "en");
  // mount 시 localStorage 값 적용
  useEffect(() => {
    if (!langStorageKey) return;
    try {
      const saved = localStorage.getItem(langStorageKey);
      if (saved === "en" || saved === "ko") setLang(saved);
    } catch {}
  }, [langStorageKey]);
  const setLangPersist = (next: "en" | "ko") => {
    setLang(next);
    if (langStorageKey) {
      try { localStorage.setItem(langStorageKey, next); } catch {}
    }
  };
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
    <div className="clay-shadow rounded-[24px] border border-[#dad4c8] bg-white p-5 dark:border-[#3a352e] dark:bg-[#2a2723]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#1a1a1a] dark:text-[#f5f3ee]">{title}</h3>
          <p className="text-xs text-[#9f9b93] dark:text-[#8a8479]">{hint}</p>
        </div>
        {koreanContent && (
          <div className="inline-flex overflow-hidden rounded-full border border-[#dad4c8] dark:border-[#3a352e]">
            <button
              type="button"
              onClick={() => setLangPersist("en")}
              className={`px-2.5 py-1.5 text-[11px] font-semibold transition ${
                lang === "en"
                  ? "bg-[#078a52] text-white dark:bg-[#078a52] dark:text-white"
                  : "bg-white text-[#55534e] hover:bg-[#faf9f7] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLangPersist("ko")}
              className={`px-2.5 py-1.5 text-[11px] font-semibold transition ${
                lang === "ko"
                  ? "bg-[#078a52] text-white dark:bg-[#078a52] dark:text-white"
                  : "bg-white text-[#55534e] hover:bg-[#faf9f7] dark:bg-[#2a2723] dark:text-[#b3aea3] dark:hover:bg-[#2c2925]"
              }`}
            >
              한국어
            </button>
          </div>
        )}
        {children}
      </div>
      <div className="relative min-h-[120px] whitespace-pre-wrap break-words rounded-2xl bg-[#faf9f7] p-4 pr-24 font-mono text-sm leading-6 text-[#1a1a1a] dark:bg-[#1c1a17] dark:text-[#f5f3ee]">
        <button
          type="button"
          onClick={handleCopy}
          className={`clay-hover absolute right-2 top-2 inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
            copied
              ? "border-[#078a52] bg-[#dffce5] text-[#02492a] dark:border-[#84e7a5] dark:bg-[#02492a] dark:text-[#84e7a5]"
              : "border-[#dad4c8] bg-white text-[#1a1a1a] hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee] dark:hover:bg-[#2c2925]"
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

  const headerClass = `flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition ${
    isOff
      ? "border-[#dad4c8] bg-[#eee9df]/60 dark:border-[#3a352e] dark:bg-[#2c2925]/80"
      : "border-[#dad4c8] bg-[#eee9df] dark:border-[#3a352e] dark:bg-[#2c2925]/60"
  } ${collapsible ? "hover:bg-[#e0d9c8] dark:hover:bg-[#352f29]" : ""}`;

  const titleText = (
    <span
      title={hint}
      className={`text-sm font-bold ${
        isOff ? "text-[#9f9b93] dark:text-[#8a8479]" : "text-[#1a1a1a] dark:text-[#f5f3ee]"
      } ${hint ? "cursor-help underline decoration-dotted underline-offset-4 decoration-[#9f9b93]/60 dark:decoration-[#8a8479]/60" : ""}`}
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
              className={`shrink-0 text-[#9f9b93] transition-transform ${open ? "" : "-rotate-90"}`}
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
            ? "bg-[#078a52] dark:bg-[#078a52]"
            : "bg-[#dad4c8] dark:bg-[#3a352e]"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      {label && (
        <span className={`text-[10px] font-semibold ${checked ? "text-[#078a52] dark:text-[#84e7a5]" : "text-[#9f9b93] dark:text-[#8a8479]"}`}>
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
          ? "clay-pressed border-[#078a52] bg-[#078a52] text-white dark:border-[#84e7a5] dark:bg-[#078a52] dark:text-white"
          : "clay-hover border-[#dad4c8] bg-white text-[#1a1a1a] hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee] dark:hover:bg-[#2c2925]"
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
      className={`min-w-[68px] rounded-full border px-2.5 py-1.5 text-center text-[11px] transition ${
        active
          ? "clay-pressed border-[#078a52] bg-[#078a52] text-white dark:border-[#84e7a5] dark:bg-[#078a52] dark:text-white"
          : "border-[#dad4c8] bg-white text-[#1a1a1a] hover:-translate-y-0.5 hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:text-[#f5f3ee] dark:hover:bg-[#2c2925]"
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
    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#dad4c8] bg-white px-3 py-2 text-xs hover:bg-[#faf9f7] dark:border-[#3a352e] dark:bg-[#2a2723] dark:hover:bg-[#2c2925]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#078a52] dark:accent-[#84e7a5]"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#eee9df] px-2.5 py-1 text-[11px] font-medium text-[#1a1a1a] dark:bg-[#2c2925] dark:text-[#b3aea3]">
      {children}
    </span>
  );
}
