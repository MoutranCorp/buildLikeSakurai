# CLAUDE.md

This project is a Sakurai-guided Unreal Engine 5 agent workspace. Claude Code should use the local Sakurai wiki and the Unreal MCP whenever the task involves game design, implementation, tuning, review, UI, animation, effects, audio, production process, or marketing.

## Always-Loaded Context
- Core behavior: `sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md`
- Condensed heuristics: `sakurai-llm-wiki/PRINCIPLES.md`
- Routing: `sakurai-llm-wiki/CATEGORY_LENSES.md`
- Ingestion guide: `sakurai-llm-wiki/INGESTION_ORDER.md`
- Source caveats: `sakurai-llm-wiki/SOURCING_LIMITS.md`

Do not imitate Sakurai's voice. Apply the design lens: player feel, clarity, responsiveness, reward visibility, concept integrity, and disciplined trimming.

## Retrieval Rule
Before substantial game design or Unreal work, run:

```powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
```

Use `--pack` when the task needs direct source capsules. Use `--category "<category name>"` when the relevant course area is clear.

## Claude Code Project Capabilities
- Project skill: `/sakurai-ue5`
- Project commands: `/sakurai-plan`, `/sakurai-review`, `/ue5-implement`, `/ue5-playtest`
- Project subagents: `sakurai-router`, `sakurai-game-designer`, `sakurai-feel-reviewer`, `sakurai-ui-reviewer`, `sakurai-production-director`, `sakurai-ue5-implementer`

Use subagents for focused exploration or critique. Keep the main thread responsible for final decisions and actual implementation unless the user asks for delegation.

## Unreal MCP Operating Contract
- Discover available Unreal MCP tools and current editor/project state before using them.
- Prefer Unreal MCP operations for assets, Blueprints, actors, levels, materials, input mappings, project settings, and editor validation.
- Use direct file edits for C++, config, scripts, docs, and source assets when that is the appropriate Unreal workflow.
- Never assume asset paths, map names, class names, or plugin layout. Inspect first.
- Build game features in small vertical slices and verify each slice.
- After asset or Blueprint changes, compile or validate through Unreal MCP when possible.
- After gameplay changes, verify with the strongest available loop: compile, map load, simulate or play in editor, logs, screenshots, or manual test checklist.
- If Unreal MCP is unavailable, state that clearly and do only the parts that can be handled locally.

## Review Standard
Every game feature review should address player-facing intent, responsiveness, readability, reward visibility, presentation stack, what to trim, and what was verified.

## Source Limits
The wiki is not a full transcript archive. It is grounded in playlist metadata, official public descriptions, generated category pages, and synthesis notes. Cite local wiki files when using course evidence and avoid unsupported transcript-level claims.
