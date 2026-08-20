import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "../data/links";

const MAX_INTENSITY = 1;
const BUILD_PER_SEC = 1.7;
const DECAY_PER_SEC = 2.4;
const STILL_MS = 50;
const TRAIL_MAX = 64;
const TRAIL_SPACING = 6;
const TRAIL_FADE_MOVE = 0.85;
const TRAIL_FADE_STILL = 2.4;
const FOLLOW_OPEN = 18;
const FOLLOW_RESTRAINED = 5.5;
const PAD = 10;

type TrailPoint = { x: number; y: number; life: number };
type Box = { left: number; top: number; right: number; bottom: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function headGradient(i: number) {
  const t = Math.min(1, Math.max(0, i));
  const cr = 255;
  const cg = Math.round(lerp(122, 255, t));
  const cb = Math.round(lerp(26, 255, t));
  const rr = 255;
  const rg = Math.round(lerp(100, 200, t));
  const rb = Math.round(lerp(20, 120, t));

  return {
    core: `rgba(${cr},${cg},${cb},${0.95})`,
    ring: `rgba(${rr},${rg},${rb},${0.55 + t * 0.25})`,
    edge: `rgba(255,${Math.round(lerp(90, 160, t))},${Math.round(lerp(15, 60, t))},${0.2 + t * 0.15})`,
  };
}

function toLocalBox(el: Element, section: DOMRect): Box {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - section.left,
    top: r.top - section.top,
    right: r.right - section.left,
    bottom: r.bottom - section.top,
  };
}

function inside(x: number, y: number, b: Box, pad: number) {
  return x > b.left - pad && x < b.right + pad && y > b.top - pad && y < b.bottom + pad;
}

function nearestEdge(x: number, y: number, b: Box, pad: number) {
  const l = b.left - pad;
  const t = b.top - pad;
  const r = b.right + pad;
  const bot = b.bottom + pad;
  const dl = x - l;
  const dr = r - x;
  const dt = y - t;
  const db = bot - y;
  const m = Math.min(dl, dr, dt, db);
  if (m === dl) return { x: l, y };
  if (m === dr) return { x: r, y };
  if (m === dt) return { x, y: t };
  return { x, y: bot };
}

function restrain(x: number, y: number, boxes: Box[]) {
  let ox = x;
  let oy = y;
  let hit = false;
  for (const b of boxes) {
    if (inside(ox, oy, b, PAD)) {
      const p = nearestEdge(ox, oy, b, PAD);
      ox = p.x;
      oy = p.y;
      hit = true;
    }
  }
  return { x: ox, y: oy, hit };
}

export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);
  const posPx = useRef({ x: 0, y: 0 });
  const targetPx = useRef({ x: 0, y: 0 });
  const lastMoveAt = useRef(0);
  const intensity = useRef(0);
  const active = useRef(false);
  const trail = useRef<TrailPoint[]>([]);
  const raf = useRef(0);
  const spansReady = useRef(false);

  const paintHead = useCallback(() => {
    const el = headRef.current;
    if (!el) return;
    const i = intensity.current;
    const { core, ring, edge } = headGradient(i);
    const opacity = active.current || i > 0.02 ? 0.65 + i * 0.35 : 0;

    el.style.opacity = String(opacity);
    el.style.background = `radial-gradient(circle, ${core} 0%, ${core} 18%, ${ring} 42%, ${edge} 62%, transparent 78%)`;
    el.style.transform = `translate3d(${posPx.current.x}px, ${posPx.current.y}px, 0) translate(-50%, -50%)`;
  }, []);

  const paintTrail = useCallback(() => {
    const layer = trailLayerRef.current;
    if (!layer) return;
    if (!spansReady.current) {
      layer.replaceChildren();
      for (let i = 0; i < TRAIL_MAX; i++) {
        const span = document.createElement("span");
        span.style.opacity = "0";
        layer.appendChild(span);
      }
      spansReady.current = true;
    }

    const points = trail.current;
    const n = points.length;
    const kids = layer.children;
    for (let i = 0; i < TRAIL_MAX; i++) {
      const el = kids[i] as HTMLSpanElement | undefined;
      if (!el) continue;
      const p = points[i];
      if (!p) {
        el.style.opacity = "0";
        continue;
      }
      const t = n <= 1 ? 1 : i / (n - 1);
      const size = 30 + t * 38;
      el.style.opacity = String(p.life * (0.18 + t * 0.48));
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.transform = `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%)`;
    }
  }, []);

  const pushTrail = (x: number, y: number) => {
    const points = trail.current;
    const last = points[points.length - 1];

    if (!last) {
      points.push({ x, y, life: 1 });
      return;
    }

    const dx = x - last.x;
    const dy = y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < TRAIL_SPACING * 0.4) return;

    const steps = Math.max(1, Math.floor(dist / TRAIL_SPACING));
    for (let s = 1; s <= steps; s++) {
      const u = s / steps;
      points.push({ x: last.x + dx * u, y: last.y + dy * u, life: 1 });
    }
    while (points.length > TRAIL_MAX) points.shift();
  };

  useEffect(() => {
    if (reduce) return;

    const section = sectionRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      const start = { x: rect.width * 0.55, y: rect.height * 0.4 };
      posPx.current = start;
      targetPx.current = start;
    }

    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      const sectionEl = sectionRef.current;
      const boxes: Box[] = [];
      if (sectionEl) {
        const sRect = sectionEl.getBoundingClientRect();
        if (displayRef.current) boxes.push(toLocalBox(displayRef.current, sRect));
        ctaRef.current?.querySelectorAll("a").forEach((el) => {
          boxes.push(toLocalBox(el, sRect));
        });
      }

      const clamped = restrain(targetPx.current.x, targetPx.current.y, boxes);
      const follow = clamped.hit ? FOLLOW_RESTRAINED : FOLLOW_OPEN;
      const k = 1 - Math.exp(-follow * dt);
      posPx.current = {
        x: lerp(posPx.current.x, clamped.x, k),
        y: lerp(posPx.current.y, clamped.y, k),
      };

      if (active.current) pushTrail(posPx.current.x, posPx.current.y);

      const isStill = active.current && now - lastMoveAt.current >= STILL_MS;
      if (isStill) {
        intensity.current = Math.min(MAX_INTENSITY, intensity.current + BUILD_PER_SEC * dt);
      } else {
        const floor = active.current ? 0.15 : 0;
        intensity.current = Math.max(floor, intensity.current - DECAY_PER_SEC * dt);
      }

      const fadeRate = isStill || clamped.hit ? TRAIL_FADE_STILL : TRAIL_FADE_MOVE;
      const next: TrailPoint[] = [];
      for (const p of trail.current) {
        const life = p.life - fadeRate * dt;
        if (life > 0.02) next.push({ x: p.x, y: p.y, life });
      }
      trail.current = next;

      paintHead();
      paintTrail();
      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [reduce, paintHead, paintTrail]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduce) return;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetPx.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      active.current = true;
      lastMoveAt.current = performance.now();
    },
    [reduce],
  );

  const onPointerLeave = useCallback(() => {
    active.current = false;
  }, []);

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16, scale: 0.97 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.5, ease: "easeOut" as const, delay },
        };

  return (
    <section
      ref={sectionRef}
      className="hero-stage relative flex min-h-screen items-center overflow-hidden pt-20"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero-gradient absolute inset-0 -z-10" aria-hidden />
      <div className="hero-illumination" aria-hidden />
      <div className="hero-vignette" aria-hidden />
      <div className="hero-grille" aria-hidden />
      <div className="hero-bezel" aria-hidden />
      <div className="hero-wash" aria-hidden />
      <div className="hero-grain" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* Trail (orange only) — under the head */}
        <div ref={trailLayerRef} className="hero-trail-layer" />
        {/* Head (orange → bright white on dwell) — on top */}
        <div ref={headRef} className="hero-pointer-glow" style={{ opacity: 0 }} />
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 70%, var(--bg-base) 100%)",
        }}
        aria-hidden
      />

      <div className="section-shell relative flex flex-col items-center text-center">
        <motion.div ref={displayRef} className="hero-display" {...fade(0)}>
          <span className="hero-handle-pill mb-5 inline-flex items-center self-start rounded-full px-3 py-[3px] font-segment text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs">
            {profile.handle}
          </span>
          <h1 className="hero-name font-segment text-[32px] font-bold uppercase leading-[1.12] tracking-[0.12em] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.75rem]">
            Gautam Menon
          </h1>
          <div className="hero-ticker mt-8" aria-label={profile.taglineLines.map((l) => `${l.prefix}${l.accent}${l.rest}`).join(" ")}>
            <div className="hero-ticker-track">
              {[0, 1].map((copy) => (
                <p key={copy} className="hero-ticker-copy">
                  {profile.taglineLines.map((line, i) => (
                    <span key={line.accent + line.rest}>
                      {i > 0 && <span className="hero-ticker-sep"> · </span>}
                      {`${line.prefix}${line.accent}${line.rest}`}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div ref={ctaRef} className="mt-10 flex flex-wrap items-center justify-center gap-4" {...fade(0.35)}>
          <a href="/#contact" className="telltale telltale-red">
            Get in Touch
          </a>
          <a href="/#work" className="telltale telltale-amber gap-2">
            See My Work
            <ArrowDown size={16} strokeWidth={2.25} />
          </a>
        </motion.div>
        <motion.p className="hero-display-meta mt-12 text-sm" {...fade(0.5)}>
          {profile.location}
          <span className="mx-2">·</span>
          {profile.study}
          <span className="mx-2">·</span>
          {profile.years}
        </motion.p>
      </div>
    </section>
  );
}
