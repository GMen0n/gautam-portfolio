export type DesignPiece = {
  title: string;
  context: string;
  image: string;
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
    image: "https://placehold.co/800x450/1a1a1c/F0B23A?text=NURA+Prototype",
    type: "figma",
    embedUrl: "https://embed.figma.com/proto/8ISWUvRuEB1crhEHiGPyon/NURA?node-id=316-10&page-id=0%3A1&starting-point-node-id=316%3A10&embed-host=share",
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
    id: "maaya25",
    label: "maaya25",
    description: "Festival identity and event posters — Design Head, Maaya 2025 @ PESU",
    pieces: maaya25Pieces,
  },
];

/** Flat list for lightbox / legacy use */
export const designPieces = designStacks.flatMap((s) => s.pieces);
