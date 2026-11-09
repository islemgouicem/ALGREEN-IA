"use client";

import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudRain, CloudSnow, Droplet, Droplets, LoaderCircle, Search, Sun, Wind } from "lucide-react";
import { IRRIGATION } from "@/lib/data";
import { setState, toast, useApp } from "@/lib/store";

interface Weather {
  city: string; temp: number; humidity: number; wind: number; code: number; rain3: number; et3: number; sample?: boolean;
}

const SAMPLE: Weather = { city: "Algiers", temp: 19, humidity: 64, wind: 14, code: 2, rain3: 2, et3: 7.4, sample: true };

async function fetchWeather(place: string): Promise<Weather | null> {
  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`).then((r) => r.json());
  const hit = geo.results?.[0];
  if (!hit) return null;
  const params = "current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=precipitation_sum,et0_fao_evapotranspiration&forecast_days=3&timezone=auto";
  const f = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&${params}`).then((r) => r.json());
  const sum = (a: number[]) => a.reduce((x, y) => x + (y ?? 0), 0);
  return {
    city: hit.name, temp: Math.round(f.current.temperature_2m), humidity: f.current.relative_humidity_2m, wind: Math.round(f.current.wind_speed_10m),
    code: f.current.weather_code, rain3: sum(f.daily.precipitation_sum), et3: sum(f.daily.et0_fao_evapotranspiration),
  };
}

function skyOf(code: number) {
  if (code === 0 || code === 1) return { Icon: Sun, label: "Clear" };
  if (code <= 3) return { Icon: Cloud, label: "Clouds" };
  if (code <= 48) return { Icon: CloudFog, label: "Mist" };
  if (code <= 57) return { Icon: CloudDrizzle, label: "Drizzle" };
  if (code <= 67 || (code >= 80 && code <= 82)) return { Icon: CloudRain, label: "Rain" };
  if (code <= 77 || code === 85 || code === 86) return { Icon: CloudSnow, label: "Snow" };
  return { Icon: CloudRain, label: "Storm" };
}

/** Rain-aware advice from the 3-day water balance. Treated as an estimate, not a measurement. */
function advise(w: Weather) {
  const deficit = Math.max(0, w.et3 * 0.7 - w.rain3);
  const litres = Math.round(deficit * 2);
  if (w.rain3 >= 5) return { title: "Skip watering", body: `About ${w.rain3.toFixed(1)} mm of rain is forecast over the next three days. Let the sky do it.`, litres: 0 };
  if (deficit < 3) return { title: "Light watering", body: "Low demand from the air right now. A small top-up is enough for young trees.", litres };
  return { title: "Water young trees", body: `Little rain is coming, and evaporation is high at ${w.et3.toFixed(1)} mm over three days.`, litres };
}

const STATE_META = {
  ok: { label: "Hydrated", cls: "ok" },
  warn: { label: "Thirsty", cls: "warn" },
  bad: { label: "Critically dehydrated", cls: "bad" },
} as const;
type StateKey = keyof typeof STATE_META;

const stateOf = (days: number, interval: number): StateKey => (days <= interval ? "ok" : days <= interval * 1.5 ? "warn" : "bad");
const worst = (a: StateKey[]): StateKey => (a.includes("bad") ? "bad" : a.includes("warn") ? "warn" : "ok");

export function IrrigationView() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [wilaya, setWilaya] = useState("");
  const [state, setStateFilter] = useState<"" | StateKey>("");
  const [dates, setDates] = useState<Record<string, string>>({});
  const irrigated = useApp((s) => s.irrigated);

  const load = async (place: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const w = await fetchWeather(place);
      if (w) setWeather(w);
      else setNotFound(true);
    } catch {
      setWeather({ ...SAMPLE, city: place });
    }
    setLoading(false);
  };

  useEffect(() => { load("Algiers"); }, []);

  const items = useMemo(() => IRRIGATION.map((c) => {
    const ts = irrigated[c.id];
    const days = ts ? Math.floor((Date.now() - ts) / 86400000) : c.lastIrrigatedDaysAgo;
    const trees = c.trees.map((t) => ({ ...t, state: stateOf(days, t.interval) }));
    return { ...c, days, trees, state: worst(trees.map((t) => t.state)), total: trees.reduce((a, t) => a + t.planted, 0) };
  }), [irrigated]);

  const shown = items.filter((c) => (!wilaya || c.wilaya === wilaya) && (!state || c.state === state));
  const wilayas = [...new Set(IRRIGATION.map((c) => c.wilaya))].sort();
  const sky = weather ? skyOf(weather.code) : null;
  const advice = weather ? advise(weather) : null;

  return (
    <div className="wrap irr">
      <section className="weather" aria-labelledby="w-title">
        <div className="weather__main">
          <h2 id="w-title" className="eyebrow">Today&rsquo;s weather</h2>
          <form className="search" onSubmit={(e) => { e.preventDefault(); if (input.trim()) load(input.trim()); }}>
            <label className="sr" htmlFor="w-q">Enter a location</label>
            <input id="w-q" placeholder="Enter a location" spellCheck={false} value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" className="iconbtn" aria-label="Search location"><Search size={19} aria-hidden="true" /></button>
          </form>
          {notFound ? <p className="field__err" role="alert">Invalid location. Try the name of a city or wilaya.</p> : null}
          <div aria-live="polite" aria-busy={loading}>
            {loading && !weather ? <p className="weather__load"><LoaderCircle className="spin" aria-hidden="true" /> Reading the sky</p> : null}
            {weather && sky ? (
              <div className="weather__now">
                <sky.Icon className="weather__icon" aria-hidden="true" />
                <div>
                  <p className="weather__temp">{weather.temp}°C</p>
                  <p className="weather__city">{weather.city} <span>{sky.label}</span></p>
                </div>
                <dl>
                  <div><dt><Droplets size={17} aria-hidden="true" /> Humidity</dt><dd>{weather.humidity}%</dd></div>
                  <div><dt><Wind size={17} aria-hidden="true" /> Wind speed</dt><dd>{weather.wind} km/h</dd></div>
                </dl>
              </div>
            ) : null}
            {weather?.sample ? <p className="note">Live weather is unavailable, so this is sample data.</p> : null}
          </div>
        </div>
        {advice ? (
          <div className="weather__advice">
            <h2 className="eyebrow">Recommendation for {weather?.city}</h2>
            <p className="display display--md">{advice.title}</p>
            <p>{advice.body}</p>
            {advice.litres > 0 ? <p className="weather__l"><b>{advice.litres} L</b> estimated per young tree</p> : null}
            <p className="note">Estimated from forecast rainfall and evapotranspiration. Open-Meteo data.</p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="c-title">
        <div className="irr__head">
          <h2 id="c-title" className="display display--sm">Plantations</h2>
          <div className="row">
            <div className="selectwrap">
              <label htmlFor="f-w">Wilaya</label>
              <select id="f-w" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                <option value="">All wilayas</option>
                {wilayas.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="selectwrap">
              <label htmlFor="f-s">State</label>
              <select id="f-s" value={state} onChange={(e) => setStateFilter(e.target.value as "" | StateKey)}>
                <option value="">Any state</option>
                <option value="bad">Critically dehydrated</option>
                <option value="warn">Thirsty</option>
                <option value="ok">Hydrated</option>
              </select>
            </div>
          </div>
        </div>

        <p className="sr" role="status">{shown.length} plantations shown</p>
        {shown.length === 0 ? <p className="panel panel--center">No plantation matches those filters.</p> : null}
        <ul className="irr__grid">
          {shown.map((c) => (
            <li key={c.id} className={`icard icard--${STATE_META[c.state].cls}`}>
              <p className="icard__state"><Droplet size={16} aria-hidden="true" fill="currentColor" /> {STATE_META[c.state].label}</p>
              <h3>{c.name}</h3>
              <dl>
                <div><dt>Location</dt><dd>{c.wilaya}</dd></div>
                <div><dt>Last irrigation</dt><dd>{c.days === 0 ? "Today" : `${c.days} days ago`}</dd></div>
                <div><dt>Total trees</dt><dd>{c.total.toLocaleString("en-US")}</dd></div>
              </dl>
              <ul className="icard__trees">
                {c.trees.map((t) => (
                  <li key={t.name}>
                    <Droplet size={16} aria-hidden="true" className={`drop drop--${STATE_META[t.state].cls}`} fill="currentColor" />
                    <span>{t.planted.toLocaleString("en-US")} {t.name}</span>
                    <small>{STATE_META[t.state].label}</small>
                  </li>
                ))}
              </ul>
              {dates[c.id] ? <p className="icard__date" role="status">Next watering by <b>{dates[c.id]}</b></p> : null}
              <div className="row">
                <button type="button" className="btn btn--solid btn--sm" onClick={() => { setState({ irrigated: { ...irrigated, [c.id]: Date.now() } }); toast(`${c.name} successfully irrigated.`); }}>
                  <span>Irrigate</span>
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
                  const interval = Math.min(...c.trees.map((t) => t.interval));
                  const d = new Date(Date.now() + Math.max(0, interval - c.days) * 86400000);
                  setDates({ ...dates, [c.id]: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) });
                }}>
                  <span>Find date</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
