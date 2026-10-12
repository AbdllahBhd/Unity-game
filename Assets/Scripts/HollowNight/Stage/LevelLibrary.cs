using UnityEngine;

namespace HollowNight
{
    /// <summary>
    /// The ten stages. Coordinates are world units: x from -6 to 6, y = 0 is the ground surface.
    /// Tools/check_levels.py reads this file to test that every stage can be finished,
    /// so keep one call per line and use plain numbers.
    /// </summary>
    public static class LevelLibrary
    {
        static LevelData[] levels;

        public static LevelData Get(int id)
        {
            if (levels == null) levels = Build();
            return levels[Mathf.Clamp(id, 1, levels.Length) - 1];
        }

        static LevelData New(int id, string name, HeroType hero, float height, int par)
        {
            return new LevelData
            {
                id = id, name = name, hero = hero, height = height, par = par, chapter = Story.ChapterOf(id)
            };
        }

        static LevelData[] Build()
        {
            return new[]
            {
                Level1(), Level2(), Level3(), Level4(), Level5(), Level6(), Level7(), Level8(), Level9(), Level10()
            };
        }

        // ------------------------------------------------------------ Chapter 1: The Whispering Graveyard
        static LevelData Level1()
        {
            return New(1, "First Hop", HeroType.Izan, 18f, 2)
                .Hint("Drag anywhere, aim, then let go to launch Izan to the door!", true)
                .Ground()
                .Start(-3.5f, 0f)
                .Ledge(3f, 3.5f, 4.5f)
                .Door(4f, 3.5f)
                .Candy(-1.2f, 3.4f)
                .Candy(0.8f, 5f)
                .Candy(2.4f, 5f)
                .Decor("tree_0", 5f, 0f, 6f)
                .Decor("tomb_0", -5.2f, 0f, 1.5f)
                .Decor("tomb_1", 0.5f, 0f, 1.7f)
                .Decor("fence_0", -2f, 0f, 1.2f)
                .Decor("pumpkin_0", 1.4f, 3.5f, 0.8f, true);
        }

        static LevelData Level2()
        {
            return New(2, "Candy Steps", HeroType.Izan, 22f, 3)
                .Hint("Tap while flying to DASH. It gives a jump that falls short a second wind!")
                .Ground()
                .Start(-4f, 0f)
                .Ledge(-1f, 3f, 3f)
                .Ledge(3.5f, 6f, 3.5f)
                .Ledge(-2.5f, 9.5f, 4f)
                .Door(-3.5f, 9.5f)
                .Candy(-1f, 4.6f)
                .Candy(3.5f, 7.8f)
                .Candy(0.8f, 10.2f)
                .Decor("tree_1", -5f, 0f, 7f)
                .Decor("tomb_2", 4.5f, 0f, 1.6f)
                .Decor("candle", 4.6f, 6f, 0.9f, true)
                .Decor("fence_1", 1f, 0f, 1.1f);
        }

        static LevelData Level3()
        {
            return New(3, "Pumpkin Patrol", HeroType.Izan, 20f, 4)
                .Hint("Smash every cursed pumpkin to break the seal on the door. Hit them fast!")
                .SmashAll()
                .Ground()
                .Start(-4.5f, 0f)
                .Ledge(1f, 3f, 4f)
                .Minion(0.2f, 3f)
                .Minion(2f, 3f)
                .Ledge(-3.5f, 6.5f, 3.5f)
                .Minion(-3.5f, 6.5f)
                .Door(4.8f, 0f)
                .Candy(-3.5f, 8.6f)
                .Candy(1f, 5f)
                .Candy(4.6f, 3.4f)
                .Decor("tree_2", -5f, 0f, 5f)
                .Decor("tomb_0", -1.5f, 0f, 1.4f)
                .Decor("hat", 2.6f, 0f, 1f, true);
        }

        static LevelData Level4()
        {
            return New(4, "Owl's Shortcut", HeroType.Hoot, 24f, 3)
                .Hint("Hoot can FLAP twice (tap) and GLIDE (hold). Red mushrooms bounce you high!")
                .Ground(-6f, -2.5f)
                .Ground(1.5f, 6f)
                .Start(-4.5f, 0f)
                .Mushroom(2.2f, 0f)
                .Ledge(4.4f, 6f, 3.2f)
                .Door(4.8f, 6f)
                .Candy(-1f, 5f)
                .Candy(1f, 6.6f)
                .Candy(2.3f, 9f)
                .Decor("tree_0", -5.2f, 0f, 6.5f)
                .Decor("tomb_1", -3f, 0f, 1.6f)
                .Decor("fence_0", 4.6f, 0f, 1.2f)
                .Decor("lolly", 3.2f, 6f, 1.2f, true);
        }

        // ------------------------------------------------------------ Chapter 2: The Webwood
        static LevelData Level5()
        {
            return New(5, "Bat Alley", HeroType.Izan, 26f, 5)
                .Hint("Bats bite! DASH into them to knock them out. The door needs the golden key.")
                .Ground()
                .Start(-4.5f, 0f)
                .Ledge(-3.5f, 4f, 3.5f)
                .Ledge(2.5f, 7.5f, 3.5f)
                .Ledge(-3f, 11.5f, 3.5f)
                .Ledge(3.5f, 15f, 4f)
                .Door(4.2f, 15f)
                .Key(-4.6f, 13.4f)
                .Bat(-1.5f, 6.2f, 3f, 0f, 3f)
                .Bat(2.5f, 11f, -3.5f, 0f, 3.5f)
                .Bat(0.2f, 14.5f, 0f, 3f, 2.6f)
                .Candy(2.5f, 9.2f)
                .Candy(-0.4f, 9.6f)
                .Candy(1f, 17f)
                .Decor("tree_1", 5f, 0f, 8f)
                .Decor("hangbat", -5f, 9.2f, 1.2f)
                .Decor("pumpkin_1", -5f, 0f, 1f, true);
        }

        static LevelData Level6()
        {
            return New(6, "Sticky Situation", HeroType.Webster, 28f, 5)
                .Hint("The floors are thorny! Webster STICKS to walls and ceilings. Tap to zip straight up.")
                .Ground()
                .Start(0f, 0f)
                .Ledge(-3.5f, 5f, 5f)
                .Spikes(-3.5f, 5f, 4.6f)
                .Ledge(3.5f, 10f, 5f)
                .Spikes(3.5f, 10f, 4.6f)
                .Ledge(-3.5f, 15f, 5f)
                .Spikes(-3.5f, 15f, 4.6f)
                .Web(1.5f, 13f, 2.2f)
                .Ledge(2.5f, 20f, 4.5f)
                .Door(3.2f, 20f)
                .Candy(2f, 4f)
                .Candy(-2f, 9f)
                .Candy(1.5f, 16.5f)
                .Decor("tree_2", 4.8f, 0f, 5f)
                .Decor("hangbat", 1f, 8.5f, 1.1f)
                .Decor("tomb_2", -4.5f, 0f, 1.5f);
        }

        static LevelData Level7()
        {
            return New(7, "The Moving Woods", HeroType.Izan, 28f, 4)
                .Hint("Ride the drifting platforms. Wind lifts you, and the blue portal leads to the orange one.")
                .Ground(-6f, -2.5f)
                .Start(-4.5f, 0f)
                .Mover(-0.5f, 2.7f, 2.6f, 3.5f, 0f, 5f)
                .Ledge(4.6f, 6f, 2.8f)
                .Portal(5f, 7.4f, -4.5f, 19.5f)
                .Wind(-4.3f, 10f, 3.2f, 9f, 0f, 24f)
                .Ledge(-4f, 16.5f, 3.5f)
                .Mover(0.5f, 16.5f, 2.6f, 0f, 4f, 5f)
                .Ledge(4.2f, 21.5f, 3.5f)
                .Door(4.6f, 21.5f)
                .Candy(1.2f, 4.6f)
                .Candy(-4.3f, 11f)
                .Candy(0.5f, 22.6f)
                .Decor("tree_0", -5.2f, 0f, 6f)
                .Decor("candle", -5.2f, 16.5f, 0.9f, true)
                .Decor("pumpkin_0", 3.4f, 21.5f, 0.8f, true);
        }

        // ------------------------------------------------------------ Chapter 3: Morgra's Tower
        static LevelData Level8()
        {
            return New(8, "Crumbling Cellar", HeroType.Pip, 25f, 4)
                .Hint("The door is at the BOTTOM. Tap in the air to SMASH through the cracked blocks!")
                .Ground()
                .Ledge(-4f, 20f, 4f)
                .Start(-4f, 20f)
                .Ledge(-3.5f, 15f, 6f)
                .CrateRow(0f, 2f, 14.5f)
                .Ledge(4.5f, 15f, 4f)
                .Ledge(-5.5f, 10f, 2f)
                .CrateRow(-4f, -2f, 9.5f)
                .Ledge(2.5f, 10f, 8f)
                .Minion(2f, 10f)
                .Minion(4f, 10f)
                .Ledge(-2.5f, 5f, 8f)
                .CrateRow(2f, 4f, 4.5f)
                .Ledge(5.5f, 5f, 2f)
                .Door(3f, 0f)
                .Candy(1f, 12.5f)
                .Candy(-3f, 7.5f)
                .Candy(3f, 3.2f)
                .Decor("candle", -5.3f, 15f, 0.9f, true)
                .Decor("cauldron_candy", -4.6f, 0f, 1.3f, true)
                .Decor("hat", -1f, 5f, 0.9f, true);
        }

        static LevelData Level9()
        {
            return New(9, "Cauldron Cannons", HeroType.Izan, 32f, 4)
                .Hint("Jump into a cauldron to be fired! Ghostly platforms blink: land while they are solid.")
                .Ground()
                .Start(-4.5f, 0f)
                .Cauldron(4.5f, 0f, -4.5f, 19f)
                .Ledge(-4f, 10f, 3.5f)
                .Ghost(0.5f, 8f, 3f, 5f, 0f)
                .Cauldron(-5f, 10f, 6.5f, 17f)
                .Ledge(4f, 17.5f, 3.5f)
                .Bat(-1f, 15f, 3f, 0f, 3f)
                .Ghost(0f, 21f, 3f, 5f, 0.5f)
                .Ledge(-3.5f, 24.5f, 4f)
                .Door(-4.2f, 24.5f)
                .Bat(1.5f, 25f, 0f, 2.5f, 2.8f)
                .Candy(0.5f, 9.6f)
                .Candy(1f, 19f)
                .Candy(0f, 22.6f)
                .Decor("candle", 5.2f, 17.5f, 0.9f, true)
                .Decor("pumpkin_1", -5.2f, 0f, 1f, true)
                .Decor("hangbat", 3f, 16.4f, 1.1f);
        }

        static LevelData Level10()
        {
            return New(10, "Morgra's Roost", HeroType.Izan, 24f, 6)
                .Hint("Hit Morgra three times! Dodge her pumpkin bombs, or DASH through them.")
                .Ground()
                .Start(0f, 0f)
                .Ledge(-4.2f, 4f, 3f)
                .Ledge(4.2f, 4f, 3f)
                .Mushroom(-5.2f, 0f)
                .Mushroom(5.2f, 0f)
                .Ledge(0f, 7.5f, 3f)
                .Boss(0f, 10.5f)
                .Candy(-4.2f, 6.5f)
                .Candy(4.2f, 6.5f)
                .Candy(0f, 13f)
                .Decor("cauldron", -2.5f, 0f, 1.3f)
                .Decor("cauldron_candy", 2.5f, 0f, 1.3f)
                .Decor("candle", -1.1f, 7.5f, 0.9f, true)
                .Decor("candle", 1.1f, 7.5f, 0.9f, true);
        }
    }
}
