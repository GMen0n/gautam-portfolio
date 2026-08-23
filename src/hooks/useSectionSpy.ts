import { useEffect, useRef, useState } from "react";

const LOCK_MS = 700;

export function useSectionSpy(
  ids: readonly string[],
  options?: { topId?: string },
) {
  const topId = options?.topId ?? "";
  const [active, setActive] = useState(topId);
  const activeRef = useRef(topId);
  const lockUntil = useRef(0);
  const ratios = useRef<Record<string, number>>({});
  const idsRef = useRef(ids);
  const topIdRef = useRef(topId);
  idsRef.current = ids;
  topIdRef.current = topId;

  const commit = (id: string) => {
    if (id === activeRef.current) return;
    activeRef.current = id;
    setActive(id);
  };

  const lockTo = (id: string) => {
    lockUntil.current = performance.now() + LOCK_MS;
    commit(id);
  };

  useEffect(() => {
    const pick = () => {
      if (performance.now() < lockUntil.current) return;

      const list = idsRef.current;
      let best = "";
      let bestR = 0;
      for (const id of list) {
        const r = ratios.current[id] ?? 0;
        if (r > bestR) {
          bestR = r;
          best = id;
        }
      }

      const currentR = ratios.current[activeRef.current] ?? 0;
      if (bestR < 0.12) {
        if (window.scrollY < 80) commit(topIdRef.current);
        return;
      }
      if (best === activeRef.current) return;
      if (currentR > 0 && bestR < currentR + 0.14) return;
      commit(best);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current[entry.target.id] = entry.intersectionRatio;
        }
        pick();
      },
      {
        root: null,
        rootMargin: "-28% 0px -48% 0px",
        threshold: [0, 0.08, 0.16, 0.28, 0.4, 0.55, 0.75, 1],
      },
    );

    for (const id of idsRef.current) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (idsRef.current.includes(id)) lockTo(id);
    };
    window.addEventListener("hashchange", onHash);
    onHash();

    return () => {
      window.removeEventListener("hashchange", onHash);
      observer.disconnect();
    };
  }, []);

  return { active, lockTo };
}
