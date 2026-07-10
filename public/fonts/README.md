# LedCover fonts

LedCover bundles a small curated font set for cover design. Keep this directory
lean because everything under `public/` is copied into production builds and
Docker images.

Current policy:

- Keep full font libraries outside the app repository.
- Generate selected bundled fonts into `utils/fontData/` as on-demand JS data
  modules.
- Register selected fonts in `utils/fonts.ts` under `PROJECT_FONT_OPTIONS`.
- Prefer `.woff2` when available.
- Keep the total bundled font set around 50-100 MB or less.

This `public/fonts/` folder is intentionally ignored except for this README, so
large source font packs are not accidentally bundled. Large packs can be tested
with the in-app font upload button instead.
