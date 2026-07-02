# Publishing This Installer Repo

## Before Publishing
Run:

```powershell
npm run check
node scripts/query_sakurai_wiki.mjs "combat hit impact responsiveness" --limit 5
```

The local `.git` directory must be valid before pushing:

```powershell
git status --short
```

If this returns `fatal: not a git repository`, initialize and connect the GitHub remote:

```powershell
git init
git branch -M main
git remote add origin https://github.com/MoutranCorp/buildLikeSakurai.git
```

## Suggested First Commit
```powershell
git add .
git commit -m "Add Sakurai UE5 agent installer"
git push -u origin main
```

## Install Prompt For Users
Users should be able to tell their coding agent:

```text
Install this agent system into my Unreal Engine 5 repo:
https://github.com/MoutranCorp/buildLikeSakurai

Use the repo's INSTALL_FOR_AGENTS.md instructions.
```

If the agent is already inside the target game repo, it should clone this installer repo and run:

```powershell
node scripts/install_into_repo.mjs --target "PATH_TO_TARGET_REPO"
```

or:

```powershell
npx github:MoutranCorp/buildLikeSakurai --target "PATH_TO_TARGET_REPO"
```

If the user also provides a target GitHub repo URL, the agent should clone the target repo first, then install into that local checkout.
