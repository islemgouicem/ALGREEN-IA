import type { Metadata, Viewport } from "next";
import { Aref_Ruqaa, Gloock, Hanken_Grotesk, Martian_Mono, Newsreader } from "next/font/google";
import { AskButton, Cursor, Header, Inactivity, Toasts } from "@/components/Chrome";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import "@/styles/base.css";
import "@/styles/chrome.css";
import "@/styles/home.css";
import "@/styles/pages.css";

const display = Gloock({ subsets: ["latin"], weight: "400", variable: "--f-display", display: "swap" });
const accent = Newsreader({ subsets: ["latin"], style: "italic", variable: "--f-accent", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });
const arabic = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--f-arabic", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Algreenia. Where every tree tells a story", template: "%s · Algreenia" },
  description: "Algreenia helps communities across Algeria plant, water and measure trees, from the first seed to a living forest.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1746D1" };

// Runs before first paint. Content is only hidden for animation when animation will really run.
const boot = `(function(){try{var d=document.documentElement,o=localStorage.getItem('algreenia:motion'),r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(o==='on'||(o!=='off'&&!r)){d.classList.add('has-motion');window.__motionTimer=setTimeout(function(){d.classList.remove('has-motion')},9000)}else{d.classList.add('no-motion')}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${accent.variable} ${body.variable} ${mono.variable} ${arabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <MotionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
        <AskButton />
        <Toasts />
        <Inactivity />
        <Cursor />
      </body>
    </html>
  );
}
