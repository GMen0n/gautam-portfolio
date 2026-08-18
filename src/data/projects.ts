export type Project = {
  title: string;
  description: string;
  stack: string[];
  href: string;
};

export const projects: Project[] = [
  {
    title: "LogRAG Sentinel",
    description:
      "Enterprise-grade microservice diagnostic engine using a RAG pipeline and local ONNX runtimes for zero-latency vector search. Strict Responsible AI guardrails (PII masking) and context engineering to prevent hallucinations, plus a React dashboard that maps AI outputs to retrieved logs for human-in-the-loop observability.",
    stack: ["Python", "FastAPI", "FAISS", "FastEmbed", "React", "Groq", "Llama-3.3"],
    href: "https://github.com/GMen0n",
  },
  {
    title: "FrameKraft",
    description:
      "AI-powered web app that turns images into stylized visuals with matching soundtracks. Five-stage pipeline: BLIP captioning, CLIP classification, Groq stylization, OpenCV smart filtering, and a Music RAG system that fetches iTunes previews from a 10K vector database.",
    stack: ["Python", "BLIP", "CLIP", "Llama-3.3", "OpenCV", "Music RAG"],
    href: "https://github.com/GMen0n",
  },
  {
    title: "MusiConvert",
    description:
      "Cross-platform playlist conversion and secure Wi-Fi Direct sharing between Spotify and YouTube Music. AES symmetric encryption, Selective Repeat ARQ, and a Rich-based terminal UI for automated playlist creation — no internet required for the transfer path.",
    stack: ["Python", "Cryptography", "PyWiFi", "Sockets", "REST APIs"],
    href: "https://github.com/GMen0n",
  },
];
