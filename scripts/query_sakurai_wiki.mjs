import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WIKI_ROOT = path.join(ROOT, "sakurai-llm-wiki");
const DATA_PATH = path.join(WIKI_ROOT, "data", "sakurai_playlist.json");

const CATEGORY_ROUTES = {
  "Design Specifics": [
    "combat",
    "hit",
    "input",
    "jump",
    "speed",
    "collision",
    "ledge",
    "button",
    "responsiveness",
  ],
  Animation: [
    "animation",
    "pose",
    "attack",
    "motion",
    "blend",
    "follow",
    "recoil",
    "anticipation",
  ],
  Effects: ["effect", "screen shake", "flash", "particle", "hit", "impact", "feedback", "trail", "smoke"],
  Audio: ["audio", "sound", "music", "reverb", "ambience", "voice", "mix", "impact"],
  UI: ["ui", "hud", "menu", "text", "loading", "button settings", "help"],
  Graphics: ["graphics", "visual", "scale", "color", "readability", "style", "pixel"],
  "Game Essence": ["loop", "reward", "fun", "strategy", "difficulty", "enemy", "random", "combat"],
  "Planning & Game Design": [
    "tutorial",
    "onboarding",
    "design",
    "planning",
    "prototype",
    "demo",
    "retry",
    "player",
  ],
  "Team Management": ["team", "director", "producer", "feedback", "communication", "trim"],
  "Programming & Tech": ["debug", "parameter", "ticket", "file", "tune", "system"],
  "Work Ethic": ["proposal", "work", "deadline", "discipline", "decision", "organize"],
  Marketing: ["marketing", "website", "reveal", "market", "audience", "trailer"],
  "Game Concepts": ["kirby", "smash", "meteos", "concept", "case study"],
  "Grab Bag": ["history", "industry", "hardware", "column", "famicom", "nes"],
};

function usage() {
  return `Usage:
  node scripts/query_sakurai_wiki.mjs "query terms" [--limit 8] [--category "Game Essence"] [--json] [--pack]

Examples:
  node scripts/query_sakurai_wiki.mjs "combat hit impact responsiveness" --limit 8
  node scripts/query_sakurai_wiki.mjs "tutorial onboarding first time player" --category "Planning & Game Design" --pack
`;
}

function parseArgs(argv) {
  const queryParts = [];
  const options = {
    limit: 8,
    categories: [],
    json: false,
    pack: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--pack") {
      options.pack = true;
    } else if (arg === "--limit") {
      options.limit = Number(argv[++i] ?? options.limit);
    } else if (arg === "--category") {
      options.categories.push(argv[++i] ?? "");
    } else {
      queryParts.push(arg);
    }
  }

  return {
    query: queryParts.join(" ").trim(),
    options,
  };
}

function normalize(input) {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(input) {
  return normalize(input)
    .split(" ")
    .filter((token) => token.length > 1);
}

function inferCategories(query) {
  const normalized = normalize(query);
  const inferred = [];
  for (const [category, terms] of Object.entries(CATEGORY_ROUTES)) {
    if (terms.some((term) => ` ${normalized} `.includes(` ${normalize(term)} `))) {
      inferred.push(category);
    }
  }
  return inferred;
}

function countMatches(haystack, queryTokens) {
  const normalized = ` ${normalize(haystack)} `;
  let total = 0;
  for (const token of queryTokens) {
    const variants = token.length > 3
      ? [token, token.endsWith("s") ? token.slice(0, -1) : `${token}s`]
      : [token];

    if (variants.some((variant) => normalized.includes(` ${variant} `))) {
      total += 1;
    }
  }
  return total;
}

function scoreVideo(video, query, selectedCategories) {
  const queryTokens = tokens(query);
  const inferredCategories = inferCategories(query);
  const categorySet = new Set([...selectedCategories, ...inferredCategories]);
  const directSignal =
    countMatches(video.shortTitle, queryTokens) +
    countMatches(video.title, queryTokens) +
    countMatches(video.category, queryTokens) +
    countMatches(video.summarySentence, queryTokens);
  let score = 0;

  score += countMatches(video.shortTitle, queryTokens) * 10;
  score += countMatches(video.title, queryTokens) * 8;
  score += countMatches(video.category, queryTokens) * 6;
  score += countMatches(video.summarySentence, queryTokens) * 5;
  score += countMatches(video.description, queryTokens) * 2;
  score += countMatches((video.keywords ?? []).join(" "), queryTokens) * 2;

  if (categorySet.has(video.category)) {
    score += 18;
  }

  if (inferredCategories.length && !categorySet.has(video.category)) {
    score -= 15;
  }

  if (inferredCategories.length && !categorySet.has(video.category) && directSignal === 0) {
    score -= 100;
  }

  if (selectedCategories.length && !selectedCategories.includes(video.category)) {
    score -= 1000;
  }

  return score;
}

function loadDataset() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Missing wiki dataset at ${DATA_PATH}`);
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function videoPath(video) {
  return path.join(WIKI_ROOT, "videos", `${video.slug}.md`);
}

function resultFor(video, score) {
  return {
    score,
    index: video.index,
    title: video.shortTitle,
    category: video.category,
    url: video.url,
    file: videoPath(video),
    summary: video.summarySentence,
  };
}

function search(query, options) {
  const dataset = loadDataset();
  const selectedCategories = options.categories
    .flatMap((category) => category.split(","))
    .map((category) => category.trim())
    .filter(Boolean);

  return dataset.videos
    .map((video) => resultFor(video, scoreVideo(video, query, selectedCategories)))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, options.limit);
}

function formatResults(results, query) {
  if (!results.length) {
    return `No Sakurai wiki results for: ${query}\n`;
  }

  const lines = [`Sakurai wiki results for: ${query}`, ""];
  for (const result of results) {
    lines.push(`${String(result.index).padStart(3, "0")} | ${result.category} | ${result.title}`);
    lines.push(`score: ${result.score}`);
    lines.push(`file: ${result.file}`);
    lines.push(`summary: ${result.summary}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function formatPack(results, query) {
  const lines = [
    "# Sakurai Retrieval Pack",
    "",
    `Query: ${query}`,
    "",
    "Use this alongside sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md and sakurai-llm-wiki/PRINCIPLES.md.",
    "",
  ];

  for (const result of results) {
    const content = fs.readFileSync(result.file, "utf8");
    lines.push(`## ${String(result.index).padStart(3, "0")} ${result.title}`);
    lines.push("");
    lines.push(`Category: ${result.category}`);
    lines.push(`Source file: ${result.file}`);
    lines.push("");
    lines.push(content.trim());
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

const { query, options } = parseArgs(process.argv.slice(2));

if (options.help || !query) {
  process.stdout.write(usage());
  process.exit(options.help ? 0 : 1);
}

const results = search(query, options);

if (options.json) {
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} else if (options.pack) {
  process.stdout.write(formatPack(results, query));
} else {
  process.stdout.write(formatResults(results, query));
}
