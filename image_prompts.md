# Verachi Landing Page Image Prompts

Updated: 2026-03-06

This prompt pack is tuned for the current landing page in [marketing/index.html](/Users/memo/src/mooomooo/marketing/index.html). The goal is premium, restrained, editorial imagery that feels closer to a Nordic industrial design campaign than generic AI SaaS art.

## Research Snapshot

Based on Google's official docs and blogs as of March 6, 2026:

- `Nano Banana 2` is `gemini-3.1-flash-image-preview` and Google says it should be the go-to model for the best overall balance of quality, intelligence, latency, and cost.
- `Nano Banana Pro` is `gemini-3-pro-image-preview` and is intended for professional asset production, complex instructions, higher fidelity text rendering, search grounding, and up to 4K output.
- Google explicitly recommends writing descriptive scene paragraphs rather than keyword soups: "Describe the scene, don't just list keywords."
- For photorealistic work, Google recommends prompting like a photographer: camera angle, lens, lighting, mood, and key texture details.
- For product and commercial imagery, Google recommends specifying the product, surface, lighting setup, camera angle, and aspect ratio.
- Gemini image models can maintain stronger brand fidelity with reference images. Gemini 3 image models support up to 14 reference images.

Official sources:

- Google AI docs: https://ai.google.dev/gemini-api/docs/image-generation
- Prompting guide: https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
- Gemini 2.5 Flash Image launch: https://developers.googleblog.com/introducing-gemini-2-5-flash-image/
- Nano Banana Pro for enterprise: https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-pro-available-for-enterprise

## Recommended Workflow

- Use `Nano Banana 2` for ideation, rapid variants, and first-pass composition.
- Use `Nano Banana Pro` for final hero images, text-in-image, or anything that must feel campaign-ready.
- Generate most landing assets at `1:1` and `2K`. The current page mostly uses square image slots.
- If you want a stronger hero crop, also generate a `4:5` version and then choose between the square and portrait version in the page.
- When a composition is almost right, do iterative refinement instead of starting over.
- When you want the whole set to feel cohesive, upload 3-6 approved images from the same family as reference images and ask the model to preserve material language, lighting, and mood.

## Global Art Direction

Use this block at the end of every prompt unless a prompt overrides it:

```text
Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

## Visual Guardrails

This should feel Apple-adjacent in discipline, not in imitation.

- Good:
  - premium industrial design photography
  - gallery-grade still life
  - architect-designed workspace
  - subtle luxury materials
  - restrained, cinematic lighting
  - quiet, credible technology
- Avoid:
  - literal Apple products or logos
  - consumer gadget parody
  - neon purple sci-fi vortexes
  - busy dashboards with unreadable UI
  - glossy crypto aesthetics
  - exaggerated 3D glassmorphism everywhere
  - overly human-centered smiling office shots

## Slot Map

Current image slots in the landing page:

- Hero lifestyle image: `proof-recall.png`
- Hero supporting product image: `hero-product.png`
- Product section main image: `proof-decision-record.png`
- Proof gallery large abstract image: `proof-integrations.png`
- Proof gallery MCP/IDE image: currently reuses `hero-product.png`
- Proof gallery warm recall image: currently reuses `proof-recall.png`

## Prompt 1: Hero Lifestyle Workspace

Target slot: `proof-recall.png`
Suggested model: `Nano Banana Pro`
Aspect ratio: `1:1` at `2K`, optional second pass at `4:5`

```text
A photorealistic editorial interior photograph of a calm, design-forward engineering workspace at dusk. A warm oak desk sits near a concrete wall and a tall window with a subtle city glow outside. On the desk: one slim external monitor and one understated laptop, both showing a clean, elegant decision-graph interface with soft white typography and faint indigo connection lines. The space should feel inhabited by a thoughtful senior engineer, but no person is visible. Include a ceramic cup, a minimal desk lamp, a notebook, and disciplined cable management. Lighting is soft, warm, and architectural, with gentle contrast and realistic shadow falloff. Captured as a premium campaign image with a 35mm lens from a slightly elevated angle. The mood is calm authority, warm precision, and quiet luxury. Keep the UI believable, minimal, and secondary to the atmosphere.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

Refinement nudge:

```text
Keep the exact composition, but reduce any futuristic UI effects, make the room feel more tactile and architectural, simplify the desk objects, and increase the sense of expensive restraint.
```

## Prompt 2: Hero Floating Product Plate

Target slot: `hero-product.png`
Suggested model: `Nano Banana Pro`
Aspect ratio: `1:1` at `2K`

```text
A high-resolution studio photograph of a thin, premium display object floating against a deep charcoal background. The object is not a known consumer device; it is an abstract product plate for a software brand. It has brushed aluminum edges, subtly curved smoked-glass surfaces, and a luminous interface showing a decision map with linked cards, citations, and fine connector lines. The interface is elegant and sparse, mostly monochrome with one restrained indigo accent. Lighting is a soft three-point studio setup with controlled reflections and crisp edge highlights. Camera angle is a slightly elevated 45-degree shot to emphasize thinness and precision. Ultra-realistic, campaign-quality, sharp focus on the material edges and glass reflections. The feeling should be premium industrial design photography for a serious software product.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

Refinement nudge:

```text
Make the interface even more minimal and editorial, with fewer cards and more breathing room. Remove any sci-fi feeling. Push it toward premium industrial design photography.
```

## Prompt 3: Decision Record Hero Image

Target slot: `proof-decision-record.png`
Suggested model: `Nano Banana Pro`
Aspect ratio: `1:1` at `2K` or `4K`

```text
A photorealistic dark editorial product scene showing one central decision record as the hero object. The decision record appears as a luminous glass-and-paper panel surrounded by a few linked supporting cards that imply Slack, Jira, GitHub, and evidence attachments without using any logos. The central panel should feel durable, cited, and authoritative, with visible hierarchy: title, summary area, source references, and relationship links. The supporting cards orbit with disciplined spacing, not chaotic motion. Background is deep graphite with a subtle indigo-black gradient and extremely restrained light bloom. Camera is a straight-on slightly elevated shot, like a premium software campaign still. The image should communicate 'one durable record replaces scattered context' without feeling like a dashboard screenshot.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

Refinement nudge:

```text
Reduce the number of surrounding cards by half, tighten the composition, and make the central record feel more like a premium object with layered depth and material realism.
```

## Prompt 4: Memory Layer / Integrations Abstract

Target slot: `proof-integrations.png`
Suggested model: `Nano Banana 2` for ideation, `Nano Banana Pro` for final
Aspect ratio: `1:1` at `2K`

```text
Create a refined abstract visual that represents multiple work systems flowing into one canonical memory layer. Use a small set of elegant tiles and ribbons, not logos. The tiles should imply distinct sources through shape, tone, and subtle accent color, then converge into one calm central plane that feels stable and intelligent. The composition should feel like premium visual identity design for a serious software company, not a sci-fi portal. Background is deep charcoal with a soft navy undertone. Materials are smoked glass, satin acrylic, and brushed aluminum. The motion implied by the image is organized and quiet. Keep strong negative space and a highly controlled composition.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

Variant:

```text
Keep the same concept but make it feel more like a luxury print campaign still life than a software visualization. Fewer elements, more silence, more polish.
```

## Prompt 5: MCP / IDE Companion Image

Target slot: replace reused `hero-product.png` in the proof gallery
Suggested model: `Nano Banana Pro`
Aspect ratio: `1:1` at `2K`

```text
A photorealistic close product scene of an understated developer setup where the main focus is a dark editor window paired with a cited answer panel. The screen should show code on one side and a compact evidence-aware response on the other, suggesting an IDE assistant querying a decision ledger. The answer panel should feel precise and grounded, with references and confidence indicators implied through layout, not literal readable product copy. The hardware should be abstract premium computing hardware without any recognizable brand marks. Lighting is low, warm, and controlled, with subtle reflections on dark surfaces. The image should communicate 'ask from your IDE' in a calm, credible way, with premium photographic realism.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

Refinement nudge:

```text
Reduce the amount of on-screen UI, make the code and evidence layout feel more editorial and less like a screenshot, and keep the hardware anonymous and luxurious.
```

## Prompt 6: Warm Recall / Troubleshooting Afterglow

Target slot: alternate `proof-recall.png` variant for the proof gallery
Suggested model: `Nano Banana Pro`
Aspect ratio: `1:1` at `2K`

```text
A warm, cinematic evening workspace photograph that suggests a hard problem has already been solved. A softly lit monitor displays a clean troubleshooting graph or decision flow, while the desk holds a closed notebook, keyboard, and a finished cup of coffee. The room should feel calm after intensity, with warm ambient light, textured concrete, oak, linen, and brushed metal. No people visible. The composition should imply memory, recall, and durable knowledge without becoming sentimental. Shot with a 50mm lens, rich but restrained tonal range, premium magazine-style realism.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

## Prompt 7: Social / OG Image With Text

Target slot: optional replacement for social card assets
Suggested model: `Nano Banana Pro`
Aspect ratio: `16:9` at `2K` or `4K`

```text
Create a premium social campaign image for Verachi. The composition is mostly negative space with one refined abstract product plane floating over a dark graphite-to-navy background. Include the exact text "Decide Once. Cascade Everywhere." in large elegant serif typography, perfectly typeset, centered or slightly left-aligned, with generous spacing and a premium editorial feel. Add the word "VERACHI" in much smaller uppercase sans-serif text. The overall design should feel like a high-end technology campaign poster: restrained, expensive, calm, and precise. No other text. No logos. No gimmicky visual effects.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware.
```

Note:

- This is the slot where Nano Banana Pro's text rendering matters most.
- If the text is close but imperfect, iterate instead of starting over:

```text
Keep the composition and materials. Correct the typography so the exact text reads: "Decide Once. Cascade Everywhere." Preserve the editorial serif style and spacing.
```

## Prompt 8: Minimal Background Asset

Target slot: optional future section background or subtle card art
Suggested model: `Nano Banana 2`
Aspect ratio: `16:9` at `2K`

```text
A minimalist composition featuring a single smoked-glass plane and one brushed aluminum element positioned in the lower-right of the frame. The rest of the image is a vast warm light-gray field with subtle paper texture and extremely soft directional light. The object should hint at connected knowledge and durable memory, but remain abstract. The image should be usable behind website copy, so keep strong negative space and avoid high-contrast clutter. Premium editorial still life, restrained and calm.

Art direction: premium editorial product photography, calm Nordic minimalism, quiet luxury, warm precision, restrained palette, mostly neutral tones, warm limestone, parchment, brushed aluminum, smoked glass, graphite, dark navy-charcoal, very sparse muted indigo accents only where they earn attention. Soft daylight or softbox lighting, immaculate composition, generous negative space, no visual clutter, no neon cyberpunk glow, no generic startup stock-photo energy, no loud gradients, no floating hologram junk, no visible logos, no Apple logo, no copied Apple hardware, no text unless explicitly requested.
```

## If You Want Tighter Brand Consistency

Upload these as references when generating the next batch:

- one approved hero image
- one approved dark product image
- one approved warm workspace image
- optional: a cropped screenshot of the actual Verachi UI

Then prepend this instruction:

```text
Use the provided reference images to preserve the same material language, lighting discipline, mood, and palette. Match the family resemblance across the set without duplicating the exact composition.
```

## Suggested First Run Order

1. Generate Prompt 1 and Prompt 2 in `Nano Banana Pro`.
2. Generate Prompt 4 in `Nano Banana 2` until the abstract language feels right.
3. Use the best outputs from steps 1 and 2 as references for Prompts 3, 5, and 6.
4. Generate Prompt 7 last if you want a sharper social card.
