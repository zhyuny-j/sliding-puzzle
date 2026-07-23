import type { Metadata } from "next";
import { Do_Hyeon, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const arcadeHeading = Do_Hyeon({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "내가 원하는 사진으로 퍼즐 만들기",
  description: "원하는 사진으로 나만의 4X4 슬라이딩 퍼즐을 만들고 랭킹에 도전하는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn("font-sans", outfit.variable, arcadeHeading.variable)}>
      <body className={cn(outfit.variable, "antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
