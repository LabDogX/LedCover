# LedCover fonts

LedCover bundles a small curated font set for cover design. Keep this directory
lean because everything under `public/` is copied into production builds and
Docker images.

Current policy:

- Put selected app fonts in `public/assets/fonts/`.
- Register selected fonts in `utils/fonts.ts` under `PROJECT_FONT_OPTIONS`.
- Prefer `.woff2` when available.
- Use stable extensionless filenames for bundled fonts when deploying behind NAS
  or reverse proxies that block `.ttf` or `.otf` requests.
- Keep the total bundled font set around 50-100 MB or less.
- Keep full font libraries outside the app repository.

This `public/fonts/` folder is intentionally ignored except for this README, so
large source font packs are not accidentally bundled. Large packs can be tested
with the in-app font upload button instead.
