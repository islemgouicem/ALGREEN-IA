import Link from "next/link";
import { CONTACT, NAV, SERVICES } from "@/lib/data";
import { grassPath, pebbles, rootSystem } from "@/lib/roots";
import { BackToCanopy, MotionToggle } from "./Chrome";

// Root tips land above the centre of each footer column
const TARGETS: [number, number][] = [[200, 250], [600, 345], [1000, 290], [1400, 370]];
const TOPS = [250, 345, 290, 370];

export function Footer() {
  const roots = rootSystem(TARGETS);
  const stones = pebbles(77, 90, 1600, 900);

  const Node = ({ i }: { i: number }) => (
    <span className="soil__node" style={{ "--top": `${TOPS[i]}px` } as React.CSSProperties} aria-hidden="true" />
  );

  return (
    <footer className="soil">
      <svg className="soil__grass" viewBox="0 0 1600 54" preserveAspectRatio="none" aria-hidden="true">
        <path d={grassPath(5, 1600, 54, 11)} fill="#6d9f35" />
        <path d={grassPath(8, 1600, 54, 7)} fill="#3f7a3d" transform="translate(0 12)" />
      </svg>

      <svg className="soil__roots" viewBox="0 0 1600 900" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {stones.map((s, i) => <ellipse key={i} {...s} opacity={undefined} fillOpacity={s.o} fill="#a98b6a" />)}
        {roots.map((r, i) => <path key={i} d={r.d} data-root="" pathLength={1} strokeWidth={r.w} strokeLinecap="round" stroke={r.w > 3 ? "#d7a874" : "#9a7048"} />)}
      </svg>

      <div className="soil__head">
        <p className="eyebrow">Below the surface</p>
        <p className="soil__line">Everything above ground depends on what happens down here.</p>
      </div>

      <div className="soil__grid">
        <div className="soil__col">
          <Node i={0} />
          <h2 className="eyebrow">About Algreenia</h2>
          <p>Connecting communities to afforestation, with the tools to restore and preserve Algeria&rsquo;s green spaces.</p>
          <p lang="ar" dir="rtl" className="soil__ar">كل شجرة تحكي قصة</p>
        </div>
        <nav className="soil__col" aria-label="Explore">
          <Node i={1} />
          <h2 className="eyebrow">Explore</h2>
          <ul>
            {NAV.slice(1).map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            {SERVICES.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </nav>
        <div className="soil__col">
          <Node i={2} />
          <h2 className="eyebrow">Contact</h2>
          <ul>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a></li>
            <li>{CONTACT.address}</li>
            <li><Link href="/contact">Send a message</Link></li>
          </ul>
        </div>
        <div className="soil__col">
          <Node i={3} />
          <h2 className="eyebrow">Accessibility</h2>
          <ul>
            <li><MotionToggle /></li>
            <li><Link href="/credits">Photo credits</Link></li>
            <li>Social links are coming soon.</li>
          </ul>
        </div>
      </div>

      <div className="soil__rock">
        <BackToCanopy />
        <div className="soil__word" aria-hidden="true">Algreenia</div>
        <p>&copy; {new Date().getFullYear()} Algreenia. All rights reserved. Designed with love by the Algreenia team.</p>
      </div>
    </footer>
  );
}
