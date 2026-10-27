using System.Collections.Generic;
using HollowNight.Logic;
using UnityEngine;

namespace HollowNight
{
    /// <summary>Saved player progress (PlayerPrefs). Levels are 1-based.</summary>
    public static class Progress
    {
        public const int LevelCount = TalesStory.Stages;
        // The tales keep their own save keys, apart from the pumpkin game's "hn_" ones, so an old
        // pumpkin save never shows up as tales stars.
        const string Prefix = "tm_";

        public static bool IsDone(int level)
        {
            return PlayerPrefs.GetInt(Prefix + "done_" + level, 0) == 1;
        }

        public static bool IsUnlocked(int level)
        {
            return level <= 1 || IsDone(level - 1);
        }

        public static int Stars(int level)
        {
            return PlayerPrefs.GetInt(Prefix + "stars_" + level, 0);
        }

        /// <summary>Fewest launches used to clear the level, 0 if never cleared (kept for information; there is no par).</summary>
        public static int Best(int level)
        {
            return PlayerPrefs.GetInt(Prefix + "best_" + level, 0);
        }

        /// <summary>The first stage not yet cleared (the last one when all are).</summary>
        public static int CurrentLevel
        {
            get
            {
                for (int i = 1; i <= LevelCount; i++)
                {
                    if (!IsDone(i)) return i;
                }
                return LevelCount;
            }
        }

        public static int TotalStars
        {
            get
            {
                int total = 0;
                for (int i = 1; i <= LevelCount; i++) total += Stars(i);
                return total;
            }
        }

        /// <summary>Stores a level result. Returns true if this is the first time the level was cleared.</summary>
        public static bool Complete(int level, int stars, int launches)
        {
            bool first = !IsDone(level);
            PlayerPrefs.SetInt(Prefix + "done_" + level, 1);
            if (stars > Stars(level)) PlayerPrefs.SetInt(Prefix + "stars_" + level, stars);
            int best = Best(level);
            if (best == 0 || launches < best) PlayerPrefs.SetInt(Prefix + "best_" + level, launches);
            PlayerPrefs.Save();
            return first;
        }

        public static bool Seen(string storyId)
        {
            return PlayerPrefs.GetInt(Prefix + "story_" + storyId, 0) == 1;
        }

        public static void MarkSeen(string storyId)
        {
            PlayerPrefs.SetInt(Prefix + "story_" + storyId, 1);
            PlayerPrefs.Save();
        }

        /// <summary>The language of the tales; the first time, the device's language when the game has it.</summary>
        public static Lang Language
        {
            get
            {
                int saved = PlayerPrefs.GetInt(Prefix + "lang", -1);
                if (saved >= 0 && saved <= (int)Lang.En) return (Lang)saved;
                switch (Application.systemLanguage)
                {
                    case SystemLanguage.French: return Lang.Fr;
                    case SystemLanguage.Arabic: return Lang.Ar;
                    default: return Lang.En;
                }
            }
            set
            {
                PlayerPrefs.SetInt(Prefix + "lang", (int)value);
                PlayerPrefs.Save();
            }
        }

        public static bool SoundOn
        {
            get { return PlayerPrefs.GetInt(Prefix + "sound", 1) == 1; }
            set
            {
                PlayerPrefs.SetInt(Prefix + "sound", value ? 1 : 0);
                PlayerPrefs.Save();
            }
        }

        /// <summary>Every progress key (stages and stories); the language and sound settings are not progress.</summary>
        public static IEnumerable<string> ProgressKeys
        {
            get
            {
                for (int i = 1; i <= LevelCount; i++)
                {
                    yield return Prefix + "done_" + i;
                    yield return Prefix + "stars_" + i;
                    yield return Prefix + "best_" + i;
                }
                foreach (string id in TalesStory.Ids) yield return Prefix + "story_" + id;
            }
        }

        /// <summary>Forgets every stage and story; keeps the language and sound.</summary>
        public static void ResetAll()
        {
            foreach (string key in ProgressKeys) PlayerPrefs.DeleteKey(key);
            PlayerPrefs.Save();
        }
    }
}
