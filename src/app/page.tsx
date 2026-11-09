import Image from "next/image";
import Link from "next/link";
import { CloudRain, Leaf, Trees, Users, Wind } from "lucide-react";
import { Btn, RingArt, SoonBadge, Split } from "@/components/ui";
import { HomeMotion } from "@/components/home/HomeMotion";
import { Challenge, PlantControls, VideoFacade } from "@/components/home/Interactive";
import { WorldStage } from "@/components/home/WorldStage";
import { CAMPAIGNS, STEPS, STORIES } from "@/lib/data";
import { ringPaths } from "@/lib/rings";

const MANIFESTO =
  "More than four fifths of Algeria is desert. Since the 1970s, people here have been planting a green line against it, fifteen hundred kilometres long. Planting was never the hard part. Keeping a tree alive is. That is what Algreenia is for.";

const CHAPTERS = [
  ["#top", "Dawn"], ["#land", "The land"], ["#steps", "Growth"], ["#tools", "Tools"],
  ["#trunk", "Impact"], ["#campaigns", "Campaigns"], ["#stories", "Stories"], ["#almanac", "Almanac"], ["#plant", "Plant"],
];

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function Home() {
  const trunkRings = ringPaths(2024, 34, 1000, 0.06);

  return (
    <div className="home">
      <div className="loader" aria-hidden="true">
        <Image src="/img/photos/algreenia-2.png" alt="" width={1024} height={1024} sizes="(max-width: 800px) 92vmin, 720px" priority className="loader__crest" />
      </div>
      <WorldStage />
      <HomeMotion />

      <nav className="stem" aria-label="Chapters">
        <svg viewBox="0 0 12 600" preserveAspectRatio="none" aria-hidden="true">
          <path className="stem__bg" d="M6 0C10 100 2 200 6 300S10 500 6 600" pathLength={1} />
          <path className="stem__line" d="M6 0C10 100 2 200 6 300S10 500 6 600" pathLength={1} />
        </svg>
        <ol>
          {CHAPTERS.map(([href, label]) => (
            <li key={href}><a href={href}><i aria-hidden="true" /><span>{label}</span></a></li>
          ))}
        </ol>
      </nav>
      <p className="hud" aria-hidden="true">Canopy <b data-hud-canopy>0%</b></p>

      {/* ------- 00 Hero ------- */}
      <section className="hero" id="top" data-world="hero">
        <h1 className="hero__title" aria-label="Where every tree tells a story">
          {"Where every tree tells a story".split(" ").map((w, i, all) => (
            <span key={i} aria-hidden="true">
              <span className="w"><i>{w}</i></span>{i < all.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <div className="hero__meta">
          <p lang="ar" dir="rtl" className="hero__ar">كل شجرة تحكي قصة</p>
          <p className="hero__lead">Join Algeria&rsquo;s green movement. Plant, track and care for trees, and restore our landscapes one project at a time.</p>
          <div className="hero__cta">
            <Btn href="/signup">Join us</Btn>
            <Btn href="/about" variant="ghost">Read more</Btn>
          </div>
          <p className="hero__scroll">Scroll to plant</p>
        </div>
      </section>

      {/* ------- 01 Manifesto ------- */}
      <section className="manifesto" id="land" data-world="land">
        <div className="manifesto__in">
          <p className="eyebrow">The land</p>
          <p className="manifesto__text">
            {MANIFESTO.split(" ").map((w, i) => <span key={i} className="m">{w} </span>)}
          </p>
        </div>
      </section>

      {/* ------- 02 Six stages ------- */}
      <section className="steps" id="steps" data-world="steps">
        <header className="steps__head wrap">
          <p className="eyebrow">How Algreenia works</p>
          <Split text="From seed to canopy" className="display display--lg" />
        </header>
        <div data-world="stepsMid" />
        <ol className="steps__list wrap">
          {STEPS.map((s, i) => (
            <li key={s.stage} className={`tag tag--${i % 2 ? "r" : "l"}`} data-reveal>
              <span className="tag__hole" aria-hidden="true" />
              <p className="tag__stage"><b>{String(i + 1).padStart(2, "0")}</b> {s.stage}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <Link href={s.href} className="more">{s.cta}</Link>
            </li>
          ))}
        </ol>
        <div data-world="stepsEnd" />
      </section>

      {/* ------- 03 Three tools ------- */}
      <div id="tools">
        <section className="tool tool--identify" data-world="identify">
          <div className="wrap tool__grid">
            <div className="tool__copy card-note">
              <p className="eyebrow">Identification <SoonBadge>AI coming soon</SoonBadge></p>
              <Split text="Know what you are planting" className="display display--md" />
              <p>Point a camera at a leaf, and Algreenia will name the species, its family, its habitat and how it should be cared for.</p>
              <Btn href="/identify" variant="solid">Explore the species</Btn>
            </div>
            <figure className="scan">
              <div className="scan__frame">
                <Image src="/img/photos/scan-leaf.jpg" alt="Close view of the feathery green leaves of an umbrella thorn tree" fill sizes="(max-width: 900px) 90vw, 40vw" />
                <span className="scan__line" aria-hidden="true" />
                <span className="scan__pin scan__pin--a">Bipinnate leaf</span>
                <span className="scan__pin scan__pin--b">Fine leaflets</span>
              </div>
            </figure>
          </div>
        </section>

        <section className="tool tool--water" data-world="irrigate">
          <div className="wrap">
            <div className="tool__huge">
              <p className="eyebrow">Smart irrigation</p>
              <Split text="Water only when the sky won't" className="display display--xl" />
            </div>
            <div className="tool__copy tool__copy--right card-note card-note--rain">
              <p>Algreenia reads the forecast for each plantation, then tells volunteers which trees are thirsty and which can wait for the rain.</p>
              <ul className="states">
                <li><i data-s="ok" aria-hidden="true" />Hydrated</li>
                <li><i data-s="warn" aria-hidden="true" />Thirsty</li>
                <li><i data-s="bad" aria-hidden="true" />Critically dehydrated</li>
              </ul>
              <Btn href="/irrigation">Open the tracker</Btn>
            </div>
          </div>
          <div data-world="irrigateEnd" />
        </section>

        <section className="tool tool--measure" data-world="measure">
          <div className="wrap">
            <div className="tool__copy card-note card-note--leaf">
              <p className="eyebrow">Measurement</p>
              <Split text="Count what survives" className="display display--md" />
              <p>A planted tree is a promise. Algreenia follows how many live, how fast they grow, and what they give back.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ------- 04 Trunk ------- */}
      <section className="trunk" id="trunk" data-world="rings" data-cover>
        <div className="trunk__in">
          <svg className="trunk__art" viewBox="0 0 1000 1000" fill="none" aria-hidden="true">
            {trunkRings.map((r, i) => <path key={i} d={r.d} pathLength={1} strokeWidth={r.heavy ? 5 : 2.2} />)}
          </svg>
          <div className="trunk__stats">
            <p className="eyebrow trunk__eyebrow">Our impact, read like a trunk</p>
            <dl>
              <div className="trunk__stat"><dt><Trees aria-hidden="true" /> Trees planted</dt><dd data-tick="1000">1,000</dd></div>
              <div className="trunk__stat"><dt><Users aria-hidden="true" /> Community participants</dt><dd data-tick="120">120</dd></div>
              <div className="trunk__stat"><dt><Wind aria-hidden="true" /> Tonnes of CO₂ captured</dt><dd data-tick="70">70</dd></div>
            </dl>
            <Link href="/impact" className="more more--bone">See full impact</Link>
          </div>
        </div>
      </section>

      {/* ------- 05 Campaigns ------- */}
      <section className="camp" id="campaigns" data-world="campaigns">
        <div className="camp__sticky">
          <header className="camp__head wrap">
            <div>
              <p className="eyebrow">Afforestation campaigns</p>
              <Split text="Pick a hillside" className="display display--lg" />
            </div>
            <Btn href="/campaigns" variant="bone">All campaigns</Btn>
          </header>
          <ul className="camp__track" tabIndex={0} aria-label="Campaigns, scrolls sideways">
            {CAMPAIGNS.slice(0, 9).map((c, i) => (
              <li key={c.id} className="ctag">
                <Link href={`/campaigns/${c.id}`} data-cursor-label="Open">
                  <span className="ctag__hole" aria-hidden="true" />
                  <RingArt seed={i * 13 + 5} count={16} className="ctag__ring" />
                  <p className="ctag__where">{c.wilaya}</p>
                  <h3>{c.name}</h3>
                  <dl>
                    <div><dt>Organised by</dt><dd>{c.association}</dd></div>
                    <div><dt>Goal</dt><dd>{c.goal.toLocaleString("en-US")} trees</dd></div>
                    <div><dt>Start date</dt><dd>{fmt(c.start)}</dd></div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------- 06 Stories ------- */}
      <section className="stories" id="stories" data-world="stories">
        <header className="wrap">
          <p className="eyebrow">Success stories</p>
          <Split text="Real soil, real names" className="display display--lg" />
        </header>
        <ol className="wrap stories__list">
          {STORIES.map((s) => (
            <li className="story" key={s.place}>
              <figure data-image-reveal>
                <Image src={s.image} alt={s.alt} fill sizes="(max-width: 900px) 90vw, 36vw" />
              </figure>
              <div className="story__text">
                <p className="story__num"><b>{s.value}</b></p>
                <h3>{s.unit} in {s.place}</h3>
                <p>&ldquo;{s.title}&rdquo;</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ------- 07 Almanac ------- */}
      <section className="almanac" id="almanac" data-world="almanac" data-cover>
        <div className="wrap">
          <header className="almanac__head">
            <p className="eyebrow">Resources and sustainability tips</p>
            <Split text="The Almanac" className="display display--xl" />
          </header>
          <div className="almanac__grid" data-reveal-group>
            <article className="al al--guide" data-reveal-item>
              <h3>Tree planting guide</h3>
              <p>Step by step: planting and caring for trees in Algeria&rsquo;s unique climate.</p>
              <Btn href="https://treecouncil.org.uk/wp-content/uploads/2019/12/Tree-planting-guide-2019-updates_1.pdf" external variant="solid">Download the guide</Btn>
            </article>

            <article className="al al--video" data-reveal-item>
              <h3>Why trees matter</h3>
              <p>The environmental and social benefits of afforestation, in one short film.</p>
              <VideoFacade />
            </article>

            <article className="al al--challenge" data-reveal-item>
              <p className="eyebrow">This month&rsquo;s challenge</p>
              <h3 className="display display--sm">Conserve water</h3>
              <div className="al__img">
                <Image src="/img/photos/dew.jpg" alt="Water droplets resting on a bright green leaf" fill sizes="(max-width: 900px) 90vw, 30vw" />
              </div>
              <p>Reduce your water use and track your progress over the month.</p>
              <Challenge />
            </article>

            <article className="al al--practice" data-reveal-item>
              <h3><Leaf aria-hidden="true" /> Eco-friendly practices</h3>
              <ul className="al__list">
                <li>Reduce single-use plastics by carrying reusable bags and bottles.</li>
                <li>Start composting kitchen scraps and yard waste.</li>
                <li>Choose native plants for your garden to conserve water.</li>
                <li>Join community tree-planting events to restore habitats and improve air quality.</li>
                <li>Use tree identification to learn the species around you.</li>
                <li>Answer the <Link href="/recommend">tree matchmaker</Link> for species that suit your land.</li>
              </ul>
            </article>

            <article className="al al--guides" data-reveal-item>
              <h3>More guides</h3>
              {[
                ["Sustainable gardening checklist", "Create a thriving garden while protecting the environment."],
                ["Composting basics", "A step-by-step guide to kitchen and yard waste."],
                ["Water conservation techniques", "Saving water in your home and garden."],
              ].map(([t, d]) => (
                <div key={t} className="al__row">
                  <div><h4>{t}</h4><p>{d}</p></div>
                  <SoonBadge>PDF soon</SoonBadge>
                </div>
              ))}
            </article>

            <article className="al al--tips" data-reveal-item>
              <h3><CloudRain aria-hidden="true" /> Community tips</h3>
              <blockquote><b>Save water in the kitchen.</b> Use leftover water from washing vegetables to water your plants.</blockquote>
              <blockquote><b>Limit shower time.</b> Try setting a five-minute timer to reduce water use.</blockquote>
            </article>
          </div>
        </div>
      </section>

      {/* ------- Crest ------- */}
      <section className="crest" data-cover aria-labelledby="crest-title">
        <div className="crest__in">
          <div className="crest__glow" aria-hidden="true" />
          <h2 id="crest-title" className="sr">Algreenia</h2>
          <div className="crest__art">
            <Image src="/img/photos/algreenia-2.png" alt="The name Algreenia in letters of living leaves, wrapped in woven vines" fill sizes="(max-width: 800px) 118vw, 1120px" />
          </div>
          <p className="crest__line">Where every tree tells a story.</p>
        </div>
      </section>

      {/* ------- 08 Plant ------- */}
      <section className="plant" id="plant" data-world="plant">
        <div className="plant__head wrap">
          <p className="eyebrow">Your turn</p>
          <Split text="This forest has room for one more" className="display display--xl" />
          <Btn href="/signup" variant="bone">Join us</Btn>
        </div>
        <PlantControls />
      </section>
    </div>
  );
}
