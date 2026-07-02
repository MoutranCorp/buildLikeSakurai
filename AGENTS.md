# AGENTS.md

## Project Purpose
This workspace is a Sakurai-guided game development agent system for Unreal Engine 5 work through an Unreal MCP server.

The local knowledge base is in `sakurai-llm-wiki/`. It is generated from Masahiro Sakurai's "Creating Games" playlist and should shape design reasoning, review criteria, and implementation priorities. Do not imitate Sakurai's voice. Apply the design lens: player feel, clarity, responsiveness, reward visibility, concept integrity, and disciplined trimming.

## Required Sakurai Context
For game design, Unreal Engine, gameplay, UI, animation, effects, audio, production, or review tasks:

1. Read `sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md` and `sakurai-llm-wiki/PRINCIPLES.md` if they are not already in context.
2. Use `sakurai-llm-wiki/CATEGORY_LENSES.md` to decide which course areas apply.
3. Run retrieval before planning substantial work:

```powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
```

Use `--category "<category name>"` when the category is obvious. Use `--pack` when you need full source capsules in the prompt.

## Unreal MCP Operating Contract
- First discover the available Unreal MCP tools and current editor/project state. Tool names vary by MCP server, so inspect what is available instead of assuming exact names.
- Prefer Unreal MCP operations for editor state, assets, Blueprints, actors, levels, materials, input mappings, project settings, and play-in-editor checks.
- Use direct file edits for C++, config, scripts, docs, and source assets only when that is the appropriate Unreal workflow.
- Never assume asset paths, map names, class names, or plugin layout. Inspect first.
- Keep changes small enough to verify. For larger features, build in vertical slices: mechanic, feedback, UI, tuning, verification.
- After asset or Blueprint changes, compile or validate them through Unreal MCP when possible.
- After gameplay changes, verify with the strongest available loop: compile, open map, simulate or play in editor, inspect logs, and report remaining manual checks.
- If the Unreal MCP is unavailable, state that clearly and continue with code or design work that can be done locally.

## Sakurai Review Standard
When reviewing or implementing a game feature, cover:

- Player-facing intent: what should the player feel or understand?
- Responsiveness: does input produce trustworthy feedback quickly?
- Readability: can the player parse state, danger, reward, and result at play speed?
- Reward and motivation: does the feature make success, recovery, and progress visible?
- Presentation stack: do animation, audio, effects, UI, camera, and timing support the mechanic?
- Trim pass: what can be removed or simplified without weakening the core?
- Verification: what was tested in Unreal, and what still needs editor or playtest confirmation?

## Source Limits
The wiki is not a full transcript archive. It contains playlist metadata, official public video descriptions, category pages, and synthesis notes. When citing Sakurai course evidence, refer to local wiki files and avoid claiming exact transcript-level wording unless the source page contains it.

## Output Expectations
- Lead with the concrete player-facing problem or implementation result.
- Prefer the smallest effective fix before proposing broad redesign.
- Cite the relevant wiki pages used for game-design claims.
- For Unreal work, report the exact editor/MCP validation performed or explain why it could not be run.
