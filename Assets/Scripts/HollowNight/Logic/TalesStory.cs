using System;
using System.Collections.Generic;

namespace HollowNight.Logic
{
    /// <summary>One story screen: a scene to draw and the text ids shown on it, in order.</summary>
    public sealed class Beat
    {
        /// <summary>hearth, home, kitchen, kitchen-sleep, kitchen-trap.</summary>
        public readonly string Scene;
        public readonly string[] Lines;
        /// <summary>An effect as the beat opens: "thud" (a jar falls on Teryel), or "".</summary>
        public readonly string Fx;

        public Beat(string scene, params string[] lines) : this(scene, lines, "") { }

        public Beat(string scene, string[] lines, string fx)
        {
            Scene = scene;
            Lines = lines;
            Fx = fx;
        }
    }

    /// <summary>
    /// The order of the story screens, from Tools/design/original/story.js. Every line is an
    /// id in <see cref="TalesText"/>, so the speaker and text come from there in any language.
    /// Story ids: opening, first_night, night_N (the tale's intro), stage_N (one Jida line and
    /// one child reaction), end_N (the tale's end), closing.
    /// </summary>
    public static class TalesStory
    {
        public const string Opening = "opening";
        public const string FirstNight = "first_night";
        public const string Closing = "closing";
        public const int StagesPerNight = 4;
        /// <summary>Slice 1 holds Night 1 only.</summary>
        public const int Nights = 1;
        public const int Stages = Nights * StagesPerNight;

        static readonly Dictionary<string, Beat[]> scenes = new Dictionary<string, Beat[]>
        {
            { Opening, new[] { new Beat("hearth", "open.1", "open.2", "open.3") } },
            { FirstNight, new[] { new Beat("hearth", "open.4", "open.5", "open.6") } },
            { Closing, new[] { new Beat("home", "close.1", "close.2"), new Beat("hearth", "close.3", "close.4") } },
            {
                "night_1", new[]
                {
                    new Beat("hearth", "t1.intro.1", "t1.intro.2", "t1.intro.3"),
                    new Beat("kitchen", "t1.intro.4", "t1.intro.5", "t1.intro.6")
                }
            },
            { "stage_1", new[] { new Beat("kitchen", "t1.s1", "t1.s1.child") } },
            { "stage_2", new[] { new Beat("kitchen", "t1.s2", "t1.s2.child") } },
            { "stage_3", new[] { new Beat("kitchen", "t1.s3", "t1.s3.child") } },
            { "stage_4", new[] { new Beat("kitchen-sleep", "t1.s4", "t1.s4.child") } },
            {
                "end_1", new[]
                {
                    new Beat("kitchen-trap", new[] { "t1.end.1", "t1.end.2", "t1.end.3" }, "thud"),
                    new Beat("hearth", "t1.end.4", "t1.end.5")
                }
            },
        };

        public static IEnumerable<string> Ids { get { return scenes.Keys; } }

        public static bool Has(string id)
        {
            return id != null && scenes.ContainsKey(id);
        }

        public static Beat[] Get(string id)
        {
            Beat[] beats;
            if (id == null || !scenes.TryGetValue(id, out beats))
                throw new KeyNotFoundException("no story '" + id + "' in TalesStory");
            return beats;
        }

        public static string NightIntro(int night) { return "night_" + night; }
        public static string StageLines(int stage) { return "stage_" + stage; }
        public static string NightEnd(int night) { return "end_" + night; }

        public static int NightOf(int stage)
        {
            return (stage - 1) / StagesPerNight + 1;
        }

        /// <summary>
        /// The stories to play before a stage, as the prototype's openStage: a night not yet told
        /// opens at the hearth (with Mqidec's naming the very first time), then the stage's lines.
        /// </summary>
        public static List<string> BeforeStage(int stage, Func<string, bool> seen)
        {
            List<string> ids = new List<string>();
            int night = NightOf(stage);
            if (!seen(NightIntro(night)))
            {
                ids.Add(Opening);
                if (night == 1 && !seen(FirstNight)) ids.Add(FirstNight);
                ids.Add(NightIntro(night));
            }
            if (!seen(StageLines(stage))) ids.Add(StageLines(stage));
            return ids;
        }

        /// <summary>After the last stage of a night: the tale's end and the closing, once.</summary>
        public static List<string> AfterStage(int stage, Func<string, bool> seen)
        {
            List<string> ids = new List<string>();
            int night = NightOf(stage);
            if (stage % StagesPerNight == 0 && !seen(NightEnd(night)))
            {
                ids.Add(NightEnd(night));
                ids.Add(Closing);
            }
            return ids;
        }
    }
}
