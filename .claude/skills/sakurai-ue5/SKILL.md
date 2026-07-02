---
name: sakurai-ue5
description: Use when designing, implementing, reviewing, or tuning Unreal Engine 5 games with an Unreal MCP using the Sakurai course wiki.
---

# Sakurai UE5 Skill

Use this skill for gameplay mechanics, prototypes, combat feel, UI, animation, effects, audio, Blueprint work, C++ gameplay code, Unreal asset setup, playtest planning, and design review.

## Required First Steps
1. Read `../../../sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md`.
2. Read `../../../sakurai-llm-wiki/PRINCIPLES.md`.
3. Check `../../../sakurai-llm-wiki/CATEGORY_LENSES.md` and pick the relevant course categories.
4. Run the local retriever from the workspace root:

```powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
```

Use `--pack` when the answer needs direct source capsules. Use `--category "<category name>"` when the task clearly belongs to one course area.

## Unreal MCP Workflow
1. Discover available Unreal MCP tools and inspect current editor/project state.
2. Identify the smallest playable vertical slice.
3. Make changes through Unreal MCP for editor, Blueprint, actor, level, material, input, and asset operations.
4. Use file edits for C++, config, scripts, and docs when normal Unreal source workflow calls for it.
5. Compile or validate affected Blueprints/assets through Unreal MCP when possible.
6. Verify gameplay through the strongest available loop: compile, map load, play in editor or simulate, logs, screenshots, and a manual test checklist.

## Design Review Lens
Every recommendation should answer:

- What should the player feel or understand?
- Is input responsiveness trustworthy?
- Is state readable at play speed?
- Are rewards, failure, and progress visible?
- Do animation, audio, effects, camera, timing, and UI support the mechanic?
- What should be trimmed or simplified?
- What was verified in Unreal, and what remains unverified?

## Source Discipline
The wiki is not a full transcript archive. It contains metadata, official public descriptions, category pages, and synthesis docs. Cite local wiki pages when making course-backed claims. Do not invent exact video wording.

## Preferred Output Shape
- Sources used
- Player-facing target
- Proposed slice or implemented change
- Sakurai-style reasoning
- Unreal MCP actions or local edits
- Verification performed
- Remaining checks
