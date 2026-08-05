export type PortfolioProject = {
  index: string;
  title: string;
  discipline: string;
  year: string;
  note: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    index: "01",
    title: "Obsidian",
    discipline: "Interaction Design",
    year: "2026",
    note: "A spatial editor built around a single gesture. Everything else disappears.",
  },
  {
    index: "02",
    title: "Silt",
    discipline: "Generative Systems",
    year: "2025",
    note: "Sediment simulated as a typographic medium, rendered entirely in one channel.",
  },
  {
    index: "03",
    title: "Vellum",
    discipline: "Product / Web",
    year: "2025",
    note: "Reading software for archives. Paper physics, no chrome, no colour.",
  },
  {
    index: "04",
    title: "Mercury",
    discipline: "Motion Identity",
    year: "2024",
    note: "An identity that only exists while it is moving. Stillness erases it.",
  },
];