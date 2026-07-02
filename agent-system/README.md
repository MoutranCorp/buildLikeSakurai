# Sakurai UE5 Agent System

This folder explains the plug-and-play setup for using the Sakurai wiki with Codex, Claude Code, and an Unreal Engine 5 MCP server.

## Installing This System Into Another Repo
From this installer repo:

```powershell
node scripts/install_into_repo.mjs --target "PATH_TO_TARGET_REPO"
```

From GitHub with npx:

```powershell
npx github:MoutranCorp/buildLikeSakurai --target "PATH_TO_TARGET_REPO"
```

The installer copies the wiki, scripts, skills, Claude commands, Claude subagents, and workflow docs into the target repo. It appends marked blocks to `AGENTS.md` and `CLAUDE.md` instead of replacing existing project instructions.

## What Is Installed
- `AGENTS.md`: always-on Codex project instructions.
- `CLAUDE.md`: always-on Claude Code project memory.
- `.agents/skills/sakurai-ue5/SKILL.md`: Codex skill.
- `.claude/skills/sakurai-ue5/SKILL.md`: Claude Code skill.
- `.claude/commands/*.md`: Claude Code slash commands for planning, review, implementation, and playtest.
- `.claude/agents/*.md`: Claude Code project subagents for focused routing, design, review, and UE5 implementation.
- `scripts/query_sakurai_wiki.mjs`: local retrieval command shared by both tools.

## Codex Quick Start
Start Codex from the workspace root. Codex should load `AGENTS.md` automatically and discover the repo skill in `.agents/skills`.

Useful prompts:

```text
$sakurai-ue5 Design a UE5 prototype for a traversal mechanic with satisfying jump recovery and quick retries.
```

```text
Use the Sakurai UE5 skill to review this combat prototype through responsiveness, readability, animation, effects, and audio.
```

Codex can also trigger the skill implicitly for game design or Unreal tasks because the skill description is scoped to UE5 game development.

## Claude Code Quick Start
Start Claude Code from the workspace root. Claude should load `CLAUDE.md`, `.claude/skills`, `.claude/commands`, and `.claude/agents`.

Useful commands:

```text
/sakurai-plan prototype a lock-on dash attack for UE5
```

```text
/sakurai-review Content/Blueprints/BP_Player.uasset movement feel and readability
```

```text
/ue5-implement add a small verifiable prototype for a quick-retry checkpoint loop
```

```text
/ue5-playtest the current combat encounter map
```

Useful subagent requests:

```text
Use the sakurai-feel-reviewer agent to critique the current melee attack.
```

```text
Use the sakurai-ue5-implementer agent to implement the smallest playable slice.
```

## Unreal MCP Requirement
The exact MCP server name and tool names can vary. The agent instructions intentionally require tool discovery before calling Unreal tools.

At the start of a UE5 task, the agent should verify:

- Unreal Editor is running or reachable by the MCP server.
- The target `.uproject`, current level, and relevant assets/classes are known.
- Available MCP tools can inspect assets, actors, Blueprints, logs, and editor state.
- The requested change can be validated through compile, Blueprint validation, map load, play in editor, simulate, logs, or screenshots.

## Retrieval Command
Use this command directly when you want to see the sources an agent should use:

```powershell
node scripts/query_sakurai_wiki.mjs "combat hit impact responsiveness" --limit 8
```

Use `--pack` to print full retrieved video pages:

```powershell
node scripts/query_sakurai_wiki.mjs "tutorial onboarding first time player" --category "Planning & Game Design" --pack
```

## Recommended Agent Loop
1. Retrieve relevant Sakurai pages.
2. Inspect UE5 project/editor state through MCP.
3. Define the smallest playable vertical slice.
4. Implement through MCP and local source edits as appropriate.
5. Validate in Unreal.
6. Report player-facing result, sources used, verification, and remaining manual checks.

## Source Caveat
The wiki is not a full transcript archive. It is grounded in playlist metadata, public official descriptions, generated category pages, and synthesis docs. Agents should cite local wiki pages and avoid unsupported exact transcript claims.
