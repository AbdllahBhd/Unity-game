using System.Collections.Generic;
using HollowNight.Logic;
using UnityEngine;

namespace HollowNight
{
    /// <summary>Turns a <see cref="LevelData"/> description into GameObjects.</summary>
    public class LevelBuilder
    {
        static readonly string[] PlatformSprites = { "plat_grave", "plat_wood", "plat_tower" };

        readonly LevelData level;
        readonly Transform root;
        readonly bool hasKey;
        public Door Door { get; private set; }
        public WitchBoss Boss { get; private set; }
        /// <summary>Everything breakable that counts as a star: pots, sleepers and rolling jars.</summary>
        public int Hunters { get; private set; }
        public int Teryels { get; private set; }

        public LevelBuilder(LevelData data, Transform parent)
        {
            level = data;
            root = parent;
            hasKey = data.Count(Kind.Key) > 0;
        }

        public void Build()
        {
            BuildBounds();
            List<Elem> elems = level.elems;
            for (int i = 0; i < elems.Count; i++) Build(elems[i]);
        }

        void BuildBounds()
        {
            float top = level.height + 6f;
            float mid = (top - 6f) * 0.5f;
            Wall("WallLeft", new Vector2(-LevelData.HalfWidth - 0.5f, mid), new Vector2(1f, top + 12f));
            Wall("WallRight", new Vector2(LevelData.HalfWidth + 0.5f, mid), new Vector2(1f, top + 12f));
            Wall("Ceiling", new Vector2(0f, top + 0.5f), new Vector2(LevelData.HalfWidth * 2f + 2f, 1f));
        }

        void Wall(string name, Vector2 position, Vector2 size)
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(root, false);
            go.transform.position = position;
            BoxCollider2D box = go.AddComponent<BoxCollider2D>();
            box.size = size;
            Solid solid = go.AddComponent<Solid>();
            solid.stable = false;
        }

        void Build(Elem e)
        {
            switch (e.kind)
            {
                case Kind.Platform: Platform(e); break;
                case Kind.Door: MakeDoor(e); break;
                case Kind.Key: Key(e); break;
                case Kind.Pot: Pot(e, e.f, e.g); break;
                case Kind.Sleeper: Pot(e, 0f, 0f); break;
                case Kind.Jar: MakeJar(e, false); break;
                case Kind.TrapJar: MakeJar(e, true); break;
                case Kind.Teryel: MakeTeryel(e); break;
                case Kind.Spikes: Spikes(e); break;
                case Kind.Mushroom: Mushroom(e); break;
                case Kind.Mover: Mover(e); break;
                case Kind.Wind: Wind(e); break;
                case Kind.Portal: Portal(e); break;
                case Kind.Bat: Bat(e); break;
                case Kind.Cauldron: Cauldron(e); break;
                case Kind.Crate: Crate(e); break;
                case Kind.Ghost: Ghost(e); break;
                case Kind.Web: Web(e); break;
                case Kind.Decor: Decor(e); break;
                case Kind.Boss: MakeBoss(e); break;
            }
        }

        static BoxCollider2D Box(GameObject go, Vector2 size, bool trigger)
        {
            BoxCollider2D box = go.AddComponent<BoxCollider2D>();
            box.size = size;
            box.isTrigger = trigger;
            return box;
        }

        static CircleCollider2D Circle(GameObject go, float radius, bool trigger)
        {
            CircleCollider2D circle = go.AddComponent<CircleCollider2D>();
            circle.radius = radius;
            circle.isTrigger = trigger;
            return circle;
        }

        static Rigidbody2D Kinematic(GameObject go)
        {
            Rigidbody2D body = go.AddComponent<Rigidbody2D>();
            body.bodyType = RigidbodyType2D.Kinematic;
            body.interpolation = RigidbodyInterpolation2D.Interpolate;
            return body;
        }

        /// <summary>Adds a collider in world units to an object whose transform is scaled to fit its sprite.</summary>
        static Vector2 Unscale(Transform t, Vector2 worldSize)
        {
            Vector3 s = t.lossyScale;
            return new Vector2(worldSize.x / Mathf.Max(0.0001f, Mathf.Abs(s.x)), worldSize.y / Mathf.Max(0.0001f, Mathf.Abs(s.y)));
        }

        GameObject Holder(string name, Vector2 position)
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(root, false);
            go.transform.position = position;
            return go;
        }

        // ------------------------------------------------------------------ elements
        void Platform(Elem e)
        {
            string sprite = PlatformSprites[Mathf.Clamp(level.chapter, 0, PlatformSprites.Length - 1)];
            SpriteRenderer renderer = Art.MakeSliced(sprite, root, e.pos, e.size, Layer.Platform, "Platform");
            Box(renderer.gameObject, e.size - new Vector2(0.06f, 0.08f), false);
            renderer.gameObject.AddComponent<Solid>();
        }

        void MakeDoor(Elem e)
        {
            const float height = 2.4f;
            GameObject go = Holder("Door", e.pos + Vector2.up * (height * 0.5f));
            SpriteRenderer glow = Art.Make("glow", go.transform, Vector3.zero, 4.5f, Layer.Item - 2, "Glow");
            glow.color = new Color(1f, 0.85f, 0.4f, 0.5f);
            glow.gameObject.AddComponent<Pulse>().amount = 0.1f;
            SpriteRenderer renderer = Art.Make("door_closed", go.transform, Vector3.zero, height, Layer.Item - 1, "Sprite");
            Box(go, new Vector2(1.1f, 1.9f), true).offset = new Vector2(0f, -0.2f);
            Door = go.AddComponent<Door>();
            bool open = Rules.DoorOpen(level.door, level.Count(Kind.Teryel));
            Door.Setup(renderer, glow, !hasKey && open, hasKey);
        }

        void Key(Elem e)
        {
            GameObject go = Holder("Key", e.pos);
            SpriteRenderer renderer = Art.Make("key", go.transform, Vector3.zero, 1.1f, Layer.Item, "Sprite");
            renderer.gameObject.AddComponent<Pulse>().amount = 0.08f;
            Circle(go, 0.55f, true);
            go.AddComponent<Bob>();
            go.AddComponent<KeyItem>();
        }

        void Pot(Elem e, float range, float speed)
        {
            const float height = 1.1f;
            GameObject go = Holder(range > 0f ? "Pot" : "Sleeper", e.pos);
            SpriteRenderer glow = Art.Make("glow", go.transform, Vector3.zero, 2.6f, Layer.Enemy - 1, "Glow");
            glow.color = new Color(1f, 0.7f, 0.35f, 0.45f);
            glow.gameObject.AddComponent<Pulse>().amount = 0.2f;
            SpriteRenderer renderer = Art.Make("hunter_0", go.transform, Vector3.zero, height, Layer.Enemy, "Sprite");
            renderer.color = new Color(0.95f, 0.7f, 0.5f);
            if (range > 0f)
            {
                FrameLoop loop = renderer.gameObject.AddComponent<FrameLoop>();
                loop.frames = new[] { Art.Get("hunter_0"), Art.Get("hunter_1") };
                loop.fps = 4f;
                Bob bob = renderer.gameObject.AddComponent<Bob>();
                bob.amplitude = new Vector2(0.05f, 0.12f);
                bob.phase = Hunters * 1.7f;
            }
            Circle(go, height * 0.44f, true);
            // Full kinematic contacts so the trigger also fires against the resting (kinematic) hero.
            Kinematic(go).useFullKinematicContacts = true;
            go.AddComponent<Hunter>().Setup(e.pos, range, speed, renderer);
            Hunters++;
        }

        void MakeJar(Elem e, bool trap)
        {
            float size = Jar.Radius * 2f * (trap ? 1.15f : 1f);
            GameObject go = Holder(trap ? "TrapJar" : "Jar", e.pos);
            SpriteRenderer renderer = Art.Make("pumpkin_0", go.transform, Vector3.zero, size, Layer.Enemy, "Sprite");
            renderer.color = trap ? new Color(0.75f, 0.5f, 0.35f) : new Color(0.85f, 0.6f, 0.4f);
            CircleCollider2D circle = Circle(go, Jar.Radius, false);
            PhysicsMaterial2D slick = new PhysicsMaterial2D("Jar") { friction = 0f, bounciness = 0f };
            circle.sharedMaterial = slick;
            Rigidbody2D body = go.AddComponent<Rigidbody2D>();
            body.gravityScale = 1.5f;
            body.mass = 2f;
            // The prototype's rolling drag (exp(-0.45 t)); rotation is frozen, so the roll is only drawn.
            body.linearDamping = 0.45f;
            body.freezeRotation = true;
            body.interpolation = RigidbodyInterpolation2D.Interpolate;
            body.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            go.AddComponent<Jar>().Setup(e.pos, trap, renderer);
            if (!trap) Hunters++;
        }

        void MakeTeryel(Elem e)
        {
            float r = e.f;
            GameObject go = Holder("Teryel", e.pos);
            SpriteRenderer glow = Art.Make("glow", go.transform, Vector3.zero, r * 4f, Layer.Enemy - 1, "Glow");
            glow.color = new Color(0.6f, 0.3f, 0.8f, 0.35f);
            SpriteRenderer renderer = Art.Make("morgra_idle", go.transform, Vector3.zero, r * 2.2f, Layer.Enemy, "Sprite");
            Circle(go, r, true);
            Kinematic(go).useFullKinematicContacts = true;
            go.AddComponent<Teryel>().Setup(e.pos, r, e.b, e.g, renderer);
            Teryels++;
        }

        void Spikes(Elem e)
        {
            GameObject go = Holder("Spikes", e.pos + Vector2.up * 0.25f);
            const float unit = 1f;
            int count = Mathf.Max(1, Mathf.RoundToInt(e.size.x / unit));
            float width = e.size.x / count;
            for (int i = 0; i < count; i++)
            {
                float x = -e.size.x * 0.5f + width * (i + 0.5f);
                SpriteRenderer renderer = Art.Make("spikes", go.transform, new Vector3(x, 0f, 0f), 0.5f, Layer.Item - 1, "Sprite");
                Vector3 scale = renderer.transform.localScale;
                float spriteWidth = renderer.sprite.bounds.size.x * scale.x;
                scale.x *= width / Mathf.Max(0.001f, spriteWidth);
                renderer.transform.localScale = scale;
            }
            Box(go, new Vector2(e.size.x - 0.25f, 0.34f), true).offset = new Vector2(0f, -0.06f);
            go.AddComponent<Spikes>();
        }

        void Mushroom(Elem e)
        {
            const float height = 1.1f;
            GameObject go = Holder("Mushroom", e.pos + Vector2.up * (height * 0.5f));
            SpriteRenderer renderer = Art.Make("mushroom_0", go.transform, Vector3.zero, height, Layer.Item, "Sprite");
            Box(go, new Vector2(1.2f, 0.5f), false).offset = new Vector2(0f, 0.2f);
            Box(go, new Vector2(0.4f, 0.6f), false).offset = new Vector2(0f, -0.25f);
            Solid solid = go.AddComponent<Solid>();
            solid.stable = false;
            solid.sticky = false;
            go.AddComponent<Mushroom>().Setup(renderer);
        }

        void Mover(Elem e)
        {
            SpriteRenderer renderer = Art.MakeSliced("plat_mover", root, e.pos, e.size, Layer.Platform, "Mover");
            Box(renderer.gameObject, e.size - new Vector2(0.06f, 0.08f), false);
            Kinematic(renderer.gameObject);
            Solid solid = renderer.gameObject.AddComponent<Solid>();
            solid.stable = false;
            Mover mover = renderer.gameObject.AddComponent<Mover>();
            mover.travel = e.b;
            mover.period = e.f;
        }

        void Wind(Elem e)
        {
            GameObject go = Holder("Wind", e.pos);
            Box(go, e.size, true);
            go.AddComponent<WindZone2D>().acceleration = e.b;

            SpriteRenderer tint = Art.MakeSliced("white", go.transform, Vector3.zero, e.size, Layer.Zone, "Tint");
            tint.color = new Color(0.7f, 0.9f, 1f, 0.07f);

            float angle = Mathf.Atan2(e.b.y, e.b.x) * Mathf.Rad2Deg;
            int count = Mathf.Clamp(Mathf.RoundToInt(e.size.x * e.size.y / 3f), 3, 10);
            bool horizontal = Mathf.Abs(e.b.x) > Mathf.Abs(e.b.y);
            for (int i = 0; i < count; i++)
            {
                float k = (i + 0.5f) / count;
                Vector3 p = horizontal
                    ? new Vector3(0f, Mathf.Lerp(-e.size.y, e.size.y, k) * 0.45f, 0f)
                    : new Vector3(Mathf.Lerp(-e.size.x, e.size.x, k) * 0.45f, 0f, 0f);
                SpriteRenderer streak = Art.Make("wind", go.transform, p, 0.45f, Layer.Zone + 1, "Streak");
                streak.transform.localRotation = Quaternion.Euler(0f, 0f, angle);
                WindStreak motion = streak.gameObject.AddComponent<WindStreak>();
                motion.direction = e.b;
                motion.halfSize = e.size * 0.5f;
                motion.speed = Mathf.Clamp(e.b.magnitude * 0.4f, 2f, 7f);
                motion.phase = i * 0.37f;
            }
        }

        void Portal(Elem e)
        {
            Portal a = MakePortal("portal_a", e.pos, 120f);
            Portal b = MakePortal("portal_b", e.b, -120f);
            a.exit = b;
            b.exit = a;
        }

        Portal MakePortal(string sprite, Vector2 position, float spin)
        {
            GameObject go = Holder("Portal", position);
            SpriteRenderer renderer = Art.Make(sprite, go.transform, Vector3.zero, 1.7f, Layer.Item - 1, "Sprite");
            renderer.gameObject.AddComponent<Spin>().degreesPerSecond = spin;
            Circle(go, 0.6f, true);
            go.AddComponent<Pulse>().amount = 0.05f;
            return go.AddComponent<Portal>();
        }

        void Bat(Elem e)
        {
            GameObject go = Holder("Bat", e.pos);
            SpriteRenderer renderer = Art.Make("bat_0", go.transform, Vector3.zero, 0.95f, Layer.Enemy, "Sprite");
            FrameLoop loop = renderer.gameObject.AddComponent<FrameLoop>();
            loop.frames = new[] { Art.Get("bat_0"), Art.Get("bat_1") };
            loop.fps = 9f;
            Circle(go, 0.42f, true);
            Kinematic(go).interpolation = RigidbodyInterpolation2D.None;
            Bat bat = go.AddComponent<Bat>();
            bat.travel = e.b;
            bat.period = e.f;
        }

        void Cauldron(Elem e)
        {
            const float height = 1.4f;
            GameObject go = Holder("Cauldron", e.pos + Vector2.up * (height * 0.5f));
            SpriteRenderer renderer = Art.Make("cauldron", go.transform, Vector3.zero, height, Layer.Item + 1, "Sprite");
            SpriteRenderer glow = Art.Make("glow", go.transform, new Vector3(0f, 0.5f, 0f), 2.4f, Layer.Item - 1, "Glow");
            glow.color = new Color(0.5f, 1f, 0.4f, 0.4f);
            glow.gameObject.AddComponent<Pulse>().amount = 0.12f;

            // Arrow of dots showing where the cannon fires.
            Vector2 direction = e.b.normalized;
            for (int i = 1; i <= 3; i++)
            {
                SpriteRenderer dot = Art.Make("dot", go.transform, (Vector3)(direction * (0.9f + i * 0.45f)) + Vector3.up * 0.4f,
                    0.3f - i * 0.05f, Layer.Item, "Aim");
                dot.color = new Color(0.6f, 1f, 0.4f, 0.8f - i * 0.15f);
            }

            Circle(go, 0.55f, true).offset = new Vector2(0f, 0.35f);
            Cauldron cauldron = go.AddComponent<Cauldron>();
            cauldron.velocity = e.b;
            cauldron.Setup(renderer.transform);
        }

        void Crate(Elem e)
        {
            SpriteRenderer renderer = Art.Make("crate", root, e.pos, e.size.y, Layer.Platform, "Crate");
            Vector3 scale = renderer.transform.localScale;
            float spriteWidth = renderer.sprite.bounds.size.x * scale.x;
            scale.x *= e.size.x / Mathf.Max(0.001f, spriteWidth);
            renderer.transform.localScale = scale;
            Box(renderer.gameObject, Unscale(renderer.transform, e.size - new Vector2(0.02f, 0.02f)), false);
            Solid solid = renderer.gameObject.AddComponent<Solid>();
            solid.stable = false;
            renderer.gameObject.AddComponent<Crate>();
        }

        void Ghost(Elem e)
        {
            SpriteRenderer renderer = Art.MakeSliced("plat_ghost", root, e.pos, e.size, Layer.Platform, "GhostPlatform");
            BoxCollider2D box = Box(renderer.gameObject, e.size - new Vector2(0.06f, 0.08f), false);
            Solid solid = renderer.gameObject.AddComponent<Solid>();
            solid.stable = false;
            GhostPlatform ghost = renderer.gameObject.AddComponent<GhostPlatform>();
            ghost.period = e.f;
            ghost.phase = e.g;
            ghost.Setup(renderer, box);
        }

        void Web(Elem e)
        {
            GameObject go = Holder("Web", e.pos);
            SpriteRenderer renderer = Art.Make("web", go.transform, Vector3.zero, e.f, Layer.Zone + 2, "Sprite");
            renderer.color = new Color(1f, 1f, 1f, 0.85f);
            Circle(go, e.f * 0.36f, true);
            go.AddComponent<WebPatch>();
        }

        void Decor(Elem e)
        {
            bool front = e.g > 0.5f;
            SpriteRenderer renderer = Art.Make(e.s, root, e.pos + Vector2.up * (e.f * 0.5f), e.f,
                front ? Layer.Item - 3 : Layer.DecorBack, "Decor");
            if (!front) renderer.color = new Color(0.62f, 0.6f, 0.78f, 1f);
        }

        void MakeBoss(Elem e)
        {
            GameObject go = Holder("Morgra", e.pos);
            SpriteRenderer glow = Art.Make("glow", go.transform, Vector3.zero, 5f, Layer.Enemy - 1, "Glow");
            glow.color = new Color(0.7f, 0.3f, 1f, 0.35f);
            SpriteRenderer renderer = Art.Make("morgra_idle", go.transform, Vector3.zero, 2.8f, Layer.Enemy, "Sprite");
            Circle(go, 0.95f, true);
            Kinematic(go).interpolation = RigidbodyInterpolation2D.None;
            Boss = go.AddComponent<WitchBoss>();
            Boss.Setup(renderer);
        }
    }
}
