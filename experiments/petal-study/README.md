# Petal study

Open `/experiments/petal-study/` with the portfolio's existing Vite development server.

Brush the bloom to release nearby fragments; pressing/dragging releases a wider region. Fragments fall before dispersing into sampled-color square particles. After inactivity they return. **Let it fall** demonstrates the sequence, **Bloom again** restores the bloom, and **Pause** freezes the simulation. Reduced-motion preference starts the animation paused.

This is a 2D interaction proof using contiguous image patches, not individually segmented botanical petals or a TouchDesigner export. It validates the proposed interaction, not production performance across devices.

## Generated asset

`flower.png` was generated with the built-in imagegen tool. That tool did not expose a model selector; no claim is made that it used a model named GPT-2.5 image.

Exact generation prompt:

> Use case: photorealistic-natural
> Asset type: isolated flower photograph for a petal-to-pixel interactive proof.
> Primary request: Square fine-art photoreal macro photograph of one single lush pale blush ivory peony, many delicate ruffled petals, dark muted green short stem, facing the viewer in three-quarter view.
> Scene/backdrop: pure solid black #000000 background.
> Composition/framing: entire flower and short stem within the square frame, at least 12% empty margin around the subject; bloom fills approximately 75% of frame width.
> Lighting/mood: moody side lighting, sculptural natural imperfect petals.
> Materials/textures: delicate lifelike petal veins and softly curled, layered edges, fine photographic detail.
> Constraints: one flower only; no text, no watermark, no particles, no digital effects, no other objects.

## Bloom opening study

The current bloom starts with a cupped bud and blends through an opening frame into the original photograph over 4.8 seconds. It is a three-keyframe photographic dissolve, not a continuous petal deformation or 3D simulation. Source sheet: `bloom-stages.png`, generated using the built-in imagegen tool with `flower.png` as edit reference.

Exact prompt:

```text
Use case: precise-object-edit
Asset type: two-frame photographic flower-opening animation sprite sheet.
Input image: the supplied blush ivory peony photograph is the edit target; preserve the flower identity, camera angle, original moody photographic side lighting, petal coloration, black background, stem and leaves.
Output: one horizontal image with exact 2:1 aspect ratio, containing exactly TWO equal square panels flush beside each other. No divider, border, spacing, labels or text. Both panel backgrounds are pure solid black #000000 and join seamlessly.
Each square panel uses the same camera composition and framing as the reference. Flower centered at x50% y44% of its own panel; stem bottom y91%. Preserve identical stem and leaf positions, scale, and orientation in both panels and preserve the base-of-bloom position from the reference. Only the petals' opening stage changes.
Left square: the same pale blush ivory peony as a half-closed cup-shaped bud with petals folded inward; bloom width approximately 48% of panel width.
Right square: the same peony 70% opened, with outer petals unfolding; bloom width approximately 68% of panel width.
The entire flower and stem remain within each square. Natural delicate ruffled imperfect petals with lifelike textures. No particles, digital effects, extra flowers or other objects. Match this pair as successive animation keyframes leading to the original fully opened reference flower.
```
