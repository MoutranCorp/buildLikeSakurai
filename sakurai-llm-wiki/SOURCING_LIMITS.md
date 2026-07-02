# Sourcing And Limits

## What This Wiki Is Built From
- The live YouTube playlist page for `PLgKCjZ2WsVLSllvUzbkHIQurVIJdhAQ4m`
- Public watch-page metadata for each video in the playlist as of `2026-07-02`
- Public short descriptions attached to those videos
- Channel-provided related-video links in those descriptions

## What It Does Not Yet Contain
- Full transcripts for every episode
- Frame-accurate notes from the audiovisual content itself
- Scene-level annotations, screenshots, or manually curated timestamps

## Why Full Transcripts Are Missing
- The watch pages expose that transcript endpoints exist, and the build records that fact.
- In this scrape, `256` of `257` videos exposed a transcript endpoint on the watch page.
- Of those visible caption tracks, `255` were surfaced as Japanese auto-captions and `1` as English auto-captions.
- Direct automated transcript retrieval from YouTube was blocked during collection.
- Because of that, this corpus currently leans on playlist metadata and public descriptions rather than complete caption text.

## Practical Consequence
- The wiki is strong for retrieval, topic routing, official synopsis capture, and agent behavior shaping.
- It is weaker than a full transcript corpus for fine-grained wording, exact examples, and frame-specific nuance.

## Refreshing The Corpus
- Run `node scripts/build_sakurai_wiki.mjs` from the workspace root.
- That command re-scrapes the playlist, updates the `data/sakurai_playlist.json` file, refreshes the category pages, and rewrites every video page.

## Best Next Upgrade
- Add manual notes or timestamped annotations for the most important categories first:
- `Game Essence`
- `Planning & Game Design`
- `Design Specifics`
- `UI`
- `Team Management`
