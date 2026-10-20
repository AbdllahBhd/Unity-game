# Hollow Night: three directions for an adult puzzle game

2026-10-14. Proposal only; no direction selected and no Unity behavior changed.

## What already works

Izan is a recognisable black rabbit with tall ears, bright eyes and a compact silhouette.
The player launches the protagonist through the world and can land and launch again.
Pursuing pumpkins create an opportunity to turn the hunter into the target. That is
the core identity to develop: **read the room, lure the hunter, commit to the leap**.

The existing story follows Hollowmere's stolen Moon Lantern, a graveyard, Webwood and
Morgra's tower. It ends by welcoming a lonely Pumpkin Queen to the celebration. That
warm ending suits the former all-ages direction; the newly requested adult audience
calls for more ambiguity, stronger environmental storytelling and meaningful stakes.

## Current evidence

`SPEC.md` is the October 12 redesign agreement. No earlier `task_plan.md` was present.
The relevant Claude sessions show an earlier four-hero overhaul, followed by the user's
explicit correction to a single black rabbit, dark atmosphere and hunting pumpkins.
The current code reflects that correction. Preserve those choices during exploration.

Current stages are First Hop, Graveyard Steps, Pumpkin Patrol, The Great Pit, Bat Alley,
Thorn Climb, The Moving Woods, Crumbling Cellar, Cauldron Cannons and Morgra's Roost.
Moving platforms, wind and portals arrive together at stage 7; cannons, ghost platforms
and bats combine at stage 9. That density leaves little space for learning each mechanic.
Story chapter boundaries also need alignment: `post_3` announces Webwood, while stage 4
still belongs to the graveyard chapter in source.

The current second star rewards smashing all pumpkins, which is already required to
open ordinary doors. Proposed independent stars: escape, finish without dying, and
finish within launch par. Keep all pumpkins mandatory; optional memories reveal lore,
without being necessary to understand or complete the main story.

## A — The Last Light

**Premise:** Every autumn, Hollowmere burns one memory from each household to keep
the night outside. Izan discovers his missing sister's voice inside a hunting pumpkin.
Morgra did not invent the ritual: she inherited it, and the town depends on her silence.

**Opening:** Izan lights an empty lantern at his sister's abandoned window. A pumpkin
whispers his childhood name. Its pursuit leads him to a gravestone bearing a living
neighbour's name. The game asks why the town remembers the dead better than the living.

**Three chapters:** The graveyard reveals the cost of safety; the root-filled woods
expose how memories feed the lantern network; the tower reveals Morgra's own erased
family. At the climax, Izan must interrupt the machinery before taking back the flame.
The ending restores the stolen memories and leaves the town facing its first unguarded
dawn together. Convey consequences through changed scenery and a short final exchange.

**Signature mechanic — lantern lure:** At marked safe perches, hold to place a short-lived
light decoy, drawing nearby pumpkins onto a planned collision route. Launch and dash
through the gathering. One decoy at a time; a visible attraction radius; no consumable
currency. The difficult decision is where to gather threats, not precise finger timing.

**Art:** Painted ink and gouache, deep indigo skies, chalk-white rabbit eyes, amber
memories and pale green ghosts. Crooked grave markers, wax-filled windows, root tunnels,
weathered lantern brass. Keep platform edges crisp against soft painted depth.

**Asset comparison:** Izan with stitched cloak and chipped lantern; pumpkins whose cracks
show miniature remembered scenes; root-and-stone platforms; doors resembling sealed
family portraits; Morgra with a crown of extinguished candles. Animation emphasizes
breathing, wary ear motion, squash on landing and a bright flowing dash silhouette.

**Tradeoff:** Closest to today's game and a strong candidate for the first comparison.
Pursuit plus decoys must remain predictable enough to support planning.

## B — The Borrowed Shadow

**Premise:** Izan wakes without a shadow. Something wearing his outline is freeing
the pumpkins ahead of him. Each chamber repeats a fragment of the night he betrayed
Morgra to save himself. The shadow remembers what the rabbit refuses to remember.

**Opening:** Izan passes beneath a lamp. Every object casts a shadow except him. On the
wall, another rabbit turns its head a moment before he does and opens the forbidden gate.

**Three chapters:** Escape through rooms where shadows contradict their owners;
reconstruct the betrayal in a forest of repeated routes; face the stolen outline in
the tower. The conclusion reunites rabbit and shadow after Izan accepts responsibility.
The final action uses an echo to rescue someone, reversing the opening abandonment.

**Signature mechanic — one-flight echo:** After landing safely, replay the previous
flight as a nonphysical shadow that activates marked ghost switches. Izan can launch
while the echo acts. One recorded route and one active echo; no recursive recordings.
Solid-world collisions remain Izan's responsibility. Show the recording and switch
timing before asking the player to combine them.

**Art:** High-contrast woodcut and paper silhouettes, bone-coloured moonlight, charcoal
architecture, restrained vermilion seals. Negative space, etched bark and long warped
shadows replace busy texture. Solid platforms and ghost platforms differ in shape and
surface pattern as well as colour.

**Assets:** Clean solid rabbit versus stretched ink echo; pumpkin masks suspended in
shadow smoke; split reflection doors; bell-shaped ghost switches; narrow carved bridges;
Morgra as an almost human silhouette whose eyes appear only in reflected light.

**Tradeoff:** Most distinctive puzzle identity, but increases player memory demands
and needs explicit rules for replay timing, death resets and moving-object interactions.
Prototype this before committing to the full production scope.

## C — The Thirteenth Bell

**Premise:** A wandering harvest carnival offers to bring back anyone the visitor has
lost. At midnight, its thirteen bells turn every unpaid promise into a pumpkin hunter.
Izan enters looking for his sister; Morgra keeps the carnival moving so its debt never
falls on the town that made the first bargain.

**Opening:** A paper ticket appears in Izan's empty hand. It reads “Admit two.” Inside
the gate, an empty seat is already reserved beside him. The first bell rings from below.

**Three chapters:** Follow the welcoming procession; discover the abandoned machinery
beneath its painted smiles; stop the final bell in Morgra's suspended belfry. The ending
lets Izan hear his sister's farewell once, then breaks the bargain rather than sustaining
the illusion. Adult tone comes from grief and temptation, not added gore.

**Signature mechanic — bell phase:** A visible, regular bell cycle changes selected
platforms and hunters between two readable states. The player launches from safe perches
into a chosen phase. Telegraph changes with animation, distinct shapes and a countdown;
sound reinforces the cue but is never required. Freeze phase during aim in the initial
prototype, then compare a timing-focused variant explicitly.

**Art:** Layered theatrical paper and worn carnival paint, oxblood curtains, antique
gold, petrol blue nights. Platform silhouettes resemble stage rigging and striped tents;
cutout scenery shifts gently in parallax. Gameplay objects stay cleaner than backdrop art.

**Assets:** Izan with a torn admission ribbon; carved mask pumpkins with readable phase
faces; balancing carnival lifts; drum trampolines; bell cannons; rotating gate wheels;
Morgra as a ringmaster among suspended bells. Keep the black rabbit recognisable.

**Tradeoff:** Strong motion, sound and environment identity, but risks turning a planning
puzzle into a reflex test. Offer timing assistance and never rely on audio alone.

## Ten-stage redesign scaffold

This is a proposed learning sequence, not a claim that layouts already exist or are
balanced. Browser baseline mode will also reproduce the current ten stage descriptions
for comparison, with physics approximations disclosed.

| Stage | Player lesson and layout intention | Story function |
|---|---|---|
| 1 | One launch, one stationary hunter, broad landing and visible sealed door | Establish the rabbit and a disturbing clue |
| 2 | One pursuing hunter; safe perch lets the player bait and outrun it | Show that the world reacts to Izan |
| 3 | One airborne dash through a clearly marked obstacle; first direction mechanic demo | First contradiction in the apparent story |
| 4 | Mushroom bounce through a wide gap; no additional new mechanic | Enter the next environment and consolidate launch control |
| 5 | One moving platform with clear travel path and safe waiting ledge | Reveal traces of previous travellers |
| 6 | Full lantern / echo / bell puzzle; direction-specific geometry | Midpoint revelation, told through the solution |
| 7 | One portal pair with readable entry and exit orientation | Cross into the hidden side of the world |
| 8 | Controlled descent through dash-breakable crates; broad recovery landings | Expose the machinery beneath the setting |
| 9 | One cauldron cannon, then combine with a previously learned tool | Approach the antagonist with the tools already mastered |
| 10 | Three-phase boss puzzle using familiar tools; no surprise new control | Resolve the story with a final playable action |

Wind, bats and blinking platforms can appear in optional challenge routes or later
stages. The first ten should earn complexity instead of showcasing every object at once.

## Polish priorities to compare in the prototype

- One-handed dragging with a visible aim origin, cancellation, power cap and useful
  trajectory preview. Show only free-flight prediction unless collisions are simulated.
- Compare planning-friendly pursuit (hunters pause during aim; marked safe perches)
  against continuous chase. Display the actual hunt radius and cooldown.
- One dash per launch, clearly visible ready/spent state, distinct lethal versus
  smashable pumpkin reaction, brief impact emphasis and immediate restart.
- Maintain readable rabbit/platform/hazard silhouettes at phone size. Reserve the
  brightest effects for interaction, rather than flooding the screen with glow.
- Short optional story beats, skippable after first view, supported by environment
  changes. Failure should retain the player's understanding and restart quickly.
- Save story and art selection independently in the comparison tool. The user should
  be able to pair one narrative with another visual treatment deliberately.

## Research and how it informs this proposal

These are design interpretations of official descriptions, not claims of hands-on
play-testing or findings that the proposed game will perform commercially.

- [Cut the Rope 3, ZeptoLab's App Store listing](https://apps.apple.com/us/app/cut-the-rope-3/id997332884):
  familiar physics tools become a journey with characters and varied environments.
  Takeaway: a simple physical objective can support coherent chapter identity.
- [Cut the Rope: Experiments](https://www.zeptolab.com/games/cut-the-rope-experiments):
  gadgets broaden an established physical interaction. Takeaway: build distinct puzzles
  from understandable tools, rather than continuously adding controls.
- [Angry Birds Journey](https://www.angrybirds.com/games/angry-birds-journey/):
  slingshot destruction is paired with a world-spanning story and visually legible targets.
  Takeaway: readable consequences and a clear objective matter to launch puzzles.
- [COCOON, Annapurna Interactive](https://new.annapurnainteractive.com/en/games/cocoon):
  a central world-leaping mechanic gains different uses, with guardians testing mastery.
  Takeaway: a boss can examine the player's puzzle knowledge rather than adding combat.
- [World of Goo 2](https://worldofgoo2.com/): bridges, towers, terrain and flying machines
  broaden a physics vocabulary. Takeaway: materials and environments can change a puzzle
  more meaningfully than simply increasing target count.
- [GDC: Puzzle Writing — Best Practices](https://www.gdcvault.com/play/1013851/puzzle-writing-best):
  the designer must supply the information required to solve a puzzle and integrate it
  into its story. Takeaway: reveal clues through spaces and actions, and make rules fair.
- [GDC: Level Design Workshop — Solving Puzzle Design](https://www.gdcvault.com/play/1023139/Level-Design-Workshop-Solving-Puzzle):
  evaluates and refines puzzles for purposeful narrative interaction. Takeaway: playtest
  confusion, pacing and frustration as deliberately as technical correctness.

## Decision after the playable comparison

Choose the narrative, visual treatment, pursuit behavior and signature mechanic
independently. Recommendation to test first: The Last Light, painted ink, lantern lure.
It connects the current pumpkin hunt directly to the adult story and has the smallest
new rule set. Compare the other two through playable examples before choosing.

The browser prototype is a design instrument. Unity compilation, current smoke tests,
real touch play, frame pacing and device performance remain separate acceptance steps.
