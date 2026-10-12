using System.Collections;
using UnityEngine;

namespace HollowNight
{
    /// <summary>Marks a collider the hero can stand on.</summary>
    public class Solid : MonoBehaviour
    {
        public bool stable = true;  // safe respawn point (false for moving or vanishing ground)
        public bool sticky = true;  // Webster can cling to it
    }

    /// <summary>Base class for objects that react when the hero touches their trigger.</summary>
    public abstract class Touchable : MonoBehaviour
    {
        protected abstract void Touch(Hero hero);

        void OnTriggerEnter2D(Collider2D other)
        {
            Hero hero = other.GetComponent<Hero>();
            if (hero != null) Touch(hero);
        }
    }

    public class Candy : Touchable
    {
        bool taken;

        protected override void Touch(Hero hero)
        {
            if (taken || hero.State == HeroState.Dead) return;
            taken = true;
            Fx.Burst(transform.position, "spark", 8, new Color(1f, 0.9f, 0.5f), 4f, 0.5f, 0.35f, 2f);
            Fx.Flash(transform.position, new Color(1f, 0.85f, 0.4f, 0.8f), 2f);
            StageController.I.CandyCollected();
            Destroy(gameObject);
        }
    }

    public class KeyItem : Touchable
    {
        bool taken;

        protected override void Touch(Hero hero)
        {
            if (taken || hero.State == HeroState.Dead) return;
            taken = true;
            Fx.Burst(transform.position, "spark", 10, new Color(1f, 0.85f, 0.3f), 5f, 0.6f, 0.4f, 2f);
            StageController.I.KeyCollected();
            Destroy(gameObject);
        }
    }

    /// <summary>The exit. It can be locked (needs the key) or sealed (needs every minion smashed).</summary>
    public class Door : MonoBehaviour
    {
        SpriteRenderer sprite;
        SpriteRenderer glow;
        bool open;

        public bool IsOpen { get { return open; } }

        public void Setup(SpriteRenderer doorSprite, SpriteRenderer doorGlow, bool startsOpen, bool locked)
        {
            sprite = doorSprite;
            glow = doorGlow;
            open = startsOpen;
            sprite.sprite = Art.Get(open ? "door_open" : (locked ? "door_locked" : "door_closed"));
            if (!open && !locked) sprite.color = new Color(0.75f, 0.6f, 0.9f);
            glow.enabled = open;
        }

        public void Open()
        {
            if (open) return;
            open = true;
            sprite.sprite = Art.Get("door_open");
            sprite.color = Color.white;
            glow.enabled = true;
            Fx.Flash(transform.position, new Color(1f, 0.9f, 0.5f, 0.9f), 5f, 0.5f);
            Fx.Burst(transform.position, "spark", 14, new Color(1f, 0.9f, 0.5f), 6f, 0.7f, 0.4f, 1f);
            Sfx.Play(Sound.Unlock);
        }

        void OnTriggerStay2D(Collider2D other)
        {
            if (!open) return;
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State == HeroState.Dead || hero.State == HeroState.Won) return;
            StageController.I.Win(transform.position + Vector3.down * 0.3f);
        }
    }

    /// <summary>Cursed pumpkin. Breaks when something hits it hard enough.</summary>
    public class Minion : MonoBehaviour
    {
        const float BreakSpeed = 4.5f;
        bool broken;

        void OnCollisionEnter2D(Collision2D collision)
        {
            if (broken) return;
            Hero hero = collision.collider.GetComponent<Hero>();
            float impact = collision.relativeVelocity.magnitude;
            if (hero != null && hero.Powered) Smash();
            else if (impact > BreakSpeed) Smash();
        }

        public void Smash()
        {
            if (broken) return;
            broken = true;
            Vector2 p = transform.position;
            Fx.Burst(p, "shard", 9, Color.white, 6f, 0.7f, 0.4f, 12f);
            Fx.Burst(p, "dot", 6, new Color(1f, 0.7f, 0.2f, 0.9f), 3f, 0.5f, 0.5f, 0f);
            Fx.Flash(p, new Color(1f, 0.6f, 0.1f, 0.8f), 3f);
            Sfx.Play(Sound.Break, 1f, Random.Range(0.9f, 1.15f));
            StageController.I.Shake(0.18f, 0.15f);
            StageController.I.MinionSmashed();
            Destroy(gameObject);
        }
    }

    public class Spikes : Touchable
    {
        protected override void Touch(Hero hero)
        {
            hero.Die();
        }

        void OnTriggerStay2D(Collider2D other)
        {
            Hero hero = other.GetComponent<Hero>();
            if (hero != null && hero.State == HeroState.Flying) hero.Die();
        }
    }

    /// <summary>Bouncy mushroom: always throws the hero upwards.</summary>
    public class Mushroom : MonoBehaviour
    {
        public float power = 17f;
        SpriteRenderer sprite;
        float squashed;

        public void Setup(SpriteRenderer renderer)
        {
            sprite = renderer;
        }

        void OnCollisionEnter2D(Collision2D collision)
        {
            Hero hero = collision.collider.GetComponent<Hero>();
            if (hero == null || hero.State != HeroState.Flying) return;
            float vx = Mathf.Clamp(hero.LastVelocity.x * 0.75f, -8f, 8f);
            hero.Bounce(new Vector2(vx, power));
            squashed = 0.2f;
            if (sprite != null) sprite.sprite = Art.Get("mushroom_1");
            Fx.Dust(collision.contactCount > 0 ? collision.GetContact(0).point : (Vector2)transform.position, 8f);
            Sfx.Play(Sound.Mushroom, 0.9f, Random.Range(0.95f, 1.1f));
        }

        void Update()
        {
            if (squashed <= 0f) return;
            squashed -= Time.deltaTime;
            if (squashed <= 0f && sprite != null) sprite.sprite = Art.Get("mushroom_0");
        }
    }

    /// <summary>Platform travelling back and forth between two points.</summary>
    public class Mover : MonoBehaviour
    {
        public Vector2 travel;
        public float period = 4f;
        Rigidbody2D body;
        Vector2 origin;
        Vector2 last;

        public Vector2 Velocity { get; private set; }

        void Start()
        {
            body = GetComponent<Rigidbody2D>();
            origin = body.position;
            last = origin;
        }

        void FixedUpdate()
        {
            float k = 0.5f - 0.5f * Mathf.Cos(Time.time / Mathf.Max(0.1f, period) * Mathf.PI * 2f);
            Vector2 target = origin + travel * k;
            Velocity = (target - last) / Time.fixedDeltaTime;
            last = target;
            body.MovePosition(target);
        }
    }

    /// <summary>Pushes flying heroes.</summary>
    public class WindZone2D : MonoBehaviour
    {
        public Vector2 acceleration;

        void OnTriggerStay2D(Collider2D other)
        {
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State != HeroState.Flying) return;
            hero.Body.AddForce(acceleration * hero.Body.mass, ForceMode2D.Force);
        }
    }

    /// <summary>Visual streak drifting through a wind zone.</summary>
    public class WindStreak : MonoBehaviour
    {
        public Vector2 direction;
        public float speed = 3f;
        public Vector2 halfSize;
        public float phase;
        SpriteRenderer sprite;
        Vector3 centre;

        void Start()
        {
            sprite = GetComponent<SpriteRenderer>();
            centre = transform.parent != null ? Vector3.zero : transform.position;
        }

        void Update()
        {
            float length = Mathf.Abs(direction.x) > Mathf.Abs(direction.y) ? halfSize.x : halfSize.y;
            float t = Mathf.Repeat(Time.time * speed / Mathf.Max(0.5f, length * 2f) + phase, 1f);
            Vector2 along = direction.normalized * Mathf.Lerp(-length, length, t);
            Vector3 p = transform.localPosition;
            if (Mathf.Abs(direction.x) > Mathf.Abs(direction.y)) p.x = centre.x + along.x;
            else p.y = centre.y + along.y;
            transform.localPosition = p;
            if (sprite != null)
            {
                Color c = sprite.color;
                c.a = Mathf.Sin(t * Mathf.PI) * 0.55f;
                sprite.color = c;
            }
        }
    }

    public class Portal : Touchable
    {
        public Portal exit;

        protected override void Touch(Hero hero)
        {
            if (exit == null) return;
            Vector2 from = transform.position;
            if (!hero.TryTeleport(exit.transform.position)) return;
            Fx.Flash(from, new Color(0.5f, 0.9f, 1f, 0.8f), 3f);
            Fx.Flash(exit.transform.position, new Color(1f, 0.6f, 0.4f, 0.8f), 3f);
            Sfx.Play(Sound.Portal);
        }
    }

    /// <summary>Flying enemy. Hurts slow heroes, is knocked out by dashing or smashing ones.</summary>
    public class Bat : Touchable
    {
        public Vector2 travel;
        public float period = 3f;
        Vector3 origin;
        SpriteRenderer sprite;
        bool defeated;

        void Start()
        {
            origin = transform.position;
            sprite = GetComponentInChildren<SpriteRenderer>();
        }

        void Update()
        {
            float angle = Time.time / Mathf.Max(0.1f, period) * Mathf.PI * 2f;
            float k = 0.5f - 0.5f * Mathf.Cos(angle);
            Vector3 p = origin + (Vector3)(travel * k) + Vector3.up * Mathf.Sin(Time.time * 6f) * 0.08f;
            if (sprite != null && Mathf.Abs(travel.x) > 0.1f) sprite.flipX = Mathf.Sin(angle) * travel.x < 0f;
            transform.position = p;
        }

        protected override void Touch(Hero hero)
        {
            if (defeated) return;
            if (hero.Powered) Defeat();
            else hero.Die();
        }

        public void Defeat()
        {
            if (defeated) return;
            defeated = true;
            Fx.Burst(transform.position, "dot", 10, new Color(0.6f, 0.4f, 0.9f, 0.9f), 5f, 0.6f, 0.5f, 2f);
            Fx.Flash(transform.position, new Color(0.7f, 0.5f, 1f, 0.8f), 3f);
            Sfx.Play(Sound.Break, 0.8f, 1.4f);
            Destroy(gameObject);
        }
    }

    /// <summary>Cauldron cannon: swallows the hero and fires them on a fixed path.</summary>
    public class Cauldron : Touchable
    {
        public Vector2 velocity;
        Transform visual;
        bool loaded;
        float cooldown;

        public void Setup(Transform cauldronVisual)
        {
            visual = cauldronVisual;
        }

        void Update()
        {
            if (cooldown > 0f) cooldown -= Time.deltaTime;
        }

        protected override void Touch(Hero hero)
        {
            if (loaded || cooldown > 0f) return;
            if (hero.State != HeroState.Flying && hero.State != HeroState.Resting) return;
            StartCoroutine(Fire(hero));
        }

        IEnumerator Fire(Hero hero)
        {
            loaded = true;
            Vector2 mouth = (Vector2)transform.position + Vector2.up * 0.5f;
            hero.EnterCannon(mouth);
            Sfx.Play(Sound.Land, 0.8f, 0.7f);
            Vector3 scale = visual.localScale;
            yield return Tween.Run(0.45f, t =>
            {
                // Wind up: squash down before firing.
                float k = Mathf.Sin(t * Mathf.PI * 0.5f);
                visual.localScale = new Vector3(scale.x * (1f + 0.2f * k), scale.y * (1f - 0.25f * k), 1f);
            });
            hero.FireFromCannon(velocity);
            cooldown = 0.6f;
            loaded = false;
            Fx.Flash(mouth, new Color(0.6f, 1f, 0.4f, 0.9f), 4f);
            Fx.Burst(mouth, "dot", 12, new Color(0.6f, 1f, 0.4f, 0.9f), 6f, 0.5f, 0.4f, 2f);
            Sfx.Play(Sound.Cannon);
            StageController.I.Shake(0.25f, 0.2f);
            yield return Tween.Run(0.25f, t =>
            {
                float k = 1f - t;
                visual.localScale = new Vector3(scale.x * (1f - 0.15f * k), scale.y * (1f + 0.25f * k), 1f);
            });
            visual.localScale = scale;
        }
    }

    /// <summary>Cracked block that shatters.</summary>
    public class Crate : MonoBehaviour
    {
        bool broken;

        public void Break()
        {
            if (broken) return;
            broken = true;
            Collider2D box = GetComponent<Collider2D>();
            if (box != null) box.enabled = false;
            Fx.Burst(transform.position, "shard", 7, new Color(0.75f, 0.73f, 0.85f), 5f, 0.7f, 0.4f, 12f);
            Fx.Burst(transform.position, "dot", 5, new Color(0.8f, 0.8f, 0.9f, 0.7f), 2f, 0.5f, 0.5f, 0f);
            Sfx.Play(Sound.Break, 0.9f, Random.Range(0.7f, 0.9f));
            Destroy(gameObject);
        }
    }

    /// <summary>Platform that fades in and out. It is only solid while visible.</summary>
    public class GhostPlatform : MonoBehaviour
    {
        public float period = 4f;
        public float phase;
        SpriteRenderer sprite;
        Collider2D box;

        public void Setup(SpriteRenderer renderer, Collider2D collider2d)
        {
            sprite = renderer;
            box = collider2d;
        }

        void Update()
        {
            float t = Mathf.Repeat(Time.time / Mathf.Max(0.5f, period) + phase, 1f);
            // Solid for the first 55% of the cycle, with a warning flicker before vanishing.
            bool solid = t < 0.55f;
            float alpha;
            if (solid)
            {
                alpha = 1f;
                if (t > 0.42f) alpha = Mathf.Sin(Time.time * 30f) > 0f ? 1f : 0.5f;
            }
            else
            {
                alpha = 0.18f;
            }
            if (box.enabled != solid) box.enabled = solid;
            Color c = sprite.color;
            c.a = Mathf.Lerp(c.a, alpha, Time.deltaTime * 14f);
            sprite.color = c;
        }
    }

    public class WebPatch : MonoBehaviour
    {
        void OnTriggerEnter2D(Collider2D other)
        {
            Hero hero = other.GetComponent<Hero>();
            if (hero == null) return;
            hero.Hang(GetComponent<Collider2D>());
        }
    }

    /// <summary>Falling pumpkin bomb thrown by the boss.</summary>
    public class Bomb : MonoBehaviour
    {
        bool exploded;

        void OnTriggerEnter2D(Collider2D other)
        {
            if (exploded || other.isTrigger) return;
            Hero hero = other.GetComponent<Hero>();
            if (hero != null)
            {
                if (!hero.Powered) hero.Die();
                Explode();
                return;
            }
            if (other.GetComponent<Solid>() != null) Explode();
        }

        void Update()
        {
            if (transform.position.y < -4f) Destroy(gameObject);
        }

        void Explode()
        {
            exploded = true;
            Vector2 p = transform.position;
            Fx.Flash(p, new Color(0.6f, 1f, 0.3f, 0.9f), 4f);
            Fx.Burst(p, "shard", 8, new Color(0.6f, 0.9f, 0.3f), 6f, 0.6f, 0.35f, 10f);
            Sfx.Play(Sound.Break, 0.8f, 0.7f);
            Hero hero = StageController.I != null ? StageController.I.Hero : null;
            if (hero != null && !hero.Powered && Vector2.Distance(hero.Position, p) < 1.3f) hero.Die();
            Destroy(gameObject);
        }
    }
}
