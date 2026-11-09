import type { Metadata } from "next";
import Image from "next/image";
import { Droplets, LineChart, Search, Sprout } from "lucide-react";
import { Btn, PageHero, SoonBadge, Split } from "@/components/ui";
import { TEAM } from "@/lib/data";

export const metadata: Metadata = { title: "About us" };

const SERVICES = [
  { Icon: Droplets, title: "Irrigation planning and monitoring", body: "Schedules based on climate data and each species' needs, with reminders so volunteers keep young trees alive.", href: "/irrigation" },
  { Icon: LineChart, title: "Impact tracking and reporting", body: "See the number of trees planted and the land restored, and calculate benefits such as carbon offset.", href: "/impact" },
  { Icon: Sprout, title: "Personalized tree recommendations", body: "A short questionnaire about your location, soil and purpose, with the reasons behind every suggested species.", href: "/recommend" },
  { Icon: Search, title: "Tree identification AI", body: "A mobile-friendly way of naming tree species by taking a picture.", href: "/identify", soon: true },
];

const PILLARS = [
  ["Identification", "Understanding what is being planted."],
  ["Optimization", "Making better decisions about water."],
  ["Measurement", "Evaluating what really survives and grows."],
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="About us" title="More than counting trees" lead="Algreenia connects communities across Algeria to afforestation, with the tools to make every planted tree last." tone="moss" seed={12} />

      <section className="wrap about__goal">
        <p className="eyebrow" data-reveal>Our goal</p>
        <Split as="p" text="A planted tree is only a promise. We help people keep it." className="display display--lg" />
        <ol className="pillars" data-reveal-group>
          {PILLARS.map(([t, d], i) => (
            <li key={t} data-reveal-item><b>{String(i + 1).padStart(2, "0")}</b><h2>{t}</h2><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <figure className="widephoto" data-image-reveal>
        <Image src="/img/photos/cedars-wide.jpg" alt="An Atlas cedar forest across the slopes of Mount Chélia" fill sizes="100vw" />
        <figcaption>Atlas cedars on Mount Chélia, in the Aurès.</figcaption>
      </figure>

      <section className="about__team">
        <div className="wrap">
          <Split text="Our team" className="display display--lg" />
          <ul className="team">
            {TEAM.map((m, i) => (
              <li key={m.name} data-offset={i % 2 || undefined}>
                <figure data-image-reveal><Image src={m.image} alt={`Portrait of ${m.name}`} fill sizes="(max-width: 760px) 90vw, 24vw" /></figure>
                <p className="eyebrow">{m.tag}</p>
                <h3>{m.name}</h3>
                <p className="team__role">{m.role}</p>
                <p>{m.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap about__svc">
        <Split text="Our services" className="display display--lg" />
        <ul className="svc" data-reveal-group>
          {SERVICES.map(({ Icon, title, body, href, soon }) => (
            <li key={title} data-reveal-item>
              <Icon aria-hidden="true" />
              <h3>{title} {soon ? <SoonBadge /> : null}</h3>
              <p>{body}</p>
              <a className="more" href={href} aria-label={`Open ${title}`}>Open</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="partner">
        <div className="wrap partner__in">
          <div>
            <p className="eyebrow">For companies</p>
            <Split text="Fund a forest, then watch it grow" className="display display--lg" />
          </div>
          <Btn href="/contact" variant="leaf">Become a partner</Btn>
        </div>
      </section>
    </>
  );
}
