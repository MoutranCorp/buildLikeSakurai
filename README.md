# Sakurai UE5 Agent System

Plug-and-play Codex and Claude Code agent system for making games in Unreal Engine 5 with an Unreal MCP server, guided by a local Sakurai LLM wiki.

## Install Into A Game Repo
Tell your coding agent:

```text
Install this agent system into my Unreal Engine 5 repo:
https://github.com/MoutranCorp/buildLikeSakurai

Use the repo's INSTALL_FOR_AGENTS.md instructions.
```

The agent should clone this repo and run:

```powershell
node scripts/install_into_repo.mjs --target "PATH_TO_TARGET_REPO"
```

If running directly from GitHub with npm/npx:

```powershell
npx github:MoutranCorp/buildLikeSakurai --target "PATH_TO_TARGET_REPO"
```

## Start Here
- Agent install guide: [INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md)
- Agent setup: [agent-system/README.md](agent-system/README.md)
- Sakurai wiki: [sakurai-llm-wiki/README.md](sakurai-llm-wiki/README.md)
- Codex instructions: [AGENTS.md](AGENTS.md)
- Claude Code instructions: [CLAUDE.md](CLAUDE.md)

## Common Commands
```powershell
node scripts/query_sakurai_wiki.mjs "combat hit impact responsiveness" --limit 8
```

```powershell
node scripts/build_sakurai_wiki.mjs
```

```powershell
npm run check
```

## Main Workflows
- Codex: use `$sakurai-ue5` or ask for Sakurai-guided UE5 design, implementation, or review.
- Claude Code: use `/sakurai-plan`, `/sakurai-review`, `/ue5-implement`, or `/ue5-playtest`.
- Unreal MCP: agents should discover available MCP tools, inspect editor/project state, implement small vertical slices, and verify in Unreal when possible.
