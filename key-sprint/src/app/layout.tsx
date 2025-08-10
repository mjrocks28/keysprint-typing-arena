import type { Metadata } from "next";
import { Outfit, Chakra_Petch } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "600", "800"],
});
const chakra = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "KeySprint — Neon Typing Arena",
};

export const viewport = {
  themeColor: "#0b1221",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${chakra.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
