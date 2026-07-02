---
description: Build a Sakurai-grounded UE5 feature plan without editing files.
allowed-tools: Read, Grep, Glob, Bash
---

Task: $ARGUMENTS

Use the local Sakurai wiki to produce an implementation-ready Unreal Engine 5 plan. Do not edit files.

Required steps:

1. Read `sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md`, `sakurai-llm-wiki/PRINCIPLES.md`, and `sakurai-llm-wiki/CATEGORY_LENSES.md`.
2. Run `node scripts/query_sakurai_wiki.mjs "$ARGUMENTS" --limit 8`.
3. Identify the relevant UE5 systems likely involved.
4. Produce the smallest playable vertical slice.

Return:

- Sources used
- Player-facing target
- UE5 systems touched
- Implementation sequence
- Verification plan
- Risks and open questions
