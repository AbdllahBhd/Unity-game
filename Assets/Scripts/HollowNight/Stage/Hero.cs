using System.Collections;
using UnityEngine;

namespace HollowNight
{
    public enum HeroState { Resting, Flying, Cannon, Dead, Won }

    /// <summary>
    /// The launchable hero. While resting the body is kinematic and follows whatever it stands on;
    /// a launch makes it dynamic until it comes to rest again.
    /// </summary>
    public class Hero : MonoBehaviour
    {
        const float RestSpeed = 0.6f;
        const float RestDelay = 0.12f;
        const float KillDepth = -3.5f;
        const float GlideFallSpeed = -1.8f;
        const float GlideTime = 3f;

        public HeroDef Def { get; private set; }
        public HeroState State { get; private set; }
        public Rigidbody2D Body { get; private set; }

        /// <summary>True while dashing or smashing: the hero destroys enemies instead of being hurt.</summary>
        public bool Powered { get { return dashTimer > 0f || smashing; } }
        public bool CanLaunch { get { return State == HeroState.Resting; } }
        public bool Invulnerable { get { return Time.time < invulnerableUntil; } }
        public Vector2 Position { get { return Body.position; } }
        /// <summary>Velocity before the current physics step (collisions have not changed it yet).</summary>
        public Vector2 LastVelocity { get { return lastVelocity; } }

        CircleCollider2D circle;
        Transform visual;
        SpriteRenderer sprite;
        SpriteRenderer aura;
        TrailRenderer trail;
        LineRenderer webLine;

        Vector2 safePosition;
        Transform restParent;
        Vector3 restLocal;
        Collider2D restCollider;
        Collider2D groundCollider;
        float groundedTime = -10f;
        float restTimer;
        Vector2 lastVelocity;

        bool abilityUsed;
        int flapsLeft;
        float glideLeft;
        bool gliding;
        float dashTimer;
        bool smashing;
        float stickCooldown;
        float portalCooldown;
        float invulnerableUntil;
        float webLineTimer;

        float squash;
        float aim;
        float blink;
        string frame = "";

        public void Setup(HeroDef def, Vector2 position)
        {
            gameObject.name = "Hero";
            transform.position = position;
            safePosition = position;

            Body = gameObject.AddComponent<Rigidbody2D>();
            Body.gravityScale = Heroes.GravityScale;
            Body.freezeRotation = true;
            Body.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            Body.interpolation = RigidbodyInterpolation2D.Interpolate;
            Body.sleepMode = RigidbodySleepMode2D.NeverSleep;
            // Keeps triggers and enemies working while the hero rests as a kinematic body.
            Body.useFullKinematicContacts = true;

            circle = gameObject.AddComponent<CircleCollider2D>();
            circle.radius = Heroes.Radius;
            PhysicsMaterial2D material = new PhysicsMaterial2D("Hero");
            material.friction = 0.6f;
            material.bounciness = 0.2f;
            circle.sharedMaterial = material;

            aura = Art.Make("glow", transform, Vector3.zero, 2.6f, Layer.Hero - 2, "Aura");
            sprite = Art.Make(def.sprite + "_idle", transform, Vector3.zero, def.height, Layer.Hero, "Visual");
            visual = sprite.transform;

            trail = gameObject.AddComponent<TrailRenderer>();
            trail.time = 0.35f;
            trail.startWidth = 0.55f;
            trail.endWidth = 0f;
            trail.sharedMaterial = Art.SpriteMaterial;
            trail.sortingOrder = Layer.Hero - 1;
            trail.numCapVertices = 4;
            trail.emitting = false;

            GameObject line = new GameObject("WebLine");
            line.transform.SetParent(transform, false);
            webLine = line.AddComponent<LineRenderer>();
            webLine.useWorldSpace = true;
            webLine.positionCount = 2;
            webLine.startWidth = 0.07f;
            webLine.endWidth = 0.07f;
            webLine.sharedMaterial = Art.SpriteMaterial;
            webLine.startColor = Color.white;
            webLine.endColor = Color.white;
            webLine.sortingOrder = Layer.Hero - 1;
            webLine.enabled = false;

            SetHero(def);
            // Start in the air just above the start point and settle naturally.
            State = HeroState.Flying;
        }

        public void SetHero(HeroDef def)
        {
            Def = def;
            frame = "";
            ShowFrame("idle");
            Art.FitHeight(sprite, def.height);
            aura.color = new Color(def.color.r, def.color.g, def.color.b, 0.28f);
            trail.startColor = new Color(def.color.r, def.color.g, def.color.b, 0.7f);
            trail.endColor = new Color(def.color.r, def.color.g, def.color.b, 0f);
        }

        // ------------------------------------------------------------------ launching
        /// <summary>Launch velocity for a drag vector (world units, already pointing in the launch direction).</summary>
        public Vector2 LaunchVelocity(Vector2 drag, float maxDrag)
        {
            float power = Mathf.Clamp01(drag.magnitude / maxDrag);
            return drag.normalized * (power * Def.maxSpeed);
        }

        public void SetAim(float power)
        {
            aim = power;
        }

        public void Launch(Vector2 velocity)
        {
            if (State != HeroState.Resting) return;
            aim = 0f;
            Release();
            Body.linearVelocity = velocity;
            lastVelocity = velocity;
            stickCooldown = 0.15f;
            squash = -0.25f;
            Sfx.Play(Sound.Launch, 0.8f, Random.Range(0.95f, 1.1f));
            Fx.Dust(Position + Vector2.down * Heroes.Radius, 5f);
        }

        /// <summary>Switches to free flight and refreshes the abilities.</summary>
        void Release()
        {
            State = HeroState.Flying;
            Body.bodyType = RigidbodyType2D.Dynamic;
            restParent = null;
            restCollider = null;
            groundCollider = null;
            groundedTime = -10f;
            restTimer = 0f;
            abilityUsed = false;
            flapsLeft = 2;
            glideLeft = GlideTime;
            gliding = false;
            smashing = false;
            dashTimer = 0f;
            trail.emitting = true;
        }

        void Rest(Collider2D ground, bool stable)
        {
            State = HeroState.Resting;
            Body.linearVelocity = Vector2.zero;
            Body.angularVelocity = 0f;
            Body.bodyType = RigidbodyType2D.Kinematic;
            restCollider = ground;
            restParent = ground != null ? ground.transform : null;
            if (restParent != null) restLocal = restParent.InverseTransformPoint(transform.position);
            if (stable) safePosition = transform.position;
            gliding = false;
            smashing = false;
            dashTimer = 0f;
            trail.emitting = false;
        }

        // ------------------------------------------------------------------ abilities
        /// <summary>Pointer pressed while the hero is in the air.</summary>
        public void AbilityPress()
        {
            if (State != HeroState.Flying) return;
            switch (Def.type)
            {
                case HeroType.Izan:
                    Dash();
                    break;
                case HeroType.Hoot:
                    Flap();
                    break;
                case HeroType.Webster:
                    Zip();
                    break;
                case HeroType.Pip:
                    Smash();
                    break;
            }
        }

        public void AbilityRelease()
        {
            gliding = false;
        }

        void Dash()
        {
            if (abilityUsed) return;
            abilityUsed = true;
            Vector2 v = Body.linearVelocity;
            Vector2 direction = v.sqrMagnitude > 1f ? v.normalized : Vector2.up;
            Body.linearVelocity = direction * Mathf.Max(v.magnitude + 5f, 13f);
            dashTimer = 0.45f;
            squash = -0.3f;
            Fx.Flash(Position, Def.color, 3f);
            Fx.Burst(Position, "spark", 8, Color.white, 5f, 0.4f, 0.4f, 0f);
            Sfx.Play(Sound.Dash);
        }

        void Flap()
        {
            gliding = true;
            if (flapsLeft <= 0) return;
            flapsLeft--;
            Vector2 v = Body.linearVelocity;
            v.y = Mathf.Max(v.y, 0f) + 6.5f;
            v.x += Mathf.Sign(Mathf.Abs(v.x) > 0.2f ? v.x : 1f) * 1.2f;
            Body.linearVelocity = v;
            squash = -0.2f;
            Fx.Burst(Position + Vector2.down * 0.3f, "dot", 6, new Color(1f, 1f, 1f, 0.7f), 3f, 0.35f, 0.3f, 2f);
            Sfx.Play(Sound.Flap, 1f, Random.Range(0.9f, 1.2f));
        }

        void Zip()
        {
            if (abilityUsed) return;
            RaycastHit2D[] hits = Physics2D.RaycastAll(Position, Vector2.up, 10f);
            float best = float.MaxValue;
            Vector2 anchor = Vector2.zero;
            for (int i = 0; i < hits.Length; i++)
            {
                Collider2D c = hits[i].collider;
                if (c == null || c.isTrigger || c == circle) continue;
                if (c.GetComponent<Solid>() == null) continue;
                if (hits[i].distance < 0.7f || hits[i].distance >= best) continue;
                best = hits[i].distance;
                anchor = hits[i].point;
            }
            if (best == float.MaxValue)
            {
                Sfx.Play(Sound.Click, 0.5f, 0.6f);
                return;
            }
            abilityUsed = true;
            float gravity = Mathf.Abs(Physics2D.gravity.y) * Body.gravityScale;
            Body.linearVelocity = new Vector2(0f, Mathf.Sqrt(2f * gravity * best) + 3f);
            stickCooldown = 0f;
            webLine.enabled = true;
            webLine.SetPosition(1, anchor);
            webLineTimer = 0.6f;
            Sfx.Play(Sound.Web);
        }

        void Smash()
        {
            if (abilityUsed) return;
            abilityUsed = true;
            smashing = true;
            Body.linearVelocity = new Vector2(0f, -20f);
            squash = -0.35f;
            Fx.Flash(Position, Def.color, 2.5f);
            Sfx.Play(Sound.Dash, 0.8f, 0.6f);
        }

        void Shockwave()
        {
            Vector2 centre = Position;
            Collider2D[] near = Physics2D.OverlapCircleAll(centre, 2.4f);
            for (int i = 0; i < near.Length; i++)
            {
                if (near[i] == null) continue;
                Crate crate = near[i].GetComponent<Crate>();
                if (crate != null) crate.Break();
                Hunter hunter = near[i].GetComponent<Hunter>();
                if (hunter != null) hunter.Smash();
                Bat bat = near[i].GetComponent<Bat>();
                if (bat != null) bat.Defeat();
            }
            Fx.Flash(centre + Vector2.down * 0.3f, new Color(1f, 0.8f, 0.4f, 0.9f), 5f, 0.4f);
            Fx.Burst(centre + Vector2.down * 0.3f, "dot", 12, new Color(1f, 0.9f, 0.7f, 0.8f), 7f, 0.5f, 0.4f, 3f);
            Sfx.Play(Sound.Smash);
            if (StageController.I != null) StageController.I.Shake(0.35f, 0.3f);
        }

        // ------------------------------------------------------------------ physics
        void FixedUpdate()
        {
            float dt = Time.fixedDeltaTime;
            if (portalCooldown > 0f) portalCooldown -= dt;

            if (State == HeroState.Resting)
            {
                if (restCollider == null || !restCollider.enabled || !restCollider.gameObject.activeInHierarchy)
                {
                    // The ground vanished (ghost platform, broken block).
                    Release();
                    Body.linearVelocity = Vector2.zero;
                }
                else if (restParent != null)
                {
                    Body.MovePosition(restParent.TransformPoint(restLocal));
                }
                return;
            }

            if (State != HeroState.Flying) return;

            if (dashTimer > 0f) dashTimer -= dt;
            if (stickCooldown > 0f) stickCooldown -= dt;

            Vector2 v = Body.linearVelocity;
            if (gliding && glideLeft > 0f && Def.type == HeroType.Hoot)
            {
                glideLeft -= dt;
                if (v.y < GlideFallSpeed)
                {
                    v.y = Mathf.Lerp(v.y, GlideFallSpeed, 0.25f);
                    Body.linearVelocity = v;
                }
            }

            bool grounded = Time.time - groundedTime < 0.08f && groundCollider != null;
            if (grounded)
            {
                Vector2 groundVelocity = Vector2.zero;
                Mover mover = groundCollider.GetComponent<Mover>();
                if (mover != null) groundVelocity = mover.Velocity;
                if ((v - groundVelocity).magnitude < RestSpeed) restTimer += dt;
                else restTimer = 0f;
                if (restTimer >= RestDelay)
                {
                    Solid solid = groundCollider.GetComponent<Solid>();
                    Rest(groundCollider, solid != null && solid.stable);
                    return;
                }
            }
            else
            {
                restTimer = 0f;
            }

            lastVelocity = Body.linearVelocity;
            if (Body.position.y < KillDepth) Die();
        }

        void OnCollisionEnter2D(Collision2D collision)
        {
            if (State != HeroState.Flying) return;
            float impact = collision.relativeVelocity.magnitude;
            Collider2D other = collision.collider;

            Crate crate = other.GetComponent<Crate>();
            if (crate != null)
            {
                bool breaks = smashing || dashTimer > 0f || (Def.type == HeroType.Pip && impact > 6f) || impact > 13f;
                if (breaks)
                {
                    crate.Break();
                    // Keep ploughing through instead of stopping on the debris.
                    Body.linearVelocity = smashing ? new Vector2(0f, -16f) : lastVelocity * 0.7f;
                    if (StageController.I != null) StageController.I.Shake(0.2f, 0.15f);
                    return;
                }
            }

            if (smashing)
            {
                smashing = false;
                Shockwave();
            }

            if (impact > 2.5f)
            {
                squash = Mathf.Clamp(impact * 0.035f, 0.1f, 0.4f);
                Vector2 point = collision.contactCount > 0 ? collision.GetContact(0).point : Position;
                Fx.Dust(point, impact);
                Sfx.Play(impact > 8f ? Sound.Bounce : Sound.Land, Mathf.Clamp01(impact / 12f), Random.Range(0.9f, 1.1f));
            }

            if (Def.type == HeroType.Webster && stickCooldown <= 0f && !other.isTrigger)
            {
                Solid solid = other.GetComponent<Solid>();
                if (solid != null && solid.sticky)
                {
                    Rest(other, solid.stable && IsFloor(collision));
                    Sfx.Play(Sound.Web, 0.6f, 1.3f);
                }
            }
        }

        static bool IsFloor(Collision2D collision)
        {
            for (int i = 0; i < collision.contactCount; i++)
            {
                if (collision.GetContact(i).normal.y > 0.6f) return true;
            }
            return false;
        }

        void OnCollisionStay2D(Collision2D collision)
        {
            if (State != HeroState.Flying) return;
            if (collision.collider.GetComponent<Mushroom>() != null) return;
            if (IsFloor(collision))
            {
                groundedTime = Time.time;
                groundCollider = collision.collider;
            }
        }

        // ------------------------------------------------------------------ events from level objects
        /// <summary>Sticks the hero to a web patch.</summary>
        public void Hang(Collider2D web)
        {
            if (State != HeroState.Flying || stickCooldown > 0f) return;
            Rest(web, false);
            Sfx.Play(Sound.Web, 0.7f);
        }

        public void Bounce(Vector2 velocity)
        {
            if (State != HeroState.Flying) return;
            Body.linearVelocity = velocity;
            lastVelocity = velocity;
            restTimer = 0f;
            groundedTime = -10f;
            squash = 0.3f;
            // A bounce gives the abilities back.
            abilityUsed = false;
            flapsLeft = 2;
            glideLeft = GlideTime;
            smashing = false;
        }

        public bool TryTeleport(Vector2 position)
        {
            if (portalCooldown > 0f || State != HeroState.Flying) return false;
            portalCooldown = 0.6f;
            Body.position = position;
            transform.position = position;
            trail.Clear();
            return true;
        }

        public void EnterCannon(Vector2 position)
        {
            if (State != HeroState.Flying && State != HeroState.Resting) return;
            State = HeroState.Cannon;
            Body.bodyType = RigidbodyType2D.Kinematic;
            Body.linearVelocity = Vector2.zero;
            Body.position = position;
            transform.position = position;
            restParent = null;
            restCollider = null;
            visual.gameObject.SetActive(false);
            aura.enabled = false;
            trail.emitting = false;
            trail.Clear();
        }

        public void FireFromCannon(Vector2 velocity)
        {
            if (State != HeroState.Cannon) return;
            visual.gameObject.SetActive(true);
            aura.enabled = true;
            Release();
            Body.linearVelocity = velocity;
            lastVelocity = velocity;
            squash = -0.3f;
        }

        public void Die()
        {
            if (State == HeroState.Dead || State == HeroState.Won || Invulnerable) return;
            State = HeroState.Dead;
            Body.linearVelocity = Vector2.zero;
            Body.bodyType = RigidbodyType2D.Kinematic;
            trail.emitting = false;
            restParent = null;
            restCollider = null;
            ShowFrame("hurt");
            Fx.Burst(Position, "spark", 10, Def.color, 6f, 0.6f, 0.45f, 5f);
            Fx.Flash(Position, new Color(1f, 0.3f, 0.4f, 0.8f), 3f);
            Sfx.Play(Sound.Hurt);
            if (StageController.I != null)
            {
                StageController.I.Shake(0.3f, 0.25f);
                StageController.I.HeroDied();
            }
            StartCoroutine(Respawn());
        }

        IEnumerator Respawn()
        {
            float t = 0f;
            while (t < 0.7f)
            {
                t += Time.deltaTime;
                visual.localScale = VisualScale() * Mathf.Lerp(1f, 0f, t / 0.7f);
                visual.Rotate(0f, 0f, 720f * Time.deltaTime);
                yield return null;
            }
            visual.localRotation = Quaternion.identity;
            Body.position = safePosition;
            transform.position = safePosition;
            trail.Clear();
            invulnerableUntil = Time.time + 1.2f;
            Release();
            trail.emitting = false;
            Body.linearVelocity = Vector2.zero;
            Fx.Flash(safePosition, Def.color, 3f);
        }

        public void Win(Vector2 doorPosition)
        {
            if (State == HeroState.Won || State == HeroState.Dead) return;
            State = HeroState.Won;
            Body.linearVelocity = Vector2.zero;
            Body.bodyType = RigidbodyType2D.Kinematic;
            trail.emitting = false;
            restParent = null;
            restCollider = null;
            ShowFrame("happy");
            StartCoroutine(EnterDoor(doorPosition));
        }

        IEnumerator EnterDoor(Vector2 doorPosition)
        {
            Vector2 from = transform.position;
            float t = 0f;
            while (t < 0.7f)
            {
                t += Time.deltaTime;
                float k = Ease.InOut(t / 0.7f);
                Vector2 p = Vector2.Lerp(from, doorPosition, k) + Vector2.up * Mathf.Sin(k * Mathf.PI) * 0.8f;
                transform.position = p;
                visual.localScale = VisualScale() * Mathf.Lerp(1f, 0.25f, k);
                yield return null;
            }
            visual.gameObject.SetActive(false);
            aura.enabled = false;
        }

        // ------------------------------------------------------------------ visuals
        Vector3 VisualScale()
        {
            float spriteHeight = sprite.sprite != null ? sprite.sprite.bounds.size.y : 1f;
            float s = Def.height / Mathf.Max(0.001f, spriteHeight);
            return new Vector3(s, s, 1f);
        }

        void ShowFrame(string name)
        {
            if (frame == name) return;
            frame = name;
            sprite.sprite = Art.Get(Def.sprite + "_" + name);
        }

        void Update()
        {
            if (webLineTimer > 0f)
            {
                webLineTimer -= Time.deltaTime;
                webLine.SetPosition(0, transform.position);
                if (webLineTimer <= 0f || State != HeroState.Flying) webLine.enabled = false;
            }

            if (State == HeroState.Dead || State == HeroState.Won || State == HeroState.Cannon) return;

            squash = Mathf.Lerp(squash, 0f, Time.deltaTime * 9f);
            float sx = 1f + squash;
            float sy = 1f - squash;
            float lean = 0f;

            if (State == HeroState.Resting)
            {
                // Crouch while aiming, breathe while idle, blink now and then.
                float breathe = Mathf.Sin(Time.time * 3f) * 0.025f;
                sx += aim * 0.22f + breathe;
                sy -= aim * 0.22f + breathe;
                blink -= Time.deltaTime;
                if (blink < -0.15f) blink = Random.Range(1.5f, 4f);
                ShowFrame(aim > 0.05f ? "fly" : (blink < 0f ? "blink" : "idle"));
            }
            else
            {
                Vector2 v = Body.linearVelocity;
                float stretch = Mathf.Clamp01(v.magnitude / 16f) * 0.16f;
                sx -= stretch;
                sy += stretch;
                lean = Mathf.Clamp(-v.x * 2.2f, -28f, 28f);
                if (Mathf.Abs(v.x) > 0.3f) sprite.flipX = v.x < 0f;
                ShowFrame(Powered ? "happy" : "fly");
            }

            Vector3 baseScale = VisualScale();
            visual.localScale = new Vector3(baseScale.x * sx, baseScale.y * sy, 1f);
            visual.localRotation = Quaternion.Lerp(visual.localRotation, Quaternion.Euler(0f, 0f, lean), Time.deltaTime * 10f);
            // Keep the body centred on the collider (the sprite has ears above and a shadow below).
            visual.localPosition = new Vector3(0f, Def.height * 0.12f - squash * 0.2f, 0f);

            Color tint = Color.white;
            if (Invulnerable) tint.a = Mathf.Sin(Time.time * 40f) > 0f ? 0.4f : 1f;
            sprite.color = tint;
            float pulse = Powered ? 0.6f : 0.26f + Mathf.Sin(Time.time * 2.5f) * 0.05f;
            aura.color = new Color(Def.color.r, Def.color.g, Def.color.b, pulse);
        }
    }
}
