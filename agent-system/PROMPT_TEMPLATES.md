# Prompt Templates

## Codex Design Plan
```text
$sakurai-ue5 Plan a UE5 prototype for <mechanic>. Use Sakurai wiki retrieval, identify the smallest playable slice, and include a verification plan through Unreal MCP.
```

## Codex Implementation
```text
$sakurai-ue5 Implement the smallest verifiable UE5 slice for <feature>. Use Unreal MCP for editor and asset work, local edits for source code, and report the validation performed.
```

## Codex Review
```text
Use the Sakurai UE5 skill to review <feature or files>. Focus on player feel, responsiveness, readability, reward visibility, presentation stack, and what should be trimmed.
```

## Claude Code Plan
```text
/sakurai-plan <feature or mechanic>
```

## Claude Code Review
```text
/sakurai-review <feature, file, folder, Blueprint, or map>
```

## Claude Code Implementation
```text
/ue5-implement <small UE5 feature slice>
```

## Claude Code Playtest
```text
/ue5-playtest <map, mechanic, encounter, or flow>
```

## Claude Code Subagent Delegation
```text
Use the sakurai-router agent to pick sources for <task>.
```

```text
Use the sakurai-feel-reviewer agent to critique <combat, movement, animation, effects, or audio target>.
```

```text
Use the sakurai-ue5-implementer agent to implement the smallest playable slice for <feature>.
```
