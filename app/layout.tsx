import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast';


const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});


export async function generateMetadata(): Promise<Metadata> {
  const siteName = "Edex School";
  const description = "Raqamli ta'lim platformasi";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`, 
    },
    description,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: siteName,
      description,
      url: "https://edex.uz", 
      siteName,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={rubik.variable}>
      <body className="font-sans">
        <Toaster position="top-center" reverseOrder={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
