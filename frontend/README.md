# InsuranceAdvise.in — Frontend

Next.js 14 (App Router) frontend for the InsuranceAdvise.in platform.

## Color Palette

The site's color palette is defined in `tailwind.config.js` under `theme.extend.colors`. Use these tokens (e.g. `bg-ia-blue`, `text-ia-green`) instead of hardcoding hex values.

| Token             | Hex       | Usage                                                        |
| ------------------ | --------- | ------------------------------------------------------------- |
| `ia-blue`         | `#2563EB` | Primary accent — advisor-side CTAs, links, "Life" plan card   |
| `ia-blue-soft`    | `#3B82F6` | Primary accent hover/lighter state                             |
| `ia-green`        | `#16A34A` | Secondary accent — customer-side CTAs, "Health" plan card     |
| `ia-green-soft`   | `#22C55E` | Secondary accent hover/lighter state, highlight badges         |
| `ia-navy`         | `#0B1F3A` | Headings, dark sections, footer background, "General" plan card |
| `ia-navy-2`       | `#122B4E` | Darker navy hover state (buttons on dark backgrounds)          |
| `ia-navy-3`       | `#0A1830` | Deepest navy (gradient endpoints)                              |

Supporting neutrals use Tailwind's built-in `gray` / `slate` scale (e.g. `bg-gray-50`, `text-gray-600`), and `white` for cards/backgrounds.

### Where it's used

- **Advisor-facing UI** (advisor CTAs, `/advisor/login`, advisor portal card): `ia-blue` / `ia-blue-soft`
- **Customer-facing UI** (customer CTAs, `/customer/login`, customer portal card): `ia-green` / `ia-green-soft`
- **Neutral/shared UI** (nav text, footer, "General Insurance" card, headings): `ia-navy`

## Font

Headings and body text use **Poppins** (via `next/font/google`), configured in `app/layout.js` and wired into Tailwind's `font-sans` in `tailwind.config.js`.

## Images

The homepage (`app/page.js`) currently uses inline emoji/gradient placeholders where real photos are expected. To swap in real images, drop files into `public/images/` with these names and replace the corresponding placeholder block in `app/page.js` with an `<img>` tag:

- `hero-family.jpg` — main hero visual
- `hero-house.png` — small accent image overlapping the hero visual
- `mission-portrait.jpg` — "What Sets Us Apart" section
- `testimonial.jpg` — customer testimonial avatar
