# Favicon Source Files

These PNGs are the source of truth for the favicon family. When updating the icon:

1. Replace `favicon-1024x1024.png` with the new base artwork (keep it 1024×1024).
2. Generate the smaller variants with `sips` (macOS built-in) so we keep crisp edges:
   ```bash
   sips -z 256 256 static/favicon/favicon-1024x1024.png --out src/server/public/favicon-256x256.png
   ```
   Repeat for 48, 32, and 16.
3. Rebuild the `.ico` container using `npx png-to-ico` with the PNG variants.
4. Regenerate the touch / Android icons from the 1024px master:
   ```bash
   sips -z 180 180 static/favicon/favicon-1024x1024.png --out src/server/public/apple-touch-icon.png
   sips -z 192 192 static/favicon/favicon-1024x1024.png --out src/server/public/android-chrome-192x192.png
   sips -z 512 512 static/favicon/favicon-1024x1024.png --out src/server/public/android-chrome-512x512.png
   ```
5. Keep `src/server/index.html` link tags aligned with the generated files and update `site.webmanifest` if you change sizes.

This keeps design assets versioned under `static/` while `src/server/public/` only contains the files the app serves directly.
