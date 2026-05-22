# Client brand assets

## App-facing files (stable URLs)

These are copied from `WS Web Images/` and `WS Logo/` when client drops new files. Re-run:

```bash
cd web
npm run sync:brand-assets
```

| File | Source (typical) | Used for |
|------|------------------|----------|
| `icon-192.png` | `WS Web Images/WS_app_icon.png` | PWA, Apple touch |
| `icon-512.png` | same | PWA install |
| `logo-horizontal.png` | `WS Logo/whobrey_studios_logo_white.png` | Header wordmark |
| `emblem-white.svg` | `WS Logo/Whobrey Studios Emblem (White).svg` | Monogram variant |
| `emblem-white.png` | `WS Logo/whobrey_studios_emblem_white_v3.png` | Fallback |

## Client palette (CSS tokens)

- **Font:** [Manrope](https://fonts.google.com/specimen/Manrope)
- **Primary:** `#2EC4B6`
- **Black / white:** `#000000` / `#FFFFFF`

## Source folders

- `WS Logo/` — logos, emblems, archives
- `WS Web Images/` — app icon, header art

Do not reference paths with spaces in code; sync into the flat files above.
