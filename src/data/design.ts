export type DesignPiece = {
  title: string;
  context: string;
  image: string;
  imageLandscape?: string;
  type?: "image" | "figma";
  embedUrl?: string;
};

export type DesignStack = {
  id: string;
  label: string;
  description: string;
  pieces: DesignPiece[];
};

const maaya25Pieces: DesignPiece[] = [
  {
    title: "Creatiwitty",
    context: "Maaya 2025",
    image: "/design/maaya25/creatiwitty.png",
  },
  {
    title: "Cultural Events",
    context: "Maaya 2025 poster",
    image: "/design/maaya25/cultural-events.png",
  },
  {
    title: "Esports",
    context: "Maaya 2025 poster",
    image: "/design/maaya25/esports.png",
  },
  {
    title: "Miscellaneous Events",
    context: "Maaya 2025 poster",
    image: "/design/maaya25/miscellaneous-events.png",
  },
  {
    title: "Maaya Poster",
    context: "Maaya 2025",
    image: "/design/maaya25/poster.png",
  },
  {
    title: "Real Esports",
    context: "Maaya 2025 poster",
    image: "/design/maaya25/real-esports.png",
  },
  {
    title: "Thamarassery",
    context: "Maaya 2025",
    image: "/design/maaya25/thamarassery.png",
  },
  {
    title: "Maaya Detail",
    context: "Maaya 2025",
    image: "/design/maaya25/detail.png",
  },
];

const nuraPieces: DesignPiece[] = [
  {
    title: "NURA Prototype",
    context: "Interactive Prototype",
    image: "/design/NURA/NURA_portrait_preview.png",
    imageLandscape: "/design/NURA/NURA_landscape_preview.png",
    type: "figma",
    embedUrl: "https://embed.figma.com/proto/8ISWUvRuEB1crhEHiGPyon/NURA?node-id=316-10&page-id=0%3A1&starting-point-node-id=316%3A10&embed-host=share",
  },
];

const aceItPieces: DesignPiece[] = [
  {
    title: "AceIt Overview",
    context: "App Design",
    image: "/design/ACEit/ACEit_portrait_preview.png",
    imageLandscape: "/design/ACEit/ACEit_landscape_preview.png",
  },
  {
    title: "Crash Page",
    context: "AceIt Wireframe",
    image: "/design/ACEit/CrashPage.png",
  },
  {
    title: "Crash Page Login",
    context: "AceIt Wireframe",
    image: "/design/ACEit/CrashPage Login.png",
  },
  {
    title: "Crash Page Sign Up",
    context: "AceIt Wireframe",
    image: "/design/ACEit/CrashPage Sign Up.jpg",
  },
  {
    title: "Home Page",
    context: "AceIt Wireframe",
    image: "/design/ACEit/HomePage.jpg",
  },
  {
    title: "Courses",
    context: "AceIt Wireframe",
    image: "/design/ACEit/Courses.jpg",
  },
  {
    title: "Chat Page",
    context: "AceIt Wireframe",
    image: "/design/ACEit/Chatpage.png",
  },
  {
    title: "Memo",
    context: "AceIt Wireframe",
    image: "/design/ACEit/Memo.png",
  },
];

export const designStacks: DesignStack[] = [
  {
    id: "nura",
    label: "NURA",
    description: "NURA Interactive Figma Prototype",
    pieces: nuraPieces,
  },
  {
    id: "aceit",
    label: "ACEIT",
    description: "App Design & Wireframes — AceIt",
    pieces: aceItPieces,
  },
  {
    id: "maaya25",
    label: "maaya25",
    description: "Festival identity and event posters — Design Head, Maaya 2025 @ PESU",
    pieces: maaya25Pieces,
  },
];

/** Flat list for lightbox / legacy use */
export const designPieces = designStacks.flatMap((s) => s.pieces);
