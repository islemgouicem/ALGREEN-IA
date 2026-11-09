import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ringPaths } from "@/lib/rings";

/** Headline split by word at render time, so nothing is rewritten in the browser. */
export function Split({ as: Tag = "h2", text, className, lang, dir, reveal = true }: {
  as?: "h1" | "h2" | "h3" | "p"; text: string; className?: string; lang?: string; dir?: string; reveal?: boolean;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} lang={lang} dir={dir} {...(reveal ? { "data-motion-text": "words" } : {})}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w"><i>{w}</i></span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

export function Btn({ href, children, variant = "solid", magnetic = true, external }: {
  href: string; children: React.ReactNode; variant?: "solid" | "ghost" | "leaf" | "bone"; magnetic?: boolean; external?: boolean;
}) {
  const cls = `btn btn--${variant}`;
  const inner = (<><span>{children}</span><ArrowUpRight size={18} aria-hidden="true" /></>);
  if (external) return <a className={cls} href={href} target="_blank" rel="noreferrer">{inner}</a>;
  return <Link className={cls} href={href} {...(magnetic ? { "data-magnetic": "" } : {})}>{inner}</Link>;
}

export function RingArt({ seed, count = 26, className, wobble }: { seed: number; count?: number; className?: string; wobble?: number }) {
  const rings = ringPaths(seed, count, 600, wobble);
  return (
    <svg className={className} viewBox="0 0 600 600" fill="none" aria-hidden="true">
      {rings.map((r, i) => <path key={i} d={r.d} strokeWidth={r.heavy ? 2.1 : 0.9} />)}
    </svg>
  );
}

export function PageHero({ eyebrow, title, lead, tone = "canopy", seed, children }: {
  eyebrow: string; title: string; lead?: string; tone?: "canopy" | "moss" | "rain" | "bloom" | "clay"; seed: number; children?: React.ReactNode;
}) {
  return (
    <section className={`phero phero--${tone}`}>
      <div className="phero__ring" data-spin="55"><RingArt seed={seed} count={30} /></div>
      <div className="wrap phero__in">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <Split as="h1" text={title} className="display" />
        {lead ? <p className="lead" data-reveal>{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function SoonBadge({ children = "Coming soon" }: { children?: React.ReactNode }) {
  return <span className="soon">{children}</span>;
}

export function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={`field${error ? " field--err" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <small id={`${id}-hint`}>{hint}</small> : null}
      {error ? <small id={`${id}-err`} className="field__err" role="alert">{error}</small> : null}
    </div>
  );
}
