---
description: Review a game feature through the Sakurai wiki lens.
allowed-tools: Read, Grep, Glob, Bash
---

Review target: $ARGUMENTS

Use the local Sakurai wiki to review the target. Do not edit files.

Required steps:

1. Read `sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md`, `sakurai-llm-wiki/PRINCIPLES.md`, and `sakurai-llm-wiki/CATEGORY_LENSES.md`.
2. Run `node scripts/query_sakurai_wiki.mjs "$ARGUMENTS" --limit 10`.
3. Inspect relevant project files if a file, folder, or system is named.

Return findings ordered by player impact:

- Player-facing issue
- Why it matters
- Smallest useful fix
- What to trim
- Wiki sources used
- Verification recommendation
