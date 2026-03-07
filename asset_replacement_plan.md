# Verachi Landing Image Replacement Plan

Updated: 2026-03-06

This is the execution plan for replacing the current landing-page imagery with the prompt pack in [image_prompts.md](/Users/memo/src/mooomooo/marketing/image_prompts.md).

## Goal

Replace the current mixed image set with one coherent family:

- premium
- restrained
- editorial
- Apple-adjacent in discipline, not imitation
- compatible with the calmer Nordic direction already established in the page

## Current Slot Inventory

The current landing page uses these image slots:

- Hero lifestyle image in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L100)
- Hero supporting product plate in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L125)
- Product chapter hero image in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L215)
- Proof gallery abstract image in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L317)
- Proof gallery MCP/IDE image in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L337)
- Proof gallery warm recall image in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L353)

## Replacement Strategy

### Phase 1: Drop-In Replacements

These four can be regenerated and dropped in without touching HTML:

1. `proof-recall.png`
2. `hero-product.png`
3. `proof-decision-record.png`
4. `proof-integrations.png`

Use the matching prompts:

- `proof-recall.png` -> Prompt 1
- `hero-product.png` -> Prompt 2
- `proof-decision-record.png` -> Prompt 3
- `proof-integrations.png` -> Prompt 4

### Phase 2: Eliminate Reused Images

The proof gallery currently reuses hero assets. That is the next thing to fix.

Create two new files:

1. `proof-mcp-ide.png`
2. `proof-troubleshooting-warm.png`

Use the matching prompts:

- `proof-mcp-ide.png` -> Prompt 5
- `proof-troubleshooting-warm.png` -> Prompt 6

After those files exist, update the page:

- change the proof gallery MCP/IDE image source at [index.html](/Users/memo/src/mooomooo/marketing/index.html#L339) from `./hero-product.png` to `./proof-mcp-ide.png`
- change the proof gallery warm recall image source at [index.html](/Users/memo/src/mooomooo/marketing/index.html#L355) from `./proof-recall.png` to `./proof-troubleshooting-warm.png`

### Phase 3: Optional Social Asset

Generate one dedicated social image:

- `og-verachi-cascade.png` -> Prompt 7

If you like it, update:

- `og:image`
- `twitter:image`

in [index.html](/Users/memo/src/mooomooo/marketing/index.html#L14)

## Generation Order

Generate in this exact order:

1. `proof-recall.png`
2. `hero-product.png`
3. `proof-integrations.png`
4. `proof-decision-record.png`
5. `proof-mcp-ide.png`
6. `proof-troubleshooting-warm.png`
7. `og-verachi-cascade.png`

Why this order:

- The first two reshape the hero immediately.
- The third establishes the abstract material language for the whole family.
- The fourth translates that language into the product chapter.
- The fifth and sixth stop the proof gallery from reusing hero art.
- The seventh is optional and should be generated only after the visual system is stable.

## Model Recommendation Per Asset

| Asset | Model | Reason |
| --- | --- | --- |
| `proof-recall.png` | `Nano Banana Pro` | hero image, mood-sensitive, must feel campaign-ready |
| `hero-product.png` | `Nano Banana Pro` | reflective materials and premium object realism |
| `proof-integrations.png` | `Nano Banana 2` first, `Pro` final | abstract concept needs rapid exploration first |
| `proof-decision-record.png` | `Nano Banana Pro` | harder composition and more interface nuance |
| `proof-mcp-ide.png` | `Nano Banana Pro` | developer scene needs believable premium realism |
| `proof-troubleshooting-warm.png` | `Nano Banana Pro` | atmospheric image, less forgiving if it feels stock |
| `og-verachi-cascade.png` | `Nano Banana Pro` | text rendering and polish matter |

## Export Specs

### Core Asset Spec

- format: `PNG`
- color space: `sRGB`
- master size: `2048 x 2048`
- keep clean margins so the image survives responsive cropping

### Social Asset Spec

- format: `PNG`
- master size: `2048 x 1152` or `4096 x 2304`

## Composition Notes Per Slot

### `proof-recall.png`

- This sits behind floating notes and a smaller overlapping product card.
- Keep the strongest subject in the right-center of frame.
- Leave some darker, quieter space toward the left and lower-left.
- Avoid tiny desk clutter that turns to mush at small sizes.

### `hero-product.png`

- Keep the object centered with generous breathing room.
- The silhouette must read at thumbnail size.
- Avoid excessive interface detail; this slot is about form, not legibility.

### `proof-decision-record.png`

- The central object must feel singular and authoritative.
- A few supporting cards are enough.
- The image should read instantly as "structured context" rather than "dashboard screenshot."

### `proof-integrations.png`

- Keep the abstract composition centered and calm.
- Use no logos.
- The image should feel like a premium brand visual, not literal integration marketing.

### `proof-mcp-ide.png`

- The answer panel should be clearly distinct from the code area.
- The overall shape should still read at small size in the proof card.
- Keep the machine anonymous; no branded keyboard or laptop details.

### `proof-troubleshooting-warm.png`

- Preserve the warm after-hours mood.
- Avoid visible people.
- This should feel like memory and relief after a solved problem, not a generic desk setup.

## Acceptance Criteria

Do not ship a generated image unless it passes all of these:

- reads clearly at both full card size and thumbnail size
- no visible logos or near-copy consumer hardware
- no warped keyboards, broken screen geometry, or impossible reflections
- no generic neon sci-fi look
- no stock-photo office energy
- feels like the same family as the other accepted images
- restrained palette with only sparse accent color
- premium enough that it improves the perceived value of the product

## Fastest Path To A Better Landing Page

If you only want the highest-leverage first pass, do this:

1. replace `proof-recall.png`
2. replace `hero-product.png`
3. replace `proof-integrations.png`

That gives you:

- a stronger hero
- a better abstract language
- a more consistent premium feel across the page

## Once Assets Exist

When the first batch is ready, the next clean step is:

1. review them at actual landing-page size
2. reject anything that feels too sci-fi, too glossy, or too busy
3. swap in the four drop-in assets
4. then update the proof gallery to use `proof-mcp-ide.png` and `proof-troubleshooting-warm.png`

I can do that HTML swap as soon as you have the generated files.
