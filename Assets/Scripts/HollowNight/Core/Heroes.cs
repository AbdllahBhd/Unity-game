using HollowNight.Logic;
using UnityEngine;

namespace HollowNight
{
    /// <summary>Mqidec is the only playable hero (named Izan in code). The other values are kept so Hero.cs
    /// keeps compiling; they are not in the roster.</summary>
    public enum HeroType { Izan = 0, Hoot = 1, Webster = 2, Pip = 3 }

    /// <summary>Static description of a playable hero.</summary>
    public class HeroDef
    {
        public HeroType type;
        public string nameId;       // text ids in TalesText
        public string titleId;
        public string hintId;
        public string sprite;       // sprite prefix: izan_idle, izan_fly...
        public float maxSpeed;      // launch speed at full drag
        public float height;        // visual height in world units
        public Color color;

        public string Name { get { return TalesText.Get(nameId, Progress.Language); } }
        public string Title { get { return TalesText.Get(titleId, Progress.Language); } }
        /// <summary>How to use the dash, shown in the stage.</summary>
        public string Hint { get { return TalesText.Get(hintId, Progress.Language); } }
    }

    public static class Heroes
    {
        public const float Radius = 0.45f;
        public const float GravityScale = 1.5f;

        static readonly HeroDef[] all =
        {
            new HeroDef
            {
                type = HeroType.Izan, nameId = "hero.name", titleId = "ui.tagline", hintId = "tip.dash", sprite = "izan",
                maxSpeed = 16f, height = 1.35f, color = new Color(0.8f, 0.85f, 1f)
            }
        };

        public static int Count { get { return all.Length; } }

        public static HeroDef Get(HeroType type)
        {
            // Only Mqidec is in the roster; any other enum value falls back to him.
            int index = (int)type;
            return index >= 0 && index < all.Length ? all[index] : all[0];
        }
    }
}
