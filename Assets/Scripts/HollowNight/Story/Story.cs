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
    /// The whole script of "Hollow Night: Izan and the Pumpkin Hunt".
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
                N("While its flame burns, the pumpkins of the valley sleep, and nothing in the dark wakes up."),
                N("Its keeper is a small black rabbit with very big ears and very big eyes..."),
                Izan("That's me. One lantern, one flame, one night. Nothing ever happens.", "idle"),
                Morgra("Nothing? Let's fix that. The flame is MINE now, rabbit.", "cast"),
                N("Morgra, the Pumpkin Queen, snatched the flame and flew to her tower."),
                N("All over the valley the pumpkins opened their eyes. They glowed. They were hungry."),
                N("And the only thing moving in the graveyard was one small rabbit."),
                Izan("They're coming for me. Rabbits don't run from pumpkins... Rabbits LEAP.", "fly"),
                Ghost("Little one! Every door is sealed by the pumpkins that hunt around it."),
                Ghost("Hit them hard and they break. Touch them slowly and they bite. Now go!"));

            Add("pre_1", "Stage 1  -  First Hop", "bg_graveyard",
                Ghost("The first door is just up there, and a pumpkin is drifting in your way."),
                Izan("Pull back, aim, let go. And hit it FAST.", "idle"),
                Ghost("Fast is right. A slow touch is how rabbits get eaten."));

            Add("pre_2", "Stage 2  -  Graveyard Steps", "bg_graveyard",
                Izan("The old stair stones. There are more of them tonight. More pumpkins, too.", "hurt"),
                Ghost("If a jump falls short, tap while you fly. Your spirit will DASH."),
                Ghost("A dashing rabbit smashes anything it hits."),
                Izan("A mid-air dash. Now you tell me.", "fly"));

            Add("pre_3", "Stage 3  -  Pumpkin Patrol", "bg_graveyard",
                N("The pumpkins have learned. Now they wait in groups."),
                Izan("They used to tell jokes. Bad jokes. I miss the bad jokes.", "hurt"),
                Ghost("Four of them guard this door. Break every one, and don't stand still for long."));

            Add("post_3", "Out of the Graveyard", "bg_graveyard",
                N("The last pumpkin shattered, and the graveyard gate groaned open."),
                Izan("Three doors. I'm still in one piece. Mostly.", "happy"),
                Ghost("The Webwood is next. The trees whisper there, and the pumpkins glow brighter."),
                Izan("Good. Bright things are easier to hit.", "idle"));

            Add("pre_4", "Stage 4  -  The Great Pit", "bg_graveyard",
                Izan("That pit has no bottom. I dropped a carrot in it last spring. Still waiting for the sound.", "hurt"),
                Ghost("The red mushrooms will bounce you across. Dash when you are up high."),
                Izan("Bouncy mushrooms, hungry pumpkins, bottomless pit. Lovely night.", "fly"));

            Add("pre_5", "Stage 5  -  Bat Alley", "bg_forest",
                N("Beyond the graveyard lies the Webwood, where the bats never sleep."),
                Ghost("Morgra's bats bite slow rabbits too. Dash through them."),
                Ghost("The door here is locked. Find the golden key, then clear the pumpkins."),
                Izan("Key, pumpkins, bats. One leap at a time.", "idle"));

            Add("post_5", "Whispers in the Wood", "bg_forest",
                N("Deep in the Webwood, the glow of the pumpkins lit the branches like lanterns."),
                Morgra("Still hopping, rabbit? My children can smell you from the tower.", "idle"),
                Izan("Then they know I'm coming.", "fly"));

            Add("pre_6", "Stage 6  -  Thorn Climb", "bg_forest",
                Ghost("Thorns cover half of every ledge. Land on the clear side."),
                Izan("And the pumpkins float right above the clear side. Of course they do.", "hurt"),
                Ghost("Then leap before they reach you. Rest short, leap far."));

            Add("pre_7", "Stage 7  -  The Moving Woods", "bg_forest",
                Ghost("The platforms here drift like sleepy clouds, and the wind has opinions."),
                Ghost("The swirly doors: go in the blue one, pop out of the orange one."),
                Izan("Moving floors, pushy wind, magic holes, hungry pumpkins. Nothing weird at all.", "happy"));

            Add("post_7", "The Tower", "bg_tower",
                N("At the edge of the Webwood the ground turned to stone, and Morgra's tower rose into the night."),
                Morgra("You will not like what waits inside, rabbit.", "cast"),
                Izan("I didn't like what waited outside either. I'm still here.", "idle"));

            Add("pre_8", "Stage 8  -  Crumbling Cellar", "bg_tower",
                N("The front gate is sealed, but the roof has seen better days."),
                Izan("The door is at the BOTTOM? Fine. Down is the one direction I'm good at.", "happy"),
                Ghost("Cracked blocks shatter if you DASH into them. The solid ones will not."));

            Add("pre_9", "Stage 9  -  Cauldron Cannons", "bg_tower",
                Morgra("My cauldrons will spit you back to your burrow, rabbit!"),
                Izan("Did she say the cauldrons are cannons?", "fly"),
                Ghost("Jump in one and hold on to your ears. The ghostly platforms blink, so time your landing."));

            Add("pre_10", "Stage 10  -  Morgra's Roost", "bg_tower",
                Morgra("You made it. How annoying. The flame is MINE, and so is the night!", "cast"),
                Izan("The flame belongs to everyone, Morgra. That's the whole point of it."),
                Morgra("Then come and take it, carrot-breath!"),
                Ghost("She flies high. Use the mushrooms, strike her three times, and dodge her pumpkin bombs!"));

            Add("post_10", "The Light Returns", "bg_graveyard",
                N("With a final bonk, Morgra tumbled off her broom, and the flame floated free."),
                Morgra("I only wanted the night to last a bit longer... It gets so quiet in that tower.", "hurt"),
                Izan("You could have just asked. There's room at the lantern for one more."),
                N("Izan carried the flame home. One by one, the pumpkins of Hollowmere closed their eyes and slept."),
                Izan("One lantern, one flame, one night. And one very tired rabbit.", "happy"),
                N("But far away, beyond the Webwood, something else began to glow..."),
                N("THE END  -  for now.  Thank you for playing!"));
        }
    }
}
