"use client";

import {
  ChangeEvent,
  DragEvent,
  Fragment,
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
  Save,
  Check,
  X,
  Info,
} from "lucide-react";
import {
  buildPrompts,
  buildPromptFor,
  stripHighlight,
  PromptInput,
  PromptOutput,
  WorkType,
  StyleType,
  RatioType,
  ReferenceRole,
  ModelKey,
  WORK_TYPE_LABEL,
  STYLE_LABEL,
  REFERENCE_ROLE_LABEL,
  MODEL_LABEL,
} from "@/lib/promptBuilder";

const WORK_TYPES: WorkType[] = ["banner", "character", "frame", "background", "icon"];

const STYLES: StyleType[] = [
  "casual_game",
  "realistic",
  "cartoon",
  "2_5d",
  "retro",
  "neon",
  "premium_gold",
  "anime_manga",
  "chibi",
  "pixel_art",
  "concept_art",
  "flat_vector",
  "cyberpunk",
  "dark_fantasy",
  "slot_premium",
  "disney_pixar",
];

const RATIOS: { value: RatioType; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "1000x600", label: "1000x600" },
  { value: "custom", label: "직접 입력" },
];
const REFERENCE_ROLES: ReferenceRole[] = ["style", "composition", "color", "character", "material"];
const FORBID_ITEMS: { key: keyof PromptInput["forbid"]; label: string }[] = [
  { key: "text", label: "텍스트 금지" },
  { key: "logo", label: "로고 금지" },
  { key: "noise", label: "노이즈 금지" },
  { key: "messyTexture", label: "지저분한 텍스처 금지" },
  { key: "sparkle", label: "반짝이 금지" },
  { key: "overDetail", label: "과한 디테일 금지" },
];

const DEFAULT_FORBID: PromptInput["forbid"] = {
  text: true,
  logo: true,
  noise: false,
  messyTexture: true,
  sparkle: false,
  overDetail: false,
};

const DEFAULT_REQUEST_KO =
  "쥬라기 테마 슬롯 배너. 저녁 느낌. 멀리 화산이 보이고 중앙은 비워줘.";
const DEFAULT_REQUEST_EN =
  "A Jurassic-themed slot banner with an evening atmosphere, a distant volcano, and an empty center area.";

const GPT_OPTIONS: ModelKey[] = ["gpt_image_2", "gpt_image_1_5", "gpt_image_1", "gpt_image_1_mini"];
const NANO_OPTIONS: ModelKey[] = ["nano_banana_2", "nano_banana", "nano_banana_pro"];
const MJ_OPTIONS: ModelKey[] = ["mj_v8_1_alpha", "mj_v8_alpha", "mj_v7"];
const NIJI_OPTIONS: ModelKey[] = ["niji_7", "niji_6"];

export default function HomePage() {
  const [request, setRequest] = useState(DEFAULT_REQUEST_KO);
  const [englishRequest, setEnglishRequest] = useState(DEFAULT_REQUEST_EN);
  const [workType, setWorkType] = useState<WorkType>("banner");
  const [style, setStyle] = useState<StyleType>("casual_game");
  const [ratio, setRatio] = useState<RatioType>("16:9");
  const [customRatio, setCustomRatio] = useState("1920x1080");
  const [referenceRole, setReferenceRole] = useState<ReferenceRole>("style");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [forbid, setForbid] = useState<PromptInput["forbid"]>(DEFAULT_FORBID);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gptModel, setGptModel] = useState<ModelKey>("gpt_image_2");
  const [nanoModel, setNanoModel] = useState<ModelKey>("nano_banana_2");
  const [mjModel, setMjModel] = useState<ModelKey>("mj_v8_1_alpha");
  const [nijiModel, setNijiModel] = useState<ModelKey>("niji_7");

  const promptInput: PromptInput = useMemo(
    () => ({
      request,
      englishRequest,
      workType,
      style,
      ratio,
      customRatio,
      referenceRole,
      hasReferenceImage: referenceImage !== null,
      forbid,
    }),
    [request, englishRequest, workType, style, ratio, customRatio, referenceRole, referenceImage, forbid]
  );

  const result: PromptOutput = useMemo(() => buildPrompts(promptInput), [promptInput]);
  const gptOutput = useMemo(() => buildPromptFor(gptModel, promptInput), [gptModel, promptInput]);
  const nanoOutput = useMemo(() => buildPromptFor(nanoModel, promptInput), [nanoModel, promptInput]);
  const mjOutput = useMemo(() => buildPromptFor(mjModel, promptInput), [mjModel, promptInput]);
  const nijiOutput = useMemo(() => buildPromptFor(nijiModel, promptInput), [nijiModel, promptInput]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file);
  };

  const readImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReferenceImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readImageFile(file);
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    setRequest(DEFAULT_REQUEST_KO);
    setEnglishRequest(DEFAULT_REQUEST_EN);
    setWorkType("banner");
    setStyle("casual_game");
    setRatio("16:9");
    setCustomRatio("1920x1080");
    setReferenceRole("style");
    setReferenceImage(null);
    setForbid(DEFAULT_FORBID);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    // .txt 파일에는 하이라이트 토큰 없는 plain text로 저장
    const text = [
      "=== AI Prompt Generator 결과 ===",
      `생성 시각: ${new Date().toLocaleString("ko-KR")}`,
      "",
      "[한글 요약]",
      stripHighlight(result.koreanSummary),
      "",
      `[GPT Image — ${MODEL_LABEL[gptModel]}]`,
      stripHighlight(gptOutput),
      "",
      `[Nano Banana — ${MODEL_LABEL[nanoModel]}]`,
      stripHighlight(nanoOutput),
      "",
      `[Midjourney — ${MODEL_LABEL[mjModel]}]`,
      stripHighlight(mjOutput),
      "",
      `[Niji — ${MODEL_LABEL[nijiModel]}]`,
      stripHighlight(nijiOutput),
      "",
      "[수정 요청용]",
      stripHighlight(result.revision),
      "",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
    a.download = `prompt-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScrollToResults = () => {
    document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-500">AI Prompt Generator</p>
            <h1 className="text-3xl font-black tracking-tight">이미지 프롬프트 자동 생성기</h1>
            <p className="mt-2 text-slate-600">
              한글 요청을 GPT Image / Nano Banana / Midjourney / Niji 용 영문 프롬프트로 변환합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50"
            >
              <RefreshCcw size={18} /> 초기화
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Save size={18} /> 저장
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <Section title="1. 작업 유형">
              <div className="grid grid-cols-5 gap-2">
                {WORK_TYPES.map((w) => (
                  <ChipSm key={w} label={WORK_TYPE_LABEL[w]} active={workType === w} onClick={() => setWorkType(w)} />
                ))}
              </div>
            </Section>

            <Section title="2. 스타일">
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <ChipSm key={s} label={STYLE_LABEL[s]} active={style === s} onClick={() => setStyle(s)} />
                ))}
              </div>
            </Section>

            <Section title="3. 비율">
              <div className="grid grid-cols-6 gap-1.5">
                {RATIOS.map((r) => (
                  <ChipXs key={r.value} label={r.label} active={ratio === r.value} onClick={() => setRatio(r.value)} />
                ))}
              </div>
              {ratio === "custom" && (
                <input
                  type="text"
                  value={customRatio}
                  onChange={(e) => setCustomRatio(e.target.value)}
                  placeholder="예: 1920x1080 또는 21:9"
                  className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-900"
                />
              )}
            </Section>

            <Section title="4. 참고 이미지 (선택)">
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                {!referenceImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition ${
                      dragOver
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <ImagePlus size={26} />
                    <span className="text-sm font-semibold">
                      {dragOver ? "여기에 놓아 주세요" : "이미지 업로드"}
                    </span>
                    <span className="text-xs text-slate-400">
                      클릭하거나 파일을 끌어다 놓기 (jpg, png)
                    </span>
                  </button>
                ) : (
                  <div
                    className={`relative h-40 w-full overflow-hidden rounded-2xl border-2 transition ${
                      dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={referenceImage} alt="참고 이미지" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                    >
                      <X size={12} /> 제거
                    </button>
                    {dragOver && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 text-sm font-semibold text-blue-700">
                        드롭하면 새 이미지로 교체됩니다
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <p className="mt-2 text-xs text-slate-400">업로드 이미지는 PC에만 저장되며 외부로 전송되지 않습니다.</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {REFERENCE_ROLES.map((r) => (
                  <ChipSm
                    key={r}
                    label={REFERENCE_ROLE_LABEL[r]}
                    active={referenceRole === r}
                    onClick={() => setReferenceRole(r)}
                  />
                ))}
              </div>
            </Section>

            <Section title="5. 금지 요소">
              <div className="grid grid-cols-2 gap-2">
                {FORBID_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={forbid[item.key]}
                      onChange={(e) => setForbid({ ...forbid, [item.key]: e.target.checked })}
                      className="h-4 w-4 accent-slate-900"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="6. 한글 요청 (메모용)">
              <div className="mb-2 inline-flex items-start gap-1.5 rounded-xl bg-blue-50 p-2 text-xs text-blue-800">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>
                  여기에 한글로 자유롭게 적어 주세요. 그 다음 ChatGPT 등에서
                  영어로 번역해 아래 <strong>영어 요청</strong> 칸에
                  붙여넣어 주세요. (자동 번역은 비용 문제로 미사용 — 한글
                  텍스트는 한글 요약 카드에만 들어갑니다.)
                </span>
              </div>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-slate-900"
                placeholder="예: 쥬라기 테마 슬롯 배너. 저녁 느낌. 중앙은 비워줘."
              />
            </Section>

            <Section title="7. 영어 요청 (실제 프롬프트에 사용)">
              <textarea
                value={englishRequest}
                onChange={(e) => setEnglishRequest(e.target.value)}
                className="h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-slate-900"
                placeholder="e.g. A Jurassic-themed slot banner with an evening atmosphere..."
              />
              <button
                type="button"
                onClick={handleScrollToResults}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white shadow-sm hover:bg-slate-800"
              >
                <Wand2 size={20} /> 프롬프트 확인
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                옵션을 바꾸면 결과는 자동 갱신됩니다. <span className="text-blue-600">파란색</span>은 사용자 옵션·입력 자리입니다.
              </p>
            </Section>
          </aside>

          <main id="result-section" className="space-y-5">
            <ResultCard title="한글 요약" description="입력한 내용 확인용" content={result.koreanSummary} />

            <ModelGroupCard
              title="GPT Image"
              description="문장형 지시문 (영어 본문 + 한글 원문 병기)"
              options={GPT_OPTIONS}
              selected={gptModel}
              onSelect={setGptModel}
              content={gptOutput}
            />

            <ModelGroupCard
              title="Nano Banana"
              description="Keep / Change / Remove 구조 (영어 + 한글 병기)"
              options={NANO_OPTIONS}
              selected={nanoModel}
              onSelect={setNanoModel}
              content={nanoOutput}
            />

            <ModelGroupCard
              title="Midjourney"
              description="키워드 + --ar / --oref (영어만)"
              options={MJ_OPTIONS}
              selected={mjModel}
              onSelect={setMjModel}
              content={mjOutput}
            />

            <ModelGroupCard
              title="Niji"
              description="애니/캐릭터 키워드 + --niji (영어만)"
              options={NIJI_OPTIONS}
              selected={nijiModel}
              onSelect={setNijiModel}
              content={nijiOutput}
            />

            <ResultCard
              title="수정 요청용 프롬프트"
              description="결과가 마음에 안 들 때 쓰는 수정 지시 템플릿"
              content={result.revision}
            />
          </main>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          v0.4 · 모델 12종 · 스타일 16종 · 드래그 앤 드롭 · 사용자 입력 하이라이트
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-slate-500">{title}</h2>
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
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function ChipXs({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full truncate rounded-full border px-1.5 py-1.5 text-xs transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

// === 하이라이트 토큰을 파란색 span으로 렌더링 ===
function HighlightedContent({ content }: { content: string }) {
  // [[B]]...[[/B]] 토큰 단위로 split. \s\S로 줄바꿈도 포함.
  const parts = content.split(/(\[\[B\]\][\s\S]*?\[\[\/B\]\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[\[B\]\]([\s\S]*?)\[\[\/B\]\]$/.exec(p);
        if (m) {
          return (
            <span key={i} className="text-blue-600">
              {m[1]}
            </span>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

function ResultCard({
  title,
  description,
  content,
}: {
  title: string;
  description: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [content]);

  const handleCopy = async () => {
    const plain = stripHighlight(content);
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = plain;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            copied
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <div className="min-h-[118px] whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">
        <HighlightedContent content={content} />
      </div>
    </div>
  );
}

function ModelGroupCard({
  title,
  description,
  options,
  selected,
  onSelect,
  content,
}: {
  title: string;
  description: string;
  options: ModelKey[];
  selected: ModelKey;
  onSelect: (m: ModelKey) => void;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [content]);

  const handleCopy = async () => {
    const plain = stripHighlight(content);
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = plain;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => onSelect(e.target.value as ModelKey)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-slate-900 focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {MODEL_LABEL[opt]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <div className="min-h-[118px] whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">
        <HighlightedContent content={content} />
      </div>
    </div>
  );
}
