using System.Collections.Generic;
using HollowNight.Logic;

namespace HollowNight
{
    /// <summary>
    /// What the story screens draw for the tales. The order of the screens and their lines are
    /// in <see cref="TalesStory"/> (Logic); the speakers and texts in <see cref="TalesText"/>.
    /// This class maps them to the placeholder art.
    /// </summary>
    public static class Story
    {
        public static IEnumerable<string> AllIds { get { return TalesStory.Ids; } }

        public static bool Has(string id)
        {
            return TalesStory.Has(id);
        }

        /// <summary>Night index (0 for Night 1) of a 1-based stage.</summary>
        public static int ChapterOf(int level)
        {
            return TalesStory.NightOf(level) - 1;
        }

        /// <summary>The backdrop behind a stage: Night 1 is Teryel's kitchen.</summary>
        public static string StageBackdrop(int level)
        {
            return "bg_kitchen";
        }

        /// <summary>The backdrop of a story beat's scene.</summary>
        public static string Backdrop(string scene)
        {
            switch (scene)
            {
                case "hearth":
                case "home":
                    return "bg_hearth";
                default:
                    return "bg_kitchen";
            }
        }

        /// <summary>Portrait sprite of a speaker (jida, girl, boy, children, teryel); null for narration.</summary>
        public static string Portrait(string who)
        {
            return string.IsNullOrEmpty(who) ? null : "portrait_" + who;
        }

        /// <summary>Jida tells from the left; the children and Teryel answer from the right.</summary>
        public static bool OnRight(string who)
        {
            return who != "jida";
        }

        /// <summary>
        /// The night whose card opens this chain of stories (its intro is in it), or 0 for none. As in
        /// the prototype, the card shows "Night N" and the tale's name over the chain's first beat.
        /// </summary>
        public static int NightCard(IList<string> stories)
        {
            for (int night = 1; night <= TalesStory.Nights; night++)
            {
                if (stories.Contains(TalesStory.NightIntro(night))) return night;
            }
            return 0;
        }
    }
}
