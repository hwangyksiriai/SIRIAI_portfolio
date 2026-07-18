import 'pretendard/dist/web/static/pretendard.css';
import './globals.css';

export const metadata = {
  title: 'SIRIAI Portfolio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/*
          next/font/google's declared subsets for Noto Sans JP omit an
          explicit "japanese" label, but a plain Google Fonts CSS2 request
          for this family serves one unrestricted font file covering
          Hiragana/Kanji (verified via fontTools cmap inspection), so a
          <link> tag is used instead of next/font/google here.
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
