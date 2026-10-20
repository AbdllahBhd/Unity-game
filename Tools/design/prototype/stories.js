(function (root) {
  "use strict";
  const stories = {
    light: {
      title: "The Last Light",
      subtitle: "What would you forget to keep the dark outside?",
      premise:
        "Hollowmere survives each winter by burning a memory from every household. When a hunting pumpkin speaks in his missing sister’s voice, Izan follows it beyond the lamps. Morgra inherited the ritual; the town inherited the silence.",
      opening:
        "At his sister’s window, Izan strikes a match. The empty lantern answers in her voice: “You promised you would remember.” Outside, something with a carved smile begins to follow him.",
      chapters: [
        {
          title: "I · Names in stone",
          text: "The cemetery holds graves for people still living. Their names are intact, but nobody can remember their faces. Izan’s sister has no grave. Someone has paid to keep her absence invisible.",
        },
        {
          title: "II · What the roots remember",
          text: "Beneath the woods, copper lamps feed on memories carried through roots. A childhood lullaby flickers between the stones. Izan recognises the tune, then the terrible fact that he gave it away himself.",
        },
        {
          title: "III · An unguarded dawn",
          text: "Morgra has forgotten her own daughter to keep Hollowmere safe. The network needs one final memory: Izan’s promise. He can extinguish the machine, but no one knows what waits outside its light.",
        },
      ],
      ending:
        "The lamps go dark. Behind every window, someone begins to remember. Morgra lays down her extinguished crown. “What happens now?” she asks. Izan opens the door. “We stay together.” Dawn arrives without asking for payment.",
      mechanic:
        "Lantern lure · Place one temporary light to gather nearby hunters, then commit to a launch through them.",
      tradeoff:
        "A natural extension of pumpkin pursuit. Attraction range and safe planning must remain clear; the lure should create a decision rather than remove danger.",
      stages: [
        "An empty window. A pumpkin whispers the name only his sister used.",
        "A lamp turns toward Izan. Its brass plaque says: FOR YOUR OWN GOOD.",
        "Inside a broken pumpkin: the smell of rain on a summer roof.",
        "A mushroom grows through a gravestone bearing a living neighbour’s name.",
        "A workman’s platform still moves. On it, two cups have gone cold.",
        "The lure draws out a lullaby. Izan remembers signing the household ledger.",
        "Beyond the portal, the same tree stands with its roots exposed to the sky.",
        "The crates contain memories wrapped in ordinary brown paper. One bears his handwriting.",
        "The cannon is a lamp turned inside out. Every shot feeds the tower.",
        "Morgra’s crown holds a single flame. It speaks in a voice she can no longer name.",
      ],
    },
    shadow: {
      title: "The Borrowed Shadow",
      subtitle: "Your shadow remembers what you refuse to.",
      premise:
        "Izan wakes without a shadow. An outline wearing his ears opens forbidden gates ahead of him. Each chamber repeats the night he abandoned Morgra to save himself. Escaping means learning to stand beside the part of him that remembers.",
      opening:
        "Under the street lamp, every fence post throws a long shadow. Izan throws none. Across the wall, a rabbit-shaped stain turns its head before he does. Then it opens a gate he remembers locking.",
      chapters: [
        {
          title: "I · The other side of the wall",
          text: "Reflections lag behind the world. Izan’s shadow is always one door ahead. The rooms repeat familiar paths, but he cannot remember where they lead—or whose hand he let go.",
        },
        {
          title: "II · A route taken twice",
          text: "Each echoed flight holds a fragment of the escape. Izan crossed the bridge. Morgra stayed to hold it steady. The shadow does not accuse him; it simply refuses to erase the second half of the story.",
        },
        {
          title: "III · Stand beside me",
          text: "At the tower, the route forks exactly as it did that night. One path leads out. The other reaches a switch that cannot be held by one body. Izan must use what he has remembered to make a different choice.",
        },
      ],
      ending:
        "The echo waits at the switch while Izan reaches back across the gap. Morgra takes his hand. In the first pale light, his shadow returns: neither forgiven nor condemned, only his again. They leave by the same door.",
      mechanic:
        "Flight echo · Replay your last safe flight as a shadow that holds marked switches while Izan takes another route.",
      tradeoff:
        "Distinctive spatial puzzles with a story built into the action. One recorded flight keeps the system legible; switch timing and resets require careful teaching.",
      stages: [
        "No shadow follows Izan beneath the lamp. Another rabbit is already on the wall.",
        "The silhouette pauses where he pauses, then takes one extra step.",
        "A red seal breaks when the echo touches it. Izan remembers a key turning.",
        "Two names are carved beneath the bridge. One has been scratched away.",
        "The platform moves as if someone unseen is still working its rope.",
        "The echo holds the switch. For the first time, Izan sees who held it before.",
        "The reflection on the far side of the portal looks back without him.",
        "Behind the crates is a coat caught in the hinge. He remembers letting go.",
        "A familiar escape route waits. This time the second landing is still occupied.",
        "The last door opens only while someone stays behind. Izan has learned to return.",
      ],
    },
    bell: {
      title: "The Thirteenth Bell",
      subtitle: "Admit two. Leave alone.",
      premise:
        "A wandering carnival promises one more evening with the dead. At midnight, thirteen bells turn unpaid promises into pumpkin hunters. Izan carries a ticket marked “Admit two.” Morgra keeps the carnival moving so its debt never returns to the town that made the first bargain.",
      opening:
        "A paper ticket appears in Izan’s empty hand. Inside the gate, two seats wait beneath a painted moon. One is warm. From under the floorboards, the first bell rings.",
      chapters: [
        {
          title: "I · The welcoming procession",
          text: "The rides know his sister’s favourite songs. The attendant remembers a joke she never told anyone else. Every attraction asks for another promise, and the exits lead back to the same empty chair.",
        },
        {
          title: "II · Under the painted smiles",
          text: "Beneath the tents, the machinery is built from surrendered keepsakes. Names are punched into brass wheels. Morgra is collecting the debt of a town that paid for one more night and never allowed it to end.",
        },
        {
          title: "III · Let the evening end",
          text: "The thirteenth bell hangs over a seat made for Izan. His sister’s voice offers to stay if he takes Morgra’s place. Stopping the bell means accepting the farewell he came here to avoid.",
        },
      ],
      ending:
        "For one quiet minute, the machinery stops. “I am glad you came,” his sister says. “You can go now.” Izan tears the second half of the ticket. Morgra opens the gate, and the carnival folds into the morning mist.",
      mechanic:
        "Bell phase · Read the visible two-phase cycle, then launch as selected platforms and hunters change state.",
      tradeoff:
        "Strong theatrical identity. The cycle needs visual cues and a planning-friendly option so timing supports the puzzle instead of replacing it.",
      stages: [
        "A ticket appears: ADMIT TWO. An empty seat is already reserved.",
        "The attendant takes no money. “A promise is quite enough.”",
        "The third bell changes every carved smile. The masks turn toward him.",
        "A trampoline plays the rhythm of his sister’s favourite song.",
        "The lift rises on a counterweight made from unopened letters.",
        "Under the stage, the phase wheel carries hundreds of scratched-out names.",
        "The mirror entrance shows two rabbits. The exit releases only one.",
        "A crate splits. Inside are tickets dated across a century of autumns.",
        "The last ride aims at the belfry. Its sign reads: NO RETURNS.",
        "Morgra offers him the ringmaster’s coat. A familiar voice asks him to put it down.",
      ],
    },
  };
  root.HNStories = stories;
  if (typeof module !== "undefined") module.exports = stories;
})(typeof window !== "undefined" ? window : globalThis);
