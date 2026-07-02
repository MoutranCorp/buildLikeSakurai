import fs from "node:fs/promises";
import path from "node:path";

const PLAYLIST_ID = "PLgKCjZ2WsVLSllvUzbkHIQurVIJdhAQ4m";
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;
const OUTPUT_ROOT = path.resolve("sakurai-llm-wiki");
const DATA_DIR = path.join(OUTPUT_ROOT, "data");
const VIDEO_DIR = path.join(OUTPUT_ROOT, "videos");
const CATEGORY_DIR = path.join(OUTPUT_ROOT, "categories");

function extractObject(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) {
    return null;
  }

  const braceStart = text.indexOf("{", start);
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = braceStart; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(braceStart, i + 1);
      }
    }
  }

  return null;
}

function walk(value, visitor) {
  if (!value || typeof value !== "object") {
    return;
  }

  visitor(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, visitor);
    }
    return;
  }

  for (const item of Object.values(value)) {
    walk(item, visitor);
  }
}

function collect(value, predicate) {
  const output = [];
  walk(value, (node) => {
    if (predicate(node)) {
      output.push(node);
    }
  });
  return output;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function repairText(input) {
  if (typeof input !== "string") {
    return input;
  }

  if (!/[Ãâ€â–]/.test(input)) {
    return input;
  }

  try {
    const repaired = Buffer.from(input, "latin1").toString("utf8");
    const originalNoise = (input.match(/[Ãâ€â–]/g) ?? []).length;
    const repairedNoise = (repaired.match(/[Ãâ€â–]/g) ?? []).length;
    return repairedNoise < originalNoise ? repaired : input;
  } catch {
    return input;
  }
}

function stripCategory(title) {
  return repairText(title).replace(/\s*\[[^\]]+\]\s*$/, "").trim();
}

function parseCategory(title) {
  const repaired = repairText(title);
  const match = repaired.match(/\[([^\]]+)\]\s*$/);
  return match ? match[1] : "Channel / Meta";
}

function formatIndex(index) {
  return String(index).padStart(3, "0");
}

function firstSentence(text) {
  const cleaned = repairText(text)
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
  const match = cleaned.match(/.+?[.!?](?:\s|$)/);
  return match ? match[0].trim() : cleaned.slice(0, 200).trim();
}

function parseDescriptionBlocks(description) {
  return repairText(description)
    .replace(/\r/g, "")
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);
}

function extractRelatedVideos(description) {
  const lines = repairText(description).replace(/\r/g, "").split("\n");
  const related = [];

  for (let i = 0; i < lines.length - 1; i += 1) {
    const line = lines[i].trim();
    const next = lines[i + 1].trim();
    const match = next.match(/https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (!match) {
      continue;
    }
    related.push({
      title: repairText(line.replace(/^■\s*/, "")),
      videoId: match[1],
      url: `https://www.youtube.com/watch?v=${match[1]}`,
    });
  }

  return related;
}

function ensureTrailingNewline(text) {
  return text.endsWith("\n") ? text : `${text}\n`;
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.text();
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

function extractVideosFromBrowse(data) {
  return collect(
    data,
    (node) => node && node.contentId && node.contentType === "LOCKUP_CONTENT_TYPE_VIDEO",
  ).map((item) => {
    const title = repairText(item.metadata?.lockupMetadataViewModel?.title?.content ?? "");
    return {
      videoId: item.contentId,
      title,
      shortTitle: stripCategory(title),
      category: parseCategory(title),
      lengthLabel:
        item.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel
          ?.badges?.[0]?.thumbnailBadgeViewModel?.text ?? null,
      url: `https://www.youtube.com/watch?v=${item.contentId}`,
    };
  });
}

function extractBrowseContinuation(data) {
  let token = null;
  walk(data, (node) => {
    if (!token && node?.continuationCommand?.request === "CONTINUATION_REQUEST_TYPE_BROWSE") {
      token = node.continuationCommand.token;
    }
  });
  return token;
}

async function fetchPlaylistMetadata() {
  const html = await fetchText(PLAYLIST_URL, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  const initialData = JSON.parse(extractObject(html, "var ytInitialData ="));
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
  const playlistTitle =
    collect(initialData, (node) => node?.title === "Masahiro Sakurai on Creating Games")[0]
      ?.title ?? "Masahiro Sakurai on Creating Games";
  const totalVideos =
    collect(initialData, (node) => node?.content === "257 videos")[0]?.content ?? null;

  const videos = [];
  const seen = new Set();

  function pushUnique(items) {
    for (const item of items) {
      if (!seen.has(item.videoId)) {
        seen.add(item.videoId);
        videos.push(item);
      }
    }
  }

  pushUnique(extractVideosFromBrowse(initialData));
  let continuation = extractBrowseContinuation(initialData);

  while (continuation) {
    const data = await fetchJson(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "origin": "https://www.youtube.com",
        "referer": PLAYLIST_URL,
        "user-agent": "Mozilla/5.0",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": clientVersion,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion,
            hl: "en",
            gl: "US",
          },
        },
        continuation,
      }),
    });

    pushUnique(extractVideosFromBrowse(data));
    continuation = extractBrowseContinuation(data);
  }

  return {
    playlistTitle,
    totalVideosLabel: totalVideos,
    apiKey,
    clientVersion,
    videos: videos.map((video, index) => ({
      ...video,
      index: index + 1,
      slug: `${formatIndex(index + 1)}-${slugify(video.shortTitle)}`,
    })),
  };
}

function extractPlayerMetadata(html) {
  const playerJson = extractObject(html, "var ytInitialPlayerResponse =");
  const initialJson = extractObject(html, "var ytInitialData =");
  if (!playerJson || !initialJson) {
    throw new Error("Expected watch page payloads were not found.");
  }

  const player = JSON.parse(playerJson);
  const initialData = JSON.parse(initialJson);
  const details = player.videoDetails ?? {};
  const micro = player.microformat?.playerMicroformatRenderer ?? {};
  const transcriptAvailable = html.includes("getTranscriptEndpoint");
  const autoCaptionTrack =
    player.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0] ?? null;
  const transcriptLanguage = autoCaptionTrack?.name?.simpleText ?? null;

  const description = repairText(details.shortDescription ?? "");
  const descriptionBlocks = parseDescriptionBlocks(description);
  const summarySentence = firstSentence(description);
  const relatedVideos = extractRelatedVideos(description);
  return {
    canonicalUrl: micro.embed?.iframeUrl
      ? `https://www.youtube.com/watch?v=${details.videoId}`
      : `https://www.youtube.com/watch?v=${details.videoId}`,
    channelTitle: repairText(details.author ?? "Masahiro Sakurai on Creating Games"),
    publishDate: micro.publishDate ?? null,
    description,
    descriptionBlocks,
    summarySentence,
    relatedVideos,
    transcriptAvailable,
    transcriptLanguage,
    lengthSeconds: details.lengthSeconds ? Number(details.lengthSeconds) : null,
    keywords: details.keywords ?? [],
    viewCount: details.viewCount ? Number(details.viewCount) : null,
  };
}

async function fetchWatchMetadata(video) {
  const html = await fetchText(video.url, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  return extractPlayerMetadata(html);
}

function makeVideoPage(video) {
  const related = video.relatedVideos.length
    ? video.relatedVideos.map((item) => `- [${item.title}](${item.url})`).join("\n")
    : "- None listed in the public description.";

  const descriptionBlocks = video.descriptionBlocks.length
    ? video.descriptionBlocks.map((block) => `> ${block.replace(/\n/g, "\n> ")}`).join("\n>\n")
    : "> No public description was available on the watch page at build time.";

  return ensureTrailingNewline(`# ${video.index}. ${video.shortTitle}

- Video: [${video.title}](${video.url})
- Category: ${video.category}
- Runtime: ${video.lengthLabel ?? "Unknown"}
- Published: ${video.publishDate ?? "Unknown"}
- Views at scrape time: ${video.viewCount ? video.viewCount.toLocaleString("en-US") : "Unknown"}
- Transcript endpoint visible on watch page: ${video.transcriptAvailable ? "Yes" : "No"}
- Auto-caption language seen on watch page: ${video.transcriptLanguage ?? "Unknown"}

## Source Capsule
${descriptionBlocks}

## Fast Read
${video.summarySentence || "No short public synopsis was available."}

## Related Videos Mentioned By The Channel
${related}
`);
}

function makeCategoryPage(category, videos) {
  const lines = videos
    .map((video) => `- [${formatIndex(video.index)} ${video.shortTitle}](../videos/${video.slug}.md): ${video.summarySentence || "No public synopsis available."}`)
    .join("\n");

  return ensureTrailingNewline(`# ${category}

${videos.length} videos in this category.

## What This Bucket Covers
This page groups Sakurai's playlist entries under a shared theme so an agent can retrieve the right lesson family before drilling into individual videos.

## Videos
${lines}
`);
}

function makeIndexPage(dataset) {
  const byCategory = new Map();
  for (const video of dataset.videos) {
    if (!byCategory.has(video.category)) {
      byCategory.set(video.category, []);
    }
    byCategory.get(video.category).push(video);
  }

  const toc = [...byCategory.entries()]
    .map(([category, videos]) => `- [${category}](./categories/${slugify(category)}.md) (${videos.length})`)
    .join("\n");

  const latestVideos = dataset.videos
    .slice(-10)
    .map((video) => `- [${formatIndex(video.index)} ${video.shortTitle}](./videos/${video.slug}.md)`)
    .join("\n");

  return ensureTrailingNewline(`# Sakurai LLM Wiki

This corpus was generated from Masahiro Sakurai's YouTube playlist [${dataset.playlistTitle}](${PLAYLIST_URL}).

- Playlist ID: \`${PLAYLIST_ID}\`
- Videos scraped: ${dataset.videos.length}
- Playlist header at scrape time: ${dataset.totalVideosLabel ?? "Unknown"}
- Build date: ${new Date().toISOString().slice(0, 10)}
- Coverage note: the build includes playlist metadata, watch-page descriptions, related-video references, and caption availability markers.

For the Codex, Claude Code, and Unreal MCP harness, see [agent-system/README.md](../agent-system/README.md).

## How To Use This Corpus
- Start with [AGENT_OPERATING_SYSTEM.md](./AGENT_OPERATING_SYSTEM.md) for the reasoning lens.
- Use [PRINCIPLES.md](./PRINCIPLES.md) for condensed heuristics.
- Use [CATEGORY_LENSES.md](./CATEGORY_LENSES.md) to route problems to the right course section.
- Use [INGESTION_ORDER.md](./INGESTION_ORDER.md) when turning this wiki into an agent context or retrieval flow.
- Read [SOURCING_LIMITS.md](./SOURCING_LIMITS.md) before treating the corpus like a full transcript archive.
- Use category pages when the task is broad.
- Use video pages when the task calls for a specific mechanic, production issue, or presentation choice.

## Categories
${toc}

## Most Recent Entries In The Current Playlist Order
${latestVideos}
`);
}

function makeCourseMap(dataset) {
  const lines = dataset.videos.map(
    (video) =>
      `- ${formatIndex(video.index)} | ${video.category} | [${video.shortTitle}](./videos/${video.slug}.md)`,
  );

  return ensureTrailingNewline(`# Course Map

This file is the linear playlist order, which is useful when an agent should ingest the course progressively instead of by topic.

${lines.join("\n")}
`);
}

async function writeGeneratedFiles(dataset) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  await fs.mkdir(CATEGORY_DIR, { recursive: true });

  await fs.writeFile(
    path.join(DATA_DIR, "sakurai_playlist.json"),
    `${JSON.stringify(dataset, null, 2)}\n`,
    "utf8",
  );

  await fs.writeFile(path.join(OUTPUT_ROOT, "README.md"), makeIndexPage(dataset), "utf8");
  await fs.writeFile(path.join(OUTPUT_ROOT, "COURSE_MAP.md"), makeCourseMap(dataset), "utf8");

  const byCategory = new Map();
  for (const video of dataset.videos) {
    if (!byCategory.has(video.category)) {
      byCategory.set(video.category, []);
    }
    byCategory.get(video.category).push(video);
  }

  for (const [category, videos] of byCategory.entries()) {
    await fs.writeFile(
      path.join(CATEGORY_DIR, `${slugify(category)}.md`),
      makeCategoryPage(category, videos),
      "utf8",
    );
  }

  for (const video of dataset.videos) {
    await fs.writeFile(path.join(VIDEO_DIR, `${video.slug}.md`), makeVideoPage(video), "utf8");
  }
}

async function main() {
  const playlist = await fetchPlaylistMetadata();
  const enrichedVideos = [];

  for (const video of playlist.videos) {
    process.stdout.write(`Fetching ${formatIndex(video.index)} ${video.shortTitle}...\n`);
    const details = await fetchWatchMetadata(video);
    enrichedVideos.push({
      ...video,
      ...details,
    });
  }

  const dataset = {
    playlistId: PLAYLIST_ID,
    playlistTitle: playlist.playlistTitle,
    playlistUrl: PLAYLIST_URL,
    totalVideosLabel: playlist.totalVideosLabel,
    scrapedAt: new Date().toISOString(),
    videos: enrichedVideos,
  };

  await writeGeneratedFiles(dataset);
  process.stdout.write(`Wrote wiki to ${OUTPUT_ROOT}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
