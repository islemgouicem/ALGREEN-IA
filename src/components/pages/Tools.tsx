"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Field, RingArt } from "@/components/ui";
import { RECOMMENDABLE } from "@/lib/data";

export function Calculator() {
  const [trees, setTrees] = useState(25);
  const [years, setYears] = useState(20);
  const [survival, setSurvival] = useState(70);
  const kg = useMemo(() => {
    // Young trees capture little, so uptake ramps over the first decade to about 21 kg a year
    let total = 0;
    for (let y = 1; y <= years; y++) total += 21 * Math.min(1, y / 10);
    return Math.round(total * Math.max(0, trees) * (survival / 100));
  }, [trees, years, survival]);
  const output = kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`;
  return (
    <div className="calc">
      <form className="calc__form" onSubmit={(e) => e.preventDefault()}>
        <Field id="calc-trees" label="Trees you plant">
          <input id="calc-trees" type="number" min={0} max={100000} inputMode="numeric" value={trees} onChange={(e) => setTrees(Math.min(100000, Number(e.target.value) || 0))} />
        </Field>
        <div className="slider">
          <label htmlFor="calc-years">Years of growth <b>{years}</b></label>
          <input id="calc-years" type="range" min={1} max={60} value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>
        <div className="slider">
          <label htmlFor="calc-surv">Survival rate <b>{survival}%</b></label>
          <input id="calc-surv" type="range" min={10} max={100} value={survival} onChange={(e) => setSurvival(Number(e.target.value))} />
        </div>
      </form>
      <output className="calc__out" htmlFor="calc-trees calc-years calc-surv">
        <span className="eyebrow">Estimated CO₂ captured</span>
        <b>{output}</b>
        <span>About {Math.round(kg / 0.12).toLocaleString("en-US")} km of car travel avoided.</span>
        <small>Rough estimate. Assumes about 21 kg per mature tree each year, and about 0.12 kg per car kilometre.</small>
      </output>
    </div>
  );
}

const QUESTIONS = [
  { key: "region", title: "Where is the land?", options: [["coast", "Mediterranean coast"], ["tell", "Tell and plains"], ["mountain", "High mountains"], ["steppe", "Steppe and high plateaus"], ["sahara", "Sahara or oasis"]] },
  { key: "soil", title: "What is the soil like?", options: [["sandy", "Sandy"], ["loam", "Rich loam"], ["clay", "Heavy clay"], ["rocky", "Stony or rocky"]] },
  { key: "water", title: "How much water can it get?", options: [["rare", "Almost none after planting"], ["seasonal", "Rain, with some help in summer"], ["regular", "Regular watering"]] },
  { key: "purpose", title: "What should the tree do?", options: [["restoration", "Restore the land"], ["shade", "Give shade"], ["windbreak", "Block wind and sand"], ["fruit", "Produce a harvest"], ["ornamental", "Look beautiful"]] },
] as const;

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= QUESTIONS.length;

  const results = useMemo(() => {
    if (!done) return [];
    return RECOMMENDABLE.map((t) => {
      let score = 0;
      if (t.regions.includes(answers.region)) score += 5;
      if (t.soils.includes(answers.soil)) score += 2;
      if (t.water.includes(answers.water)) score += 3;
      if (t.purposes.includes(answers.purpose)) score += 2;
      return { ...t, score };
    }).filter((t) => t.regions.includes(answers.region)).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [done, answers]);

  if (done) {
    return (
      <div className="quiz">
        <h2 className="display display--md" tabIndex={-1} ref={(el) => el?.focus()}>Your trees</h2>
        <ol className="quiz__results">
          {results.map((t, i) => (
            <li key={t.name}>
              <RingArt seed={i * 23 + 9} count={14} className="quiz__ring" />
              <p className="eyebrow">Match {Math.round((t.score / 12) * 100)}%</p>
              <h3>{t.name}</h3>
              <p className="latin">{t.latin}</p>
              <p>{t.why}</p>
            </li>
          ))}
        </ol>
        <div className="row">
          <Link className="btn btn--solid" href="/campaigns"><span>Find a campaign</span></Link>
          <button type="button" className="btn btn--ghost" onClick={() => { setStep(0); setAnswers({}); }}><span>Start again</span><RotateCcw size={17} aria-hidden="true" /></button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="quiz">
      <div className="quiz__prog" role="img" aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}>
        {QUESTIONS.map((x, i) => <i key={x.key} data-on={i <= step || undefined} />)}
      </div>
      <fieldset key={q.key}>
        <legend className="display display--md">{q.title}</legend>
        <div className="quiz__opts">
          {q.options.map(([value, label]) => (
            <button key={value} type="button" className="quiz__opt" onClick={() => { setAnswers({ ...answers, [q.key]: value }); setStep(step + 1); }}>{label}</button>
          ))}
        </div>
      </fieldset>
      {step > 0 ? <button type="button" className="linklike quiz__back" onClick={() => setStep(step - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous question</button> : null}
    </div>
  );
}
