export const profile = {
  name: "Gautam Menon",
  handle: "gmenon",
  taglineLines: [
    { prefix: "I architect ", accent: "AI", rest: " that ships." },
    { prefix: "I build the ", accent: "stack", rest: " around it." },
    { prefix: "I ", accent: "design", rest: " until it feels inevitable." },
  ] as const,
  location: "Bengaluru, India",
  study: "B.Tech CSE @ PES University (ECC)",
  years: "2023–2027",
  email: "gautammenon05@gmail.com",
  github: "https://github.com/GMen0n",
  githubHandle: "GMen0n",
  linkedin: "https://linkedin.com/in/gautammenon05",
  linkedinHandle: "/in/gautammenon05",
  resume: "/resume.pdf",
};

export const aboutText =
  "Dedicated Computer Science student specializing in full-stack engineering and AI-native technologies. Passionate about building multi-agent systems, RAG pipelines, and deploying production-grade LLM applications with a strict focus on responsible AI, guardrails, and enterprise observability.";

export const availability =
  "Open to Summer 2027 SDE / AI Engineering internships.";

export const navItems = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/#research", label: "Research" },
  { href: "/#contact", label: "Contact" },
] as const;
