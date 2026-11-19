# Seed Rute Kelana

One-off scripts that put the curated routes into the Supabase `templates` table.
They use the service key from `.env`, so run them only against the database you mean to change.

- `data.mjs`: Bandung 3, Jakarta 3, Yogyakarta 5, Bali 7, Belitung 4, Sumba 7 hari (costs are rough estimates for 2 people).
- `publish.mjs <project-dir> [--dry|--update]`: looks up each photo and its credit on Wikimedia Commons, then inserts the routes as published. `--update` rewrites rows that already exist. `--dry` only checks the photos.
- `lombok/`: the Lombok 5 hari route (`route.mjs` inserts it as a draft, `apply.mjs` adds its photos).

Photos are hotlinked from Wikimedia Commons (CC licences, credit shown on each route page). Upload them to your own storage before relying on them.
