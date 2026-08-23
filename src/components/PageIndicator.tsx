import { Fragment, type CSSProperties } from "react";
import { navItems } from "../data/links";
import { useSectionSpy } from "../hooks/useSectionSpy";

const RAIL_ITEMS = [
  { href: "/#home", label: "Home", id: "home" },
  ...navItems.map((item) => ({
    href: item.href,
    label: item.label,
    id: item.href.split("#")[1] ?? "",
  })),
];

const RAIL_IDS = RAIL_ITEMS.map((item) => item.id);

export default function PageIndicator() {
  const { active, lockTo } = useSectionSpy(RAIL_IDS, { topId: "home" });
  const current = active || "home";
  const index = Math.max(
    0,
    RAIL_ITEMS.findIndex((item) => item.id === current),
  );

  return (
    <nav className="page-rail hidden lg:flex" aria-label="On this page">
      <div className="page-rail-card" style={{ "--i": index } as CSSProperties}>
        {RAIL_ITEMS.map((item) => (
          <Fragment key={item.id}>
            <input
              id={`page-rail-${item.id}`}
              type="radio"
              name="page-rail"
              value={item.id}
              checked={current === item.id}
              onChange={() => {
                lockTo(item.id);
                window.location.hash = item.id;
              }}
              aria-label={item.label}
            />
            <label htmlFor={`page-rail-${item.id}`}>{item.label}</label>
          </Fragment>
        ))}
        <span className="page-rail-selection" aria-hidden />
      </div>
    </nav>
  );
}
