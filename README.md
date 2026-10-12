# Prism 3D Showcase

Prism One product stage. Solid off white page with dark sections and indigo accent. Center Three.js stage with rotating icosahedron plus ring, finish switcher, mouse parallax, scroll scrub rotation, and floating parallax shapes.

## Features
1. Sticky nav with hamburger menu under 820px plus scroll progress bar
2. Three.js hero stage: icosahedron plus ring, drag to spin, mouse parallax, GSAP color tween finishes
3. Parallax system: mouse parallax on stage, GSAP ScrollTrigger scrub rotation, data speed floating shapes, Lenis smooth scroll
4. Specs counters, 3 tier pricing with order shortcut, auto rotating testimonials
5. Validated order form with inline errors and success state

## Libs and CDN
- three 0.160.0: https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js
- gsap 3.12.5: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
- ScrollTrigger 3.12.5: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
- lenis 1.1.14: https://unpkg.com/lenis@1.1.14/dist/lenis.min.js
- Font: Inter via Google Fonts
- All CDN guarded: page renders static fallback if any lib fails; reduced motion shows one static 3D frame

## Run
python3 -m http.server 8000

Then open http://localhost:8000/

## Customize
- Finishes: edit FINISHES map in script.js plus swatch buttons in index.html
- Stage look: material color, roughness, ring color in baseScene in script.js
- Copy and prices: sections stage, highlights, specs, pricing, order in index.html
- Theme: CSS vars paper, ink, accent in styles.css

## Structure
- index.html: nav, hero stage, highlights, specs, pricing plus quotes, order form, footer
- styles.css: theme, layout, stage, cards, responsive 360 768 1200, reduced motion
- script.js: Lenis, nav, reveals, Three.js stage, parallax, counters, quotes, form
