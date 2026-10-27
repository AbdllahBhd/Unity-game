using System.Collections;
using System.Collections.Generic;
using HollowNight.Logic;
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

    /// <summary>
    /// Teryel's pot. Its moves come from <see cref="Pot"/> (idle, notice, hunt, lunge, return); it freezes while
    /// the player aims and stays home, harmless, from a death until the next launch. A dashing or fast hero, or a
    /// rolling jar, breaks it; a slower touch kills the hero. A range of 0 makes a sleeper that never moves.
    /// </summary>
    public class Hunter : MonoBehaviour
    {
        public const float BreakSpeed = 4.5f;

        Pot pot;
        Rigidbody2D body;
        SpriteRenderer sprite;
        bool broken;

        public void Setup(Vector2 home, float range, float speed, SpriteRenderer renderer)
        {
            pot = new Pot(home.x, home.y, range, speed);
            sprite = renderer;
        }

        void Awake()
        {
            body = GetComponent<Rigidbody2D>();
        }

        void FixedUpdate()
        {
            if (broken || pot == null) return;
            StageController stage = StageController.I;
            Hero hero = stage != null ? stage.Hero : null;
            bool heroGone = hero == null || hero.State == HeroState.Dead || hero.State == HeroState.Won;
            bool safe = stage == null || stage.PotsSafe || heroGone;
            if (safe && !pot.Safe && stage != null && stage.PotsSafe)
            {
                // A death puts every pot back home at once, so none waits on the respawn spot.
                pot.SendHome();
                body.position = new Vector2(pot.X, pot.Y);
            }
            pot.Safe = safe;
            Vector2 target = hero != null ? hero.Position : body.position;
            if (pot.Step(target.x, target.y, Time.fixedDeltaTime, stage != null && stage.Aiming))
            {
                Fx.Burst(body.position + Vector2.up * 0.5f, "dot", 4, new Color(1f, 0.85f, 0.4f, 0.9f), 2f, 0.3f, 0.2f, 0f);
            }
            if (sprite != null && Mathf.Abs(pot.Vx) > 0.05f) sprite.flipX = pot.Vx < 0f;
            body.MovePosition(new Vector2(pot.X, pot.Y));
        }

        void OnTriggerEnter2D(Collider2D other) { Touch(other); }
        void OnTriggerStay2D(Collider2D other) { Touch(other); }

        void Touch(Collider2D other)
        {
            if (broken) return;
            Jar jar = other.GetComponent<Jar>();
            if (jar != null)
            {
                if (jar.Bowling)
                {
                    jar.Bowled();
                    Smash();
                }
                return;
            }
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State == HeroState.Dead || hero.State == HeroState.Won) return;
            // A safe pot (from a death until the next launch) neither breaks nor kills.
            if (pot.Safe) return;
            bool flying = hero.State == HeroState.Flying;
            float impact = flying ? hero.Body.linearVelocity.magnitude : 0f;
            if (hero.Powered || impact > BreakSpeed)
            {
                if (flying) hero.Body.linearVelocity *= 0.6f;
                Smash();
            }
            else
            {
                // Die() ignores a hero still in respawn grace, and makes every pot safe until the next launch.
                hero.Die();
            }
        }

        public void Smash()
        {
            if (broken) return;
            broken = true;
            Vector2 p = transform.position;
            Fx.Burst(p, "shard", 9, new Color(0.85f, 0.55f, 0.35f), 6f, 0.7f, 0.4f, 12f);
            Fx.Burst(p, "dot", 8, new Color(1f, 0.8f, 0.5f, 0.9f), 3.5f, 0.5f, 0.5f, 0f);
            Fx.Flash(p, new Color(1f, 0.8f, 0.5f, 0.8f), 3.5f);
            Sfx.Play(Sound.Break, 1f, Random.Range(0.9f, 1.15f));
            if (StageController.I != null)
            {
                StageController.I.Shake(0.18f, 0.15f);
                StageController.I.Broke(Breakable.Pot);
            }
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// A rolling jar (SPEC.md §3). A dynamic body with frozen rotation (the spin is only drawn) that the flying
    /// hero kicks along, as in the prototype: he passes through it (so he never stands or rests on it) and kicks
    /// it again every 0.4 s while he overlaps it. It breaks pots it bowls into, and shatters after a fall of 2.5 or
    /// more, against a side wall faster than 3, or off the stage. The hero never comes to rest on it. The trap
    /// jar rolls out again from home 1.2 s after breaking while a Teryel is still free; it is never a star.
    /// </summary>
    public class Jar : MonoBehaviour
    {
        public const float Radius = 0.45f;
        const float PushCooldown = 0.4f;
        const float FallBreak = 2.5f;
        const float WallBreakSpeed = 3f;
        const float RespawnDelay = 1.2f;

        public bool trap;
        Vector2 home;
        Rigidbody2D body;
        Collider2D circle;
        SpriteRenderer sprite;
        float fallFrom;
        float pushCool;
        bool grounded;
        bool wasGrounded = true;
        bool broken;
        bool ignoringHero;

        public void Setup(Vector2 at, bool isTrap, SpriteRenderer renderer)
        {
            home = at;
            trap = isTrap;
            sprite = renderer;
            body = GetComponent<Rigidbody2D>();
            circle = GetComponent<Collider2D>();
            fallFrom = at.y;
        }

        /// <summary>Fast enough to break a pot or trap Teryel.</summary>
        public bool Bowling
        {
            get
            {
                if (broken || body == null) return false;
                Vector2 v = body.linearVelocity;
                return Mathf.Abs(v.x) > 1.5f || v.y < -2f;
            }
        }

        /// <summary>A pot it hit slows it down a little.</summary>
        public void Bowled()
        {
            Vector2 v = body.linearVelocity;
            body.linearVelocity = new Vector2(v.x * 0.85f, v.y);
        }

        void FixedUpdate()
        {
            if (broken) return;
            float dt = Time.fixedDeltaTime;
            if (pushCool > 0f) pushCool -= dt;
            Hero hero = StageController.I != null ? StageController.I.Hero : null;
            if (hero != null)
            {
                if (!ignoringHero)
                {
                    Physics2D.IgnoreCollision(circle, hero.GetComponent<Collider2D>());
                    ignoringHero = true;
                }
                if (Vector2.Distance(hero.Position, body.position) < Heroes.Radius + Radius) Kick(hero);
            }
            float y = body.position.y;
            // Landing is judged when a floor contact begins, whatever the first contact was (a ledge corner).
            if (grounded && !wasGrounded && fallFrom - y > FallBreak)
            {
                CrushPotsNear();
                Shatter();
                return;
            }
            fallFrom = grounded ? y : Mathf.Max(fallFrom, y);
            wasGrounded = grounded;
            grounded = false;
            sprite.transform.Rotate(0f, 0f, -body.linearVelocity.x / Radius * Mathf.Rad2Deg * dt);
            if (y < -3f) Shatter();
        }

        void OnCollisionEnter2D(Collision2D collision)
        {
            if (broken) return;
            Vector2 normal = collision.contactCount > 0 ? collision.GetContact(0).normal : Vector2.zero;
            bool atWall = Mathf.Abs(body.position.x) > LevelData.HalfWidth - Radius - 0.1f;
            if (atWall && Mathf.Abs(normal.x) > 0.6f && Mathf.Abs(collision.relativeVelocity.x) > WallBreakSpeed) Shatter();
        }

        void OnCollisionStay2D(Collision2D collision)
        {
            for (int i = 0; i < collision.contactCount; i++)
            {
                if (collision.GetContact(i).normal.y > 0.6f) grounded = true;
            }
        }

        /// <summary>The prototype's push: the jar takes most of his horizontal speed, he hops off it.</summary>
        void Kick(Hero hero)
        {
            if (hero.State != HeroState.Flying || pushCool > 0f) return;
            pushCool = PushCooldown;
            Vector2 hv = hero.LastVelocity;
            float push = Mathf.Abs(hv.x) > 1f ? hv.x : Mathf.Sign(body.position.x - hero.Position.x) * 4f;
            body.linearVelocity = new Vector2(Mathf.Sign(push) * Mathf.Clamp(Mathf.Abs(push) * 0.9f, 4f, 14f),
                body.linearVelocity.y);
            hero.Body.linearVelocity = new Vector2(hv.x * 0.5f, hv.y < 0f ? 3f : hv.y);
            Sfx.Play(Sound.Bounce, 0.7f, 0.6f);
        }

        void CrushPotsNear()
        {
            Collider2D[] near = Physics2D.OverlapCircleAll(body.position, 1.1f);
            for (int i = 0; i < near.Length; i++)
            {
                Hunter pot = near[i].GetComponent<Hunter>();
                // The prototype's reach is 1.1 between centres, not to the trigger's edge.
                if (pot != null && Vector2.Distance(pot.transform.position, body.position) < 1.1f) pot.Smash();
            }
        }

        void Shatter()
        {
            if (broken) return;
            broken = true;
            Vector2 p = body.position;
            body.linearVelocity = Vector2.zero;
            body.simulated = false;
            circle.enabled = false;
            sprite.enabled = false;
            Fx.Burst(p, "shard", 10, new Color(0.8f, 0.5f, 0.3f), 6f, 0.7f, 0.4f, 12f);
            Fx.Flash(p, new Color(1f, 0.8f, 0.5f, 0.8f), 3f);
            Sfx.Play(Sound.Break, 1f, Random.Range(0.7f, 0.85f));
            if (StageController.I != null)
            {
                StageController.I.Shake(0.22f, 0.18f);
                StageController.I.Broke(trap ? Breakable.TrapJar : Breakable.RollingJar);
            }
            if (trap && Teryel.AnyFree) Invoke("RollOutAgain", RespawnDelay);
            else Destroy(gameObject);
        }

        void RollOutAgain()
        {
            if (!Teryel.AnyFree) return;
            broken = false;
            fallFrom = home.y;
            grounded = false;
            wasGrounded = true;
            body.position = home;
            transform.position = home;
            body.simulated = true;
            body.linearVelocity = Vector2.zero;
            circle.enabled = true;
            sprite.enabled = true;
            Fx.Flash(home, new Color(1f, 0.85f, 0.5f, 0.7f), 2.5f);
        }
    }

    /// <summary>
    /// Teryel, the ogress (SPEC.md §3). Never fought: any touch kills, even a dash, though she respects the
    /// hero's respawn grace. She can patrol, and a moving jar traps her. A rest inside the path of a free
    /// Teryel is never saved as a respawn spot (<see cref="InPath"/>, used by Hero.Rest).
    /// </summary>
    public class Teryel : MonoBehaviour
    {
        static readonly List<Teryel> all = new List<Teryel>();

        float radius = 1f;
        Vector2 travel;
        float period = 6f;
        Vector2 home;
        Rigidbody2D body;
        SpriteRenderer sprite;
        bool trapped;

        public static bool AnyFree
        {
            get
            {
                for (int i = 0; i < all.Count; i++)
                {
                    if (!all[i].trapped) return true;
                }
                return false;
            }
        }

        public static bool InPath(Vector2 p)
        {
            for (int i = 0; i < all.Count; i++)
            {
                Teryel t = all[i];
                if (t.trapped) continue;
                float reach = t.radius + Heroes.Radius + 0.3f;
                if (Mathf.Abs(p.x - t.home.x) < Mathf.Abs(t.travel.x) + reach
                    && Mathf.Abs(p.y - t.home.y) < Mathf.Abs(t.travel.y) + reach) return true;
            }
            return false;
        }

        public void Setup(Vector2 at, float r, Vector2 patrol, float patrolPeriod, SpriteRenderer renderer)
        {
            home = at;
            radius = r;
            travel = patrol;
            period = Mathf.Max(0.5f, patrolPeriod);
            sprite = renderer;
            body = GetComponent<Rigidbody2D>();
        }

        void OnEnable()
        {
            all.Add(this);
        }

        void OnDisable()
        {
            all.Remove(this);
        }

        void FixedUpdate()
        {
            if (trapped || travel == Vector2.zero) return;
            float angle = Time.timeSinceLevelLoad * Mathf.PI * 2f / period;
            body.MovePosition(home + travel * Mathf.Sin(angle));
            if (sprite != null && Mathf.Abs(travel.x) > 0.1f) sprite.flipX = Mathf.Cos(angle) * travel.x < 0f;
        }

        void OnTriggerEnter2D(Collider2D other) { Touch(other); }
        void OnTriggerStay2D(Collider2D other) { Touch(other); }

        void Touch(Collider2D other)
        {
            if (trapped) return;
            Jar jar = other.GetComponent<Jar>();
            if (jar != null)
            {
                if (jar.Bowling) Trap();
                return;
            }
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State == HeroState.Dead || hero.State == HeroState.Won) return;
            // The prototype's reach: her radius plus most of his. Die() honours the respawn grace.
            if (Vector2.Distance(hero.Position, body.position) < radius + Heroes.Radius * 0.8f) hero.Die();
        }

        void Trap()
        {
            trapped = true;
            if (sprite != null) sprite.color = new Color(0.55f, 0.5f, 0.6f);
            Fx.Burst(body.position, "spark", 14, new Color(1f, 0.9f, 0.5f), 6f, 0.7f, 0.4f, 3f);
            Fx.Flash(body.position, new Color(1f, 0.9f, 0.6f, 0.8f), radius * 3f);
            Sfx.Play(Sound.Unlock, 1f, 0.8f);
            if (StageController.I != null)
            {
                StageController.I.Shake(0.3f, 0.25f);
                StageController.I.TeryelTrapped();
            }
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
            yield return Tween.Run(0.4f, t =>
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
            // From the stage's start, as Tools/check_levels.py assumes.
            float t = Mathf.Repeat(Time.timeSinceLevelLoad / Mathf.Max(0.5f, period) + phase, 1f);
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
