import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Prompt Generator",
  description: "한글 요청을 GPT Image / Nano Banana / Midjourney / Niji 프롬프트로 변환",
};

// 다크 모드 초기 적용 스크립트 (FOUC 방지)
// 첫 페인트 전에 실행되어야 하므로 inline script로 head에 삽입.
// 우선순위: localStorage('theme') > 시스템 prefers-color-scheme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
