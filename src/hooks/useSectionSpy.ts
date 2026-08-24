import { useEffect, useRef, useState } from "react";

const LOCK_MS = 700;
/** Viewport line used to decide which section is active (from top). */
const SPY_LINE = 0.32;

export function useSectionSpy(
  ids: readonly string[],
  options?: { topId?: string },
) {
  const topId = options?.topId ?? "";
  const [active, setActive] = useState(topId);
  const activeRef = useRef(topId);
  const lockUntil = useRef(0);
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

      if (window.scrollY < 80) {
        commit(topIdRef.current);
        return;
      }

      const line = window.innerHeight * SPY_LINE;
      let current = topIdRef.current;

      // Last section whose top has crossed the spy line wins.
      for (const id of idsRef.current) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
      }

      commit(current);
    };

    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (idsRef.current.includes(id)) lockTo(id);
    };

    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    window.addEventListener("hashchange", onHash);
    onHash();
    pick();
    // Islands / late layout: re-check shortly after mount.
    const t1 = window.setTimeout(pick, 120);
    const t2 = window.setTimeout(pick, 500);

    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
      window.removeEventListener("hashchange", onHash);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return { active, lockTo };
}
