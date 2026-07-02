# Install Instructions For AI Coding Agents

You are reading this because a user asked you to install the Sakurai UE5 agent system into a game repository.

## Goal
Install this repository's Codex and Claude Code agent harness into the user's target Unreal Engine 5 repository so future agents can use:

- Codex project instructions and the `$sakurai-ue5` skill
- Claude Code `CLAUDE.md`, `/sakurai-ue5`, slash commands, and subagents
- The local Sakurai wiki retrieval command
- UE5 MCP operating docs

## Required Inputs
- Source repo URL: this GitHub repository.
- Target repo: the user's Unreal Engine 5 game repository URL or an already-open local target path.

If the user only pasted this source repo URL, ask for or infer the target repo/path before installing.

## Preferred Agent Flow
1. If the user gives a target GitHub repo URL, clone that target repo first.
2. Clone this installer repo into a temporary directory outside the target repo.
3. Run the installer with `--target` pointing at the target repo.
4. Verify retrieval from inside the target repo.
5. Report the files installed and remind the user to restart Codex or Claude Code.

## Install From A Cloned Source Repo
From the source repo root, run:

```powershell
node scripts/install_into_repo.mjs --target "PATH_TO_TARGET_REPO"
```

## Install Directly With npm/npx From GitHub
If the user provides a GitHub URL for this installer repo, use:

```powershell
npx github:MoutranCorp/buildLikeSakurai --target "PATH_TO_TARGET_REPO"
```

## What The Installer Does
- Copies `sakurai-llm-wiki/` into the target repo.
- Copies the shared query/build scripts into `scripts/`.
- Copies Codex skills into `.agents/skills/sakurai-ue5/`.
- Copies Claude Code skills, commands, and subagents into `.claude/`.
- Adds or updates marked Sakurai UE5 blocks in `AGENTS.md` and `CLAUDE.md`.
- Writes `agent-system/install-manifest.json`.

The installer does not configure the user's Unreal MCP server. After install, verify MCP availability in the user's agent environment.

## Verification
Run from the target repo:

```powershell
node scripts/query_sakurai_wiki.mjs "combat hit impact responsiveness" --limit 5
```

Then restart Codex or Claude Code so the new skill, commands, and subagents are discovered.

## Safety
- Do not delete existing project instructions.
- The installer appends or replaces only the marked `SAKURAI_UE5_AGENT_SYSTEM` block in `AGENTS.md` and `CLAUDE.md`.
- If the target has heavy local modifications, inspect `git status --short` before and after install.
