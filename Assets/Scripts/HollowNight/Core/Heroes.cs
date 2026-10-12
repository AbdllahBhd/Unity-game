using UnityEngine;

namespace HollowNight
{
    /// <summary>Izan is the only playable hero. The other values are kept so Hero.cs keeps compiling;
    /// they are not in the roster.</summary>
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
    }

    public static class Heroes
    {
        public const float Radius = 0.45f;
        public const float GravityScale = 1.5f;

        static readonly HeroDef[] all =
        {
            new HeroDef
            {
                type = HeroType.Izan, name = "Izan", sprite = "izan", title = "The Black Rabbit",
                ability = "Spirit Dash", abilityHint = "Tap while flying to DASH forward and smash the pumpkins.",
                maxSpeed = 16f, height = 1.35f, color = new Color(0.8f, 0.85f, 1f)
            }
        };

        public static int Count { get { return all.Length; } }

        public static HeroDef Get(HeroType type)
        {
            // Only Izan is in the roster; any other enum value falls back to him.
            int index = (int)type;
            return index >= 0 && index < all.Length ? all[index] : all[0];
        }
    }
}
