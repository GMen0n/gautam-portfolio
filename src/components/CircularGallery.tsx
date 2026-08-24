import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { DesignPiece } from "../data/design";

export interface CircularGalleryProps {
  /** Design pieces to display around the 3D ring */
  pieces: DesignPiece[];
  /** Number of cards in the ring. Defaults to 150. */
  count?: number;
  /** Base tilt of the ring in degrees (rotateX). Defaults to 55. */
  tilt?: number;
  /** Ring radius in px (card distance from centre). Defaults to 400. */
  radius?: number;
  /** Card width in px. Defaults to 45. */
  itemWidth?: number;
  /** Card height in px. Defaults to 60. */
  itemHeight?: number;
  /** Slowly spin the ring on its own. Defaults to true. */
  autoRotate?: boolean;
  /** Auto-rotation speed in degrees per second. Defaults to 4. */
  autoRotateSpeed?: number;
  /** Show the large centre preview that follows the hovered card. Defaults to true. */
  showPreview?: boolean;
  /** Parallax the ring's tilt toward the cursor. Defaults to true. */
  parallax?: boolean;
  /** Callback when a card or preview is clicked to open in lightbox */
  onItemClick?: (piece: DesignPiece, index: number) => void;
  /** Extra classes for the root element. */
  className?: string;
}

export function CircularGallery({
  pieces,
  count = 150,
  tilt = 55,
  radius = 400,
  itemWidth = 45,
  itemHeight = 60,
  autoRotate = true,
  autoRotateSpeed = 4,
  showPreview = true,
  parallax = true,
  onItemClick,
  className = "",
}: CircularGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  const [activePiece, setActivePiece] = useState<DesignPiece | null>(pieces[0] ?? null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeRadius, setActiveRadius] = useState(radius);

  const getPiece = (i: number) => (pieces.length > 0 ? pieces[i % pieces.length] : null);

  const optsRef = useRef({ autoRotate, autoRotateSpeed, parallax, tilt });
  useEffect(() => {
    optsRef.current = { autoRotate, autoRotateSpeed, parallax, tilt };
  }, [autoRotate, autoRotateSpeed, parallax, tilt]);

  // Handle responsive radius calculations
  useEffect(() => {
    const updateRadius = () => {
      if (!rootRef.current) return;
      const width = rootRef.current.clientWidth;
      if (width < 500) {
        setActiveRadius(Math.min(220, width * 0.44));
      } else if (width < 768) {
        setActiveRadius(Math.min(290, width * 0.42));
      } else {
        setActiveRadius(radius);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [radius]);

  useEffect(() => {
    const root = rootRef.current;
    const gallery = galleryRef.current;
    if (!root || !gallery || pieces.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = gsap.utils.toArray<HTMLElement>(gallery.querySelectorAll("[data-ring-item]"));
    if (items.length === 0) return;

    const angleIncrement = 360 / items.length;
    const baseAngles = items.map((_, i) => i * angleIncrement - 90);

    // Seat each card on the ring, facing outward.
    items.forEach((item, i) => {
      gsap.set(item, {
        rotationY: 90,
        rotationZ: baseAngles[i],
        transformOrigin: `50% ${activeRadius}px`,
      });
    });
    
    gsap.set(gallery, { rotationY: 0 });

    if (previewWrapRef.current) gsap.set(previewWrapRef.current, { opacity: 0 });

    const setZ = items.map((item) => gsap.quickSetter(item, "rotationZ", "deg"));

    // Smooth entrance
    if (!reduce) {
      gsap.fromTo(
        gallery,
        { rotationX: optsRef.current.tilt + 16, opacity: 0 },
        { rotationX: optsRef.current.tilt, opacity: 1, duration: 1.4, ease: "power3.out" },
      );
      gsap.from(items, {
        opacity: 0,
        duration: 0.7,
        ease: "power1.out",
        stagger: { amount: 1, from: "random" },
      });
    } else {
      gsap.set(gallery, { rotationX: optsRef.current.tilt, opacity: 1 });
      gsap.set(items, { opacity: 1 });
    }

    let current = 0;
    let target = 0;
    let dragging = false;
    let lastX = 0;

    const tick = () => {
      const { autoRotate: auto, autoRotateSpeed: speed } = optsRef.current;
      if (auto && !dragging && !reduce) {
        target += (speed / 60) * gsap.ticker.deltaRatio();
      }
      current += (target - current) * 0.05;
      for (let i = 0; i < setZ.length; i++) setZ[i](baseAngles[i] + current);
    };

    gsap.ticker.add(tick);

    // Pointer Drag to Spin
    let dragDistance = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragDistance = 0;
      setIsInteracting(true);
      lastX = e.clientX;
      root.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (optsRef.current.parallax && !reduce) {
        const rect = root.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(gallery, {
          rotationX: optsRef.current.tilt + py * 5,
          rotationY: px * 5,
          duration: 1.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (dragging) {
        const dx = e.clientX - lastX;
        dragDistance += Math.abs(dx);
        target += dx * 0.3;
        lastX = e.clientX;
        if (dragDistance > 5) {
          root.dataset.dragging = "true";
        }
      }
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      setIsInteracting(false);
      root.style.cursor = "grab";
      setTimeout(() => {
        if (root) root.dataset.dragging = "false";
      }, 50);
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointerleave", endDrag);

    return () => {
      gsap.ticker.remove(tick);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointerleave", endDrag);
      gsap.killTweensOf(gallery);
      gsap.killTweensOf(items);
    };
  }, [count, activeRadius, pieces]);

  const showPreviewImage = (piece: DesignPiece, index: number) => {
    setActivePiece(piece);
    setActiveIndex(index % pieces.length);
    const wrap = previewWrapRef.current;
    if (wrap) {
      gsap.to(wrap, { opacity: 1, scale: 1, duration: 0.15, ease: "power2.out", overwrite: true });
    }
  };

  const hidePreviewImage = () => {
    // Follow Vengeance UI's interaction and hide on mouse leave.
    const wrap = previewWrapRef.current;
    if (wrap) {
      gsap.to(wrap, { opacity: 0, scale: 0.95, duration: 0.25, ease: "power1.out", overwrite: true });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`dash-module relative h-[560px] w-full touch-none select-none overflow-hidden rounded-2xl [perspective:1500px] md:h-[660px] ${className}`}
      style={{
        cursor: "grab",
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(255, 109, 41, 0.1), transparent 62%), radial-gradient(circle at 50% 45%, rgba(240, 178, 58, 0.08), transparent 50%), #0c0909",
      }}
    >
      {/* Cockpit Horizon Scanline Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240, 178, 58, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 178, 58, 0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* Cockpit HUD Top Badge */}
      <div className="pointer-events-none absolute left-6 top-6 z-30 flex items-center gap-3">
        <span className="hero-handle-pill inline-flex items-center rounded-full px-2.5 py-0.5 font-segment text-[10px] font-bold uppercase tracking-[0.18em]">
          3D RING VIEW
        </span>
        <span className="font-mono text-xs text-text-muted">
          {isInteracting ? "SPINNING" : "AUTO-DRIFT"} · {pieces.length} POSTERS
        </span>
      </div>

      {/* Centre Preview Card — PERFECTLY CENTERED */}
      {showPreview && activePiece && (
        <div className="absolute left-1/2 top-[32%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none md:top-[35%]">
          <div
            ref={previewWrapRef}
            className="group pointer-events-auto h-[210px] w-[310px] cursor-pointer overflow-hidden rounded-xl border border-lcd-amber/40 bg-cabin-black opacity-0 shadow-[0_0_40px_rgba(240,178,58,0.25)] transition-[border,box-shadow] duration-300 hover:border-lcd-amber hover:shadow-[0_0_55px_rgba(240,178,58,0.45)] sm:h-[240px] sm:w-[350px] md:h-[260px] md:w-[380px]"
            onClick={(e) => {
              if (rootRef.current?.dataset.dragging === "true") return;
              onItemClick?.(activePiece, activeIndex);
            }}
            onMouseEnter={() => {
              if (previewWrapRef.current) gsap.to(previewWrapRef.current, { opacity: 1, scale: 1, duration: 0.15, overwrite: true });
            }}
            onMouseLeave={hidePreviewImage}
            title="Click to view full piece in high resolution"
          >
            <img
              ref={previewRef}
              src={activePiece.image}
              alt={activePiece.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
            {/* Glass reflection gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-white/10" />

            {/* Caption info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-left">
              <p className="font-dash text-[11px] font-bold uppercase tracking-[0.12em] text-lcd-amber-bright">
                {activePiece.context}
              </p>
              <p className="font-display text-base font-semibold leading-tight text-white drop-shadow">
                {activePiece.title}
              </p>
              <p className="mt-1 font-mono text-[10px] text-text-secondary opacity-90">
                Click to inspect full poster
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The 3D Ring */}
      <div
        ref={galleryRef}
        className="absolute left-1/2 top-[20%] z-10 -translate-x-1/2 [transform-style:preserve-3d]"
      >
        {Array.from({ length: count }).map((_, i) => {
          const piece = getPiece(i);
          if (!piece) return null;
          return (
            <div
              key={i}
              data-ring-item
              className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-[4px] border border-white/20 bg-[#251f22] shadow-md shadow-black/70 ring-1 ring-black/40 [transform-style:preserve-3d] transition-all duration-300 hover:z-30 hover:border-lcd-amber hover:shadow-[0_0_16px_rgba(240,178,58,0.8)]"
              style={{
                width: activeRadius < 300 ? itemWidth * 0.75 : itemWidth,
                height: activeRadius < 300 ? itemHeight * 0.75 : itemHeight,
              }}
              onMouseEnter={() => showPreviewImage(piece, i)}
              onMouseLeave={hidePreviewImage}
              onClick={(e) => {
                if (rootRef.current?.dataset.dragging === "true") return;
                e.stopPropagation();
                onItemClick?.(piece, i % pieces.length);
              }}
            >
              <img
                src={piece.image}
                alt={piece.title}
                className="h-full w-full object-cover transition-all duration-300 hover:scale-115 hover:brightness-120"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {/* Edge Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_50%,transparent_52%,rgba(12,9,9,0.9)_94%)]"
      />

    </div>
  );
}

export default CircularGallery;
