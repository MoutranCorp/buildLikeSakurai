# UE5 MCP Workflow

Use this workflow whenever an agent is connected to an Unreal Engine 5 MCP server.

## 1. Establish Context
- Confirm Unreal Editor reachability through MCP.
- Identify the `.uproject`, current map, active game mode, pawn/controller classes, and relevant plugins.
- Inspect source layout before editing C++.
- Inspect asset paths before touching Blueprints, widgets, materials, Niagara systems, sounds, or levels.

## 2. Retrieve Sakurai Sources
Run:

```powershell
node scripts/query_sakurai_wiki.mjs "<task summary>" --limit 8
```

Use the retrieval results to decide which design lens dominates: feel, readability, reward, onboarding, production, audio, visual hierarchy, or marketing.

## 3. Choose A Vertical Slice
Prefer one playable loop over a broad incomplete system.

A good slice contains:

- One player action
- One clear response
- One feedback stack
- One success or failure condition
- One verification method inside Unreal

## 4. Implement With The Right Surface
- Use MCP for editor state, assets, Blueprints, levels, actors, components, materials, UMG, input mappings, logs, PIE, and validation.
- Use file edits for C++, config, scripts, docs, and generated source files when appropriate.
- Keep asset names explicit and searchable.
- Avoid broad asset migrations or project setting changes unless the task requires them.

## 5. Sakurai Tuning Pass
Check:

- Input response arrives quickly enough.
- The player can read the result at play speed.
- Animation, effects, audio, camera, and UI emphasize the same event.
- Rewards and retries respect the player's time.
- The concept is stronger after the change, not just larger.
- Something unnecessary was trimmed or deliberately left out.

## 6. Verify
Use the strongest available checks:

- C++ compile or Unreal build
- Blueprint compile
- Asset validation
- Map load
- Play in editor or simulate
- Output log inspection
- Screenshot or viewport inspection
- Manual playtest checklist

Report exactly what was run and what remains unverified.
