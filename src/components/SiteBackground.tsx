import DotDistortionField from "./DotDistortionField";

export default function SiteBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ isolation: "isolate", zIndex: 0 }}
      aria-hidden="true"
    >
      <div className="hero-gradient absolute inset-0 -z-10" />
      <div className="hero-illumination" />
      <div className="hero-vignette" />
      <div className="hero-wash" />
      <div className="hero-grain" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <DotDistortionField scrollSpeed={1.0} />
      </div>
    </div>
  );
}
