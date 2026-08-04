# White Canvas Studio

Monochrome Interactive Portfolio

You are not designing a conventional portfolio website. You are designing an interactive experience where a single living white entity is responsible for creating the entire interface.

The design language is built around one rule:

Nothing on the page appears unless the white entity creates it.

Every animation, reveal, transition, and interaction should respect this rule.

Design Language

The website is strictly monochrome.

Use only:

 Pure black backgrounds

 Pure white interactive elements

 White typography

 White geometry

Do not use gray for the primary visual language.

Do not use gradients as decoration.

Do not use glassmorphism.

Do not use colorful accents.

The page should rely on contrast, not color.

The white should feel brilliant against an almost absolute black background.

Think premium photography printed on matte black paper.

Negative space is one of the main design elements.

Everything should feel intentional and minimal.

Overall Feeling

The experience should feel:

 calm

 mysterious

 fluid

 intelligent

 alive

 cinematic

Avoid feeling playful or cartoonish.

The white entity should feel like liquid ink, mercury, or living paint.

The White Entity

The entire experience revolves around a single white blob.

This is not a cursor.

It is the protagonist of the website.

It has personality.

When idle:

 it gently breathes

 subtly changes shape

 blinks occasionally

 exhibits squash-and-stretch

 has slight inertia

It should feel alive without demanding attention.

Hero Section

When the page loads:

The screen is almost completely empty.

Only the white entity exists.

It sits perfectly centered.

Every few seconds it performs a blink.

The blink should resemble an eyelid closing from the top and opening again.

Not a fade.

Not an opacity animation.

It should feel organic.

First Scroll

When the visitor begins scrolling:

The white entity notices.

It travels smoothly toward the left side of the screen.

Its movement should feel fluid.

It should slightly overshoot before settling.

Name Reveal

The entity reveals the hero title.

The reveal should resemble the reverse of selecting text on a desktop operating system.

A solid white rectangle briefly covers where the text will appear.

The rectangle then retracts horizontally.

As it retracts, the text remains.

The result:

Lekha

Ruthwik

The white rectangle disappears completely.

The blob then waits beside the name like a blinking text cursor.

Nothing should fade in independently.

The blob is solely responsible for revealing the text.

Scrolling

The website should use smooth cinematic scrolling.

As the user scrolls:

The white entity follows.

It should never feel like it teleports.

It always travels intentionally.

Sometimes quickly.

Sometimes slowly.

Sometimes with slight anticipation.

Every movement should appear choreographed.

Projects

This section occupies most of the portfolio.

Do not use ordinary project cards.

Each project should feel like a carefully presented exhibit.

Dark.

Minimal.

Generous spacing.

Large typography.

Projects should alternate left and right for visual rhythm.

Example:

Project 1 (left)

Project 2 (right)

Project 3 (left)

Project 4 (right)

Project Reveal Philosophy

Every project should be introduced by the white entity.

Nothing should simply appear.

For this first version, implement one handcrafted reveal animation as a placeholder.

The animation:

The white entity snaps to one corner of an invisible rectangle.

It drags diagonally like creating a screenshot selection.

A white rectangle grows as it moves.

Once complete, the rectangle melts away to reveal the project underneath.

Structure the animation system so additional reveal styles can easily be added later.

Architecture

Design the reveal system to be modular.

Future reveal animations should be easy to plug into the existing structure without rewriting the page.

The project architecture should support many reveal behaviors in the future.

Typography

Typography should be bold.

Modern.

Geometric.

Minimal.

Avoid decorative fonts.

Large headings.

Generous whitespace.

Strong hierarchy.

Motion

All movement should feel intentional.

No bouncing.

No flashy transitions.

No exaggerated effects.

Use smooth easing.

Heavy but elegant.

Everything should appear choreographed rather than random.

Cursor

Leave the system cursor unchanged for now.

The white entity should remain visually distinct from the mouse cursor.

Performance

Prioritize smooth animation.

Target 60 FPS.

Keep animations GPU accelerated.

Avoid unnecessary rendering.

Design the blob and reveal system with future expansion in mind.

Overall Goal

The visitor should feel that the interface is not loading itself.

Instead, a living white entity is patiently constructing the website in front of them.

The website should feel less like browsing a portfolio and more like watching an intelligent artist gradually paint the interface into existence.


Focus on establishing the interaction framework and visual identity rather than perfecting every animation. It's acceptable to use simplified placeholder versions of complex blob behaviors as long as the codebase is structured so they can be refined incrementally without redesigning the site.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mercury-artistry-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c8075ce-d8f0-453f-b73c-97f3cb367cd8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
