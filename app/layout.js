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
          next/font/google can't be used for Tsukimi Rounded here: its only
          declared subsets are latin/latin-ext, which excludes the Hiragana
          range even though the font file itself contains those glyphs.
          Since "しりあい" is fixed static text, Google's text= param
          generates a subset covering exactly those characters instead.
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Tsukimi+Rounded&text=%E3%81%97%E3%82%8A%E3%81%82%E3%81%84&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
