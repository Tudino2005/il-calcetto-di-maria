import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena Stats | Classifiche",
  description: "Le classifiche in tempo reale dell'Arena del Biliardino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arena Stats",
  },
  themeColor: "#0f172a", // slate-900
};

export default function ClassificheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {children}
    </div>
  );
}
