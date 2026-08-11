---
name: portfolio-design-excellence
description: Conventions and quality bar for building exceptional portfolio websites in Bolt — visual identity, interaction design, motion, typography, layout, and performance. Use whenever the user asks to build, redesign, or improve a portfolio, personal site, showcase, or creative résumé, even if they don't mention "portfolio" or name the skill directly. Also triggers on requests for "interactive portfolio," "designer portfolio," "developer portfolio," "creative site," or "personal brand site."
---

# Portfolio Design Excellence

A guide for building portfolio websites that feel like crafted, living interfaces — not templates. Portfolios are a distinct category: they exist to impress and inform, not to convert or transact. Every decision should serve that dual purpose.

## When this applies

Any personal or professional showcase site: developer portfolios, designer portfolios, creative résumés, agency microsites, or personal brand sites. If the site's primary job is to represent a person or small team's work, this skill applies.

## Core philosophy

A great portfolio is a **curated experience**, not a content dump. It should feel like a gallery installation: intentional space, deliberate reveals, and a clear point of view. The visitor should feel the person behind the work, not just see a list of projects.

Three principles drive every decision:

1. **Restraint over abundance.** A few excellent projects presented beautifully beat a long scroll of mediocre ones. Negative space is a design choice, not an absence.
2. **Interaction as identity.** The way the site behaves IS the portfolio. A motion designer's site that doesn't move is self-contradictory. A software engineer's site that feels janky undermines their credibility.
3. **Content first, effects second.** Every visual flourish must serve the content. If removing an effect makes the site clearer, the effect was decoration, not design.

## Visual identity

### Color

- Default to a restrained, near-monochrome palette. One or two hues plus neutrals is usually enough for a portfolio — the work itself provides the color.
- If the portfolio owner has a brand color, use it as a single accent, never as a dominant surface. An accent appears in 3-5 places maximum: the logo mark, a hover state, a key link, a focus ring.
- Never use purple, indigo, or violet hues unless the user explicitly requests them. Default to neutral tones, blues, greens, or colors that match the person's field.
- Build a complete color system with at least 6 ramps (primary, secondary, accent, success, warning, error) plus neutral tones, each with multiple shades. Even a monochrome site needs a ramp from pure black to pure white with 5-7 steps.
- Every text color must maintain sufficient contrast against its background. Test hover states and transition states, not just the resting state.

### Typography

- Use two fonts maximum: one display font for headings and one body font for text. A third for monospace labels is acceptable for technical portfolios.
- Display type should be large and confident. Portfolio headings routinely hit 4-8rem on desktop. Don't be timid.
- Body text uses 150% line height; headings use 120%.
- Use 3 font weights maximum (e.g., 400, 500, 700). More weights dilute the system.
- Small uppercase labels with wide letter-spacing (0.1-0.15em) create a gallery-label feel. Use them for section indices, disciplines, years, and metadata.
- Never let typography be an afterthought. The type IS the design on most portfolio pages.

## Layout

- Establish a clear visual hierarchy through scale, spacing, and contrast — not through boxes, cards, or borders.
- Use an 8px spacing system consistently. All padding, margins, and gaps should be multiples of 8 (or 4 for fine adjustments).
- Portfolios benefit from asymmetric layouts. A centered grid is safe but forgettable. Offset content, use negative space deliberately, let elements breathe.
- Each page should have one clear focal point. Don't stack competing elements.
- Apply the Single Responsibility Principle: each view does one thing. Don't mix a project list with a contact form with a blog teaser on one screen.
- Responsive design is non-negotiable. Test at 375px, 768px, 1024px, and 1440px minimum. Typography should scale with `clamp()` rather than jumping at breakpoints.
- Use progressive disclosure: reveal secondary information through modals, drawers, or expandable sections rather than cramming everything onto one screen.

## Interaction and motion

### Principles

- Motion should feel physical and intentional, not decorative. Every animation should communicate a state change, a relationship, or spatial continuity.
- Respect `prefers-reduced-motion`. Provide a static or simplified alternative for users who request it. This is not optional.
- Easing matters. Linear motion feels mechanical. Use cubic-bezier curves that mimic physical materials: ease-out for things arriving, ease-in for things leaving, custom curves for personality.
- Duration sweet spot: 200-600ms for most UI transitions. Anything over 800ms needs to be justified by the experience.
- Hover states are not optional. Every interactive element should respond visually to hover and focus. This is where portfolios earn their "crafted" feel.

### Micro-interactions that elevate

- **Custom cursor**: A small, smooth-following cursor with `mix-blend-mode: difference` reads as premium. Only activate for fine pointers. Always keep the system cursor accessible.
- **Scroll reveals**: Elements that enter the viewport should animate in (opacity, transform, blur). Use `IntersectionObserver`, not scroll listeners. Keep it subtle — 200-400ms, never bouncy.
- **Hover inversions**: Elements that invert color on hover (using `mix-blend-mode: difference` against a disc) create a tactile, satisfying interaction. The disc should be one coherent element, not fragments.
- **Discovery fields**: Canvas layers that reveal hidden content around the cursor create a sense of depth and mystery. Only render the area near the pointer for performance.
- **Page transitions**: Route changes should feel continuous, not like a page reload. The transition should originate from the click point. Disintegration/reconstruction (particles breaking apart and reforming) feels more crafted than a simple fade or blur.

### Stability rules

Motion that glitches is worse than no motion at all. Follow these rules religiously:

- **One animation loop per concept.** Don't run multiple `requestAnimationFrame` loops that do overlapping work. Consolidate.
- **Clean up on unmount.** Every `requestAnimationFrame` loop, event listener, and timer must be cancelled in the effect's cleanup function. Leaked loops cause ghost animations.
- **Don't fight the browser.** Use `transform` and `opacity` for animations — they're GPU-accelerated. Animating `top`, `left`, `width`, or `height` causes layout thrash.
- **Don't re-render during animation.** If an animation runs in a `requestAnimationFrame` loop, write to the DOM directly (via refs and style properties), not through React state. React re-renders during animation cause jank.
- **Test rapid interaction.** Hover in and out quickly. Click during a transition. Switch routes mid-animation. If any of these produce visual artifacts, the animation needs a guard (a `busy` ref, a cancellation token, or a state reset).
- **Simpler and smooth beats complex and glitchy.** If a sophisticated effect can't be made stable, reduce its complexity until it can. A clean fade is infinitely better than a broken particle system.

### Canvas performance

- Use `devicePixelRatio` for crisp rendering, but cap at 2 — higher values burn performance for no visible gain.
- Only draw what's visible. For cursor-reveal effects, compute the grid range around the pointer and skip everything outside it.
- `clearRect` the full canvas each frame, then redraw. Don't accumulate.
- Set `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` once after resizing, not every frame.

## Page structure

A complete portfolio needs these pages, but not all need to be elaborate:

### Landing / Home
The first impression. Should communicate identity in under 3 seconds. Options:
- Name + navigation (minimal, confident)
- Hero statement + scroll cue (immersive)
- Featured work preview (content-forward)

### Projects / Work
The core content. Each project should have:
- Title, discipline, year
- A one-sentence description that captures the idea, not the technology
- A visual representation (screenshot, abstract composition, or motion piece)
- Optional: detail page with full case study

### About
Personal context. Can be minimal — a paragraph or two — but should feel intentional, not unfinished. "Coming soon" placeholders read as abandoned, not anticipated.

### Resume / CV
Professional history. Keep it scannable. If the portfolio is art-directed, the resume can match the aesthetic while remaining readable.

### Contact
Make it easy to reach out. A real email link is the minimum. Social links should point to real profiles, not `#` placeholders.

## Content quality

- Write descriptions that capture the **idea** behind the work, not the implementation. "A spatial editor built around a single gesture" is a portfolio description. "React app with drag-and-drop" is a tech spec.
- Keep copy short. Portfolio visitors scan, they don't read. One sentence per project. Two paragraphs max for about.
- Use real links. Placeholder `href="#"` links are worse than no link — they signal the site is unfinished.
- Project years should be real. A 2026 project in 2025 reads as either fictional or careless unless the site is explicitly speculative.

## Theme and dark mode

- If the site supports light and dark themes, every component must be tested in both. A component that works in dark mode but breaks in light mode is a bug, not a feature.
- Use CSS custom properties driven by a `data-theme` attribute on `<html>`. Every color, canvas layer, and transition should read from the same source of truth.
- The transition color in dark mode is white (the opposite of the black background). In light mode, it's black (the opposite of the white background). Never use gray as a primary transition surface.
- Test: navigation visibility, cursor visibility, text contrast, hover states, canvas ink colors, and transition colors in both themes.

## What to avoid

- Don't use stock templates or boilerplate layouts. If it looks like it came from a starter kit, it fails as a portfolio.
- Don't use purple/indigo gradients unless explicitly requested.
- Don't add features the user didn't ask for. A portfolio with a blog, shop, forum, and dashboard is a portfolio that forgot its purpose.
- Don't leave dead links, placeholder text, or "coming soon" sections without a plan to fill them.
- Don't use blur as a transition crutch. If the page blurs out and blurs back in, it's not a transition — it's a focus pull. Disintegration and reconstruction feel intentional; blur feels like a loading state.
- Don't let effects overpower content. The cursor should be the brightest interactive element. Background effects should be subordinate to the text. If the background competes with the content, reduce its opacity or brightness.

## Done right

A portfolio that follows this skill should feel like this when you visit it:

- You know whose site it is within 2 seconds.
- You want to scroll because the first screen is intriguing, not because you're looking for content.
- Every interaction responds to you — hovers, scrolls, clicks all produce feedback.
- The projects are presented with enough context to understand them, but not so much that you stop to read.
- The site works perfectly on your phone, even if some effects are simplified.
- Switching to light mode (if available) feels like the same site, not a broken version.
- You leave with the impression that the person cares about details — because the site itself demonstrates it.
