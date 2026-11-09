"use client";

import { useState } from "react";
import { Droplets, Play, Share2, Sprout, Trophy } from "lucide-react";
import { motionAllowed } from "@/lib/gsap";
import { setState, toast, useApp } from "@/lib/store";
import type { PlantDetail } from "./WorldStage";

export function PlantControls() {
  const planted = useApp((s) => s.planted);

  const plant = (x: number | null, y: number | null) => {
    const detail: PlantDetail = { x, y, hit: true };
    window.dispatchEvent(new CustomEvent("world:plant", { detail }));
    if (detail.hit) setState({ planted: planted + 1 });
  };

  const onZone = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!motionAllowed()) return plant(null, null);
    plant((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };

  return (
    <>
      <div className="plant__zone" onPointerUp={onZone} data-cursor-label="Plant" aria-hidden="true" />
      <div className="plant__panel">
        <button type="button" className="btn btn--leaf" onClick={() => plant(null, null)}>
          <span>Plant a tree</span><Sprout size={18} aria-hidden="true" />
        </button>
        <p aria-live="polite">
          {planted === 0 ? "Or tap the ground anywhere." : `You have planted ${planted} ${planted === 1 ? "tree" : "trees"} in this forest.`}
        </p>
        {planted > 0 ? (
          <ul className="plant__row" aria-hidden="true">
            {Array.from({ length: Math.min(planted, 24) }).map((_, i) => <li key={i}><Sprout size={18} /></li>)}
          </ul>
        ) : null}
      </div>
    </>
  );
}

export function VideoFacade() {
  const [on, setOn] = useState(false);
  return (
    <div className="video">
      {on ? (
        <iframe
          src="https://www.youtube-nocookie.com/embed/5yqogs7va_k?autoplay=1"
          title="Why trees matter"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} data-cursor-label="Play">
          <Play aria-hidden="true" />
          <span>Play the film. Loads from YouTube.</span>
        </button>
      )}
    </div>
  );
}

export function Challenge() {
  const joined = useApp((s) => s.challenge);
  return (
    <div className="challenge__stats">
      <dl>
        <div><dt>of users are participating</dt><dd>{joined ? "46%" : "45%"}</dd></div>
        <div><dt>water saved so far</dt><dd>1,000 L</dd></div>
      </dl>
      <div className="challenge__act">
        <button type="button" className="btn btn--solid" aria-pressed={joined} onClick={() => {
          setState({ challenge: !joined });
          toast(joined ? "You left this month's challenge." : "You joined. Every litre counts.");
        }}>
          <span>{joined ? "Leave the challenge" : "Join the challenge"}</span>
          {joined ? <Trophy size={18} aria-hidden="true" /> : <Droplets size={18} aria-hidden="true" />}
        </button>
        <button type="button" className="btn btn--ghost" onClick={async () => {
          const data = { title: "Algreenia water challenge", text: "I am conserving water with Algreenia this month.", url: location.origin };
          try {
            if (navigator.share) await navigator.share(data);
            else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); toast("Copied. Paste it anywhere."); }
          } catch { /* user dismissed the share sheet */ }
        }}>
          <span>Share your progress</span><Share2 size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
