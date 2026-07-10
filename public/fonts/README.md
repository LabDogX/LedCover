# LedCover fonts

LedCover bundles a small curated font set for cover design. Keep this directory
lean because everything under `public/` is copied into production builds and
Docker images.

Current policy:

- Put selected app fonts in `public/fonts/bundled/`.
- Register selected fonts in `utils/fonts.ts` under `PROJECT_FONT_OPTIONS`.
- Prefer `.woff2` when available.
- Keep the total bundled font set around 50-100 MB or less.
- Keep full font libraries outside the app repository.

Large source font packs should stay outside this folder and can be tested with
the in-app font upload button instead.
