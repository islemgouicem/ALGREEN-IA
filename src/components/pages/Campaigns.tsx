"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Field, RingArt } from "@/components/ui";
import { CAMPAIGNS, WILAYAS, type Campaign } from "@/lib/data";
import { getState, setState, toast, toggleJoin, useApp } from "@/lib/store";

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const PARTICIPANT_BANDS: Record<string, [number, number]> = { small: [1, 10], medium: [11, 50], large: [51, Infinity] };

export function useJoin() {
  const router = useRouter();
  return (c: Campaign) => {
    if (!getState().user) {
      setState({ loginReason: "join", afterLogin: `/campaigns/${c.id}` });
      router.push("/login");
      return;
    }
    const nowJoined = toggleJoin(c.id);
    toast(nowJoined ? `You joined ${c.name}.` : `You left ${c.name}.`);
  };
}

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} aria-hidden="true" fill={i < value ? "currentColor" : "none"} />)}
    </span>
  );
}

function Card({ c, index, pending }: { c: Campaign; index: number; pending?: boolean }) {
  const joined = useApp((s) => s.joined.includes(c.id));
  const join = useJoin();
  const pct = Math.min(100, Math.round((c.planted / c.goal) * 100));
  return (
    <li className="ccard">
      <RingArt seed={index * 17 + 3} count={14} className="ccard__ring" />
      <p className="ccard__where">{c.wilaya}{pending ? <span className="soon">Pending review</span> : null}</p>
      <h3><Link href={pending ? "#" : `/campaigns/${c.id}`}>{c.name}</Link></h3>
      <Stars value={c.rating} />
      <dl>
        <div><dt>Organised by</dt><dd>{c.association}</dd></div>
        <div><dt>Goal</dt><dd>{c.goal.toLocaleString("en-US")} trees</dd></div>
        <div><dt>Start date</dt><dd>{fmt(c.start)}</dd></div>
        <div><dt>Participants</dt><dd>{c.participants + (joined ? 1 : 0)}</dd></div>
      </dl>
      <div className="bar" role="img" aria-label={`${pct}% of the goal planted`}><i style={{ width: `${pct}%` }} /></div>
      <div className="row">
        <button type="button" className={`btn btn--sm ${joined ? "btn--ghost" : "btn--solid"}`} aria-pressed={joined} disabled={pending} onClick={() => join(c)}>
          <span>{joined ? "Joined" : "Join us"}</span>{joined ? <Check size={16} aria-hidden="true" /> : null}
        </button>
        {!pending ? <Link className="more" href={`/campaigns/${c.id}`} aria-label={`Read more about ${c.name}`}>Read more</Link> : null}
      </div>
    </li>
  );
}

export function CampaignsView() {
  const router = useRouter();
  const created = useApp((s) => s.created);
  const [q, setQ] = useState("");
  const [rating, setRating] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  const [goal, setGoal] = useState(0);
  const [band, setBand] = useState("");
  const [sort, setSort] = useState("relevant");
  const [moreW, setMoreW] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = CAMPAIGNS.filter((c) => {
      if (rating && c.rating < rating) return false;
      if (locations.length && !locations.includes(c.wilaya)) return false;
      if (goal && c.goal < goal) return false;
      if (band) {
        const [a, b] = PARTICIPANT_BANDS[band];
        if (c.participants < a || c.participants > b) return false;
      }
      if (term && !`${c.name} ${c.wilaya} ${c.association} ${c.species.join(" ")}`.toLowerCase().includes(term)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return b.start.localeCompare(a.start);
      if (sort === "participants") return b.participants - a.participants;
      return b.relevance - a.relevance;
    });
  }, [q, rating, locations, goal, band, sort]);

  const active = rating || locations.length || goal || band || q;
  const clear = () => { setRating(0); setLocations([]); setGoal(0); setBand(""); setQ(""); };
  const toggleLoc = (w: string) => setLocations((l) => (l.includes(w) ? l.filter((x) => x !== w) : [...l, w]));

  const openCreate = () => {
    if (!getState().user) {
      setState({ loginReason: "create", afterLogin: "/campaigns" });
      router.push("/login");
      return;
    }
    dialog.current?.showModal();
    window.__lenis?.stop();
  };

  const visibleWilayas = moreW ? WILAYAS : ["Algiers", "Oran", "Constantine", "Annaba"];

  return (
    <div className="wrap camps">
      <div className="camps__top">
        <div className="search">
          <Search size={18} aria-hidden="true" />
          <label className="sr" htmlFor="c-search">Search campaigns</label>
          <input id="c-search" type="search" placeholder="Search by name, wilaya or species" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className="btn btn--ghost btn--sm camps__ftoggle" aria-expanded={filtersOpen} aria-controls="filters" onClick={() => setFiltersOpen((o) => !o)}>
          <span>Filter</span><SlidersHorizontal size={16} aria-hidden="true" />
        </button>
        <div className="selectwrap">
          <label htmlFor="c-sort">Sort by</label>
          <select id="c-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest first</option>
            <option value="participants">Highest participants</option>
          </select>
        </div>
        <button type="button" className="btn btn--solid btn--sm" onClick={openCreate}><span>Create a project</span><Plus size={17} aria-hidden="true" /></button>
      </div>

      <div className="camps__grid">
        <aside id="filters" className="filters" data-open={filtersOpen || undefined} aria-label="Filters" data-lenis-prevent>
          <details open>
            <summary>Ratings <ChevronDown size={16} aria-hidden="true" /></summary>
            <fieldset><legend className="sr">Minimum rating</legend>
              {[0, 5, 4, 3, 2, 1].map((r) => (
                <label key={r} className="check"><input type="radio" name="rating" checked={rating === r} onChange={() => setRating(r)} /> {r === 0 ? "Any rating" : r === 5 ? "5 stars" : `${r} stars and up`}</label>
              ))}
            </fieldset>
          </details>
          <details open>
            <summary>Location <ChevronDown size={16} aria-hidden="true" /></summary>
            <fieldset><legend className="sr">Wilaya</legend>
              {visibleWilayas.map((w) => <label key={w} className="check"><input type="checkbox" checked={locations.includes(w)} onChange={() => toggleLoc(w)} /> {w}</label>)}
              <button type="button" className="linklike" aria-expanded={moreW} onClick={() => setMoreW((m) => !m)}>Show {moreW ? "less" : "more"}</button>
            </fieldset>
          </details>
          <details>
            <summary>Goal <ChevronDown size={16} aria-hidden="true" /></summary>
            <fieldset><legend className="sr">Minimum goal</legend>
              {[[0, "Any size"], [100, "100+ trees"], [500, "500+ trees"], [1000, "1000+ trees"]].map(([v, l]) => (
                <label key={v} className="check"><input type="radio" name="goal" checked={goal === v} onChange={() => setGoal(v as number)} /> {l}</label>
              ))}
            </fieldset>
          </details>
          <details>
            <summary>Participants <ChevronDown size={16} aria-hidden="true" /></summary>
            <fieldset><legend className="sr">Participants</legend>
              {[["", "Any"], ["small", "1 to 10 people"], ["medium", "11 to 50 people"], ["large", "50+ people"]].map(([v, l]) => (
                <label key={v} className="check"><input type="radio" name="band" checked={band === v} onChange={() => setBand(v)} /> {l}</label>
              ))}
            </fieldset>
          </details>
          {active ? <button type="button" className="linklike" onClick={clear}>Clear all filters</button> : null}
        </aside>

        <div>
          <p className="camps__count" role="status">{list.length} {list.length === 1 ? "campaign" : "campaigns"}</p>
          {list.length === 0 ? (
            <div className="panel panel--center">
              <h2 className="display display--sm">Nothing growing here yet.</h2>
              <button type="button" className="btn btn--solid" onClick={clear}><span>Clear filters</span></button>
            </div>
          ) : (
            <ul className="camps__list">
              {created.map((c, i) => <Card key={c.id} c={c} index={i + 40} pending />)}
              {list.map((c) => <Card key={c.id} c={c} index={CAMPAIGNS.indexOf(c)} />)}
            </ul>
          )}
        </div>
      </div>

      <CreateDialog dialog={dialog} />
    </div>
  );
}

function CreateDialog({ dialog }: { dialog: React.RefObject<HTMLDialogElement | null> }) {
  const empty = { name: "", goal: "", area: "", location: "", wilaya: "", start: "", participants: "5", description: "" };
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const created = useApp((s) => s.created);
  useEffect(() => { /* keep the form fresh between openings */ }, []);
  const close = () => dialog.current?.close();
  const bind = (k: keyof typeof empty) => ({
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value }),
    ...(errors[k] ? { "aria-invalid": true, "aria-describedby": `n-${k}-err` } : {}),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = "Give your project a name.";
    if (!(Number(v.goal) >= 30)) errs.goal = "The goal must be at least 30 trees.";
    if (!(Number(v.area) >= 1)) errs.area = "The area must be at least 1 hectare.";
    if (!v.location.trim()) errs.location = "Say where it will happen.";
    if (!v.wilaya) errs.wilaya = "Choose a wilaya.";
    if (!v.start) errs.start = "Choose a start date.";
    if (!(Number(v.participants) >= 5)) errs.participants = "A project needs at least 5 participants.";
    if (!v.description.trim()) errs.description = "Add a brief description.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { document.getElementById(`n-${first}`)?.focus(); return; }
    const project: Campaign = {
      id: `mine-${Date.now()}`, name: v.name.trim(), association: "Your request", wilaya: v.wilaya, location: v.location.trim(), goal: Number(v.goal), planted: 0,
      participants: Number(v.participants), start: v.start, end: v.start, rating: 0, species: [], area: Number(v.area), description: v.description.trim(), relevance: 100,
    };
    setState({ created: [project, ...created] });
    setV(empty);
    close();
    toast("Request sent. It will appear once it is reviewed.");
  };

  return (
    <dialog ref={dialog} className="modal" aria-labelledby="create-title" onClose={() => window.__lenis?.start()} data-lenis-prevent>
      <header>
        <h2 id="create-title" className="display display--sm">Create a new project</h2>
        <button type="button" className="iconbtn" onClick={close} aria-label="Close"><X aria-hidden="true" /></button>
      </header>
      <form className="form" onSubmit={submit} noValidate>
        <Field id="n-name" label="Project name" error={errors.name}><input id="n-name" {...bind("name")} /></Field>
        <div className="form__two">
          <Field id="n-goal" label="Goal (number of trees)" error={errors.goal}><input id="n-goal" type="number" min={30} inputMode="numeric" {...bind("goal")} /></Field>
          <Field id="n-area" label="Approximate area (hectares)" error={errors.area}><input id="n-area" type="number" min={1} inputMode="numeric" {...bind("area")} /></Field>
        </div>
        <div className="form__two">
          <Field id="n-location" label="Location" error={errors.location}><input id="n-location" {...bind("location")} /></Field>
          <Field id="n-wilaya" label="Wilaya" error={errors.wilaya}>
            <select id="n-wilaya" {...bind("wilaya")}>
              <option value="" disabled>Select wilaya</option>
              {WILAYAS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
        </div>
        <div className="form__two">
          <Field id="n-start" label="Start date" error={errors.start}><input id="n-start" type="date" {...bind("start")} /></Field>
          <Field id="n-participants" label="Current participants" error={errors.participants}><input id="n-participants" type="number" min={5} inputMode="numeric" {...bind("participants")} /></Field>
        </div>
        <Field id="n-description" label="Description" error={errors.description}><textarea id="n-description" {...bind("description")} /></Field>
        <button type="submit" className="btn btn--solid form__submit"><span>Submit</span></button>
      </form>
    </dialog>
  );
}

export function JoinPanel({ id }: { id: string }) {
  const c = CAMPAIGNS.find((x) => x.id === id)!;
  const joined = useApp((s) => s.joined.includes(id));
  const join = useJoin();
  return (
    <button type="button" className={`btn ${joined ? "btn--ghost" : "btn--solid"}`} aria-pressed={joined} onClick={() => join(c)}>
      <span>{joined ? "Leave this campaign" : "Join this campaign"}</span>
    </button>
  );
}
