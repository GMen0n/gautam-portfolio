import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";

const badgeAccents = [
  "border-l-accent",
  "border-l-accent-amber",
  "border-l-accent-gold",
  "border-l-brown",
];

export default function Projects() {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Work</h2>
          <span className="rule" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              className="glow-card rounded-2xl p-6"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <h3 className="font-display text-2xl font-semibold text-text-primary">
                {project.title}
              </h3>
              <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-text-secondary">
                {project.description}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech, ti) => (
                  <li
                    key={tech}
                    className={`rounded-full border-l-2 bg-white/5 px-2.5 py-1 font-mono text-xs text-text-secondary ${badgeAccents[ti % badgeAccents.length]}`}
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm text-accent"
              >
                GitHub
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
