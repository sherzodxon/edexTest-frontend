// app/page.tsx
import { redirect } from "next/navigation";
import "./globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Edex School",
  description: "Official Edex School Platform",
};

export default function HomePage() {
  redirect("/login");
  return (
    <main
      className={`${montserrat.variable} font-poppins flex items-center justify-center min-h-screen bg-gray-100`}
    >
      <h1 className="text-3xl font-semibold text-[#27a55d]">
        Yo'naltirilmoqda...
      </h1>
    </main>
  );
}
