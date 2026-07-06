# The Production Manual

## From Zero to Smash-Ultimate-Quality Fighters: Robin Hood & Red Riding Hood

**A complete, step-by-step operating manual for the human director of an AI-agent-driven UE5 platform fighter.**

---

**Who this is for.** You — the single human on this project. You are the director. A studio of AI agents (Claude Code sessions, subagents, and generative tools) does roughly 90% of the labor. This manual tells you, in order, every step required to go from an empty machine to two playable fighters whose models, animations, and game feel stand comparison with Super Smash Bros. Ultimate.

**How to read this manual.** Parts are sequential. Do not skip Part 2 (Foundation) to get to characters faster — the foundation *is* the studio, and every later part assumes it exists. Checklists marked **GATE** are hard exit criteria: do not proceed past a gate until every box is checked. Text in `monospace` is a literal name, path, command, or value. Citations like (`wiki: 049`) refer to files in `sakurai-llm-wiki/videos/` — the design law this project operates under.

**The one-sentence version of the whole manual.** Build the agent pipeline first, prove the game feel on free mannequins second, spend art effort only on proven kits third, and protect your own time for the three things only you can do: taste, feel, and trimming.

---

## Table of Contents

- **Part 0 — The Project Charter**: goal, quality bar, operating model, your job description
- **Part 1 — Prerequisites**: hardware, software, accounts, installs, legal groundwork
- **Part 2 — Milestone M0, The Foundation**: UE project, conventions, version control, data schemas, debug tooling, the agent pipeline harness
- **Part 3 — Working With Agents**: session patterns, prompt discipline, the review workflow, guardrails
- **Part 4 — The Design Phase**: character fantasy documents, movement specs, silhouette process, art direction lock
- **Part 5 — Milestone M1, The One True Attack**: movement tuning, the first two attacks, hit-stop, reactions, effects, sound
- **Part 6 — Milestone M2, Red Riding Hood's Kit on the Mannequin**: full move list, frame data, playtesting
- **Part 7 — Model Production**: concept generation, generative 3D, retopology, UVs, texturing, team colors, LODs
- **Part 8 — Rigging**: the shared skeleton, accessory chains, facial rig, quality checks
- **Part 9 — Animation Production**: locomotion, the attack-authoring loop, damage set, blending
- **Part 10 — Integration & Presentation**: Animation Blueprints, notifies, camera, VFX, audio
- **Part 11 — Milestone M4, Robin Hood**: the pipeline's second run, projectiles
- **Part 12 — Milestone M5, The Versus Slice**: stage, camera, tuning, human playtests
- **Part 13 — Milestone M6, The Trim Gate**: the director's cut pass and master quality checklists
- **Appendix A — Naming Conventions Reference**
- **Appendix B — Agent Prompt Library**
- **Appendix C — Frame Data Starting Values**
- **Appendix D — Sakurai Wiki Source Index for This Project**
- **Appendix E — Troubleshooting**
- **Appendix F — Glossary**

---

# Part 0 — The Project Charter

## 0.1 The Goal, Stated Precisely

Build a 3D platform fighter in Unreal Engine 5 featuring public-domain folk characters — first Robin Hood and Red Riding Hood — where per-character model quality, animation craft, readability, and game feel are on par with Super Smash Bros. Ultimate.

Be precise about what "on par with Smash Ultimate" means, because getting this wrong wastes months:

- It **does not** mean matching Ultimate's roster size (89 fighters), stage count, mode count, or content volume. Ultimate was made by 800+ developers over years, on top of two decades of accumulated assets. Chasing volume is how a solo project dies.
- It **does** mean matching Ultimate's bar on the things a player experiences in any single match:
  1. **Readability.** At full gameplay zoom, with four characters moving, every fighter is identifiable by silhouette alone, and every attack telegraphs before it lands (`wiki: 239`, `wiki: 049`).
  2. **Responsiveness.** Input to first visible response in at most 2 frames at 60 fps, on every action, always (`PRINCIPLES.md`, Feel and Timing).
  3. **Animation craft.** Every attack has a deliberate lead-in, a held identity pose at contact, and a follow-through that sells weight and consequence (`wiki: 036`, `wiki: 062`, `wiki: 077`).
  4. **Impact.** Hits land with layered feedback — hit-stop, reaction animation, effect, sound — that makes the result legible in a single glance (`wiki: 141`, `wiki: 035`).
  5. **Character identity.** Ten seconds of moving a character tells the player what kind of fighter they are, without text.

The scope that carries this bar: **2 fighters, 1 stage, 1 mode (versus), at 60 fps locked.** Everything else is post-M6 expansion.

## 0.2 The Operating Model: One Director, an Agent Studio

Ninety percent of the labor on this project is performed by AI agents. This is not a compromise — it maps cleanly onto how Sakurai describes direction: the director's irreplaceable work is deciding, aligning, resolving, and trimming, not producing every asset personally (`wiki: 230`, `wiki: 254`). It also sidesteps the coordination tax that makes ten people produce seven people's work (`wiki: 088`) — agents do not hold meetings, do not block each other, and parallelize freely.

**Division of labor, permanently fixed:**

| Work | Owner |
|---|---|
| All gameplay code (movement, hitboxes, hit-stop, states, damage) | Agents |
| All Unreal editor work via Unreal MCP (Blueprints, AnimBPs, notifies, materials, Niagara, MetaSounds, DataTables) | Agents |
| All Blender work via headless Python scripting (cleanup, retopo assist, UVs, rigging, weights, export) | Agents |
| Driving generative tools (concept images, generative 3D, texture generation, motion libraries) | Agents |
| Animation keyframing from written pose specs, via Control Rig / Blender scripting | Agents |
| Automated verification (frame audits, hitbox lint, silhouette renders, PIE captures) | Agents |
| Documentation, specs upkeep, commit hygiene, pipeline tooling | Agents |
| **Taste calls** — choosing silhouettes, locking art direction, approving/rejecting poses and models | **You** |
| **Feel verdicts** — playing every build, originating notes like "the smash feels floaty" | **You** |
| **Trim decisions** — what gets cut, simplified, or reshaped | **You** |
| **Final polish notes** on the highest-visibility moves (jab, run, smash contact poses) | **You** (notes) → Agents (execution) |
| **Human playtests** — organizing them, watching silently, converting observations to bugs | **You** |

**The consequence that shapes this entire manual:** your review time is the project's scarcest resource and its critical path. Every process in this manual is therefore designed around one rule:

> **The Two-Minute Rule.** No agent deliverable may reach you in a form that takes more than two minutes to judge. Models arrive as turntable videos. Animations arrive as 60 fps preview strips with frame numbers burned in. Gameplay changes arrive as in-game clips. Code arrives as a one-paragraph summary plus a passing verification log. If you have to open an editor to evaluate something, the pipeline has failed — file that as a pipeline bug.

## 0.3 Your Job Description (read this again whenever you feel like modeling something yourself)

1. Write and maintain the character fantasy and movement specs (Part 4). These are the constitution agents work under.
2. Review deliverable batches daily or every other day. Give notes in plain language. Approve or reject; never "fix it yourself real quick."
3. Play every build that changes gameplay. Feel is tuned by perception, not spreadsheets (`AGENT_OPERATING_SYSTEM.md`).
4. Guard the gates. A milestone is done when its GATE checklist passes, not when the work "looks done."
5. Trim. At every review, ask the standing question: if 20% of this had to disappear, what goes first? (`AGENT_OPERATING_SYSTEM.md`, Questions)
6. Say things early. When something worries you, put it in the notes the same day — silence hardens into rework (`wiki: 060`).

## 0.4 The Design Law

This project runs under the Sakurai lens as encoded in this repository. The five load-bearing laws, which appear as checklist items throughout this manual:

1. **Feel first, art second.** No final art effort is spent on a kit that isn't already fun as a gray mannequin.
2. **Lead-ins snap** (`wiki: 049`). The first 1–2 frames of any attack jump hard toward the anticipation pose. Slow ease-ins are banned.
3. **Exaggerate to survive the screen** (`wiki: 091`). If a pose reads only in close-up, it is wrong. The test is a squint at gameplay zoom.
4. **Hitboxes are authored, never auto-fitted** (`wiki: 221`). Collision is a design statement about trust, tuned generously where the player would swear they hit.
5. **Effects clarify, never outshine** (`wiki: 035`). The character is always the brightest read on screen.

---

# Part 1 — Prerequisites

Complete every section of this part before creating the Unreal project. Estimated time: one focused day, plus shipping time if you need hardware.

## 1.1 Hardware

Minimum workstation for this pipeline (UE5 editor + headless Blender + local agent sessions running concurrently):

- **CPU:** 12+ cores (agents will run headless Blender renders and UE builds in parallel with your editor session; core count matters more than clock).
- **GPU:** NVIDIA RTX 3080-class or better, 10 GB+ VRAM. UE5 editor, 60 fps PIE with debug overlays, and turntable rendering all lean on it. If you ever run local image/3D generation models, 24 GB VRAM (4090/5090-class) pays for itself.
- **RAM:** 64 GB. UE5 editor alone can sit at 20–30 GB with a mid-size project; headless Blender and browsers stack on top. 32 GB works but you will pay in swap stalls during reviews.
- **Storage:** 2 TB NVMe SSD minimum. UE5 (~120 GB with debug symbols), DDC cache (~50–100 GB over time), the project with binary asset history, Blender working files, and rendered preview videos add up fast.
- **Display:** whatever you have, plus the discipline to review gameplay at the *window size you actually play at*, not maximized — readability is judged at play conditions (`PRINCIPLES.md`, Clarity).
- **Input:** a game controller (Xbox/PS/GameCube-style). You cannot give feel verdicts on keyboard. Buy two — Part 12 needs a second player.
- **Frame timing:** a 60 Hz-capable display with VRR disabled during frame audits, so a dropped frame is visible as a dropped frame.

## 1.2 Software Installs, In Order

Install in this order; later items reference earlier ones.

### 1.2.1 Version control tooling

Decision to make now: **Git + Git LFS** or **Perforce Helix Core**.

- **Choose Git + LFS if:** you are staying solo-plus-agents, you want the agents' native tooling (they are strongest with git), and the repo will live on GitHub. This is the **recommended default for this project** — the agent workflow in this workspace is already git-based.
- **Choose Perforce if:** you expect human artists later, need file locking on binary assets, or the project outgrows LFS bandwidth economics.

For Git + LFS:
1. Install Git (latest stable).
2. Install Git LFS: `git lfs install` (run once per machine).
3. You will configure tracking patterns in Part 2.4 — do not track anything yet.

### 1.2.2 Unreal Engine 5

1. Install the Epic Games Launcher.
2. Install the **latest stable UE 5.x** (5.4 or newer; anything current in 2026 is fine — the systems this manual uses, Enhanced Input / Control Rig / IK Retargeter / Niagara / MetaSounds, are all mature). Pin the minor version and record it in the project README; do not upgrade mid-milestone.
3. Include these options in the install: **Engine Source** (agents read engine source to answer their own questions), **Starter Content off** (we control every asset that enters the project).
4. Launch once, create a throwaway Blank project, confirm the editor opens and PIE runs. Delete the throwaway.

### 1.2.3 Blender

1. Install the latest **Blender LTS** release. LTS matters: agents write Python against its API and API churn between non-LTS versions silently breaks pipeline scripts.
2. Verify headless mode works — this is the backbone of the model/rig pipeline:
   `blender --background --version`
3. Record the exact version in the project README. Agents will target this version's Python API.

### 1.2.4 Cascadeur

1. Install Cascadeur (free tier is sufficient to start). This is the AI-physics-assisted animation tool used to turn agent-authored key poses into ballistic, weighty inbetweens for the hardest attack animations.
2. Note: Cascadeur is a *supplement*, not the primary authoring path. The primary path is Control Rig in UE (Part 9). Set it up now so it's available when an attack plateaus at "correct but flat."

### 1.2.5 Texturing

Options, pick one:
- **Adobe Substance 3D Painter** (subscription) — the industry default, best material output, agents can drive it via its Python API.
- **ArmorPaint / free alternatives** — viable for a stylized project, weaker automation.

**Recommendation:** because Part 4 will lock a *stylized/cel-adjacent* art direction (§4.4 explains why this is load-bearing for generative-3D quality), much texture work is flat color + gradient + hand-painted accents, which reduces Substance dependence. Start with Substance's trial during Part 7 and decide with real data.

### 1.2.6 Node.js and this workspace

1. Install Node.js LTS (≥ 20).
2. Clone this repository (`buildLikeSakurai`) to the workstation.
3. From the repo root, verify the wiki retrieval works:
   `node scripts/query_sakurai_wiki.mjs "test query" --limit 3`
4. Read, in this order (one sitting, ~30 minutes): `sakurai-llm-wiki/AGENT_OPERATING_SYSTEM.md`, `sakurai-llm-wiki/PRINCIPLES.md`, `sakurai-llm-wiki/CATEGORY_LENSES.md`, `sakurai-llm-wiki/SOURCING_LIMITS.md`. You are the director; the design law lives in your head or nowhere.

### 1.2.7 Claude Code and the Unreal MCP

1. Install Claude Code (CLI and/or desktop app) on the workstation and authenticate.
2. Install and configure the **Unreal MCP server** so agent sessions can drive the Unreal editor: follow `INSTALL_FOR_AGENTS.md` in this repository for the workspace's expected MCP setup. The operating contract agents follow is already written in `CLAUDE.md` (discover tools first, never assume asset paths, verify every slice).
3. Verification: with the UE editor open on any project, start a Claude Code session in this repo and ask it to list the Unreal MCP tools it can see and report current editor state. If it cannot, stop and fix this before anything else — **an agent studio without editor access is just a chat window.**
4. Confirm the project subagents resolve: `sakurai-router`, `sakurai-game-designer`, `sakurai-feel-reviewer`, `sakurai-ui-reviewer`, `sakurai-production-director`, `sakurai-ue5-implementer`, and the commands `/sakurai-plan`, `/sakurai-review`, `/ue5-implement`, `/ue5-playtest`.

### 1.2.8 Generative-asset service accounts

Create accounts / API keys for (evaluate current leaders at time of execution; the categories are stable even as vendors shift):

1. **Image generation** for concept art batches (character thumbnails, turnarounds, color scripts). Any current top-tier image model with strong character consistency.
2. **Generative 3D** (image-to-3D / text-to-3D: Meshy, Tripo, Hunyuan3D-class, or current best). You want: quad-dominant mesh export, texture output, and an API the agents can call. Get API keys, store them in a local `.env` that is **git-ignored** (Part 2.4).
3. **Motion libraries:** an Adobe account for **Mixamo** (free retargetable locomotion), and download Epic's **Game Animation Sample** from Fab into a holding project (it ships hundreds of high-quality locomotion animations on the UE5 skeleton, free to use in UE projects).
4. **Audio:** a source for SFX layers — a commercial library subscription (Soundly, A Sound Effect bundles) or curated CC0 libraries (freesound with strict license filtering). Impacts, whooshes, cloth, bow-string, footsteps.

Record every account, key location, and license in `docs/specs/LICENSES.md` (created in Part 2).

### 1.2.9 Capture and review tooling

1. Install **OBS Studio** (or confirm UE's built-in Movie Render Queue suffices) for capturing PIE gameplay clips at a locked 60 fps.
2. Install **ffmpeg** (agents use it constantly: assembling frame strips, burning frame numbers into previews, converting captures).
3. Install a video player with true frame-step (mpv recommended; `.` and `,` step frames). You will spend hours stepping through attack animations one frame at a time — make it comfortable.

## 1.3 Legal Groundwork (one hour now saves a rebrand later)

The folk characters are public domain; **specific famous depictions are not**. Do this before any concept art is generated:

1. Write `docs/specs/IP_GUARDRAILS.md` containing, at minimum:
   - Robin Hood: no anthropomorphic fox (Disney 1973), no likeness of Errol Flynn's or any actor's specific portrayal, no Disney-specific costume details. Safe basis: medieval English outlaw archer, Lincoln-green, feathered cap as *generic* motif (predates all trademarks).
   - Red Riding Hood: no likeness of any studio's specific design (note recent film/game depictions); the red hooded cloak, basket, and wolf association are folk-tale elements and safe.
   - A standing rule for agents: every generated concept batch must include the prompt used, and prompts must not name living franchises, studios, or actors.
2. Pick the game's **working title** now and run a basic trademark search on it. Do not print it on anything until searched.
3. Plan one hour with an actual IP lawyer before public marketing (post-M6). Put it in the calendar section of the production doc so it is not forgotten.

## 1.4 GATE — Prerequisites Complete

- [ ] Workstation meets §1.1, controller(s) in hand
- [ ] Git + LFS installed and working (`git lfs env` reports cleanly)
- [ ] UE 5.x installed, version pinned and recorded; editor opens and PIE runs
- [ ] Blender LTS installed; `blender --background --version` succeeds; version recorded
- [ ] Cascadeur installed and launches
- [ ] Node ≥ 20; wiki query script returns results from repo root
- [ ] Claude Code session can enumerate Unreal MCP tools against a live editor
- [ ] Project subagents and commands resolve in a session
- [ ] Gen-3D API key obtained and stored in git-ignored `.env`
- [ ] Mixamo account + Game Animation Sample downloaded
- [ ] SFX source secured, licenses recorded
- [ ] ffmpeg + frame-step player installed
- [ ] `IP_GUARDRAILS.md` written; working title searched
- [ ] You have read the four core wiki documents

---

# Part 2 — Milestone M0: The Foundation

**Purpose:** build the studio before hiring the workers. M0 produces zero character content. It produces the Unreal project, the conventions, the data schemas, the debug tooling, and — most importantly — the **agent pipeline harness**: the scripts and workflows that let agents deliver two-minute-reviewable work forever after. Expect M0 to take *longer* than intuition says (1–3 weeks of calendar time); every later milestone repays it.

**Everything in Part 2 except the decisions is agent work.** Your role: make the decisions flagged ⚖️, then review the results.

## 2.1 Create the Unreal Project

Direct an agent session (with the editor open and MCP connected) to create the project with these specifications:

1. **Template:** Blank, C++ project (not Blueprint-only — the movement and hitbox core will be C++ for determinism and tunability; Blueprints layer on top).
2. **Name:** short, no spaces, matching the working title's codename (e.g. `Hoodlums` — pick your own; the codename appears in every class prefix).
3. **Target:** Desktop, Maximum Quality, no starter content.
4. **Project settings to apply immediately** (agents apply via MCP/config edits; you verify the summary):
   - Frame rate: fixed frame rate **off**, but `t.MaxFPS 60` in PIE for review parity, and **Smooth Frame Rate off**. Gameplay logic must be written frame-count-aware at a 60 fps reference (frame data is expressed in 1/60s frames; the engine tick remains variable — the fighter systems convert).
   - **Enhanced Input** plugin enabled and set as the default input system.
   - Plugins enabled: Control Rig, IK Rig, Animation Warping, Niagara (default-on), MetaSounds, Movie Render Queue, Python Editor Script Plugin (agents use it), Editor Scripting Utilities.
   - Collision profiles: create custom object channels `Hurtbox`, `Hitbox`, `GrabBox` now (Part 5 uses them; creating channels later invalidates presets).
   - Rendering: pick **Deferred** renderer, Lumen **off** for gameplay levels (a platform fighter wants stable, flat-lit readability and a locked 60; you can art-direct lighting without GI cost), MSAA/TAA decision deferred to the art-direction lock (§4.4).
5. **Maps:** create `L_Gym` (the gray-box training room: one flat platform, two side platforms, a kill boundary, neutral lighting) and set it as editor + game default. Every gameplay review for the next several milestones happens in `L_Gym`.

## 2.2 Directory and Naming Conventions

Adopt these now; agents follow them mechanically and they make every later automation reliable. Full tables in Appendix A; the load-bearing rules:

1. **Content root layout:**
```
/Content
  /Core            (game framework: modes, controllers, camera, shared components)
  /Characters
    /_Shared       (shared skeleton, shared damage anims, shared anim layers, retarget rigs)
    /RedRidingHood (everything unique to her: /Meshes /Materials /Textures /Anims /Rigs /BP /Data /FX /Audio)
    /RobinHood     (same substructure)
  /Stages
    /Gym
  /FX              (shared Niagara systems: hit sparks, dust, KO)
  /Audio           (shared: hit layers, whooshes, UI)
  /UI
  /Data            (DataTables: frame data, knockback curves, tuning)
  /Debug           (hitbox visualizer, frame counter, review widgets)
```
2. **Asset prefixes** (industry-standard, enforced by a lint script agents run pre-commit): `SK_` skeletal mesh, `SKEL_` skeleton, `PA_` pose asset, `AM_` montage, `AS_` anim sequence, `ABP_` anim blueprint, `CR_` control rig, `IK_` ik rig, `RTG_` retargeter, `M_`/`MI_` material/instance, `T_` texture, `NS_` Niagara system, `DT_` datatable, `BP_` blueprint, `W_` widget.
3. **Animation naming grammar** — this one convention powers the entire automated frame-audit system, get it exactly right:
   `AS_<Char>_<MoveID>` where `MoveID` matches the frame-data table key. Examples: `AS_RRH_Jab1`, `AS_RRH_FSmash`, `AS_RRH_NAir`, `AS_ROB_NSpecial_Charge`. Shared damage anims: `AS_SHARED_HitLight_F`, `AS_SHARED_Launch_BU`, etc.
4. **C++ naming:** project module `<Codename>Core`; classes `A<Codename>Fighter`, `U<Codename>MovementComponent`, `U<Codename>HitboxComponent`, `U<Codename>AttackStateMachine` (or GAS equivalents — §2.5 decision).

## 2.3 The Specs Directory — the Agents' Shared Brain

For a human team, shared understanding lives in meetings (`wiki: 043`, `wiki: 114`). For an agent studio, **it lives in the repo or it doesn't exist**. Every agent session starts by reading these files; keeping them current is part of your director job.

Create `docs/specs/` with these files (agents draft them in M0; you edit and approve):

| File | Contents |
|---|---|
| `GAME_CHARTER.md` | Part 0 of this manual, condensed to one page: goal, quality bar, scope, division of labor. |
| `CONVENTIONS.md` | §2.2 in full + Appendix A tables. |
| `FRAME_DATA_SCHEMA.md` | §2.6 schema, with field-by-field semantics. |
| `QUALITY_BARS.md` | The checklists from Part 13, so agents self-check before submitting. |
| `REVIEW_PROTOCOL.md` | Part 3.3: deliverable formats, where to put previews, notes format. |
| `IP_GUARDRAILS.md` | §1.3. |
| `LICENSES.md` | Every external asset/service, its license, where used. |
| `ART_DIRECTION.md` | Empty until §4.4 locks it; then the single source of visual truth. |
| `characters/RRH_FANTASY.md`, `characters/RRH_MOVEMENT.md` | Part 4 outputs, per character. |
| `characters/ROB_FANTASY.md`, `characters/ROB_MOVEMENT.md` | Same for Robin Hood. |
| `DECISIONS.md` | Append-only log: every ⚖️ decision, date, one-line rationale. Agents consult it instead of re-litigating. |

Additionally, update the project `CLAUDE.md` so every session auto-loads: pointer to `docs/specs/`, the Two-Minute Rule, the five design laws (§0.4), and the standing verification requirements (§2.8).

## 2.4 Version Control Configuration

1. Initialize the repo (or a new `game/` subdirectory of this one — ⚖️ decision: **separate game repo recommended**, keeping this agent-workspace repo as the brain and the game repo as the product; record in `DECISIONS.md`).
2. `.gitattributes` — track with LFS: `*.uasset`, `*.umap`, `*.fbx`, `*.png`, `*.tga`, `*.psd`, `*.blend`, `*.wav`, `*.mp4`, `*.exr`, `*.cascadeur`.
3. `.gitignore` — UE standard (`Binaries/`, `DerivedDataCache/`, `Intermediate/`, `Saved/`, `.vs/`), plus `.env`, plus `/ReviewQueue/**/*.mp4` older exports if you choose not to version previews (⚖️ decision: **version the previews** — they are the project's visual history and diff evidence; LFS handles it).
4. Commit discipline (agents follow automatically): one vertical slice per commit; message format `<area>: <what> — <why>`; every commit that touches gameplay must reference its verification evidence (§2.8).
5. Branch model: `main` is always playable. Agents work on short-lived feature branches, merged after your review. No long-running branches — binary assets make merges hell; keep integration continuous.

## 2.5 Core Gameplay Architecture Decisions (⚖️ make these once, now)

Agents will present prototypes for each in M0/M1; you decide by feel and record in `DECISIONS.md`:

1. **Movement: custom pawn movement vs. tuned CharacterMovementComponent.** Platform fighters need: instant direction reversal, precise air-drift acceleration, fast-fall, no momentum smoothing you didn't ask for, and frame-exact jump-squat. Recommendation: **custom movement component** (subclass or replace CMC) — CMC's smoothing/physics assumptions fight you forever. Have the M1 agent build the jab prototype on both and pick with the controller in your hand.
2. **Attack system: Gameplay Ability System (GAS) vs. bespoke attack state machine.** GAS gives networking scaffolding and effect plumbing at the cost of substantial complexity agents must reason through on every change. Bespoke gives a small, fully-understood state machine (`Idle → Startup → Active → Recovery → back`, plus cancel tables) that maps 1:1 onto frame data. Recommendation for a 2-character local-versus v1: **bespoke state machine**, designed with clean seams so GAS or rollback netcode can replace the shell later. (⚖️ If online multiplayer is a v1 must-have, stop and re-plan — rollback netcode changes the architecture from day one. This manual assumes local versus for v1; record the decision.)
3. **Physics of knockback:** deterministic custom trajectory (Smash-style: launch speed + decay + gravity, no physics engine) — not UE physics simulation. Non-negotiable for feel reproducibility; listed as a decision only so it's recorded.

## 2.6 The Frame Data Schema

All tuning lives in DataTables so iteration never requires touching animation assets or code (`PRINCIPLES.md`: organize data so changes are cheap; systems easy to tune). Agents create `DT_FrameData_<Char>` with one row per `MoveID`:

| Field | Type | Meaning |
|---|---|---|
| `MoveID` | Name | Primary key; must equal the anim asset suffix (§2.2.3) |
| `InputCommand` | Enum | Which input triggers it (Jab, FTilt, FSmash, NSpecial, NAir, …) |
| `StartupFrames` | Int | Frames before first active frame (frame 1 = first frame after input) |
| `ActiveFrames` | Int Array | Active windows, e.g. `[6–8]` or multi-hit `[5–6, 9–10]` |
| `RecoveryFrames` | Int | Frames after last active until actionable |
| `IASA` | Int | "Interruptible as soon as" frame, if earlier than full recovery |
| `CancelWindows` | Struct Array | (frame range → allowed cancel category) |
| `Damage` | Float (per hit) | |
| `BaseKnockback` / `KnockbackGrowth` / `LaunchAngle` | Float / Float / Float | Smash-style knockback formula inputs |
| `HitstopFrames` | Int | Freeze applied to both parties on hit |
| `HitboxSpecs` | Struct Array | Per active window: bone socket, shape, offset, radius/half-extents, priority |
| `SFX_Whoosh` / `SFX_Hit` / `VFX_Hit` | Asset refs | Presentation bindings |
| `Notes` | String | Design intent, one line |

**The invariant that powers automated auditing:** the animation asset's notify windows (Part 10) must match this table exactly, and an agent-run audit script (§2.7.4) diffs them on every change. Frame data drift between table and animation is a build-breaking lint error, not a code-review comment.

Appendix C provides starting values for every move archetype so the first pass isn't invented from nothing.

## 2.7 The Agent Pipeline Harness

The heart of M0. Four subsystems, all built by agents, all verified by you once:

### 2.7.1 Headless Blender harness

A `pipeline/blender/` directory in the game repo containing:
- `run.py` dispatcher: `blender --background --python run.py -- <task> <args>` with tasks accumulating over the project: `import_gen3d` (ingest a generative-3D export: normalize scale to UE units (1uu = 1cm, character ≈ 170uu), orient +X forward / Z up, weld/cleanup, report stats), `retopo_check` (mesh stats vs. budget: tri count, UV coverage, manifold errors), `autorig` (fit the project's Epic-proportioned armature template, §8.2, and auto-weight), `export_fbx` (canonical UE-ready FBX export settings, one true exporter), `render_turntable` (36-frame turntable + 4-view silhouette render, black-on-white, §2.7.3 output spec).
- Golden-file tests: a checked-in test mesh runs through every task in CI/local; if a Blender version bump breaks the API, tests catch it before an art batch does.

### 2.7.2 Generative-asset harness

`pipeline/gen/`: thin scripts wrapping the image-gen and 3D-gen APIs with the project's standing constraints baked in (IP guardrails prompt suffix from §1.3, output folder conventions, automatic metadata sidecars recording the full prompt + seed + model version for every generated asset — provenance is not optional, `LICENSES.md` depends on it).

### 2.7.3 The Review Queue

The physical implementation of the Two-Minute Rule:
- A `ReviewQueue/` directory: `ReviewQueue/YYYY-MM-DD/<batch>/` containing preview media + a `MANIFEST.md` per batch: what's included, what question you're being asked, what the agent recommends, links to specs it claims to satisfy.
- **Canonical preview formats** (agents produce these, ffmpeg-assembled; formats are contractual):
  - *Model:* 12-second turntable MP4 at gameplay-camera distance **and** close-up, plus the 4-view black-and-white silhouette sheet, plus a stats block (tris, materials, texture sizes) in the manifest.
  - *Animation:* 60 fps MP4 preview from the gameplay camera angle, frame counter burned into a corner, played at full speed then auto-repeated at 25% speed, plus a **frame strip** (every frame of startup + first active frames as a horizontal contact sheet with frame numbers) for pose-timing judgment at a glance.
  - *Gameplay change:* 10–20 second PIE capture demonstrating the change, with debug overlays on (hitboxes visible, frame counter on).
  - *Code/system:* one-paragraph summary + verification log excerpt. No video needed.
- Your notes go in `NOTES.md` next to each manifest: `APPROVED`, `APPROVED WITH NOTES: …`, or `REJECTED: …` with plain-language direction. Agents treat `NOTES.md` as the authoritative next-action source.

### 2.7.4 Automated verification suite

`pipeline/verify/` scripts agents must run before anything reaches the queue:
- `frame_audit`: opens the anim assets (UE Python) and diffs notify windows against `DT_FrameData_*`. Any mismatch = fail.
- `lead_in_check`: verifies attack animations reach ≥N% of the distance to the anticipation pose by frame 2 (`wiki: 049` as an executable rule — measurable as pose-space delta between frame 0 and frame 2 relative to frame 0 → anticipation key).
- `hitbox_lint`: every active window has ≥1 hitbox; no hitbox exists outside an active window; hitbox bone sockets exist on the skeleton.
- `silhouette_render`: automated black-and-white renders of any changed model, from gameplay distance, dropped into the queue.
- `naming_lint`: asset prefixes and MoveID naming grammar (§2.2).
- `build_check`: project compiles, `L_Gym` loads, PIE launches and survives 10 seconds with a scripted input sequence, log scraped for errors/warnings.

### 2.7.5 Capture harness

A UE editor utility (agent-built) that: spawns the fighter(s) in `L_Gym`, plays a scripted input sequence (from a small DSL: `frame 10: press A`, …), records via Movie Render Queue at true 60 fps with debug overlays on, and writes the MP4 to the Review Queue. This makes "show me the jab whiffing and hitting" a one-command deliverable, and later makes regression clips diffable across builds.

## 2.8 Standing Verification Requirements (write into CLAUDE.md)

Every agent gameplay change ships with: compile pass, `L_Gym` PIE survival, relevant `pipeline/verify/` passes, and a capture clip if player-visible. Every asset change ships with: naming lint, budget check, preview media in the queue. No exceptions; "it should work" is not a verification (`CLAUDE.md` operating contract).

## 2.9 GATE — M0 Complete

- [ ] UE project created to §2.1 spec; `L_Gym` loads; empty pawn moves at locked 60 in PIE
- [ ] Directory + naming conventions applied; `naming_lint` runs clean
- [ ] All `docs/specs/` files exist; `CLAUDE.md` updated; you have personally read and edited `GAME_CHARTER.md` and `REVIEW_PROTOCOL.md`
- [ ] Version control live: LFS patterns verified (`git lfs ls-files` shows binaries), first clean clone tested on a fresh directory and the project opens
- [ ] ⚖️ decisions recorded in `DECISIONS.md`: repo split, movement approach (may say "deciding in M1 by feel"), attack system, local-versus-v1, preview versioning
- [ ] `DT_FrameData_RRH` exists with schema §2.6 (rows may be placeholder)
- [ ] Headless Blender harness: golden-file test passes end-to-end on your machine
- [ ] Gen harness produces an image batch with metadata sidecars (test prompt)
- [ ] Review Queue: you have reviewed one dummy batch end-to-end (agent submits → you write `NOTES.md` → agent reads and reacts)
- [ ] Verification suite: all six §2.7.4 checks runnable; `build_check` green
- [ ] Capture harness produces a 60 fps clip with frame counter + hitbox overlay from a scripted input sequence

---

# Part 3 — Working With Agents

This part is process, and it is as load-bearing as any technical part. Agents amplify exactly what you put in: crisp specs and fast honest notes produce a studio; vague asks produce confident mediocrity.

## 3.1 Session Patterns

- **One session, one slice.** Each agent session gets one vertical slice with a clear exit: "implement fast-fall per MOVEMENT spec §3, verify, submit clip." Long meandering sessions drift; slices land.
- **Parallelize across seams, not within them.** Safe to run simultaneously: one session on gameplay code, one on Blender pipeline, one on concept generation — they touch different files. Never two sessions in the same UE editor at once, and treat binary `.uasset` files as single-writer.
- **Use the project subagents deliberately:** `sakurai-router` to pick wiki sources when starting a new area; `sakurai-game-designer` for kit/mechanic critique **before** implementation; `sakurai-feel-reviewer` on every attack batch **before** it reaches your queue (it catches lead-in and follow-through violations so your two minutes are spent on taste, not lint); `sakurai-production-director` monthly on the plan itself; `sakurai-ue5-implementer` for the MCP-driven slices.
- **Retrieval rule:** substantial design/implementation sessions begin with `node scripts/query_sakurai_wiki.mjs "<task>"` per `CLAUDE.md`. The wiki is the shared design vocabulary; retrieval keeps agents inside it.
- **Overnight batches.** Queue generation-heavy work (concept batches, gen-3D candidates, turntable renders) to run while you sleep; review over coffee. Your review hours and agent compute hours should overlap as little as possible.

## 3.2 Prompt Discipline

Every task brief you (or a coordinating agent) writes contains five parts — Appendix B has full templates:
1. **Slice:** the one thing to build/produce.
2. **Spec pointers:** exact files/sections that govern it (`docs/specs/...`, frame-data rows, this manual's section).
3. **Deliverable format:** which §2.7.3 preview format, to which queue folder.
4. **Verification:** which checks must pass before submitting.
5. **Freedom boundary:** what the agent may decide alone vs. must surface as a question in the manifest. Default: agents decide implementation details, surface anything player-visible that specs don't cover.

## 3.3 The Review Ritual

Daily or every-other-day, timeboxed, controller within reach:
1. Open the day's queue folders. Watch previews. Write `NOTES.md` verdicts immediately — same-day notes are the agent-studio version of "don't wait to speak your mind" (`wiki: 060`).
2. **Notes are direction, not solutions.** Write what's wrong in player language ("the contact pose reads as a push, not a slash; I want the follow-through to whip past her hip") and let agents translate to keys and curves. You direct like the design docs in `wiki: 014` — intent, adjectives, references.
3. If a build changed gameplay: play it. Minimum five minutes in `L_Gym`. Feel notes go in the same `NOTES.md`.
4. End with the trim question on whatever grew this week: what would you cut first? (`wiki: 254`)
5. **Never fix assets yourself.** The moment you hand-edit an agent deliverable, that knowledge lives outside the pipeline and the next batch repeats the error. Fix the spec or the note instead. (Exception: Part 13 polish hours, which are scheduled, deliberate, and fed back into specs afterward.)

## 3.4 Guardrails (standing rules, in CLAUDE.md, non-negotiable)

1. **Lock-the-mesh.** Once you approve a base model, regeneration is banned; all changes are scripted edits or sculpt-layer deltas on the approved mesh. Generative 3D is non-deterministic — "same character, small fix" via regen produces a different mesh and silently breaks rig, weights, and every animation downstream.
2. **Frame data lives in the table.** No agent hardcodes a timing, damage, or knockback number in code or tweaks an anim to change timing. Table first, then assets conform, audited by `frame_audit`.
3. **No new dependencies without a manifest note.** Plugins, marketplace assets, Python packages — each appears in `LICENSES.md` in the same commit.
4. **The reference slice is law.** After M1, the One True Attack is the diff-target: every attack batch's manifest must state how it compares. Quality bars are checklists agents self-apply (`QUALITY_BARS.md`), because agents will confidently ship mediocre work if the bar isn't encoded and checked.
5. **Two-minute deliverables or it didn't happen.** Anything submitted without canonical preview media bounces back unreviewed — enforced by you actually bouncing it the first three times, after which agents comply forever.

---

# Part 4 — The Design Phase

Runs concurrently with late M0. Output: four approved spec documents and one locked art direction. This is majority **your** work — it is taste — with agents producing options and drafts.

## 4.1 Character Fantasy Documents

For each character, write (or edit an agent draft of) `docs/specs/characters/<CHAR>_FANTASY.md`, one page, containing:

1. **The fantasy in one sentence.**
   - Robin Hood: *"The precise outlaw: every arrow is aimed, every dodge is smug, and the whole kit says 'you can't catch me.'"*
   - Red Riding Hood: *"Deceptive innocence: skips like a fairy tale, hits like the wolf — moves that start sweet and end vicious."*
2. **Player archetype it serves.** Robin: spacing/zoner players who love precision payoffs. Red: bait-and-punish tricksters who love making opponents flinch wrong.
3. **Three signature moments** the kit must produce in real matches (e.g., Robin: a full-charge arrow snipe on an offstage recovery; Red: a dash that *looks* like retreat becoming the kill throw; write your own — these become the specials' design targets).
4. **Emotional palette** — five adjectives, no more (`wiki: 014`-style direction language). Robin: *taut, springy, precise, cocky, light*. Red: *sweet, sudden, feral, deceptive, gleeful*.
5. **What this character is NOT.** The trim pre-commitment: Robin is not a sword fighter with a bow taped on (arrows are the identity; melee stays functional, short-range, unglamorous). Red is not an axe-heavy bruiser (the folk-tale hood stays; the wolf shows in *moments*, not as a permanent form — a full transformation mechanic is explicitly out of v1 scope).

## 4.2 Movement Spec One-Pagers

`<CHAR>_MOVEMENT.md`, the document every animation gets checked against (`wiki: 014`):

1. **Posture and gait:** Robin stands tall and coiled, weight forward on the balls of his feet; his run is upright, silent, effortless. Red's idle sways innocently with the basket/cloak; her walk is a skip; her *dash* drops the act — low, predatory, sudden.
2. **Physique numbers** (initial targets; tuned in M2): weight class (Robin: light-middle; Red: middle), run speed (Robin faster), air drift (Red floatier), fall speed (Robin faster + strong fast-fall), jump squat (both 3 frames — modern-Smash standard responsiveness).
3. **Five reference clips each** (film/game/animation) with one line on *what to steal* — mechanics of motion, never design likeness (IP guardrails apply to references too: steal timing and weight, not costumes).
4. **Per-move-class adjectives:** Robin — tilts are *fencing jabs with the bow limb*, smashes are *drawn shots, held anticipation, explosive release*; aerials are *acrobatic, arrow-first*. Red — tilts are *basket/cloak swipes, deceptively casual*; smashes are *the wolf peeking through — lunging bites of motion*; aerials are *cloak-swirling, hang-time heavy*.

## 4.3 The Silhouette Process (`wiki: 239`)

Executed as an overnight agent batch, decided by you in one sitting:

1. Agents generate **12+ silhouette-first concept thumbnails per character**: pure black shapes on white, gameplay-camera proportions, exaggerated per `wiki: 091` (oversized hood, bow, hands, weapon reads).
2. You cull to 3 per character on shape alone. Ask of each: distinct from the other character at 10% screen height? Distinct in *motion* (does the shape have parts that trail and snap — cloak, quiver, feather)? Legally clean (§1.3)?
3. Agents take your 3 picks to full-color concept batches: front/side/back turnarounds, 2–3 color scripts each (including the darker/alt palettes that will become team colors).
4. You pick **one per character**. This pick is close to irreversible once modeling starts — sleep on it, then record in `DECISIONS.md`.
5. Agents produce the final **model sheet** per character: clean turnaround, color callouts, material notes, accessory inventory (every strap and pouch the modeler — i.e., the gen-3D + cleanup pipeline — must account for), and the silhouette sheet at three zoom levels.

## 4.4 The Art Direction Lock (⚖️ the biggest decision in the project)

Choose the rendering style once; write `ART_DIRECTION.md`; never revisit before M6.

**Recommendation: stylized cel-adjacent** — flat-ish albedo, painted gradients, strong rim/outline for character-vs-background separation, restrained PBR (low roughness variation), saturated but disciplined palette. Three reasons, in priority order:
1. **It hides generative-3D artifacts.** Realistic PBR exposes every topology and texture flaw the gen pipeline produces; stylization absorbs them. This is the difference between the 90%-agent pipeline reaching the quality bar or not.
2. **It maximizes readability** — the actual Smash bar — because value/color hierarchy is authored, not emergent from lighting.
3. **It is maintainable by one director** — consistency rules can be written down and lint-checked (palette swatches, outline widths, value ranges), so agents can self-check.

`ART_DIRECTION.md` must contain: the style statement; a master palette (backgrounds desaturated/dark relative to fighters — fighters always win the value contest, `wiki: 035`); material rules (what gets outline, rim intensity, gradient direction); the anti-aliasing decision from §2.1 (with a locked 60 and cel edges, test MSAA-forward vs TAA and pick by clarity of thin features like the bow string in motion); lighting rules for gameplay levels (fixed key direction, no gameplay-affecting shadows); and 3 approved "look target" images produced by rendering a test asset through the actual pipeline.

## 4.5 GATE — Design Phase Complete

- [ ] Both `_FANTASY.md` docs approved by you (read them aloud; if a sentence bores you, cut it — bored specs make bored kits)
- [ ] Both `_MOVEMENT.md` docs approved, with reference clips linked and physique targets set
- [ ] Silhouette picks made and recorded; model sheets delivered to spec §4.3.5
- [ ] Both characters pass the mutual-distinction squint test as thumbnails side by side
- [ ] `ART_DIRECTION.md` locked, look-target renders approved, AA decision made
- [ ] IP re-check: final designs reviewed against `IP_GUARDRAILS.md`, noted in `DECISIONS.md`

---

# Part 5 — Milestone M1: The One True Attack

**Purpose:** build the vertical slice that defines quality for the entire project: one fighter pawn (UE5 Mannequin), tuned movement, **one jab and one forward smash**, with full hit consequence — on the gray gym, with zero final art. When M1 passes its gate, you will have felt, once, exactly what "done" means; every later attack is measured against it (`Guardrail 3.4.4`).

Everything here is agent-implemented via `/ue5-implement`-style slices; you review clips and play builds. Sequence:

## 5.1 Slice 1 — The Pawn Moves

1. Fighter pawn class + Enhanced Input mapping (stick move, X jump, A attack, shoulder shield placeholder later). Deadzone and stick-smash detection (a "smash input" = crossing a stick-speed threshold — this distinguishes tilts from smashes; implement and expose both thresholds as tunables now).
2. Movement per §2.5 decision, with these platform-fighter behaviors, each a named tunable: ground acceleration/max speed, instant turnaround (with a 1-frame turn pose hook), air drift acceleration/max, gravity, fast-fall multiplier (triggered by stick-down past threshold while airborne and falling), jump-squat frames (3), short-hop vs full-hop by button release timing during jump-squat, double jump, landing lag (base 2–4 frames).
3. Ledge/platform behavior minimum: stage edges are walls/floors; falling off the boundary respawns; drop-through on the side platforms via stick-down.
4. **Your review:** ten minutes with the controller. The bar: dashing back and forth, jumping, fast-falling should *already* feel like a platform fighter. Iterate tunables via notes until it does. Do not proceed on "close enough" — every animation will be built on top of this motion.

## 5.2 Slice 2 — Attack State Machine + Hitboxes

1. The state machine (§2.5): `Actionable → Startup → Active → Recovery → Actionable`, driven by frame counts from `DT_FrameData_RRH` rows `Jab1` and `FSmash` (Appendix C starting values). Frames counted in fixed 1/60s gameplay frames, independent of render hitches.
2. `HitboxComponent`: spawns shapes per `HitboxSpecs` on active frames, attached to skeleton sockets, overlap-tests against `Hurtbox` channel, resolves priority, reports hits exactly once per active window per target.
3. Hurtbox setup on the pawn: capsule-per-body-region (3–5 capsules bound to bones — head, torso, legs; enough for high/low distinction later).
4. Debug visualizer (from §2.7.4/`/Debug`): hitboxes red, hurtboxes cyan, active frames flash, frame counter and current state name on screen. This overlay appears in **every** gameplay review clip for the rest of the project.
5. **Verify:** `frame_audit` and `hitbox_lint` green against the two table rows; capture-harness clip of the jab whiffing shows startup/active/recovery frame counts matching the table on screen.

## 5.3 Slice 3 — Hit Consequence (where "feel" is actually manufactured)

Implement the full impact stack; every element individually tunable:

1. **Hit-stop:** on connect, both attacker and victim freeze for `HitstopFrames` (victim may freeze 1–2 frames longer on heavy hits — expose as tunable). Freeze means animation and movement pause; input buffering continues.
2. **Knockback:** Smash-formula trajectory (base + growth×damage, launch angle from table), custom deterministic integration (§2.5.3), with victim entering hitstun for a duration derived from knockback magnitude (tunable curve in `/Content/Data`).
3. **Damage reactions:** on the victim mannequin — placeholder flinch (light, directional) and launch/tumble poses. Even as placeholders these are *feedback*, not filler (`wiki: 141`): flinch direction must visibly match hit direction from day one.
4. **Impact presentation:** one Niagara hit spark (scaled by knockback dealt), one layered hit sound (thud layer + character layer slot for later), a 2-frame white hit-flash material pulse on the victim, and a subtle camera punch on smash connects only. Restraint rule: at this stage the effect stack should feel *slightly too weak* — headroom is added per-move later; a maxed-out baseline leaves nowhere to go (`wiki: 035`).
5. **Input buffer:** 5-frame buffer on all actions (tunable) — buffered inputs are half of "the controls feel trustworthy."

## 5.4 Slice 4 — The Two Attacks Get Real Animation

Even on the Mannequin, `Jab1` and `FSmash` get the full three-part treatment (`wiki: 036`) using the Part 9 authoring loop (this is the loop's shakedown cruise):

1. You write pose specs (Appendix B template): jab — a compact lead hand snap, anticipation is a 2-frame shoulder coil; FSmash — big drawn-back anticipation held through charge, explosive release, massive follow-through past the hips with full weight transfer (`wiki: 077`).
2. Agent authors keys via Control Rig, runs `lead_in_check`, submits frame-strip + 60fps preview.
3. You give notes until the *frame strip alone* tells the move's story: readable anticipation shape by frame 2, unmistakable contact pose (`wiki: 062`), consequence in the follow-through.
4. Smash **charge** state: FSmash holds at the anticipation pose with a subtle shake/glow while charging (also the readability telegraph — `wiki: 049` capsule: lead-ins double as the opponent's information).

## 5.5 GATE — M1 Complete (the most important gate in the manual)

Test with a second mannequin as training dummy in `L_Gym`:

- [ ] Input-to-response ≤ 2 frames on every action, measured from capture-harness frame-counted clips
- [ ] Jab and FSmash match `DT_FrameData` exactly (`frame_audit` green) and the numbers *feel* right on the controller — if not, change the **table** and re-audit
- [ ] Lead-ins snap: `lead_in_check` green + your eye agrees on the frame strip
- [ ] Hitting the dummy is **satisfying** — this is subjective and it is the whole point; iterate hit-stop/spark/sound/flash until landing the smash makes you smile in an empty gray room. Budget real days for this. The project's quality ceiling is set here.
- [ ] Whiffing feels honest: recovery reads as vulnerability, IASA makes the jab feel snappy
- [ ] The reference clips (jab hit, jab whiff, FSmash charge-hit, FSmash whiff) are saved to `docs/specs/reference/M1/` — **this is now the One True Attack reference set** cited by every future manifest
- [ ] `QUALITY_BARS.md` updated with anything you learned that the checklists missed

---

# Part 6 — Milestone M2: Red Riding Hood's Kit on the Mannequin

**Purpose:** design and implement Red Riding Hood's complete v1 move set as Mannequin animations + frame data, and make her *fun* before a single vertex of her real model is approved. The gate rule, restated because it is the project's most protective rule: **no final sculpt until the mannequin version is fun.** (Part 7 concept/model work may run in parallel — but nothing there is "final" until this gate passes.)

## 6.1 The v1 Move List (trimmed on purpose)

Per the charter, ~14 attacks + movement + defense. The v1 kit for every character:

| Slot | Move | Red Riding Hood v1 intent |
|---|---|---|
| Jab (×2 string) | `Jab1`, `Jab2` | Quick basket-hand swat into cloak backhand; sweet-then-sharp |
| Forward tilt | `FTilt` | Casual cloak swipe, deceptive range |
| Up tilt | `UTilt` | Hood flick upward — anti-air, fast |
| Down tilt | `DTilt` | Low skirt-sweep kick from a curtsey — the "innocent" poke |
| Forward smash | `FSmash` | The wolf peeks through: lunging two-hand rake, big anticipation |
| Up smash | `USmash` | Rising bite of motion — cloak erupts upward |
| Down smash | `DSmash` | Both-sides cloak snap at the ground |
| Neutral special | `NSpecial` | Signature projectile/trick (design in §6.2) |
| Side special | `SSpecial` | The bait: a skip-step that reads as retreat, cancels into a lunge |
| Up special | `USpecial` | Recovery: cloak-swirl leap (generous, floaty — fits her drift) |
| Down special | `DSpecial` | The counter/trap — feeds the "made you flinch" fantasy |
| Neutral air | `NAir` | Cloak-swirl hitbox around her |
| Forward air | `FAir` | Committal aerial bite — her aerial kill move |
| Back air | `BAir` | Backhand swat, quick, spacing tool |
| Grab + throws | `Grab`, `FThrow`, `BThrow` | v1 minimum: grab, one forward throw, one back throw |
| Defense | `Shield`, `SpotDodge`, `Roll`, `AirDodge` | Shared system, per-character timing rows |

Explicitly **cut from v1** (recorded in `DECISIONS.md` so nobody "helpfully" adds them): up/down throws, dash attack (add in v1.1 — it's high value but the list above already tests every system), ledge attacks beyond a basic getup, wall jump, taunt count >1, victory poses >3, any wolf-transformation mechanic.

## 6.2 Kit Design Pass

1. Run `sakurai-game-designer` on the fantasy + move list: does every move serve *deceptive innocence*? Where's the redundancy? What's each move's job in neutral/advantage/disadvantage?
2. Specials get one page each (agent-drafted, you-approved): input, function, counterplay, failure mode, and the signature moment (§4.1.3) it enables. Counterplay is a design requirement — every trick has an answer, or the trickster fantasy curdles into frustration for the opponent (`AGENT_OPERATING_SYSTEM.md`: does this reward experimentation or merely punish uncertainty?).
3. Fill `DT_FrameData_RRH` completely from Appendix C archetype values, adjusted for her identity: slightly slower smashes than average with bigger payoffs, quick tilts, floaty aerials with generous autocancel windows.

## 6.3 Implementation Loop

For each move, in kit-priority order (jab → tilts → FSmash → aerials → specials → smashes → grab → defense):
1. You write/approve the pose spec (Appendix B); the animation goes through the Part 9 authoring loop on the Mannequin.
2. Agent wires: montage, notify windows from the table, hitboxes, effects/audio placeholder bindings, cancel rules.
3. `sakurai-feel-reviewer` pass → verification suite → capture clips (hit + whiff, plus any special interactions) → your queue.
4. You play each batch in `L_Gym` against the dummy. Notes → iterate → approve → next batch.

Batch size: 2–3 moves per review cycle. The kit lands in roughly 6–8 cycles.

## 6.4 Making Her Fun (the tuning weeks)

With the kit playable, spend focused sessions (you, controller, agents standing by for table changes):
1. **Movement re-tune with the kit live** — kit and movement tune each other; her drift/fall numbers from §4.2 will shift once FAir exists.
2. **The bait loop must work:** SSpecial retreat-read → lunge must actually bait *you* when an agent-scripted dummy uses it against you (build a scripted-dummy mode into the capture harness: it shields on your startup, chases your retreats — crude AI, enough to test deception).
3. **Kill confirmation feel:** landing FSmash at high damage should produce the full ceremony — freeze, flash, launch, sound — proportional to the moment (`PRINCIPLES.md`: audiovisual emphasis makes important moments land harder).
4. Frame-data balance sanity: every move needs a *reason to exist* (speed, range, power, angle — pick a job); any move you never press in an hour of play gets flagged for redesign, not deletion yet.

## 6.5 GATE — M2 Complete

- [ ] All v1 moves implemented, `frame_audit`/`hitbox_lint`/`lead_in_check` green across the kit
- [ ] Every move passes the M1-reference comparison in its manifest (self-checked by agents, spot-checked by you)
- [ ] You can play her for 20 minutes against the scripted dummy and it stays engaging — the honest boredom test
- [ ] A friend (or you, ruthlessly) can describe her personality after 10 minutes of play, unprompted, in words that roughly match the fantasy doc
- [ ] Every move has a stated job; no dead buttons
- [ ] Frame data table is the single source of truth (grep confirms no hardcoded timings)
- [ ] Kit reference clips saved to `docs/specs/reference/M2_RRH/`

---

# Part 7 — Model Production

**Purpose:** turn the approved model sheet (§4.3.5) into a game-ready, art-directed character mesh through the generative pipeline. Runs for Red Riding Hood after (or in careful parallel with) M2; repeats for Robin Hood in Part 11.

## 7.1 Budgets (write into `QUALITY_BARS.md`)

- **Triangles:** 40,000–80,000 for LOD0 (Ultimate fighters are in this class; at platform-fighter camera anything beyond is invisible cost). Cloak/hood get generous allocation — they are silhouette.
- **Materials:** ≤ 4 slots (body, head, cloth/accessory, FX like eyes/emissive).
- **Textures:** 2048² body set, 1024² accessories, in the cel-adjacent maps `ART_DIRECTION.md` prescribes (albedo, lightweight ORM if used, outline/ramp control masks).
- **Bones the mesh must accommodate:** the Part 8 skeleton, including cloak/hood/braid chains — model with rigging in mind (cloak as separate cleanly-welded shell, interior faces where the cloak opens, hood able to frame the face in all idle poses).

## 7.2 Base Mesh Generation Loop

1. **Inputs:** the model sheet's turnaround, decomposed by agents into per-part reference (body, head, cloak, basket, boots) — generative 3D performs far better on clear single subjects than on full multi-accessory characters.
2. Agents run **overnight candidate batches** through the gen-3D harness: full-character candidates *and* per-part candidates (the winning strategy is usually a kitbash: best body + best cloak + best head, assembled in Blender by script).
3. Every candidate auto-runs `import_gen3d` (normalize, orient, stats) → `render_turntable` → Review Queue with its provenance sidecar.
4. **You cull on shape only** — ignore texture noise at this stage. Two-minute rule: turntables only, never raw meshes. Expect 2–4 rounds; be brutal early, mediocre base meshes are expensive later.
5. Assembly candidates (kitbashed composites) get one more turntable round → you approve **the** base mesh → **lock-the-mesh takes effect** (Guardrail 3.4.1) → tag it in git (`model/rrh-base-locked`).

## 7.3 Cleanup and Retopology

Agent-scripted in headless Blender, verified by `retopo_check` + turntables:

1. **Cleanup:** weld/merge-by-distance artifacts, delete internal junk geometry, close non-manifold holes, normalize normals — scripted, deterministic, on the locked mesh.
2. **Retopology:** gen-3D topology is animation-hostile (uniform blobs, no edge loops). Path: automated quad remesh (Blender's remesher or a dedicated auto-retopo tool the agents drive) at target density, followed by **scripted loop enforcement at deformation-critical zones** — shoulders, elbows, knees, hips, neck, wrists, and the cloak hinge. Where automation can't produce acceptable loops (usually shoulders and face), the fallback ladder is: (a) different remesh parameters, (b) agent hand-edits via Blender script on the specific region, (c) your 30-minute manual pass — logged as pipeline debt in `DECISIONS.md` so it's improved next character.
3. **Face:** ensure loops around eyes/mouth sufficient for the §8.4 facial set (brow, lids, jaw). Stylized faces need far less than realistic ones — another dividend of §4.4.
4. **UVs:** scripted unwrap with enforced seam placement (hidden seams: inner arms, under cloak), ≥85% UV space utilization, uniform texel density body vs. accessories (±20%).
5. Verification gate: `retopo_check` green (budget, manifold, UV coverage) + deformation preview — the harness poses the mesh with an auto-rig through 6 extreme test poses (deep squat, arms crossed overhead, torso twist) and renders a strip; shoulder/hip collapse visible here means another loop pass *now*, not after rigging.

## 7.4 Texturing and Materials

1. Agents produce the texture set per `ART_DIRECTION.md`: base flats from the color script, painted gradient/AO bakes, hand-painted accent passes (cloak hem wear, basket weave) — via Substance automation or Blender texture-paint scripting, whichever the M0 evaluation chose.
2. **Team colors from day one:** the material uses a mask-driven palette system (an ID mask + palette LUT or vector parameters), so Red's 4 team variants (default red; blue hood; green; black/gold) are material instances, not texture duplicates. Verify all 4 in one turntable.
3. Outline/rim per art direction: implemented as the shared character material's feature, parameterized per character (hood interior darkness, rim warmth).
4. **Review in-game, not in Blender:** the approval turntable is rendered *in UE, in `L_Gym`, under gameplay lighting, at gameplay camera distance* — the only lighting that matters. Include the desaturated silhouette pass (`silhouette_render`).

## 7.5 LODs

- LOD0 (gameplay camera): full budget. LOD1 (~50%): zoomed-out multi-fighter chaos. LOD2 (~20%): results/far shots. Auto-generated (UE's reducer) with per-LOD silhouette verification — the *silhouette* must survive reduction even as detail dies; if the reducer eats the hood shape, lock those edges.
- Platform fighters zoom dynamically: verify LOD transitions are invisible during a scripted zoom capture.

## 7.6 GATE — Model Complete (per character)

- [ ] In-`L_Gym` turntable approved at gameplay + close distance, all 4 team colors
- [ ] Black-and-white silhouette sheet approved at 3 zoom levels; distinct from the other character side by side
- [ ] `retopo_check` green: budgets met, manifold, UV coverage, texel density
- [ ] 6-pose deformation strip shows no collapse at shoulders/hips/cloak hinge
- [ ] LOD chain generated; scripted-zoom capture shows no visible pops; silhouette survives LOD2
- [ ] Provenance sidecars complete; `LICENSES.md` updated; mesh lock tag pushed
- [ ] The honest question, answered yes: *"Would I stop and look at this character on a store page?"* If no — the gap is almost always face, hands, or cloak; targeted notes, another pass. Do not gate-pass a model you're lukewarm on; you will look at it for years.

---

# Part 8 — Rigging

**Purpose:** one shared, animation-ready skeletal foundation across all fighters, plus per-character flourish. Rigging is the most automatable "specialist" discipline in this pipeline — lean on it.

## 8.1 The Shared Skeleton Strategy

All fighters bind to a **project skeleton with Epic-standard bone naming and hierarchy** (UE5 Mannequin-compatible), at per-character proportions. What this buys, permanently: every locomotion/damage animation retargets across the roster nearly free (IK Retargeter), one AnimBP architecture serves everyone, one Control Rig template poses everyone, and all M2 mannequin animation transfers onto the real character instead of being redone (Part 9.2).

## 8.2 The Rig, Layer by Layer

1. **Core:** Epic hierarchy (pelvis→spine×3→neck→head; clavicle→arm→hand with full fingers; legs with ball joints), plus standard attach sockets: `weapon_r`, `weapon_l`, `back` (Robin's quiver/bow), `hand_prop` (Red's basket).
2. **Per-character accessory chains** (the silhouette-in-motion layer — treat as first-class, not decoration):
   - Red: cloak — 3 chains × 4 bones (left/center/right) + 2×2 hood chains; skirt 2×2; braid 1×3.
   - Robin: cap feather 1×2; quiver-strap 1×2; tunic skirt 2×2; bow gets its own micro-rig (2 limb bones + string bone) so the **draw actually bends the bow** — this sells every arrow.
3. **Twist bones:** forearm + upper-arm twist (2 each side) — mandatory; cloak characters hide legs but arms are always visible and candy-wrapper forearms are an amateur tell.
4. **Facial (§8.4):** joints/morphs for the minimal set.
5. **Binding:** `autorig` task fits the armature template to the mesh (marker-guided: agents place landmark empties, script solves joint positions), auto-weights, then runs **scripted weight cleanup**: prune tiny influences (<0.01), enforce max 4 influences/vertex, mirror-symmetrize, smooth seams at cloak/body boundary.

## 8.3 Rig Verification (automated, then your two minutes)

1. **The ROM reel:** a canonical range-of-motion animation (checked into the pipeline, reused every character) — full joint rotations, the 6 extreme poses, a cloak-swirl stress move — rendered as a turntable-style MP4. Candy-wrapping, volume collapse, cloak interpenetration all show here.
2. In-UE checks: skeleton asset diff against the project template (bone names/hierarchy exact), all sockets present (`hitbox_lint` depends on them), physics asset generated for the accessory chains (§8.5).
3. Your review: the ROM reel + one in-game clip of the character running M1's jab via retarget. Approve/notes.

## 8.4 The Facial Minimal Set (`wiki: 162`, trimmed hard)

v1 facial = **8 expressions as pose assets**, not performance animation: neutral, effort (attack exertion), strain (charge/heavy), hurt-light, hurt-heavy (launched), smug/gleeful (character-specific — Robin smirk, Red's too-sweet smile), KO, victory. Driven as an additive layer from game state (attacking → effort; hitstun → hurt), swapped instantly — at gameplay distance, *that they change* reads louder than *how they blend*. Eyes get simple aim/blink. Everything beyond this is post-M6.

## 8.5 Secondary Motion (cloth without Chaos Cloth)

Accessory chains are driven by **joint-chain dynamics** (AnimDynamics node or KawaiiPhysics-class plugin — ⚖️ pick in this milestone, record it): per-chain stiffness/damping/gravity/wind tunables, simple capsule collision against thighs/torso only. Full cloth simulation is explicitly post-M6 (`DECISIONS.md`). Tune targets: Red's cloak should *trail* on dashes and *snap* on turnarounds (deception motif: the cloak lies about her momentum a half-beat behind the truth); Robin's feather is a constant small tell of his coiled energy. Verify with dash-dance and turnaround capture clips.

## 8.6 GATE — Rig Complete (per character)

- [ ] ROM reel approved: no candy-wrapping, no collapse, cloak behaves through the stress move
- [ ] Skeleton diff clean vs. project template; sockets all present; retargeter asset (`RTG_Mannequin_to_<Char>`) created and validated
- [ ] M1 jab retargets onto the character and plays in `L_Gym` without visible deformation errors
- [ ] Facial pose assets: all 8, previewed in a strip, at gameplay distance each reads distinctly
- [ ] Dynamics tuned: dash/turnaround clips show trail-and-snap; nothing jitters at 60 fps; nothing interpenetrates in shield/crouch idles
- [ ] Weight painting passes the scripted checks (influence caps, symmetry) — logged in the manifest

---

# Part 9 — Animation Production

**Purpose:** the full animation set per character, at the M1 bar. This part defines the single most important loop in the project — the **attack-authoring loop** — because animation is where "90% agents" is hardest and where the Smash comparison is won or lost.

## 9.1 The Animation Inventory (per character)

**Locomotion & state set (~28):** idle (+2 idle fidgets), walk, run, dash-start, turnaround, run-stop/skid, jump-squat, jump, double-jump, rise, apex, fall, fast-fall, land (soft/hard), crouch (enter/loop/exit), platform drop, ledge-hang, ledge-getup, shield (enter/loop/exit/break), spot-dodge, roll F/B, air-dodge, grab-hold, grabbed/struggle.
**Attacks (~16):** the full §6.1 list.
**Damage set (shared skeleton, authored once for the roster, ~15):** flinch light F/B/U/D, flinch heavy F/B, launch F/B/U (each: launch→tumble loop), ground-bounce, tech-in-place/F/B, knockdown + getup F/B, ledge-slip. Feedback quality is a per-move requirement (`wiki: 141`): reactions must scale visibly with hit strength.
**Ceremony (~5):** 1 taunt, 3 victory poses (with facial), 1 entrance.

## 9.2 Locomotion Path (the cheap 60%)

1. **Sources:** Game Animation Sample (primary — high quality, already on the UE5 skeleton) + Mixamo fills. Agents retarget via `RTG_`, then **polish per the movement spec**: retiming (Red's walk becomes a skip via keyframe retime + hip bounce layer), posture layers (Robin's upright additive lean), and personality idles authored fresh through §9.3's loop (idles are identity — worth full effort).
2. **Transfer of M2 mannequin work:** every M2 attack retargets onto the real character as the *starting point*, then gets a proportion-correction pass via Control Rig (her cloak and shorter reach change contact poses; the retarget preserves your locked timing exactly — the frame data does not move).
3. Blending rules (`wiki: 190`): locomotion blends smooth (100–150ms); **any transition into attack startup is ≤1 frame** — blending never eats responsiveness; inertia blending for land/skid so weight carries through.

## 9.3 The Attack-Authoring Loop (the crown jewel — run ~20×/character)

The loop that replaces a fighting-game animator, exploiting that attacks are **pose-sparse**: 3–5 authored poses + exact timing (`wiki: 036`, `wiki: 062`). Per move:

**Step 1 — You: the pose spec** (10 minutes, Appendix B template). Written in intent language, e.g. for `RRH_FSmash`:
> *Anticipation (reached by frame 2, held through charge):* weight fully on back leg, torso coiled away, hood shadowing the face, hands crossed low like the innocent pose — but fingers spread, clawed. Reads as "shy" at 10% zoom, "wrong" at 50%.
> *Contact (the identity pose):* full lunge, both hands raked forward past center, cloak whipping the opposite way, face in `strain`, back leg fully extended. This is the poster frame — it must work as a still.
> *Follow-through:* hands continue past her hip, overshoot, weight falls forward onto the front foot, one full beat of vulnerability, cloak settles last.
> *Adjectives:* sudden, feral, overcommitted. *Timing:* per `DT_FrameData` row.

**Step 2 — Agent: key authoring.** Via Control Rig in UE (or scripted Blender poses exported): sets the spec's key poses on the timeline at the frame-data-derived frames, breakdowns for arcs (arc-check: wrists and cloak tips travel on curves, not lines), moving-holds instead of frozen holds (2–3% drift), first-key snap per `wiki: 049`.

**Step 3 — Agent: physicality pass.** Where the inbetweens feel floaty on preview, round-trip the keys through **Cascadeur** for physics-assisted inbetweening (ballistic weight transfer, natural spine counter-rotation), then re-import. Skip when the Control Rig result already passes — measured by your notes, not by default.

**Step 4 — Automated checks:** `lead_in_check`, `frame_audit` (notify windows placed from the table in the same slice), arc-lint if implemented, then **self-review by `sakurai-feel-reviewer`** against the pose spec + M1 reference. Only survivors reach your queue.

**Step 5 — You: the two-minute verdict.** Frame strip first (does frame 2 telegraph? is the contact pose a poster?), then 60fps preview, then 25% speed. Notes in intent language. Typical convergence: 2–4 rounds. **Escalation rule:** if a move is still flat after 4 rounds, stop looping — the spec is the problem; rewrite it with a reference clip attached.

**Step 6 — In-game verification:** the move lands in `L_Gym` with its full impact stack, capture clips hit + whiff, and — the real test — you press the button. Approval happens with the controller, not the video player.

## 9.4 Exaggeration Calibration (`wiki: 091`)

Standing calibration, checked at every Step 5: poses are authored ~30% past naturalistic — silhouette-breaking anticipations, contact poses with every line of the body agreeing on direction, smears/stretch on 1–2 frame transitions (scale a forearm 15% on the swing frame; nobody sees the trick, everybody feels the speed). The check: view every preview at **50% window size**. If it reads there, it reads in a match. If it only reads full-screen, bounce it.

## 9.5 The Damage Set (shared, then personalized)

Authored once on the shared skeleton via the same loop (damage anims are feedback: direction and magnitude must be legible in one glance — `wiki: 141`), then two personality overrides per character where identity shows even in defeat: Red's heavy-launch keeps a feral snarl (facial `hurt-heavy` is *angry*, not scared); Robin's tumble is all flailing lanky limbs and lost dignity. Everything else stays shared — this is where the shared-skeleton dividend pays.

## 9.6 GATE — Animation Set Complete (per character)

- [ ] Full inventory §9.1 present, `naming_lint` + `frame_audit` green across all moves
- [ ] Every attack passed the 6-step loop; frame strips archived with their pose specs in `docs/specs/reference/anim_<Char>/`
- [ ] 50%-window readability spot check on 5 random moves: all pass
- [ ] Locomotion feel: 10 minutes of pure movement (no attacking) is *pleasant* — dash-dancing feels like drumming; if movement alone is boring, iterate before shipping the character
- [ ] Blend audit: scripted input sequence capture shows no transition ever delays an attack's frame-2 snap
- [ ] Damage reactions scale visibly across jab → tilt → smash in a single capture clip
- [ ] Idle test: character left standing 60 seconds is alive (breathing, fidgets, cloak micro-motion) and in character

---

# Part 10 — Integration & Presentation

**Purpose:** the connective tissue that turns assets into a game: AnimBP architecture, the notify contract, camera, per-move effects and audio. Agent-built; your reviews are all in-game.

## 10.1 Animation Blueprint Architecture (one template, all fighters)

`ABP_FighterBase` (all fighters share it; per-character child assets only override data): locomotion state machine (grounded/air/ledge/shield branches) → attack montage slot (full-body, driven by the state machine from Part 5 — gameplay code owns *when*, AnimBP owns *what it looks like*) → additive layers in order: posture/personality, facial pose layer (§8.4, from game state), accessory dynamics (§8.5), hit-reaction additive (light flinches play additively over motion so movement never stalls on weak hits — heavies take over full-body).

## 10.2 The Notify Contract (the frame-data invariant, made physical)

Every attack montage carries, placed by agents from the table and policed by `frame_audit`: `NS_Hitbox` notify-state spanning exactly the active window (payload: `HitboxSpec` index) · `NS_Cancel` per cancel window · `AN_Whoosh` on the swing frame · `AN_Step`/`AN_Cloth` foley marks · `AN_FX` for anticipation glints (charge sparkle on smashes — readability, not decoration). Rule: gameplay-relevant notifies are *generated from the table*, never hand-placed; presentation notifies (foley, glints) are hand-placed freely.

## 10.3 Camera

Platform-fighter framing camera (agent-built to this spec): frames all fighters + margin, zoom bounded [min: two characters at ~40% screen height; max: silhouette-driven — never zoom past where `silhouette_render` says characters stop reading], smoothed asymmetrically (fast zoom-out for safety, slow zoom-in for drama), subtle hit-punch on smash connects only (§5.3), KO ceremony hooks (Part 12). Verify with a scripted 2-fighter chase capture at both zoom extremes.

## 10.4 Per-Move Effects & Audio (the presentation pass)

After a kit's animations gate-pass, one presentation slice per character: whoosh family scaled to move class (jab: air-tick; smash: cloth-heavy shear), hit sounds layered (universal thud + character layer: Red = wolf-adjacent snap on her heavy hits, Robin = arrow thunk/string notes), Niagara accents on identity moves only (Red's smashes get 3-frame claw-streak smears; Robin's arrows get restrained tracer + a *good* impact), charge loops (audio rise + particle shimmer that double as opponent information). Restraint audit closes the slice (`wiki: 035`): capture a 4-stock chaos scene — if effects ever make you lose a character, cut effect size/brightness until the character wins again. The fighter is always the brightest read.

## 10.5 GATE — Integration Complete (per character)

- [ ] ABP conforms to the shared template; facial layer reacts to game state; light flinches don't interrupt movement
- [ ] `frame_audit` green over generated notifies; no hand-placed gameplay notify anywhere (script-verified)
- [ ] Camera clip approved at both zoom extremes; hit-punch only on smashes
- [ ] Presentation pass done; chaos-scene restraint audit passed
- [ ] The character *sounds* like the fantasy with your eyes closed (play blind for one minute — identity should survive vision loss; audio is not secondary, `PRINCIPLES.md`)

---

# Part 11 — Milestone M4: Robin Hood

**Purpose:** run the whole pipeline a second time, faster, and add the one new engineering system his identity demands: projectiles. This milestone proves the pipeline is a *pipeline* rather than a heroic one-off — measure it.

## 11.1 The Repeat (with a stopwatch)

Execute Parts 4.1–4.3 (his docs were drafted in Part 4; finalize), 6 (his kit: same slot template, zoner identity — key design differences: arrows as the neutral-special centerpiece with charge tiers, FSmash as the fully-drawn point-blank shot with huge anticipation, quick low-commitment tilts for keep-away, weaker close-range reward as the archetype's honest cost), 7, 8, 9, 10 — in parallel lanes where they don't collide (his model pipeline runs while his mannequin kit is still tuning; the M2-gate rule still applies to *final* approval). **Log actual durations per part in `DECISIONS.md`** vs. Red's — the deltas are your pipeline-improvement backlog and your roster-expansion cost model.

## 11.2 The Projectile System (new engineering)

Agent-built to spec: pooled projectile actors (arrows) with deterministic trajectories (custom gravity per charge tier, no physics engine — §2.5.3 applies to projectiles too), frame-data rows for each tier (arrows have startup/active/damage/knockback like any move; the *flight* is the active window), clank/priority rules vs. melee hitboxes (⚖️ decide: arrows beat jabs, trade with tilts, lose to smashes — or your own table; record it), arrow-vs-arrow behavior, stick-in-world presentation detail (arrows that miss embed in the stage briefly — cheap, characterful, cut if it ever costs a frame), and the bow micro-rig integration (§8.2: draw animation bends the bow, string bone tracks the hand — the single most identity-selling detail he has; `render the draw-release-wobble cycle as its own review clip`).

## 11.3 The First True Matchup

With both kits live, the game exists for the first time. Before M5's stage work, run matchup sessions in `L_Gym`: does Robin's keep-away vs. Red's bait-and-approach produce the intended dance? Tune interaction points (arrow vs. SSpecial lunge; her DSpecial counter vs. his point-blank FSmash) until *both* players in the matchup are having the fantasy their character promised. This is kit design's final exam.

## 11.4 GATE — M4 Complete

- [ ] All per-character gates (Parts 7–10) passed for Robin
- [ ] Projectile system: frame-audited, priority table recorded, pooling verified (200-arrow stress capture, zero hitches at 60)
- [ ] Bow draw-release clip approved; arrows feel *aimed*, not sprayed (charge tiers visibly/audibly distinct)
- [ ] 20 minutes of you playing the matchup (both sides) stays fun; both fantasies survive contact with each other
- [ ] Pipeline timing log complete; top 3 slowest steps have improvement notes
- [ ] Side-by-side squint sheet: both final characters, all team colors, unmistakable at 10% screen height

---

# Part 12 — Milestone M5: The Versus Slice

**Purpose:** one real stage, complete match flow, and the first fully human playtests. This is where the project stops being a toybox and becomes a game.

## 12.1 The Stage

One stage (`L_Greenwood` — a forest-edge clearing; both characters' folk-tale home turf), built to readability law: **gameplay surfaces first** (main platform + 2–3 soft platforms, blast zones tuned in play, ledges grabbable), art second and *behind* the fighters in every sense — desaturated/darker palette per `ART_DIRECTION.md`, no high-frequency detail near the action plane, parallax background layers for depth, zero gameplay-affecting visual noise. Verify with the chaos-scene readability audit on the real stage. Trim rule: any background element you notice *during* a match is too loud.

## 12.2 Match Flow

Agent-built: character select (functional, not fancy — portraits, team colors, stage confirm), match rules (3 stock, 7 minutes, tunable), spawn/respawn with invulnerability frames, the damage HUD (percent readout in fighter team color, large, at real-play legibility — `PRINCIPLES.md` text rules), KO ceremony (blast-zone flash + screen shake + sound sized to the moment; star-KO-style top exits optional/cuttable), results screen (winner pose using victory anims + facial, per-player stats minimal), and **fast retries**: rematch from results in ≤ 2 button presses, ≤ 3 seconds (`PRINCIPLES.md`: fast retries preserve motivation; friction after failure kills it). Menus are part of the game feel — same 2-frame responsiveness bar as gameplay.

## 12.3 Human Playtests (`wiki: 244`)

Protocol, run with ≥4 sessions of 2 fresh players (friends, family — *naive* players are the point):
1. **Say nothing.** No tutorial, no explanations. Hand controllers, start match, watch from behind. Every question they ask aloud is a readability bug; write it down verbatim.
2. Watch for: hesitation (they don't know what's safe → telegraph/feedback gap), misattribution ("what hit me?" → effect/reaction gap), dead buttons (moves never used → job unclear), and delight (what makes them laugh or lean in → *protect and amplify those*).
3. After 3 matches, two questions only: "describe each character in a few words" (compare against the fantasy docs verbatim) and "which move felt best?" (compare against your One True Attack lineage).
4. Convert observations to queue items same day. Re-run with fresh players after each fix batch. Never coach mid-session; a player you've coached is spent as a naive tester.

## 12.4 GATE — M5 Complete

- [ ] Full match loop: select → fight → KO ceremony → results → rematch, all at 60, rematch ≤3s
- [ ] Stage readability audit passed; ledges/blast zones tuned through play
- [ ] ≥4 naive playtest sessions run; hesitation/misattribution lists empty **or** explicitly accepted in `DECISIONS.md`
- [ ] Naive players' character descriptions match the fantasy docs (the ten-second identity test, §0.1.5, passed by strangers)
- [ ] Two strangers voluntarily ask to keep playing past the session. This is the real gate; everything above merely predicts it.

---

# Part 13 — Milestone M6: The Trim Gate & Master Quality Bars

**Purpose:** the director's cut pass (`wiki: 254`) and the final audit against the Ultimate bar, before any expansion (characters 3+, more stages, modes, marketing).

## 13.1 The Trim Pass

One full day, you alone with the build and a notebook — the compromise-and-resolve work that *is* the director's job:
1. Play everything. For each move, effect, sound, menu screen, and flourish, ask: does it add clarity, delight, or strategic value proportional to the attention it asks? (`AGENT_OPERATING_SYSTEM.md` priority 5/7.)
2. Produce three lists: **CUT** (does nothing — remove this week), **SHRINK** (right idea, too loud/long — effects to dim, recoveries to trim, menu steps to remove), **AMPLIFY** (the delight moments playtesters found — make them 10% bigger). The lists go through the normal agent queue like any work.
3. The 20% question, answered for real: if forced to remove a fifth of the game's content, what goes? Whatever tops that list should worry you — either cut it now or fix why it's expendable.

## 13.2 Your Scheduled Polish Hours (the deliberate exception to Guardrail 3.3.5)

Budget 2–3 hours *per character*, hands-on, on exactly three things — highest-visibility, highest-taste-sensitivity: jab contact pose, FSmash contact + follow-through, run cycle personality. Work via notes-to-agent in a live loop, or hand-adjust and then **feed every adjustment back into the pose specs** so the pipeline learns what your hands knew.

## 13.3 The Master Quality Audit (the "on par with Ultimate" checklist, run per character)

**Readability:** silhouette ID at 10% height, all team colors, on the real stage ▢ · every attack telegraphs by frame 2 (strip-verified) ▢ · every hit's source/direction/strength legible in one glance ▢ · chaos-scene: fighters always brightest read ▢
**Responsiveness:** ≤2-frame response on all inputs (measured) ▢ · buffer working ▢ · no blend delays (audit clip) ▢ · 60 fps under 4-fighter + max-effects stress ▢
**Animation craft:** all attacks pass lead-in/pose/follow-through review ▢ · frame data matches table exactly (`frame_audit` clean run archived) ▢ · reactions scale visibly ▢ · idle alive ▢ · 50%-window test on the full kit ▢
**Impact:** the smile test — landing each smash still satisfying after months of exposure ▢ · KO ceremony proportional ▢ · blind audio identity test ▢
**Identity:** naive-player descriptions match fantasy docs ▢ · every move has a stated job ▢ · signature moments (§4.1.3) occur organically in real matches ▢
**Craft hygiene:** `LICENSES.md`/provenance complete ▢ · IP guardrail final review ▢ · fresh-clone builds and runs ▢

## 13.4 After the Gate

Only now: roster expansion (character 3 costs what the §11.1 stopwatch says, minus the pipeline-debt fixes), additional stages, modes, and marketing — which per `PRINCIPLES.md` (Marketing) means showing the real game as soon as it exists, painting an accurate picture: readable clips of real matches are the asset; the M5 capture harness already makes them.

---

# Appendix A — Naming Conventions Reference

## A.1 Character codes
`RRH` = Red Riding Hood · `ROB` = Robin Hood · `SHARED` = roster-shared assets. Three letters, uppercase, assigned at fantasy-doc creation, never reused.

## A.2 MoveID vocabulary (exact strings; table keys = anim suffixes = montage names)
`Jab1 Jab2 FTilt UTilt DTilt FSmash USmash DSmash NSpecial SSpecial USpecial DSpecial NAir FAir BAir UAir DAir Grab GrabHold FThrow BThrow DashAttack` (unused slots reserved). Multi-part moves suffix with `_Charge`, `_Release`, `_Hit2`, e.g. `NSpecial_Charge`.

## A.3 Asset prefixes (full table)
| Prefix | Type | Prefix | Type |
|---|---|---|---|
| `SK_` | Skeletal mesh | `SKEL_` | Skeleton |
| `SM_` | Static mesh | `PHYS_` | Physics asset |
| `AS_` | Anim sequence | `AM_` | Anim montage |
| `ABP_` | Anim blueprint | `PA_` | Pose asset |
| `CR_` | Control rig | `IK_` | IK rig |
| `RTG_` | IK retargeter | `BS_` | Blend space |
| `M_` | Material | `MI_` | Material instance |
| `T_` | Texture | `NS_` | Niagara system |
| `DT_` | DataTable | `CT_` | Curve table |
| `BP_` | Blueprint | `W_` | Widget |
| `MS_` | MetaSound | `SC_` | Sound cue/class |
| `IA_` | Input action | `IMC_` | Input mapping context |
| `L_` | Level | `LUT_` | Palette LUT |

## A.4 Notify names
Gameplay (generated only): `NS_Hitbox`, `NS_Cancel`, `NS_Armor`, `NS_Invuln`. Presentation (hand-placed): `AN_Whoosh`, `AN_FX`, `AN_Step`, `AN_Cloth`, `AN_Voice`.

## A.5 Review Queue layout
`ReviewQueue/YYYY-MM-DD/<batch-slug>/` containing `MANIFEST.md`, `NOTES.md` (yours), and media named `<asset-or-move>__<view>.<ext>`, e.g. `RRH_FSmash__strip.png`, `RRH_FSmash__60fps.mp4`, `SK_RRH__turntable_gameplay.mp4`.

## A.6 Git
Branches: `feat/<area>-<slug>`, `art/<char>-<slug>`, `anim/<char>-<moveid>`, `pipe/<slug>`. Tags: `model/<char>-base-locked`, `gate/m<N>-passed`. Commit format: `<area>: <what> — <why>` + verification reference.

---

# Appendix B — Agent Prompt Library

Templates for the recurring briefs. Replace `«»` fields; keep the five-part structure (§3.2) always.

## B.1 Gameplay slice brief
> **Slice:** Implement «one behavior», per «spec file §». **Spec:** `docs/specs/«…»`, `DT_FrameData_«char»` rows «…», manual Part «N». **Deliverable:** PIE capture clip demonstrating «the specific interaction», debug overlays on, to `ReviewQueue/«date»/«slug»/` with manifest. **Verify:** compile, `build_check`, `frame_audit`, «any specific check». **Freedom:** implementation details yours; anything player-visible not covered by spec goes in the manifest as a question, not a decision.

## B.2 Pose spec (the Part 9 loop input — you write these)
> **Move:** `«CHAR»_«MoveID»` · **Frame data row:** (link) · **Fantasy line it serves:** «quote from _FANTASY.md»
> **Anticipation (by frame 2, hold if chargeable):** «body position in plain language; what it telegraphs to the opponent; what it must read as at 10% zoom»
> **Contact pose (the poster frame):** «the identity pose; where every line of the body points; facial pose; what the cloak/prop is doing»
> **Follow-through:** «the overshoot, the weight landing, the vulnerability read, what settles last»
> **Adjectives:** «≤5, from the movement spec» · **Reference:** «optional clip link — timing/weight only, never design»
> **Never:** «the one failure mode to avoid, e.g. 'must not read as a push'»

## B.3 Animation authoring brief
> **Slice:** Author `AS_«CHAR»_«MoveID»` from the attached pose spec, keys via Control Rig on `SK_«char»`, timing from `DT_FrameData_«char»`. Place generated gameplay notifies in the same slice. **Spec:** pose spec + `QUALITY_BARS.md` §animation + M1 reference clips. **Deliverable:** frame strip (startup + first actives, numbered) + 60fps/25% preview MP4 from gameplay camera. **Verify:** `lead_in_check`, `frame_audit`, `sakurai-feel-reviewer` pass noted in manifest with its verdict. **Freedom:** breakdowns, arcs, smears yours; key pose *content* changes require a manifest question.

## B.4 Model batch brief
> **Slice:** Generate «N» base-mesh candidates for «char/part» from model sheet «link». **Spec:** `ART_DIRECTION.md`, `IP_GUARDRAILS.md` (prompt suffix mandatory), budgets `QUALITY_BARS.md` §model. **Deliverable:** per candidate — gameplay+close turntables, silhouette sheet, stats block, provenance sidecar. **Verify:** `import_gen3d` clean, `naming_lint`. **Freedom:** generation parameters yours; do not cull candidates yourself below «N» — shape selection is the director's.

## B.5 Review-reaction brief (after your NOTES.md)
> **Slice:** Address `NOTES.md` in `ReviewQueue/«…»` for «asset». Notes are direction, not implementation: translate intent to changes, list your translation in the new manifest so drift is visible. Resubmit to a new dated batch; prior batch stays untouched (history).

## B.6 Playtest conversion brief
> **Slice:** Convert the attached raw playtest observations into queue items. Each verbatim player quote becomes: classification (hesitation / misattribution / dead button / delight), hypothesized cause, smallest-change proposal, affected spec file. Delight items get AMPLIFY proposals, not just preservation.

---

# Appendix C — Frame Data Starting Values

Starting points, not balance — tuned in M2/M4 play. All values in frames at 60 fps. (Startup = frames before first active; a "frame 5 jab" = `StartupFrames 4`, first active frame 5.)

| Archetype | Startup | Active | Recovery | Damage | Hitstop | Notes |
|---|---|---|---|---|---|---|
| Jab1 | 3–4 | 2 | 12–14 (IASA ~10 into Jab2) | 2.5 | 4 | The trust move — err fast |
| Jab2 | 4 | 2 | 16 | 3.5 | 5 | String gap ≤ 3f |
| FTilt | 7–9 | 3 | 18–20 | 8–10 | 7 | Spacing tool |
| UTilt | 5–7 | 4 | 16–18 | 7 | 6 | Anti-air, combo starter |
| DTilt | 5–6 | 2 | 14–16 | 6 | 5 | The safe poke |
| FSmash | 14–18 | 3 | 28–34 | 15–19 | 11–13 | Big anticipation = the telegraph |
| USmash | 10–12 | 4 | 26–30 | 13–16 | 10 | |
| DSmash | 9–11 | 2+2 (front/back) | 26–32 | 12–14 | 10 | |
| NAir | 6–8 | 10 (persistent) | land-lag 8 | 8 | 6 | The get-off-me |
| FAir | 9–12 | 3 | land-lag 10–14 | 11–14 | 9 | Aerial kill move |
| BAir | 7–9 | 3 | land-lag 8–10 | 10–12 | 8 | |
| NSpecial (projectile) | 12–20 by charge | flight | 20–24 | 4–12 by tier | 5–9 | Robin's centerpiece |
| Grab | 6–7 | 2 | 24–28 whiff | — | — | Whiff must hurt |
| Throws | 10–14 to release | — | — | 7–9 | — | |
| Spot dodge | invuln 3–17 | — | actionable f27 | — | — | |
| Roll | invuln 4–16 | — | actionable f30–34 | — | — | |
| Air dodge | invuln 3–20 | — | +10 land-lag | — | — | |

Universal: jump-squat 3 · input buffer 5 · base land 2–4 · hitstun ≈ knockback-scaled curve (start: `frames ≈ 0.4 × knockback units`, tune by feel) · shieldstun ≈ damage-scaled (tune so jab-on-shield is attacker −2 to −6).

---

# Appendix D — Sakurai Wiki Source Index for This Project

The wiki files this manual's rules are grounded in (paths under `sakurai-llm-wiki/videos/`). Cite these in specs; per `SOURCING_LIMITS.md`, they support principle-level claims, not transcript-level ones.

| File | Rule it grounds | Where used |
|---|---|---|
| `036-breaking-down-attack-animations.md` | Lead-in / attack / follow-through structure | Parts 5, 9 |
| `049-making-lead-ins-instant-and-impactful.md` | Frame-2 snap; lead-ins as opponent information | §0.4, `lead_in_check`, Part 9 |
| `062-attack-poses.md` | Contact pose = the move's identity/poster frame | Pose specs |
| `077-follow-throughs-make-the-impact.md` | Weight and consequence live in recovery | Pose specs |
| `221-always-keep-attack-collision-in-mind.md` | Hitboxes authored, generous, never mesh-fitted | §0.4, hitbox design |
| `141-damage-animations.md` | Reactions are feedback, first-class work | §5.3, §9.5 |
| `091-exaggerate-to-make-up-for-information-loss.md` | 30%-past-natural; 50%-window test | §9.4 |
| `190-animation-blending.md` | Blend locomotion, never attack startups | §9.2 |
| `014-assigning-animations.md` | Direct with movement specs and adjectives | Part 4, §3.3 |
| `162-facial-animations.md` | Expressions as state feedback; minimal set | §8.4 |
| `239-establishing-characters-through-their-design.md` | Silhouette-first design; B&W test | §4.3 |
| `035-let-your-characters-shine.md` | Effects clarify, never outshine | §5.3, §10.4, §12.1 |
| `254-a-director-s-job-is-to-trim.md` | Compromise/resolve/trim as the director's core | §0.2, Part 13 |
| `230-directors-and-producers.md` | Director role definition | §0.2 |
| `088-ten-people-can-produce-seven-people-s-work.md` | Coordination tax; why agent-parallelism wins | §0.2 |
| `043-sharing-info-within-a-team.md` / `114-explain-ideas-to-everyone-at-once.md` | Shared info systems → the specs directory | §2.3 |
| `060-don-t-wait-to-speak-your-mind.md` | Same-day notes | §3.3 |
| `244-elementary-school-play-testers.md` | Naive playtesting, watch silently | §12.3 |
| Core docs: `AGENT_OPERATING_SYSTEM.md`, `PRINCIPLES.md` | Priority order, feel/clarity/reward laws, time respect | Throughout |

---

# Appendix E — Troubleshooting

**Gen-3D candidates all look mushy/generic.** Decompose harder (per-part generation, §7.2.1), feed cleaner single-subject reference crops, and check that the art direction's stylization is in the prompt — realistic prompts produce meshes the style can't rescue. If two rounds fail, the model sheet is probably under-specified: more shape language, fewer material words.

**Auto-retopo keeps ruining shoulders.** Known worst case. Escalate the §7.3.2 ladder faster; consider a reusable "shoulder loop graft" script (agents transplant a known-good shoulder topology patch) — build it once, it pays across the roster.

**Agent-authored attacks converge to 'correct but flat.'** The spec lacks a *strongest verb*. Add one ("whips", "rakes", "detonates"), attach one reference clip, and demand a 15%-further exaggeration pass than feels right in the strip — flat previews often read correctly in motion at gameplay zoom, but the reverse never happens. If it persists across moves: your Step-5 notes may be describing positions instead of intent; re-read §3.3.2.

**Retarget slides feet / bends the cloak wrong.** Check retarget chains match (IK Retargeter chain mapping), pelvis motion set to scaled-translation, and that accessory chains are *excluded* from retargeting (dynamics drive them, §8.5).

**`frame_audit` and feel disagree** (numbers match, move feels late). The table is wrong, not the audit: perception beats spreadsheet (`PRINCIPLES.md`). Change the table row, let the notify regeneration follow, re-audit.

**60 fps drops during effects-heavy moments.** Audit in order: Niagara overdraw (particle counts, transparency stacking), accessory dynamics substepping, texture streaming pool. The frame budget is a design law — cut effects before accepting drops (`wiki: 035` gives you the license).

**Two sessions corrupted a binary asset.** You violated single-writer (§3.1). Restore from git, re-read the parallelization seams, and add the asset path to a session-lock note in `CLAUDE.md`.

**A milestone gate has been 90% done for two weeks.** Classic. The remaining 10% is always a taste item you're avoiding. Book one review block, make the call, record it, move. Unresolved decisions are the solo-director failure mode — the wiki's whole Team Management category is Sakurai resolving things *now*.

---

# Appendix F — Glossary

**Active frames** — frames a hitbox can connect. **Anticipation/lead-in** — pre-hit portion of an attack animation; doubles as the opponent's telegraph. **Autocancel** — landing during specified aerial frames incurs only base landing lag. **Blast zone** — KO boundary. **Buffer** — inputs stored during non-actionable frames, executed at first opportunity. **Clank** — attack-vs-attack collision resolution. **Fast-fall** — player-triggered increased fall speed. **Follow-through** — post-hit recovery portion; where weight/vulnerability reads. **Frame** — 1/60 s. **Frame strip** — contact sheet of consecutive numbered frames. **Hitstop** — shared freeze on hit connection. **Hitstun** — victim's uncontrollable post-hit state. **IASA** — interruptible-as-soon-as frame. **Jump-squat** — grounded frames between jump input and liftoff. **Kit** — a character's full move set. **Lock-the-mesh** — the ban on regenerating an approved base model. **One True Attack** — the M1 reference slice all later work is diffed against. **Pose-sparse** — the property that fighting-game attacks are a few key poses plus timing, which is what makes agent authoring viable. **ROM reel** — range-of-motion rig-verification render. **Two-Minute Rule** — no deliverable may take >2 minutes to judge. **Vertical slice** — smallest end-to-end playable unit of work.

---

*End of manual. The first command it asks of you is in §1.2: install the tools. The last is in §13.3: audit the bar. Everything between is a loop of specs, batches, notes, and gates — run it.*





