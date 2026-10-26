# Portfolio content

Project: `amber-portfolio` (`mwfdtxlqherngwjxbsgq`, us-west-1).
Dashboard: https://supabase.com/dashboard/project/mwfdtxlqherngwjxbsgq

## Edit without rebuilding

In Table Editor, open `portfolio_entries`. Each row is one project, sketch, film,
or case study. Edit `payload` for copy and media URLs, `position` for ordering,
and `published` for visibility. Only published rows are publicly readable.
Anonymous visitors cannot write. Use the authenticated Dashboard for editing.

For a new film, use collection `films`, a unique `id`, a numeric `position`, and
payload with `id`, `title`, `kind`, `src` (video URL), and `poster` (image URL).
For a sketch, use collection `sketches`, `theme` (`coding`, `ai`, or `drawing`),
`title`, `video` + `poster` or `image`, and optional `exploration`.
For projects, retain the existing payload shape. Adding a new standalone case
study URL still needs a page shell/deployment; adding content to an existing
project or a generic project view does not.

## Media migration status

Database and Storage are live. All 58 published media assets were uploaded and
verified by public HTTP status and exact file size. Published catalog entries use
Storage URLs. Local originals are retained; verified assets are excluded from
build output by the cloud-assets plugin. Draft-only assets remain local.

Use a public `portfolio` Storage bucket for portfolio media only. Upload staged
files from `.portfolio/upload` into its `assets` folder. Storage public URLs are:
`https://mwfdtxlqherngwjxbsgq.supabase.co/storage/v1/object/public/portfolio/assets/<filename>`.
After verifying uploads, `node scripts/portfolio/storage-sql.mjs` prepares a
URL-only SQL migration in `.portfolio/storage-urls.sql`. Apply it through the
Supabase MCP; it preserves current database copy, visibility, and ordering.
Copy the verified map to `src/data/storage-assets.json` for local fallback assets.
Do not publish draft-only assets accidentally.

## Local fallback and export

`node scripts/portfolio/export.mjs` exports source data to ignored
`.portfolio/catalog.json`. `node scripts/portfolio/prepare.mjs` creates a hashed
asset manifest. Export is a local snapshot, not an automatic database sync:
do not overwrite Dashboard edits with an older source snapshot.

The frontend fetches published entries when a content section opens. Home does
not wait for the database. Reads time out after 2.5 seconds and fall back to local
content. The public publishable key can be shipped; never put secret/service-role
keys in frontend source. `supabase/portfolio-schema.sql` records the applied schema.

`src/data/video-posters.js` maps videos to small static list covers. Detail
players use `preload="none"`; Film only creates its player after selection.

## Verify uploads before switching

`node scripts/portfolio/verify-storage.mjs` checks public HTTP responses and exact
file sizes against `.portfolio/published-assets.json`. It writes a verified-only
map to `.portfolio/verified-storage.json`; a nonzero exit means some assets are
still missing or failed. Never copy unverified paths into the live catalog.

`src/data/storage-assets.json` contains only verified public URLs. The
`cloud-assets.mjs` Vite plugin replaces matching local imports and static
`new URL(..., import.meta.url)` references, so migrated media are not copied into
build output. Original files remain available locally. Restart the dev server
(or touch `vite.config.ts`) after extending this map.
