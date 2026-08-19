import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DesignPiece, DesignStack } from "../data/design";

type Props = {
  stacks: DesignStack[];
};

const SHUFFLE_MS = 2800;
const VISIBLE_BACK = 3;

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

  // Paint back → front so the top card wins in the stacking context
  const paintOrder = [...layers].reverse();

  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        className="relative mx-auto block aspect-[4/5] w-full max-w-[300px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        aria-label={`Open ${stack.label} gallery`}
        onClick={() => onOpen(front)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {paintOrder.map(({ piece, depth, rot, shiftX, shiftY, scale }) => (
          <span
            key={`${stack.id}-${piece.image}-${depth}`}
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-[#2a2426] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-out"
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
      </button>

      <div className="mt-10 text-center">
        <p className="font-mono text-sm tracking-wide text-accent">{stack.label}</p>
        <p className="mt-2 text-sm text-text-secondary">{stack.description}</p>
        <p className="mt-2 font-mono text-xs text-text-muted">
          {front + 1} / {pieces.length} · click to open
        </p>
      </div>
    </div>
  );
}

export default function DesignGallery({ stacks }: Props) {
  const [open, setOpen] = useState(false);
  const [activeStack, setActiveStack] = useState<DesignStack | null>(null);
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const pieces: DesignPiece[] = activeStack?.pieces ?? [];

  const close = useCallback(() => {
    setOpen(false);
    setActiveStack(null);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + pieces.length) % pieces.length);
  }, [pieces.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % pieces.length);
  }, [pieces.length]);

  const openStack = (stack: DesignStack, startIndex: number) => {
    setActiveStack(stack);
    setIndex(startIndex);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
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

  const current = pieces[index];

  return (
    <>
      <div className="mt-14 flex flex-wrap justify-center gap-16">
        {stacks.map((stack) => (
          <StackCard
            key={stack.id}
            stack={stack}
            onOpen={(i) => openStack(stack, i)}
          />
        ))}
      </div>

      {open && current && activeStack && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${current.title} — full size`}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="glass-pill absolute top-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-text-primary"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="glass-pill absolute top-1/2 left-3 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-text-primary sm:inline-flex md:left-6"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="glass-pill absolute top-1/2 right-3 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-text-primary sm:inline-flex md:right-6"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>

          <figure
            className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.image}
              alt={current.title}
              className="max-h-[min(82vh,820px)] w-auto max-w-full object-contain"
            />
            <figcaption className="mt-4 text-center">
              <p className="font-mono text-xs text-accent">{activeStack.label}</p>
              <p className="mt-1 font-display text-lg font-semibold text-text-primary">
                {current.title}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {current.context}
                <span className="mx-2 text-text-muted">·</span>
                <span className="font-mono text-text-muted">
                  {index + 1} / {pieces.length}
                </span>
              </p>
            </figcaption>

            <div className="mt-5 flex items-center gap-3 sm:hidden">
              <button
                type="button"
                className="glass-pill inline-flex h-11 w-11 items-center justify-center rounded-full text-text-primary"
                aria-label="Previous image"
                onClick={prev}
              >
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                className="glass-pill inline-flex h-11 w-11 items-center justify-center rounded-full text-text-primary"
                aria-label="Next image"
                onClick={next}
              >
                <ChevronRight size={22} strokeWidth={1.5} />
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}
