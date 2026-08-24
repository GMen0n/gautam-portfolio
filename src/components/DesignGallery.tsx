import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers, Orbit, X } from "lucide-react";
import type { DesignPiece, DesignStack } from "../data/design";
import CircularGallery from "./CircularGallery";

type Props = {
  stacks: DesignStack[];
};

const SHUFFLE_MS = 2800;
const VISIBLE_BACK = 3;
const SIGNAL_MS = 2100;

function TurnSignalIcon({ dir }: { dir: "left" | "right" }) {
  const d =
    dir === "left"
      ? "M14 3.2 L3.2 12 L14 20.8 V16.1 H28.5 V7.9 H14 Z"
      : "M18 3.2 L28.8 12 L18 20.8 V16.1 H3.5 V7.9 H18 Z";
  return (
    <svg viewBox="0 0 32 24" className="h-9 w-12" aria-hidden>
      <path
        d={d}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IndicatorButton({
  dir,
  blinking,
  className,
  onClick,
}: {
  dir: "left" | "right";
  blinking: boolean;
  className: string;
  onClick: (e?: React.MouseEvent) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={`gallery-indicator inline-flex items-center justify-center ${blinking ? "is-blinking" : ""} ${className}`}
      aria-label={dir === "left" ? "Previous image" : "Next image"}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      whileHover={reduce ? undefined : { scale: 1.1 }}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <TurnSignalIcon dir={dir} />
    </motion.button>
  );
}

function StackCard({
  stack,
  onOpen,
}: {
  stack: DesignStack;
  onOpen: (index: number) => void;
}) {
  const { pieces } = stack;
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || pieces.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setFront((i) => (i + 1) % pieces.length);
    }, SHUFFLE_MS);
    return () => window.clearInterval(id);
  }, [paused, pieces.length]);

  const layers = Array.from({ length: Math.min(pieces.length, VISIBLE_BACK + 1) }, (_, depth) => {
    const piece = pieces[(front + depth) % pieces.length];
    const rot = depth === 0 ? -2 : depth % 2 === 0 ? -8 - depth * 2 : 7 + depth * 2;
    const shiftX = depth === 0 ? 0 : depth % 2 === 0 ? -14 - depth * 6 : 14 + depth * 6;
    const shiftY = depth * 8;
    const scale = 1 - depth * 0.05;
    return { piece, depth, rot, shiftX, shiftY, scale };
  });

  const paintOrder = [...layers].reverse();

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        type="button"
        className="relative mx-auto block aspect-[4/5] w-full max-w-[300px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        aria-label={`Open ${stack.label} gallery`}
        onClick={() => onOpen(front)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {paintOrder.map(({ piece, depth, rot, shiftX, shiftY, scale }) => (
          <span
            key={`${stack.id}-${piece.image}-${depth}`}
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-[#2a2426] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out"
            style={{
              zIndex: 10 - depth,
              transform: `translate(${shiftX}px, ${shiftY}px) rotate(${rot}deg) scale(${scale})`,
            }}
          >
            <img
              src={piece.image}
              alt={depth === 0 ? piece.title : ""}
              loading={depth === 0 ? "eager" : "lazy"}
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {depth === 0 && (
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-base/70 via-transparent to-transparent" />
            )}
          </span>
        ))}
      </motion.button>

      <div className="mt-10 text-center">
        <p className="font-mono text-sm tracking-wide text-accent">{stack.label}</p>
        <p className="mt-2 text-sm text-text-secondary">{stack.description}</p>
        <p className="mt-2 font-mono text-xs text-text-muted">
          {front + 1} / {pieces.length} · click to open
        </p>
      </div>
    </motion.div>
  );
}

export default function DesignGallery({ stacks }: Props) {
  const [viewMode, setViewMode] = useState<"ring" | "stacks">("ring");
  const [open, setOpen] = useState(false);
  const [activeStack, setActiveStack] = useState<DesignStack | null>(null);
  const [index, setIndex] = useState(0);
  const [signal, setSignal] = useState<"left" | "right" | null>(null);
  const [blinkNonce, setBlinkNonce] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const signalTimer = useRef(0);
  const reduce = useReducedMotion();

  const allPieces = useMemo(() => stacks.flatMap((s) => s.pieces), [stacks]);
  const activePieces: DesignPiece[] = activeStack?.pieces ?? allPieces;

  const flash = useCallback((side: "left" | "right") => {
    setSignal(side);
    setBlinkNonce((n) => n + 1);
    window.clearTimeout(signalTimer.current);
    signalTimer.current = window.setTimeout(() => setSignal(null), SIGNAL_MS);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveStack(null);
    setSignal(null);
    window.clearTimeout(signalTimer.current);
  }, []);

  const prev = useCallback(() => {
    flash("left");
    setIndex((i) => (i - 1 + activePieces.length) % activePieces.length);
  }, [flash, activePieces.length]);

  const next = useCallback(() => {
    flash("right");
    setIndex((i) => (i + 1) % activePieces.length);
  }, [flash, activePieces.length]);

  useEffect(() => {
    return () => window.clearTimeout(signalTimer.current);
  }, []);

  const openStack = (stack: DesignStack, startIndex: number) => {
    setActiveStack(stack);
    setIndex(startIndex);
    setOpen(true);
  };

  const openPiece = (_piece: DesignPiece, pieceIndex: number) => {
    setActiveStack(null);
    setIndex(pieceIndex % allPieces.length);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  const current = activePieces[index];

  return (
    <div className="mt-8 space-y-12">
      {/* Cockpit Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-cabin-black/60 p-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-dash text-xs font-bold uppercase tracking-[0.14em] transition-all ${
              viewMode === "ring"
                ? "border border-lcd-amber/60 bg-lcd-amber/15 text-lcd-amber-bright shadow-[0_0_16px_rgba(240,178,58,0.25)]"
                : "border border-transparent text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setViewMode("ring")}
          >
            <Orbit size={15} strokeWidth={2} />
            3D Ring Gallery
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-dash text-xs font-bold uppercase tracking-[0.14em] transition-all ${
              viewMode === "stacks"
                ? "border border-lcd-amber/60 bg-lcd-amber/15 text-lcd-amber-bright shadow-[0_0_16px_rgba(240,178,58,0.25)]"
                : "border border-transparent text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => setViewMode("stacks")}
          >
            <Layers size={15} strokeWidth={2} />
            Shuffle Stacks
          </button>
        </div>

        <div className="hidden font-mono text-xs text-text-muted sm:block pr-2">
          {allPieces.length} POSTERS ARCHIVED
        </div>
      </div>

      {/* Main Interactive Showcase */}
      {viewMode === "ring" ? (
        <div className="relative">
          <CircularGallery
            pieces={allPieces}
            count={120}
            radius={400}
            tilt={55}
            itemWidth={48}
            itemHeight={68}
            autoRotate={true}
            autoRotateSpeed={3.2}
            onItemClick={openPiece}
          />
          <div className="mt-6 flex items-center justify-center px-4 text-center">
            <p className="font-mono text-xs tracking-wider text-text-muted">
              ← Drag horizontally to spin 3D ring · Hover card to inspect · Click to expand →
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap justify-center gap-16 py-8">
          {stacks.map((stack) => (
            <StackCard
              key={stack.id}
              stack={stack}
              onOpen={(i) => openStack(stack, i)}
            />
          ))}
        </div>
      )}

      {/* Full Size Modal Lightbox */}
      <AnimatePresence>
        {open && current && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title} — full size`}
            onClick={close}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              type="button"
              className="glass-pill absolute top-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-text-primary"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              whileHover={reduce ? undefined : { scale: 1.1 }}
              whileTap={reduce ? undefined : { scale: 0.92 }}
            >
              <X size={20} strokeWidth={1.5} />
            </motion.button>

            <IndicatorButton
              key={`left-${blinkNonce}`}
              dir="left"
              blinking={signal === "left"}
              className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 sm:inline-flex md:left-8"
              onClick={prev}
            />

            <IndicatorButton
              key={`right-${blinkNonce}`}
              dir="right"
              blinking={signal === "right"}
              className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 sm:inline-flex md:right-8"
              onClick={next}
            />

            <motion.figure
              key={`${current.image}-${index}`}
              className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {current.type === "figma" && current.embedUrl ? (
                <iframe
                  style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  src={`${current.embedUrl}${current.embedUrl.includes("?") ? "&" : "?"}hide-ui=1&scaling=scale-down`}
                  allowFullScreen
                  className="h-[75vh] w-full max-w-[1024px] rounded-lg bg-[#1a1a1c] shadow-2xl sm:h-[82vh]"
                />
              ) : (
                <img
                  src={current.image}
                  alt={current.title}
                  className="max-h-[min(82vh,820px)] w-auto max-w-full rounded-lg border border-white/10 object-contain shadow-2xl"
                />
              )}
              <figcaption className="mt-4 text-center">
                <p className="font-mono text-xs text-accent">
                  {activeStack ? activeStack.label : current.context}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-text-primary">
                  {current.title}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {current.context}
                  <span className="mx-2 text-text-muted">·</span>
                  <span className="font-mono text-text-muted">
                    {index + 1} / {activePieces.length}
                  </span>
                </p>
              </figcaption>

              <div className="mt-5 flex items-center gap-8 sm:hidden">
                <IndicatorButton
                  key={`m-left-${blinkNonce}`}
                  dir="left"
                  blinking={signal === "left"}
                  className="inline-flex"
                  onClick={prev}
                />
                <IndicatorButton
                  key={`m-right-${blinkNonce}`}
                  dir="right"
                  blinking={signal === "right"}
                  className="inline-flex"
                  onClick={next}
                />
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
