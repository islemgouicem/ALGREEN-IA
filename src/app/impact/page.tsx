import type { Metadata } from "next";
import Image from "next/image";
import { Calculator } from "@/components/pages/Tools";
import { PageHero, RingArt, Split } from "@/components/ui";
import { CONTRIBUTORS, GOALS, KEY_STATS } from "@/lib/data";

export const metadata: Metadata = { title: "Impact Tracking" };

const ORDINAL = ["1st", "2nd", "3rd"];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Impact tracking" title="Count what survives" lead="Every number here will come from the field. For now, these are sample figures while the backend is rebuilt." tone="clay" seed={61} />

      <section className="wrap imp">
        <h2 className="sr">Key statistics</h2>
        <ul className="stats" data-reveal-group>
          {KEY_STATS.map((s, i) => (
            <li key={s.label} data-reveal-item>
              <RingArt seed={i * 7 + 2} count={12} className="stats__ring" />
              <p className="stats__v"><span data-count={s.value} data-suffix={s.suffix}>{s.value.toLocaleString("en-US")}{s.suffix}</span></p>
              <h3>{s.label}</h3>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap imp imp--goals">
        <Split text="Goals vs. achievements" className="display display--lg" />
        <ul className="goals" data-reveal-group>
          {GOALS.map((g) => (
            <li key={g.label} data-reveal-item>
              <div className="goals__l"><h3>{g.label}</h3><p>{g.value}% of goal</p></div>
              <div className="goals__bar" role="img" aria-label={`${g.label}: ${g.value}% of goal reached`}><i style={{ width: `${g.value}%` }} /></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="imp__calc">
        <div className="wrap">
          <p className="eyebrow">Your contribution</p>
          <Split text="What will your trees give back?" className="display display--lg" />
          <Calculator />
        </div>
      </section>

      <section className="wrap imp imp--top">
        <Split text="Top contributors of the season" className="display display--lg" />
        <p className="lead" data-reveal>Keep planting and contributing to earn your spot here.</p>
        <ol className="podium">
          {CONTRIBUTORS.map((c) => (
            <li key={c.name} data-rank={c.rank}>
              <figure data-image-reveal><Image src={c.image} alt={`Portrait of ${c.name}`} fill sizes="(max-width: 760px) 90vw, 30vw" /></figure>
              <p className="podium__rank">{ORDINAL[c.rank - 1]}</p>
              <h3>{c.name}</h3>
              <p>{c.wilaya} · {c.trees} trees planted</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
