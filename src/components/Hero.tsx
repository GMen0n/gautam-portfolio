import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "../data/links";

const MAX_INTENSITY = 1;
const BUILD_PER_SEC = 1.7;
const DECAY_PER_SEC = 2.4;
const STILL_MS = 50;
const TRAIL_MAX = 48;
const TRAIL_SPACING = 10;
const TRAIL_FADE_MOVE = 1.1;
const TRAIL_FADE_STILL = 3.2; // clear trail under cursor when dwelling

type TrailPoint = { x: number; y: number; life: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Head glow only: orange → warm yellow → bright white.
 * Always bright in the CENTER (never dark mid stops — those looked muddy/green after blur).
 */
function headGradient(i: number) {
  const t = Math.min(1, Math.max(0, i));
  // core: #FF7A1A → #FFE566 → #FFFFFF
  const cr = 255;
  const cg = Math.round(lerp(122, 255, t));
  const cb = Math.round(lerp(26, 255, t));
  // ring: always warmer orange, softer
  const rr = 255;
  const rg = Math.round(lerp(100, 200, t));
  const rb = Math.round(lerp(20, 120, t));

  return {
    core: `rgba(${cr},${cg},${cb},${0.95})`,
    ring: `rgba(${rr},${rg},${rb},${0.55 + t * 0.25})`,
    edge: `rgba(255,${Math.round(lerp(90, 160, t))},${Math.round(lerp(15, 60, t))},${0.2 + t * 0.15})`,
  };
}

export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);
  const posPx = useRef({ x: 0, y: 0 });
  const lastMoveAt = useRef(0);
  const intensity = useRef(0);
  const active = useRef(false);
  const trail = useRef<TrailPoint[]>([]);
  const raf = useRef(0);

  const paintHead = useCallback(() => {
    const el = headRef.current;
    if (!el) return;
    const i = intensity.current;
    const { core, ring, edge } = headGradient(i);
    const opacity = active.current || i > 0.02 ? 0.65 + i * 0.35 : 0;

    el.style.opacity = String(opacity);
    // layered: white/yellow core sits ABOVE trail (separate element, higher z)
    el.style.background = `radial-gradient(circle, ${core} 0%, ${core} 18%, ${ring} 42%, ${edge} 62%, transparent 78%)`;
    el.style.transform = `translate3d(${posPx.current.x}px, ${posPx.current.y}px, 0) translate(-50%, -50%)`;
  }, []);

  const paintTrail = useCallback(() => {
    const layer = trailLayerRef.current;
    if (!layer) return;

    // Trail is orange-only — never white — and stays under the head visually
    const points = trail.current;
    const n = points.length;
    let html = "";
    for (let i = 0; i < n; i++) {
      const p = points[i];
      const t = n <= 1 ? 1 : i / (n - 1);
      const size = 34 + t * 40;
      const opacity = p.life * (0.2 + t * 0.45);
      html += `<span style="transform:translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%);width:${size}px;height:${size}px;opacity:${opacity}"></span>`;
    }
    layer.innerHTML = html;
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
    if (dist < TRAIL_SPACING * 0.45) return;

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
      posPx.current = { x: rect.width * 0.55, y: rect.height * 0.4 };
    }

    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      const isStill = active.current && now - lastMoveAt.current >= STILL_MS;

      if (isStill) {
        intensity.current = Math.min(MAX_INTENSITY, intensity.current + BUILD_PER_SEC * dt);
      } else {
        const floor = active.current ? 0.15 : 0;
        intensity.current = Math.max(floor, intensity.current - DECAY_PER_SEC * dt);
      }

      // Trail fades faster while still so it doesn't muddy the white head
      const fadeRate = isStill ? TRAIL_FADE_STILL : TRAIL_FADE_MOVE;
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      posPx.current = { x, y };
      active.current = true;
      lastMoveAt.current = performance.now();
      pushTrail(x, y);
      paintHead();
      paintTrail();
    },
    [reduce, paintHead, paintTrail],
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

      <div className="section-shell relative">
        <motion.p className="mb-6 font-mono text-sm text-text-muted" {...fade(0)}>
          {profile.handle}
        </motion.p>
        <motion.h1
          className="font-display text-[36px] font-bold uppercase leading-[1.05] tracking-[0.1em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          {...fade(0)}
        >
          Gautam Menon
        </motion.h1>
        <div className="mt-8 max-w-2xl space-y-2 text-lg leading-relaxed text-text-secondary md:text-xl">
          {profile.taglineLines.map((line, i) => (
            <motion.p key={line.accent + line.rest} {...fade(0.15 * (i + 1))}>
              {line.prefix}
              <span className="text-accent">{line.accent}</span>
              {line.rest}
            </motion.p>
          ))}
        </div>
        <motion.div className="mt-10 flex flex-wrap gap-3" {...fade(0.5)}>
          <a
            href="/#contact"
            className="cta-glow rounded-full px-6 py-3 text-sm font-medium text-white"
          >
            Get in Touch
          </a>
          <a
            href="/#work"
            className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent/40"
          >
            See My Work
            <ArrowDown size={16} strokeWidth={1.5} />
          </a>
        </motion.div>
        <motion.p className="mt-12 text-sm text-text-muted" {...fade(0.6)}>
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
