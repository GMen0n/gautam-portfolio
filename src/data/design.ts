export type DesignPiece = {
  title: string;
  context: string;
  image: string;
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

export const designStacks: DesignStack[] = [
  {
    id: "maaya25",
    label: "maaya25",
    description: "Festival identity and event posters — Design Head, Maaya 2025 @ PESU",
    pieces: maaya25Pieces,
  },
];

/** Flat list for lightbox / legacy use */
export const designPieces = designStacks.flatMap((s) => s.pieces);
