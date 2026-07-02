---
description: Implement a small UE5 vertical slice with Sakurai wiki retrieval and Unreal MCP validation.
---

Implementation target: $ARGUMENTS

Use the `/sakurai-ue5` workflow. Implement only a small verifiable vertical slice unless the user explicitly asks for a larger change.

Required steps:

1. Read the Sakurai operating docs if not already in context.
2. Run `node scripts/query_sakurai_wiki.mjs "$ARGUMENTS" --limit 8`.
3. Discover available Unreal MCP tools and inspect current editor/project state.
4. Plan the smallest playable slice.
5. Make the change using Unreal MCP for editor, asset, Blueprint, actor, level, input, material, and validation work when available.
6. Use local file edits for C++, config, scripts, and docs where appropriate.
7. Verify through Unreal MCP or local build/test commands.

Return:

- Sources used
- Implemented slice
- Files and Unreal assets touched
- MCP actions performed
- Verification performed
- Remaining manual checks
