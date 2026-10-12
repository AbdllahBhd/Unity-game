using UnityEngine;

namespace HollowNight
{
    public enum HeroType { Izan = 0, Hoot = 1, Webster = 2, Pip = 3 }

    /// <summary>Static description of a playable hero.</summary>
    public class HeroDef
    {
        public HeroType type;
        public string name;
        public string sprite;       // sprite prefix: izan_idle, izan_fly...
        public string title;
        public string ability;
        public string abilityHint;
        public float maxSpeed;      // launch speed at full drag
        public float height;        // visual height in world units
        public Color color;
        public int unlockLevel;     // level that must be completed first (0 = always available)
    }

    public static class Heroes
    {
        public const float Radius = 0.45f;
        public const float GravityScale = 1.5f;

        static readonly HeroDef[] all =
        {
            new HeroDef
            {
                type = HeroType.Izan, name = "Izan", sprite = "izan", title = "The Moon Hare",
                ability = "Spirit Dash", abilityHint = "Tap while flying to DASH forward and smash through things.",
                maxSpeed = 16f, height = 1.35f, color = new Color(0.35f, 0.7f, 1f), unlockLevel = 0
            },
            new HeroDef
            {
                type = HeroType.Hoot, name = "Professor Hoot", sprite = "hoot", title = "The Wise Owl",
                ability = "Flap & Glide", abilityHint = "Tap to FLAP (twice per flight). Hold to GLIDE slowly.",
                maxSpeed = 14f, height = 1.3f, color = new Color(1f, 0.75f, 0.4f), unlockLevel = 3
            },
            new HeroDef
            {
                type = HeroType.Webster, name = "Webster", sprite = "webster", title = "The Shy Spider",
                ability = "Sticky Feet", abilityHint = "Webster STICKS to walls and ceilings. Tap to zip up on a web line.",
                maxSpeed = 15f, height = 1.2f, color = new Color(0.75f, 0.55f, 1f), unlockLevel = 5
            },
            new HeroDef
            {
                type = HeroType.Pip, name = "Pip", sprite = "pip", title = "The Brave Pumpkin",
                ability = "Ground Smash", abilityHint = "Tap while flying to SMASH down and break cracked blocks.",
                maxSpeed = 13.5f, height = 1.25f, color = new Color(1f, 0.6f, 0.2f), unlockLevel = 7
            }
        };

        public static int Count { get { return all.Length; } }

        public static HeroDef Get(HeroType type)
        {
            return all[(int)type];
        }
    }
}
