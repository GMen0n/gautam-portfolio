import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems, profile } from "../data/links";
import { useSectionSpy } from "../hooks/useSectionSpy";

const SECTION_IDS = navItems.map((item) => item.href.split("#")[1]);

function sectionId(href: string) {
  return href.split("#")[1] ?? "";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { active, lockTo } = useSectionSpy(SECTION_IDS);

  useEffect(() => {
    const onScrollChrome = () => setScrolled(window.scrollY > 12);
    onScrollChrome();
    window.addEventListener("scroll", onScrollChrome, { passive: true });
    return () => window.removeEventListener("scroll", onScrollChrome);
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
