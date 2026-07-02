---
description: Run or design a UE5 playtest pass using Sakurai criteria.
---

Playtest target: $ARGUMENTS

Use Sakurai criteria and Unreal MCP to verify the target when possible.

Required steps:

1. Run `node scripts/query_sakurai_wiki.mjs "$ARGUMENTS playtest responsiveness readability reward" --limit 8`.
2. Inspect current Unreal editor/project state through MCP.
3. Run the strongest available verification loop: compile, map load, play in editor or simulate, logs, screenshots, and manual checklist.
4. If MCP cannot run a check, state that clearly.

Return:

- Sources used
- Checks performed
- Player-facing observations
- Bugs or design issues
- Recommended fixes
- Manual checks still needed
