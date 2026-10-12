using System.Collections.Generic;
using UnityEngine;

namespace HollowNight
{
    /// <summary>Sorting orders used by every sprite in the game (single "Default" sorting layer).</summary>
    public static class Layer
    {
        public const int Background = -100;
        public const int DecorBack = -50;
        public const int Zone = -20;
        public const int Platform = 0;
        public const int Item = 10;
        public const int Enemy = 15;
        public const int Hero = 20;
        public const int Fx = 30;
        public const int Trajectory = 40;
    }

    /// <summary>Loads sprites and fonts from Resources/HN and builds sprite GameObjects.</summary>
    public static class Art
    {
        const string Root = "HN/";

        static readonly Dictionary<string, Sprite> sprites = new Dictionary<string, Sprite>();
        static Sprite fallback;
        static Material spriteMaterial;
        static Font titleFont;
        static Font bodyFont;

        public static Sprite Get(string name)
        {
            Sprite sprite;
            if (sprites.TryGetValue(name, out sprite) && sprite != null) return sprite;

            sprite = Resources.Load<Sprite>(Root + name);
            if (sprite == null)
            {
                Debug.LogWarning("[HollowNight] Missing sprite: " + Root + name);
                sprite = Fallback;
            }
            sprites[name] = sprite;
            return sprite;
        }

        static Sprite Fallback
        {
            get
            {
                if (fallback == null)
                {
                    Texture2D tex = Texture2D.whiteTexture;
                    fallback = Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f), tex.width);
                }
                return fallback;
            }
        }

        /// <summary>Unlit sprite material shared by trails and line renderers.</summary>
        public static Material SpriteMaterial
        {
            get
            {
                if (spriteMaterial == null)
                {
                    Shader shader = Shader.Find("Sprites/Default");
                    if (shader != null) spriteMaterial = new Material(shader);
                }
                return spriteMaterial;
            }
        }

        public static Font TitleFont
        {
            get
            {
                if (titleFont == null) titleFont = LoadFont("Creepster");
                return titleFont;
            }
        }

        public static Font BodyFont
        {
            get
            {
                if (bodyFont == null) bodyFont = LoadFont("LuckiestGuy");
                return bodyFont;
            }
        }

        static Font LoadFont(string name)
        {
            Font font = Resources.Load<Font>(Root + "Fonts/" + name);
            if (font == null) font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            return font;
        }

        /// <summary>Creates a sprite object scaled so that it is <paramref name="height"/> world units tall.</summary>
        public static SpriteRenderer Make(string sprite, Transform parent, Vector3 position, float height, int order, string name = null)
        {
            GameObject go = new GameObject(name ?? sprite);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = position;
            SpriteRenderer renderer = go.AddComponent<SpriteRenderer>();
            renderer.sprite = Get(sprite);
            renderer.sortingOrder = order;
            FitHeight(renderer, height);
            return renderer;
        }

        /// <summary>Creates a 9-sliced sprite of an exact world size (platforms, blocks).</summary>
        public static SpriteRenderer MakeSliced(string sprite, Transform parent, Vector3 position, Vector2 size, int order, string name = null)
        {
            GameObject go = new GameObject(name ?? sprite);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = position;
            SpriteRenderer renderer = go.AddComponent<SpriteRenderer>();
            renderer.sprite = Get(sprite);
            renderer.sortingOrder = order;
            renderer.drawMode = SpriteDrawMode.Sliced;
            renderer.size = size;
            return renderer;
        }

        public static void FitHeight(SpriteRenderer renderer, float height)
        {
            if (renderer.sprite == null) return;
            float spriteHeight = renderer.sprite.bounds.size.y;
            if (spriteHeight <= 0.0001f) return;
            float scale = height / spriteHeight;
            renderer.transform.localScale = new Vector3(scale, scale, 1f);
        }

        public static Color Hex(string hex, float alpha = 1f)
        {
            Color color;
            if (!ColorUtility.TryParseHtmlString(hex, out color)) color = Color.white;
            color.a = alpha;
            return color;
        }
    }
}
