using HollowNight.Logic;
using UnityEngine;

namespace HollowNight
{
    /// <summary>
    /// The stages of the tales: Night 1, Teryel's kitchen, from Tools/design/original/levels.js.
    /// Coordinates are world units: x from -6 to 6, y = 0 is the ground surface; the y of Ledge,
    /// Door, Sleeper, Jar, TrapJar, Teryel and Cauldron is the surface they stand on, a Pot's is
    /// its centre. Tools/check_levels.py reads this file to test that every stage can be finished
    /// with three stars, so keep one call per line and use plain numbers.
    /// </summary>
    public static class LevelLibrary
    {
        public static LevelData Get(int id)
        {
            // Built on each call so the stage name follows the chosen language.
            LevelData[] levels = Build();
            return levels[Mathf.Clamp(id, 1, levels.Length) - 1];
        }

        static LevelData New(int id, float height)
        {
            return new LevelData
            {
                id = id, name = TalesText.Get("stage." + id, Progress.Language), hero = HeroType.Izan, height = height,
                chapter = Story.ChapterOf(id)
            };
        }

        static LevelData[] Build()
        {
            return new[] { Level1(), Level2(), Level3(), Level4() };
        }

        // ------------------------------------------------------------ Night 1: Teryel's kitchen
        // Her pots hunt him.
        static LevelData Level1()
        {
            return New(1, 16f)
                .Hint("tip.launch", true)
                .Ground()
                .Start(-4.5f, 0f)
                .Ledge(3f, 4f, 3.4f)
                .Ledge(-3f, 7.5f, 3.4f)
                .Ledge(2f, 11f, 3.6f)
                .Door(2.6f, 11f)
                .Pot(0f, 2.6f, 3f, 0.9f)
                .Pot(0f, 6.2f, 3f, 0.9f)
                .Pot(-2.6f, 10.4f, 3f, 0.9f);
        }

        // The rolling jar: pushed off its ledge it shatters, and counts as a hunter.
        static LevelData Level2()
        {
            return New(2, 16f)
                .Hint("tip.roll")
                .Ground()
                .Start(-4.6f, 0f)
                .Ledge(-2.8f, 4.2f, 4f)
                .Ledge(3.6f, 9.4f, 3f)
                .Door(3.8f, 9.4f)
                .Jar(-3.2f, 4.2f)
                .Sleeper(1.6f, 0f)
                .Pot(2.8f, 7.4f, 3f, 1f);
        }

        // The hearth cannons and a crumbling ledge.
        static LevelData Level3()
        {
            return New(3, 24f)
                .Hint("tip.cannon")
                .Ground()
                .Start(-4.5f, 0f)
                .Ledge(1.6f, 10f, 3.6f)
                .Ghost(-3.4f, 14.2f, 2.8f, 8f, 0f)
                .Ledge(-3f, 18f, 3.4f)
                .Door(-3.4f, 18f)
                .Pot(-1.2f, 5.6f, 2.5f, 0.8f)
                .Pot(1.2f, 14f, 2.5f, 0.8f)
                .Pot(-1f, 16.6f, 2.5f, 0.8f)
                .Cauldron(-1.2f, 0f, 0.4f, 15f)
                .Cauldron(4.2f, 10f, -6.5f, 13.5f);
        }

        // The great jar traps Teryel; the door opens only then. The jar is not a star.
        static LevelData Level4()
        {
            return New(4, 14f)
                .Rules(DoorMode.Trap)
                .Hint("tip.trap")
                .Ground()
                .Start(-4.6f, 0f)
                .Ledge(-3.6f, 3f, 3f)
                .Ledge(-2.5f, 6.2f, 5f)
                .Door(5f, 0f)
                .TrapJar(-0.7f, 6.2f)
                .Pot(-4.2f, 9.2f, 3f, 0.9f)
                .Pot(1.2f, 9.4f, 3f, 0.9f)
                .Pot(4.2f, 5.4f, 2.6f, 0.8f)
                .Teryel(2.4f, 0f, 1.3f);
        }
    }
}
