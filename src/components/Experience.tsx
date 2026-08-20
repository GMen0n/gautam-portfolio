import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { experience } from "../data/experience";

function TimelineItem({
  job,
  i,
  reduce,
}: {
  job: (typeof experience)[number];
  i: number;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const lit = Boolean(inView);

  return (
    <motion.li
      ref={ref}
      className="relative mb-12 pl-8 last:mb-0"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
    >
      <span className={`timeline-lamp${lit ? " is-lit" : ""}`} aria-hidden />
      <h3 className="font-display text-xl font-semibold text-text-primary">{job.role}</h3>
      <p className="mt-1 text-base font-medium text-accent-amber">{job.company}</p>
      <p className="mt-1 font-mono text-[13px] text-text-muted">{job.dates}</p>
      <ul className="mt-4 max-w-[720px] space-y-2 text-[15px] leading-relaxed text-text-secondary">
        {job.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.li>
  );
}

export default function Experience() {
  const reduce = useReducedMotion();

  return (
    <section id="experience" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <span className="section-led" aria-hidden="true" />
          <h2>Experience</h2>
        </div>
        <ol className="relative ml-3 border-l border-transparent md:ml-4">
          <span className="timeline-spine" aria-hidden />
          {experience.map((job, i) => (
            <TimelineItem key={job.role} job={job} i={i} reduce={reduce} />
          ))}
        </ol>
      </div>
    </section>
  );
}
