using System.Collections.Generic;

namespace HollowNight
{
    /// <summary>One line of dialogue.</summary>
    public class Line
    {
        public string who;      // speaker name shown in the name plate ("" = narrator)
        public string portrait; // sprite name, null for narration
        public string text;
        public bool right;      // portrait side

        public Line(string who, string portrait, string text, bool right = false)
        {
            this.who = who;
            this.portrait = portrait;
            this.text = text;
            this.right = right;
        }
    }

    public class Dialogue
    {
        public string title;
        public string backdrop;
        public Line[] lines;
    }

    /// <summary>
    /// The whole script of "Hollow Night: Izan and the Moon Lantern".
    /// Scene ids: prologue, pre_N (before level N), post_N (after level N).
    /// </summary>
    public static class Story
    {
        public static readonly string[] ChapterNames =
        {
            "Chapter 1  -  The Whispering Graveyard",
            "Chapter 2  -  The Webwood",
            "Chapter 3  -  Morgra's Tower"
        };

        public static readonly string[] ChapterBackdrops = { "bg_graveyard", "bg_forest", "bg_tower" };

        static Dictionary<string, Dialogue> scenes;

        public static IEnumerable<string> AllIds
        {
            get
            {
                Build();
                return scenes.Keys;
            }
        }

        public static bool Has(string id)
        {
            Build();
            return id != null && scenes.ContainsKey(id);
        }

        public static Dialogue Get(string id)
        {
            Build();
            Dialogue scene;
            return scenes.TryGetValue(id, out scene) ? scene : null;
        }

        /// <summary>Chapter index (0-2) of a 1-based level.</summary>
        public static int ChapterOf(int level)
        {
            if (level <= 4) return 0;
            if (level <= 7) return 1;
            return 2;
        }

        static Line N(string text) { return new Line("", null, text); }
        static Line Izan(string text, string face = "idle") { return new Line("Izan", "izan_" + face, text); }
        static Line Hoot(string text, string face = "idle") { return new Line("Professor Hoot", "hoot_" + face, text, true); }
        static Line Web(string text, string face = "idle") { return new Line("Webster", "webster_" + face, text, true); }
        static Line Pip(string text, string face = "idle") { return new Line("Pip", "pip_" + face, text, true); }
        static Line Morgra(string text, string face = "idle") { return new Line("Morgra", "morgra_" + face, text, true); }
        static Line Ghost(string text) { return new Line("Villager", "ghost", text, true); }

        static void Add(string id, string title, string backdrop, params Line[] lines)
        {
            scenes[id] = new Dialogue { title = title, backdrop = backdrop, lines = lines };
        }

        static void Build()
        {
            if (scenes != null) return;
            scenes = new Dictionary<string, Dialogue>();

            Add("prologue", "Hollow Night", "bg_graveyard",
                N("Once a year, on Hollow Night, the village of Hollowmere lights the Moon Lantern."),
                N("While its flame burns, every ghost, bat and pumpkin in the valley stays gentle and kind."),
                N("Its keeper is a small blue moon hare with very big ears..."),
                Izan("That's me! One lantern, one flame, one night. Easiest job in Hollowmere.", "happy"),
                Morgra("Easy? Then you won't mind if I BORROW it. Forever!", "cast"),
                N("The witch Morgra snatched the flame, shattered its light into candy embers, and flew to her tower."),
                N("Without the flame, the pumpkins turned sour and the graveyard doors slammed shut."),
                Izan("My ears are tingling. That means adventure... or trouble. Probably both.", "fly"),
                Ghost("Izan! The doors only open for the brave. Leap, little hare. Bring our light home!"));

            Add("pre_1", "Stage 1  -  First Hop", "bg_graveyard",
                Ghost("The first door is just up there. You remember how to leap, don't you?"),
                Izan("Pull back, aim, let go. I was born bouncing!", "happy"),
                Ghost("Gather the candy embers on the way. They are pieces of the flame."));

            Add("pre_2", "Stage 2  -  Candy Steps", "bg_graveyard",
                Izan("The old stair stones. Grandma hare said they go all the way to the moon."),
                Ghost("If a jump falls short, tap while you fly. Your spirit will DASH!"),
                Izan("A mid-air dash? Now you tell me!", "fly"));

            Add("pre_3", "Stage 3  -  Pumpkin Patrol", "bg_graveyard",
                N("Sour pumpkins guard the next door. Morgra's curse has sealed it tight."),
                Izan("They used to tell jokes. Bad jokes, but still.", "hurt"),
                Ghost("Knock the curse out of them! Hit each one hard and the seal will break."),
                new Line("Professor Hoot", "hoot_hurt", "Hoo... hoo-elp! Somebody! I am stuck behind this door!", true));

            Add("post_3", "A New Friend", "bg_graveyard",
                Hoot("Splendid bouncing, young hare! I am Professor Hoot, scholar of moonlight.", "happy"),
                Izan("Morgra stole the flame. I'm going to get it back."),
                Hoot("Then you will need wings over the Great Pit. Fortunately, I happen to own two."),
                N("PROFESSOR HOOT joined the team!  Tap to FLAP twice, hold to GLIDE."),
                Hoot("Use the swap button whenever you are standing still to change hero."));

            Add("pre_4", "Stage 4  -  Owl's Shortcut", "bg_graveyard",
                Izan("That pit has no bottom. I dropped a carrot in it last spring. Still waiting for the sound.", "hurt"),
                Hoot("Observe. Launch, flap, flap, and hold to glide. Science!", "fly"),
                Izan("And the red mushrooms?"),
                Hoot("Bouncy. Extremely bouncy. Also science."));

            Add("pre_5", "Stage 5  -  Bat Alley", "bg_forest",
                N("Beyond the graveyard lies the Webwood, where the trees whisper and the bats never sleep."),
                Hoot("Morgra's bats. Touch one slowly and it bites. Hit one at full speed and it goes POOF."),
                Izan("So... dash into them?", "happy"),
                Hoot("The door here is locked. Find the golden key first."),
                new Line("Webster", "webster_hurt", "H-help... the bats tied me up in my own web. How embarrassing.", true));

            Add("post_5", "Eight Legs, One Friend", "bg_forest",
                Web("You saved me! I'm Webster. I'm shy, I'm sticky, and I owe you eight high-fives.", "happy"),
                Izan("Eight?! We don't have time for eight. Two now, six later.", "happy"),
                Web("Morgra's tower is up the old shaft. Nobody can climb it... nobody with only two feet."),
                N("WEBSTER joined the team!  He sticks to walls and ceilings. Tap to zip up on a web line."));

            Add("pre_6", "Stage 6  -  Sticky Situation", "bg_forest",
                Web("The floors are covered in thorns. So we don't use floors."),
                Izan("We don't use FLOORS?", "fly"),
                Web("Walls are just floors that stood up. Aim me at one and I'll hold on tight."));

            Add("pre_7", "Stage 7  -  The Moving Woods", "bg_forest",
                Hoot("Fascinating. The platforms here drift like sleepy clouds, and the wind has opinions."),
                Web("And those swirly doors? Go in the blue one, pop out the orange one."),
                Izan("Moving floors, pushy wind, magic holes. Got it. Nothing weird at all.", "happy"),
                new Line("Pip", "pip_hurt", "Hey! HEY! Down here! I'm not sour like the others, I promise!", true));

            Add("post_7", "The Brave Pumpkin", "bg_forest",
                Pip("Name's Pip! Morgra tried to curse me but I was asleep, so it bounced right off.", "happy"),
                Izan("You're... a pumpkin who wants to fight the pumpkin witch?"),
                Pip("She turned my cousins sour. I'm small, but I am HEAVY. Watch what I do to a cracked floor!"),
                N("PIP joined the team!  Tap while flying to SMASH straight down through cracked blocks."));

            Add("pre_8", "Stage 8  -  Crumbling Cellar", "bg_tower",
                N("At last: Morgra's tower. The front gate is sealed, but the roof has seen better days."),
                Pip("The door is at the BOTTOM? Oh, this is my favourite kind of problem.", "happy"),
                Hoot("Cracked blocks will shatter under you. The solid ones will not. Choose wisely."),
                Pip("Geronimoooo!", "fly"));

            Add("pre_9", "Stage 9  -  Cauldron Cannons", "bg_tower",
                Morgra("Still hopping, little hare? My cauldrons will spit you back to your burrow!"),
                Izan("Did she say the cauldrons are cannons?", "fly"),
                Web("Jump in one and hold on to your ears. The ghostly platforms blink, so time your landing."),
                Hoot("Every one of us may be needed here. Swap heroes whenever you land."));

            Add("pre_10", "Stage 10  -  Morgra's Roost", "bg_tower",
                Morgra("You made it. How annoying. The flame is MINE, and so is the night!", "cast"),
                Izan("The flame belongs to everyone, Morgra. That's the whole point of it."),
                Morgra("Then come and take it, carrot-breath!"),
                Hoot("She flies high. Use the mushrooms, strike her three times, and dodge her pumpkin bombs!"),
                Pip("For my cousins!", "happy"));

            Add("post_10", "The Light Returns", "bg_graveyard",
                N("With a final bonk, Morgra tumbled off her broom, and the flame floated free."),
                Morgra("I only wanted the night to last a bit longer... It gets so quiet in that tower.", "hurt"),
                Izan("You could have just asked. There's room at the lantern for one more."),
                N("Izan carried the flame home. One by one, the pumpkins of Hollowmere began to smile again."),
                Hoot("A most successful expedition. I shall write a very long book about it.", "happy"),
                Web("Six high-fives, Izan. You still owe me six.", "happy"),
                Pip("And next year, I'M lighting the lantern!", "happy"),
                N("But far away, beyond the Webwood, something else began to glow..."),
                N("THE END  -  for now.  Thank you for playing!"));
        }
    }
}
