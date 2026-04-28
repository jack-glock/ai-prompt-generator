"use client";

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
  Save,
  Check,
  X,
} from "lucide-react";
import {
  buildPrompts,
  PromptInput,
  PromptOutput,
  WorkType,
  StyleType,
  RatioType,
  ReferenceRole,
  WORK_TYPE_LABEL,
  STYLE_LABEL,
  REFERENCE_ROLE_LABEL,
} from "@/lib/promptBuilder";

const WORK_TYPES: WorkType[] = [
  "banner",
  "character",
  "frame",
  "background",
  "icon",
];
const STYLES: StyleType[] = [
  "casual_game",
  "realistic",
  "cartoon",
  "2_5d",
  "retro",
  "neon",
  "premium_gold",
];
const RATIOS: { value: RatioType; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "1000x600", label: "1000x600" },
  { value: "custom", label: "직접 입력" },
];
const REFERENCE_ROLES: ReferenceRole[] = [
  "style",
  "composition",
  "color",
  "character",
  "material",
];
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

const DEFAULT_REQUEST =
  "쥬라기 테마 슬롯 배너. 저녁 느낌. 멀리 화산이 보이고 중앙은 비워줘.";

export default function HomePage() {
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  const [workType, setWorkType] = useState<WorkType>("banner");
  const [style, setStyle] = useState<StyleType>("casual_game");
  const [ratio, setRatio] = useState<RatioType>("16:9");
  const [customRatio, setCustomRatio] = useState("1920x1080");
  const [referenceRole, setReferenceRole] = useState<ReferenceRole>("style");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [forbid, setForbid] = useState<PromptInput["forbid"]>(DEFAULT_FORBID);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실시간 미리보기 (입력이 바뀌면 자동 갱신)
  const result: PromptOutput = useMemo(
    () =>
      buildPrompts({
        request,
        workType,
        style,
        ratio,
        customRatio,
        referenceRole,
        hasReferenceImage: referenceImage !== null,
        forbid,
      }),
    [request, workType, style, ratio, customRatio, referenceRole, referenceImage, forbid]
  );

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReferenceImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    setRequest(DEFAULT_REQUEST);
    setWorkType("banner");
    setStyle("casual_game");
    setRatio("16:9");
    setCustomRatio("1920x1080");
    setReferenceRole("style");
    setReferenceImage(null);
    setForbid(DEFAULT_FORBID);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    // 모든 결과를 .txt 파일로 다운로드
    const text = [
      "=== AI Prompt Generator 결과 ===",
      `생성 시각: ${new Date().toLocaleString("ko-KR")}`,
      "",
      "[한글 요약]",
      result.koreanSummary,
      "",
      "[GPT Image용]",
      result.gptImage,
      "",
      "[Nano Banana용]",
      result.nanoBanana,
      "",
      "[Midjourney용]",
      result.midjourney,
      "",
      "[수정 요청용]",
      result.revision,
      "",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 12);
    a.download = `prompt-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScrollToResults = () => {
    document
      .getElementById("result-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* === 헤더 === */}
        <header className="mb-6 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-500">
              AI Prompt Generator
            </p>
            <h1 className="text-3xl font-black tracking-tight">
              이미지 프롬프트 자동 생성기
            </h1>
            <p className="mt-2 text-slate-600">
              한글 요청을 GPT Image / Nano Banana / Midjourney용 프롬프트로
              변환합니다.
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

        {/* === 본문 === */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* === 왼쪽 입력 사이드바 === */}
          <aside className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <Section title="1. 작업 유형">
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map((w) => (
                  <Chip
                    key={w}
                    label={WORK_TYPE_LABEL[w]}
                    active={workType === w}
                    onClick={() => setWorkType(w)}
                  />
                ))}
              </div>
            </Section>

            <Section title="2. 스타일">
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <Chip
                    key={s}
                    label={STYLE_LABEL[s]}
                    active={style === s}
                    onClick={() => setStyle(s)}
                  />
                ))}
              </div>
            </Section>

            <Section title="3. 비율">
              <div className="flex flex-wrap gap-2">
                {RATIOS.map((r) => (
                  <Chip
                    key={r.value}
                    label={r.label}
                    active={ratio === r.value}
                    onClick={() => setRatio(r.value)}
                  />
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
              {!referenceImage ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
                >
                  <ImagePlus size={26} />
                  <span className="text-sm font-semibold">이미지 업로드</span>
                  <span className="text-xs text-slate-400">
                    클릭해서 파일 선택 (jpg, png)
                  </span>
                </button>
              ) : (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImage}
                    alt="참고 이미지"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                  >
                    <X size={12} /> 제거
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="mt-2 text-xs text-slate-400">
                업로드 이미지는 PC에만 저장되며 외부로 전송되지 않습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REFERENCE_ROLES.map((r) => (
                  <Chip
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
                      onChange={(e) =>
                        setForbid({ ...forbid, [item.key]: e.target.checked })
                      }
                      className="h-4 w-4 accent-slate-900"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="6. 한글 요청">
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="h-36 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-slate-900"
                placeholder="예: 쥬라기 테마 슬롯 배너. 저녁 느낌. 중앙은 비워줘."
              />
              <button
                type="button"
                onClick={handleScrollToResults}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white shadow-sm hover:bg-slate-800"
              >
                <Wand2 size={20} /> 프롬프트 확인
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                결과는 입력을 바꾸면 실시간으로 갱신됩니다.
              </p>
            </Section>
          </aside>

          {/* === 오른쪽 결과 === */}
          <main id="result-section" className="space-y-5">
            <ResultCard
              title="한글 요약"
              description="입력한 내용 확인용"
              content={result.koreanSummary}
            />
            <ResultCard
              title="GPT Image용 프롬프트"
              description="문장형 지시문 (ChatGPT 이미지 생성에 그대로 붙여넣기)"
              content={result.gptImage}
            />
            <ResultCard
              title="Nano Banana용 프롬프트"
              description="Keep / Change / Remove 구조"
              content={result.nanoBanana}
            />
            <ResultCard
              title="Midjourney용 프롬프트"
              description="짧은 키워드 + --ar 비율"
              content={result.midjourney}
            />
            <ResultCard
              title="수정 요청용 프롬프트"
              description="결과가 마음에 안 들 때 쓰는 수정 지시 템플릿"
              content={result.revision}
            />
          </main>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          v0.2 · 프롬프트 생성 + 참고 이미지 미리보기 (이미지 생성 API 미연동)
        </footer>
      </div>
    </div>
  );
}

// === 작은 컴포넌트들 ===

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
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

  // 컨텐츠가 바뀌면 "복사됨" 표시 자동 해제
  useEffect(() => {
    setCopied(false);
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
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
        {content}
      </div>
    </div>
  );
}
