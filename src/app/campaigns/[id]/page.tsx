import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinPanel } from "@/components/pages/Campaigns";
import { PageHero } from "@/components/ui";
import { CAMPAIGNS } from "@/lib/data";

export function generateStaticParams() {
  return CAMPAIGNS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: CAMPAIGNS.find((c) => c.id === id)?.name ?? "Campaign" };
}

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = CAMPAIGNS.findIndex((c) => c.id === id);
  if (i < 0) notFound();
  const c = CAMPAIGNS[i];
  const pct = Math.min(100, Math.round((c.planted / c.goal) * 100));
  return (
    <>
      <PageHero eyebrow={`${c.wilaya} · ${c.location}`} title={c.name} lead={c.description} tone="moss" seed={i * 13 + 5}>
        <div className="row phero__cta" data-reveal><JoinPanel id={c.id} /></div>
      </PageHero>
      <section className="wrap detail" data-reveal-group>
        <div className="detail__prog panel panel--leaf" data-reveal-item>
          <p className="eyebrow">Progress</p>
          <p className="bigstat">{pct}%</p>
          <p>{c.planted.toLocaleString("en-US")} of {c.goal.toLocaleString("en-US")} trees planted</p>
          <div className="bar bar--dark" role="img" aria-label={`${pct}% of the goal planted`}><i style={{ width: `${pct}%` }} /></div>
        </div>
        <dl className="panel specs" data-reveal-item>
          <div><dt>Organised by</dt><dd>{c.association}</dd></div>
          <div><dt>Start date</dt><dd>{fmt(c.start)}</dd></div>
          <div><dt>End date</dt><dd>{fmt(c.end)}</dd></div>
          <div><dt>Area</dt><dd>{c.area} hectares</dd></div>
          <div><dt>Participants</dt><dd>{c.participants}</dd></div>
          <div><dt>Species</dt><dd>{c.species.join(", ")}</dd></div>
        </dl>
      </section>
      <p className="wrap detail__back"><Link className="more" href="/campaigns">All campaigns</Link></p>
    </>
  );
}
