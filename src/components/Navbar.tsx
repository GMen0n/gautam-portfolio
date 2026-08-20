import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems, profile } from "../data/links";

const SECTION_IDS = navItems.map((item) => item.href.split("#")[1]);
const LOCK_MS = 700;

function sectionId(href: string) {
  return href.split("#")[1] ?? "";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const activeRef = useRef("");
  const lockUntil = useRef(0);
  const ratios = useRef<Record<string, number>>({});

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
    const onScrollChrome = () => setScrolled(window.scrollY > 12);
    onScrollChrome();
    window.addEventListener("scroll", onScrollChrome, { passive: true });

    const pick = () => {
      if (performance.now() < lockUntil.current) return;

      let best = "";
      let bestR = 0;
      for (const id of SECTION_IDS) {
        const r = ratios.current[id] ?? 0;
        if (r > bestR) {
          bestR = r;
          best = id;
        }
      }

      const currentR = ratios.current[activeRef.current] ?? 0;
      if (bestR < 0.12) {
        if (window.scrollY < 80) commit("");
        return;
      }
      // Hysteresis: don't hop unless the new section is clearly more visible
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

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (SECTION_IDS.includes(id)) lockTo(id);
    };
    window.addEventListener("hashchange", onHash);

    return () => {
      window.removeEventListener("scroll", onScrollChrome);
      window.removeEventListener("hashchange", onHash);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        scrolled || open
          ? "glass border-white/10"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <a href="/" className="nav-dash" onClick={() => lockTo("")}>
          {profile.name}
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const id = sectionId(item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`nav-item ${active === id ? "is-active" : ""}`}
                  onClick={() => lockTo(id)}
                >
                  <span className="nav-led" aria-hidden />
                  <span className="nav-dash">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="nav-dash-icon inline-flex rounded-md p-2 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </nav>
      {open && (
        <ul className="space-y-1 border-t border-white/10 px-6 py-4 md:hidden">
          {navItems.map((item) => {
            const id = sectionId(item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`nav-item items-start py-2 ${active === id ? "is-active" : ""}`}
                  onClick={() => {
                    lockTo(id);
                    setOpen(false);
                  }}
                >
                  <span className="nav-led" aria-hidden />
                  <span className="nav-dash">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
