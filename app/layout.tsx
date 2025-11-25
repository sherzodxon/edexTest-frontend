import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast';

// Rubik fontini import qilamiz
const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});

// Dinamik metadata (title va description har sahifaga qarab o‘zgaradi)
export async function generateMetadata(): Promise<Metadata> {
  // Bu yerda siz masalan `cookies`, `headers`, yoki `params`dan foydalansangiz bo‘ladi
  const siteName = "Edex School";
  const description = "Raqamli ta'lim platformasi";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`, // Har bir sahifa title oldiga qo‘shiladi
    },
    description,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: siteName,
      description,
      url: "https://edex.uz", // misol uchun
      siteName,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body className={`${rubik.variable} font-sans antialiased`}>
         <Toaster position="top-center" reverseOrder={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
