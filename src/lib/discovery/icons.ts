/**
 * Minimal monochrome icon library for the cursor-revealed background fields.
 * Every icon draws inside a 24x24 box using stroked paths only.
 */
export type IconDraw = (ctx: CanvasRenderingContext2D) => void;

const line = (ctx: CanvasRenderingContext2D, d: string) => {
  ctx.stroke(new Path2D(d));
};

/* ------------------------------- About me ------------------------------ */
const headphones: IconDraw = (ctx) => {
  line(ctx, "M4 15v-3a8 8 0 0 1 16 0v3");
  line(ctx, "M2 15h4v6H4a2 2 0 0 1-2-2z");
  line(ctx, "M22 15h-4v6h2a2 2 0 0 0 2-2z");
};

const controller: IconDraw = (ctx) => {
  line(ctx, "M6 8h12a5 5 0 0 1 0 10H6a5 5 0 0 1 0-10z");
  line(ctx, "M8.5 11v4M6.5 13h4M16 12h.01M18 15h.01");
};

const carWheel: IconDraw = (ctx) => {
  line(ctx, "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z");
  line(ctx, "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z");
  line(ctx, "M12 2v6M12 16v6M2 12h6M16 12h6");
};

const laptop: IconDraw = (ctx) => {
  line(ctx, "M5 5h14v11H5z");
  line(ctx, "M2 19h20");
};

const keyboard: IconDraw = (ctx) => {
  line(ctx, "M2 7h20v10H2z");
  line(ctx, "M5 10h.01M9 10h.01M13 10h.01M17 10h.01M7 14h10");
};

const football: IconDraw = (ctx) => {
  line(ctx, "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z");
  line(ctx, "M12 7l4 3-1.5 5h-5L8 10z");
  line(ctx, "M12 2v5M16 10l5-1.5M14.5 15l3 4M9.5 15l-3 4M8 10L3 8.5");
};

const eightBall: IconDraw = (ctx) => {
  line(ctx, "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z");
  line(ctx, "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z");
  line(ctx, "M10.6 10.2h2.8M10.6 13.8h2.8M11 10.2v3.6M13 10.2v3.6");
};

/* -------------------------------- Resume ------------------------------- */
const pen: IconDraw = (ctx) => {
  line(ctx, "M4 20l1-4L16 5l3 3L8 19z");
  line(ctx, "M14.5 6.5l3 3");
};

const newspaper: IconDraw = (ctx) => {
  line(ctx, "M3 5h14v14H5a2 2 0 0 1-2-2z");
  line(ctx, "M17 9h4v8a2 2 0 0 1-4 0z");
  line(ctx, "M6 8h8M6 11h8M6 14h5");
};

const documentIcon: IconDraw = (ctx) => {
  line(ctx, "M6 3h8l4 4v14H6z");
  line(ctx, "M14 3v4h4");
  line(ctx, "M9 12h6M9 15h6M9 18h4");
};

const pageStack: IconDraw = (ctx) => {
  line(ctx, "M7 2h7l4 4v12H7z");
  line(ctx, "M4 6v14a2 2 0 0 0 2 2h9");
};

const fountainNib: IconDraw = (ctx) => {
  line(ctx, "M12 3l5 8-5 10-5-10z");
  line(ctx, "M12 10v5M7 11h10");
};

export const aboutIcons: IconDraw[] = [
  headphones,
  controller,
  carWheel,
  laptop,
  keyboard,
  football,
  eightBall,
];

export const resumeIcons: IconDraw[] = [
  pen,
  newspaper,
  documentIcon,
  pageStack,
  fountainNib,
];
