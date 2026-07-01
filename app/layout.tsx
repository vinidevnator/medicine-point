import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Medicine Point — Marketplace de medicamentos",
    template: "%s · Medicine Point",
  },
  description:
    "Encontre medicamentos disponíveis em farmácias próximas via CEP. Retire na loja, receba por motoentrega ou pelo centro de distribuição.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Medicine Point",
    description: "Marketplace de medicamentos com retirada, motoentrega e centro de distribuição.",
    locale: "pt_BR",
    type: "website",
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('mp-theme');var m=s==='light'||s==='dark'?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',m==='dark');document.documentElement.setAttribute('data-mode',m);}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}