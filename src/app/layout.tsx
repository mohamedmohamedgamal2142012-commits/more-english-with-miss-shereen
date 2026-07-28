import type { Metadata } from "next";
import { Poppins, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LanguageWrapper from "@/components/LanguageWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "More English with Miss Shereen Elmairy",
  description:
    "Learn English from KG1 to Secondary Grade 3 with Miss Shereen Elmairy. Interactive lessons, proven curriculum, and personalized attention for every student.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${poppins.variable} ${cairo.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <AuthProvider>
          <LanguageWrapper>
            {children}
          </LanguageWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
