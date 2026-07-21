# Zeo Tourism — Master Design System

Generated for the Next.js public travel experience using the UI/UX Pro Max workflow.

## Product and audience

- Product: travel and tourism agency with pilgrimage, Nepal and international tour planning
- Primary audience: families, pilgrims, first-time Nepal visitors and travellers comparing guided packages
- Context: mobile-first discovery, trust evaluation, itinerary comparison and direct enquiry
- Desired tone: welcoming, capable, premium, practical and locally grounded

## Experience pattern

**Hero-centric storytelling with guided discovery and social proof.**

Recommended public-page sequence:

1. Immersive hero with one primary CTA
2. Fast route-selection actions
3. Destination inspiration
4. Journey-type comparison
5. Local expertise and trust proof
6. Traveller stories
7. Direct planning CTA

## Visual style

- Base: approachable modern travel interface
- Primary influence: restrained Aurora atmosphere used only as subtle light, gradient or section accent
- Secondary influence: image-led storytelling and soft layered cards
- Avoid: neon gradients, decorative glass everywhere, excessive parallax, sharp editorial numbering, equal-weight card walls and multiple competing CTAs

## Color roles

- Primary brand: `#055FAC`
- Primary dark: `#044A8A`
- Warm action accent: `#F47721`
- Page surface: `#F8FAFC`
- Card surface: `#FFFFFF`
- Strong text: `#0F172A`
- Body text: `#475569`
- Muted text: `#64748B`
- Border: `#E2E8F0`

Use blue for trust and primary navigation. Use orange sparingly for action emphasis, active markers and warm destination cues. Destination photography provides most of the visual color.

## Typography

- Display and selected section headings: Playfair Display
- Interface, body and controls: Inter / Outfit
- Mobile body minimum: 16px
- Body line-height: 1.5–1.75
- Desktop paragraph measure: 60–75 characters
- Avoid oversized multi-line headings that compete with destination imagery

## Radius and elevation

- Controls: 6–10px
- Cards and media: 12–16px
- Large panels/dialogs: 20px
- Use one subtle elevation scale; do not assign different custom shadows to every card
- Keep full-width sections, dividers and tables structurally square where appropriate

## Interaction

- Minimum target: 44×44px
- Visible focus states on all interactive elements
- Hover/press transitions: 150–250ms
- Motion only for state changes, carousel transitions and subtle image emphasis
- Respect `prefers-reduced-motion`
- Never rely on hover as the only discovery mechanism

## Performance

- Render the hero image before optional video
- Do not preload multiple videos
- Use responsive image sizing and fixed aspect ratios
- Lazy-load below-the-fold media
- Avoid decorative animation that adds main-thread work
- Reserve carousel and media dimensions to prevent CLS

## Conversion rules

- One visually dominant CTA per section
- Secondary actions use quieter text or outline treatment
- Show direct support near high-intent sections
- Keep route, timing, permit and support clarity more prominent than generic promotional claims

## Accessibility

- Text contrast at least WCAG AA
- Descriptive alt text for meaningful travel imagery
- Icon-only controls require accessible labels
- Logical heading hierarchy
- Keyboard-operable carousels and navigation
- Colour never acts as the only state indicator
