#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const START = "<!-- SAKURAI_UE5_AGENT_SYSTEM:START -->";
const END = "<!-- SAKURAI_UE5_AGENT_SYSTEM:END -->";

function usage() {
  return `Usage:
  node scripts/install_into_repo.mjs --target <repo-path> [--force]

Examples:
  node scripts/install_into_repo.mjs --target .
  node scripts/install_into_repo.mjs --target "C:\\Projects\\MyUnrealGame" --force

If this package is installed through npx from GitHub:
  npx github:MoutranCorp/buildLikeSakurai --target .
`;
}

function parseArgs(argv) {
  const options = {
    target: process.cwd(),
    force: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--target") {
      options.target = argv[++i] ?? options.target;
    } else if (arg === "--force") {
      options.force = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function copyManagedPath(sourceRelative, targetRoot) {
  const source = path.join(SOURCE_ROOT, sourceRelative);
  const target = path.join(targetRoot, sourceRelative);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source path: ${source}`);
  }

  ensureDir(path.dirname(target));
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
}

function upsertBlock(file, heading, blockBody) {
  const original = readIfExists(file);
  const block = `${START}\n${blockBody.trim()}\n${END}`;

  if (!original.trim()) {
    writeFile(file, `# ${heading}\n\n${block}\n`);
    return "created";
  }

  const pattern = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`);
  if (pattern.test(original)) {
    writeFile(file, original.replace(pattern, block));
    return "updated";
  }

  writeFile(file, `${original.trimEnd()}\n\n${block}\n`);
  return "appended";
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAgentsBlock() {
  return `
## Sakurai UE5 Agent System
This repo has the Sakurai UE5 agent system installed.

For game design, Unreal Engine 5, gameplay, UI, animation, effects, audio, production, or review tasks:

1. Read \`sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md\` and \`sakurai-llm-wiki/PRINCIPLES.md\`.
2. Use \`sakurai-llm-wiki/CATEGORY_LENSES.md\` to route the task.
3. Retrieve relevant source pages before substantial work:

\`\`\`powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
\`\`\`

Use Unreal MCP for editor, Blueprint, actor, level, asset, material, input, and validation work when available. Discover the actual MCP tools and current editor/project state before making assumptions.

For full workflow docs, read \`agent-system/README.md\` and \`agent-system/UE5_MCP_WORKFLOW.md\`.
`;
}

function buildClaudeBlock() {
  return `
## Sakurai UE5 Agent System
This repo has the Sakurai UE5 agent system installed.

Use the local Sakurai wiki and Unreal MCP for game design, UE5 implementation, tuning, review, UI, animation, effects, audio, production, and marketing tasks.

Before substantial game work, run:

\`\`\`powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
\`\`\`

Claude Code project skill: \`/sakurai-ue5\`
Claude Code project commands: \`/sakurai-plan\`, \`/sakurai-review\`, \`/ue5-implement\`, \`/ue5-playtest\`
Claude Code project subagents: \`sakurai-router\`, \`sakurai-game-designer\`, \`sakurai-feel-reviewer\`, \`sakurai-ui-reviewer\`, \`sakurai-production-director\`, \`sakurai-ue5-implementer\`

For full workflow docs, read \`agent-system/README.md\` and \`agent-system/UE5_MCP_WORKFLOW.md\`.
`;
}

function writeManifest(targetRoot, copiedPaths, instructionStatus) {
  const manifest = {
    name: "sakurai-ue5-agent-system",
    installedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    copiedPaths,
    instructionFiles: instructionStatus,
    nextSteps: [
      "Restart Codex or Claude Code so skills, commands, and subagents are discovered.",
      "Configure or start your Unreal Engine 5 MCP server.",
      "Run node scripts/query_sakurai_wiki.mjs \"combat hit impact responsiveness\" --limit 5 to verify retrieval.",
    ],
  };

  writeFile(
    path.join(targetRoot, "agent-system", "install-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
}

function install(options) {
  const targetRoot = path.resolve(options.target);
  ensureDir(targetRoot);

  if (targetRoot === SOURCE_ROOT && !options.force) {
    throw new Error("Target is the installer repo itself. Pass --force only if you intend to reinstall in place.");
  }

  const managedPaths = [
    "sakurai-llm-wiki",
    path.join("agent-system", "README.md"),
    path.join("agent-system", "UE5_MCP_WORKFLOW.md"),
    path.join("agent-system", "AGENT_ROLES.md"),
    path.join("agent-system", "PROMPT_TEMPLATES.md"),
    path.join("scripts", "query_sakurai_wiki.mjs"),
    path.join("scripts", "build_sakurai_wiki.mjs"),
    path.join(".agents", "skills", "sakurai-ue5"),
    path.join(".claude", "skills", "sakurai-ue5"),
    path.join(".claude", "commands"),
    path.join(".claude", "agents"),
  ];

  for (const managedPath of managedPaths) {
    copyManagedPath(managedPath, targetRoot);
  }

  const instructionStatus = {
    AGENTS: upsertBlock(path.join(targetRoot, "AGENTS.md"), "AGENTS.md", buildAgentsBlock()),
    CLAUDE: upsertBlock(path.join(targetRoot, "CLAUDE.md"), "CLAUDE.md", buildClaudeBlock()),
  };

  writeManifest(targetRoot, managedPaths, instructionStatus);

  return {
    targetRoot,
    copiedPaths: managedPaths,
    instructionStatus,
  };
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
    process.exit(0);
  }

  const result = install(options);
  process.stdout.write(`Installed Sakurai UE5 agent system into ${result.targetRoot}\n`);
  process.stdout.write(`Instruction files: ${JSON.stringify(result.instructionStatus)}\n`);
  process.stdout.write("Restart Codex or Claude Code, then configure/start your Unreal MCP server.\n");
} catch (error) {
  process.stderr.write(`${error.message}\n\n${usage()}`);
  process.exit(1);
}
