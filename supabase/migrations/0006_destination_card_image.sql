-- Separate card image (photo) from the hero image (art/illustration) so the
-- Guides list cards don't crop the torn-edge hero art awkwardly.
alter table public.destinations add column if not exists card_image text;
