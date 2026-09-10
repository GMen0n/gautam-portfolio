import { useEffect, useRef, type MutableRefObject } from "react";

export type PointerState = { x: number; y: number; inside: boolean };

type Dot = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse: number;
  phase: number;
};

const GAP = 20;
const DOT_SIZE = 1.15;
const MOUSE_RADIUS = 140;
const PUSH = 28;
const RETURN = 18;
const DAMP = 0.86;
const TWINKLE = 0.55;
const DPR_CAP = 1.5;
const REST = "rgba(240, 178, 58, 0.22)";
const LIT = "rgba(255, 193, 77, 0.95)";

type Props = {
  pointer?: MutableRefObject<PointerState>;
  scrollSpeed?: number;
};

function lerpColor(t: number) {
  const a = 0.22 + t * 0.73;
  const r = Math.round(240 + 15 * t);
  const g = Math.round(178 + 15 * t);
  const b = Math.round(58 + 19 * t);
  return `rgba(${r},${g},${b},${a})`;
}

export default function DotDistortionField({ pointer, scrollSpeed = 1.0 }: Props = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackPointer = useRef<PointerState>({ x: -1000, y: -1000, inside: false });
  const activePointer = pointer ?? fallbackPointer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let running = false;
    let scrollY = window.scrollY || 0;

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight,
      );
      dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots.length = 0;
      cols = Math.ceil(width / GAP) + 1;
      rows = Math.ceil(docHeight / GAP) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ox = col * GAP + (row % 2 === 0 ? 0 : GAP * 0.5);
          const oy = row * GAP;
          dots.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            pulse: 0.15 + Math.random() * 0.55,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = REST;
      const scrollOffset = scrollY * scrollSpeed;
      const rowStart = Math.max(0, Math.floor((scrollOffset - GAP) / GAP));
      const rowEnd = Math.min(rows, Math.ceil((scrollOffset + height + GAP) / GAP));

      for (let row = rowStart; row < rowEnd; row++) {
        const startIdx = row * cols;
        const endIdx = Math.min(dots.length, startIdx + cols);
        for (let i = startIdx; i < endIdx; i++) {
          const d = dots[i];
          const screenY = d.oy - scrollOffset;
          ctx.beginPath();
          ctx.arc(d.ox, screenY, DOT_SIZE, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const mouse = activePointer.current;
      const scrollOffset = scrollY * scrollSpeed;

      ctx.clearRect(0, 0, width, height);

      const rowStart = Math.max(0, Math.floor((scrollOffset - GAP * 2) / GAP));
      const rowEnd = Math.min(rows, Math.ceil((scrollOffset + height + GAP * 2) / GAP));

      for (let row = rowStart; row < rowEnd; row++) {
        const startIdx = row * cols;
        const endIdx = Math.min(dots.length, startIdx + cols);

        for (let i = startIdx; i < endIdx; i++) {
          const d = dots[i];
          d.phase += dt * TWINKLE * (0.6 + d.pulse);
          const twinkle = 0.5 + 0.5 * Math.sin(d.phase);
          const screenY = d.y - scrollOffset;

          if (mouse.inside) {
            const dx = d.x - mouse.x;
            const dy = screenY - mouse.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            if (dist < MOUSE_RADIUS) {
              const falloff = 1 - dist / MOUSE_RADIUS;
              const f = falloff * falloff * PUSH;
              d.vx += (dx / dist) * f * dt;
              d.vy += (dy / dist) * f * dt;
            }
          }

          d.vx += (d.ox - d.x) * RETURN * dt;
          d.vy += (d.oy - d.y) * RETURN * dt;
          d.vx *= DAMP;
          d.vy *= DAMP;
          d.x += d.vx * dt * 60;
          d.y += d.vy * dt * 60;

          let near = 0;
          if (mouse.inside) {
            const md = Math.hypot(d.x - mouse.x, screenY - mouse.y);
            near = Math.max(0, 1 - md / MOUSE_RADIUS);
          }
          const bright = Math.min(1, 0.18 + twinkle * d.pulse * 0.45 + near * 0.7);
          ctx.fillStyle = bright > 0.55 ? LIT : lerpColor(bright);
          if (bright > 0.72) {
            ctx.shadowColor = LIT;
            ctx.shadowBlur = 6 * bright;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.beginPath();
          ctx.arc(d.x, screenY, DOT_SIZE + near * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      if (running && visible && !reduce) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    build();
    if (reduce) {
      drawStatic();
    } else {
      start();
    }

    const onResize = () => {
      build();
      if (reduce) drawStatic();
    };
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) drawStatic();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (reduce) return;
        if (visible) start();
        else stop();
      },
      { rootMargin: "40px" },
    );
    io.observe(canvas);

    const handlePointerMove = (e: PointerEvent) => {
      if (reduce) return;
      fallbackPointer.current = {
        x: e.clientX,
        y: e.clientY,
        inside: true,
      };
    };

    const handlePointerLeave = () => {
      fallbackPointer.current = {
        x: -1000,
        y: -1000,
        inside: false,
      };
    };

    if (!pointer) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      document.addEventListener("mouseleave", handlePointerLeave);
    }

    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      io.disconnect();
      if (!pointer) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("mouseleave", handlePointerLeave);
      }
    };
  }, [pointer, activePointer, scrollSpeed]);

  return <canvas ref={canvasRef} className="hero-dots" aria-hidden />;
}
