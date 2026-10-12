using System.Collections.Generic;
using UnityEngine;

namespace HollowNight
{
    public enum Kind
    {
        Platform, Candy, Door, Key, Minion, Spikes, Mushroom, Mover, Wind, Portal, Bat, Cauldron, Crate, Ghost,
        Web, Decor, Boss
    }

    /// <summary>One object of a level. The meaning of the fields depends on <see cref="kind"/>.</summary>
    public class Elem
    {
        public Kind kind;
        public Vector2 pos;
        public Vector2 size;
        public Vector2 b;      // second point: mover travel, portal exit, wind force, bat travel, cannon velocity
        public float f;        // period, scale...
        public float g;        // phase
        public string s;       // sprite name
    }

    /// <summary>
    /// A level description. World units: x from -6 to 6, y from 0 (ground level) up to <see cref="height"/>.
    /// Levels are written with the fluent methods below, see LevelLibrary.
    /// </summary>
    public class LevelData
    {
        public const float HalfWidth = 6f;

        public int id;
        public string name;
        public int chapter;
        public HeroType hero;
        public float height = 20f;
        public int par = 3;
        public Vector2 start = new Vector2(-3.5f, 0.45f);
        public bool smashAll;      // the door stays sealed until every minion is smashed
        public string hint;
        public bool showFinger;
        public readonly List<Elem> elems = new List<Elem>();

        Elem Add(Kind kind, float x, float y)
        {
            Elem e = new Elem { kind = kind, pos = new Vector2(x, y) };
            elems.Add(e);
            return e;
        }

        public LevelData Start(float x, float y)
        {
            start = new Vector2(x, y + Heroes.Radius);
            return this;
        }

        public LevelData Hint(string text, bool finger = false)
        {
            hint = text;
            showFinger = finger;
            return this;
        }

        public LevelData SmashAll()
        {
            smashAll = true;
            return this;
        }

        /// <summary>Solid block. x, y is the centre.</summary>
        public LevelData Platform(float x, float y, float w, float h = 0.6f)
        {
            Add(Kind.Platform, x, y).size = new Vector2(w, h);
            return this;
        }

        /// <summary>Thin platform whose walking surface is at height top.</summary>
        public LevelData Ledge(float x, float top, float w)
        {
            return Platform(x, top - 0.3f, w, 0.6f);
        }

        /// <summary>Ground strip between x0 and x1 with its surface at y = 0.</summary>
        public LevelData Ground(float x0 = -6f, float x1 = 6f)
        {
            return Platform((x0 + x1) * 0.5f, -0.75f, x1 - x0, 1.5f);
        }

        public LevelData Candy(float x, float y)
        {
            Add(Kind.Candy, x, y);
            return this;
        }

        /// <summary>Exit door standing on a surface at height y.</summary>
        public LevelData Door(float x, float y)
        {
            Add(Kind.Door, x, y);
            return this;
        }

        public LevelData Key(float x, float y)
        {
            Add(Kind.Key, x, y);
            return this;
        }

        /// <summary>Cursed pumpkin standing on a surface at height y.</summary>
        public LevelData Minion(float x, float y)
        {
            Add(Kind.Minion, x, y);
            return this;
        }

        /// <summary>Row of spikes of width w standing on a surface at height y.</summary>
        public LevelData Spikes(float x, float y, float w)
        {
            Add(Kind.Spikes, x, y).size = new Vector2(w, 0.5f);
            return this;
        }

        /// <summary>Bouncy mushroom standing on a surface at height y.</summary>
        public LevelData Mushroom(float x, float y)
        {
            Add(Kind.Mushroom, x, y);
            return this;
        }

        /// <summary>Platform that travels by (dx, dy) and back every period seconds.</summary>
        public LevelData Mover(float x, float y, float w, float dx, float dy, float period = 4f)
        {
            Elem e = Add(Kind.Mover, x, y);
            e.size = new Vector2(w, 0.6f);
            e.b = new Vector2(dx, dy);
            e.f = period;
            return this;
        }

        /// <summary>Area that pushes flying heroes with acceleration (ax, ay).</summary>
        public LevelData Wind(float x, float y, float w, float h, float ax, float ay)
        {
            Elem e = Add(Kind.Wind, x, y);
            e.size = new Vector2(w, h);
            e.b = new Vector2(ax, ay);
            return this;
        }

        /// <summary>Blue entrance at (x, y), orange exit at (x2, y2). Works both ways.</summary>
        public LevelData Portal(float x, float y, float x2, float y2)
        {
            Add(Kind.Portal, x, y).b = new Vector2(x2, y2);
            return this;
        }

        /// <summary>Bat patrolling from (x, y) by (dx, dy) and back.</summary>
        public LevelData Bat(float x, float y, float dx, float dy, float period = 3f)
        {
            Elem e = Add(Kind.Bat, x, y);
            e.b = new Vector2(dx, dy);
            e.f = period;
            return this;
        }

        /// <summary>Cannon standing on a surface at height y that fires the hero with velocity (vx, vy).</summary>
        public LevelData Cauldron(float x, float y, float vx, float vy)
        {
            Add(Kind.Cauldron, x, y).b = new Vector2(vx, vy);
            return this;
        }

        /// <summary>Cracked block that can be smashed.</summary>
        public LevelData Crate(float x, float y, float w = 1f, float h = 1f)
        {
            Add(Kind.Crate, x, y).size = new Vector2(w, h);
            return this;
        }

        /// <summary>Row of cracked blocks from x0 to x1 (centres), one unit each.</summary>
        public LevelData CrateRow(float x0, float x1, float y)
        {
            for (float x = x0; x <= x1 + 0.01f; x += 1f) Crate(x, y);
            return this;
        }

        /// <summary>Platform that is solid for half of each period.</summary>
        public LevelData Ghost(float x, float y, float w, float period = 4f, float phase = 0f)
        {
            Elem e = Add(Kind.Ghost, x, y);
            e.size = new Vector2(w, 0.6f);
            e.f = period;
            e.g = phase;
            return this;
        }

        /// <summary>Sticky web: any hero that touches it hangs there and can launch again.</summary>
        public LevelData Web(float x, float y, float size = 2f)
        {
            Add(Kind.Web, x, y).f = size;
            return this;
        }

        /// <summary>Background decoration standing on a surface at height y.</summary>
        public LevelData Decor(string sprite, float x, float y, float height, bool front = false)
        {
            Elem e = Add(Kind.Decor, x, y);
            e.s = sprite;
            e.f = height;
            e.g = front ? 1f : 0f;
            return this;
        }

        public LevelData Boss(float x, float y)
        {
            Add(Kind.Boss, x, y);
            return this;
        }

        public int Count(Kind kind)
        {
            int count = 0;
            for (int i = 0; i < elems.Count; i++)
            {
                if (elems[i].kind == kind) count++;
            }
            return count;
        }
    }
}
