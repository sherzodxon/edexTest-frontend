import DashboardClient from "@/components/ui/dashboardClient";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

export default function DashboardPage() {
  return (
    <main className={`${montserrat.variable} font-sans bg-slate-50 min-h-screen`}>
      <DashboardClient />
    </main>
  );
}