# Ingestion Order

Use this order when turning the wiki into an agent prompt, retrieval corpus, or evaluation set.

## Full Ingestion Path
1. Read [AGENT_OPERATING_SYSTEM.md](./AGENT_OPERATING_SYSTEM.md).
2. Read [PRINCIPLES.md](./PRINCIPLES.md).
3. Read [COURSE_MAP.md](./COURSE_MAP.md) to understand playlist order.
4. Read the category page that matches the problem you are solving.
5. Pull the individual video pages linked from that category page.

## Fast Task Routing
- Combat feel, impact, responsiveness: `Design Specifics`, `Animation`, `Effects`, `Audio`
- Core loop, reward structure, competitive shape: `Game Essence`, `Planning & Game Design`
- UI, tutorials, onboarding, menu flow: `UI`, `Planning & Game Design`, `Graphics`
- Art direction, readability, scale, visual hierarchy: `Graphics`, `Animation`, `Effects`
- Production process, proposals, direction, team communication: `Work Ethic`, `Team Management`, `Programming & Tech`
- Commercial framing, demos, websites, positioning: `Marketing`, `Grab Bag`, `Planning & Game Design`
- Historical Sakurai examples and case studies: `Game Concepts`, `Grab Bag`, `Channel / Meta`

## Retrieval Rule Of Thumb
- Use category pages to decide where the answer probably lives.
- Use video pages to gather precise examples, official summaries, and Sakurai's related-video links.
- Prefer pulling several short adjacent videos over one long speculative summary.

## When To Use Playlist Order
- Use linear order when training a model from scratch on the corpus.
- Use category order when solving a real problem quickly.
- Use reverse order when you want Sakurai's later, more reflective framing first.
