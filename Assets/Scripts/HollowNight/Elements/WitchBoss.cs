using System.Collections;
using UnityEngine;

namespace HollowNight
{
    /// <summary>
    /// Morgra. She sweeps across the arena on her broom and throws pumpkin bombs.
    /// Hit her three times; each hit sends her higher and makes her faster.
    /// When she falls she drops the Moon Lantern, which is the goal of the stage.
    /// </summary>
    public class WitchBoss : MonoBehaviour
    {
        const int MaxHealth = 3;
        const float Range = 4.2f;

        public int Health { get; private set; }

        SpriteRenderer sprite;
        float baseY;
        float targetY;
        float speed = 0.9f;
        float phase;
        float castTimer = 2.5f;
        float castFace;
        float stunned;
        bool defeated;

        public void Setup(SpriteRenderer renderer)
        {
            sprite = renderer;
            Health = MaxHealth;
            baseY = transform.position.y;
            targetY = baseY;
        }

        void Update()
        {
            if (defeated) return;
            float dt = Time.deltaTime;

            if (stunned > 0f)
            {
                stunned -= dt;
                sprite.color = Mathf.Sin(Time.time * 40f) > 0f ? Color.white : new Color(1f, 0.4f, 0.4f);
                transform.Rotate(0f, 0f, 540f * dt);
                if (stunned <= 0f)
                {
                    sprite.color = Color.white;
                    transform.rotation = Quaternion.identity;
                    sprite.sprite = Art.Get("morgra_idle");
                }
                return;
            }

            phase += dt * speed;
            baseY = Mathf.Lerp(baseY, targetY, dt * 2f);
            float x = Mathf.Sin(phase) * Range;
            float y = baseY + Mathf.Sin(phase * 2.3f) * 0.5f;
            transform.position = new Vector3(x, y, 0f);
            sprite.flipX = Mathf.Cos(phase) > 0f;

            if (castFace > 0f)
            {
                castFace -= dt;
                if (castFace <= 0f) sprite.sprite = Art.Get("morgra_idle");
            }

            castTimer -= dt;
            if (castTimer <= 0f)
            {
                castTimer = Mathf.Lerp(1.6f, 3f, Health / (float)MaxHealth);
                Cast();
            }
        }

        void Cast()
        {
            sprite.sprite = Art.Get("morgra_cast");
            castFace = 0.6f;
            Sfx.Play(Sound.Dash, 0.5f, 0.5f);

            Vector2 from = (Vector2)transform.position + Vector2.down * 0.8f;
            SpriteRenderer bomb = Art.Make("bomb", null, from, 0.9f, Layer.Enemy, "Bomb");
            Rigidbody2D body = bomb.gameObject.AddComponent<Rigidbody2D>();
            body.gravityScale = 0.8f;
            body.freezeRotation = false;
            body.angularVelocity = 200f;
            CircleCollider2D circle = bomb.gameObject.AddComponent<CircleCollider2D>();
            circle.radius = bomb.sprite.bounds.size.y * 0.32f;
            circle.isTrigger = true;
            bomb.gameObject.AddComponent<Bomb>();

            // Lob it towards the hero.
            Hero hero = StageController.I != null ? StageController.I.Hero : null;
            float dx = hero != null ? hero.Position.x - from.x : 0f;
            body.linearVelocity = new Vector2(Mathf.Clamp(dx * 0.6f, -4f, 4f), 1.5f);
        }

        void OnTriggerEnter2D(Collider2D other)
        {
            if (defeated || stunned > 0f) return;
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State != HeroState.Flying) return;

            Health--;
            // The hero bounces off her.
            Vector2 away = (hero.Position - (Vector2)transform.position).normalized;
            if (away.sqrMagnitude < 0.01f) away = Vector2.down;
            hero.Bounce(away * 7f + Vector2.up * 2f);

            sprite.sprite = Art.Get("morgra_hurt");
            Fx.Flash(transform.position, new Color(1f, 0.4f, 0.8f, 0.9f), 6f, 0.5f);
            Fx.Burst(transform.position, "spark", 14, new Color(1f, 0.8f, 0.3f), 8f, 0.7f, 0.5f, 3f);
            Sfx.Play(Sound.BossHit);
            StageController.I.Shake(0.45f, 0.35f);
            StageController.I.BossHit(Health, MaxHealth);

            if (Health <= 0)
            {
                StartCoroutine(Fall());
                return;
            }
            stunned = 1.1f;
            speed += 0.35f;
            targetY += 2.2f;
        }

        IEnumerator Fall()
        {
            defeated = true;
            Vector3 from = transform.position;
            float t = 0f;
            while (t < 1.4f)
            {
                t += Time.deltaTime;
                transform.Rotate(0f, 0f, 720f * Time.deltaTime);
                transform.position = from + new Vector3(Mathf.Sin(t * 6f) * 0.6f, -t * t * 3f, 0f);
                sprite.color = new Color(1f, 1f, 1f, 1f - t / 1.4f);
                if (Random.value < 0.3f)
                    Fx.Burst(transform.position, "spark", 1, new Color(0.8f, 0.5f, 1f), 3f, 0.5f, 0.4f, 1f);
                yield return null;
            }
            StageController.I.BossDefeated(new Vector2(0f, from.y));
            Destroy(gameObject);
        }
    }

    /// <summary>The Moon Lantern dropped by the boss. Touching it wins the stage.</summary>
    public class LanternGoal : MonoBehaviour
    {
        public float floorY = 1.2f;
        float velocity;
        bool landed;

        void Update()
        {
            if (landed) return;
            velocity -= 6f * Time.deltaTime;
            Vector3 p = transform.position;
            p.y += velocity * Time.deltaTime;
            if (p.y <= floorY)
            {
                p.y = floorY;
                landed = true;
                gameObject.AddComponent<Bob>();
                Fx.Flash(p, new Color(1f, 0.9f, 0.5f, 0.9f), 5f);
            }
            transform.position = p;
        }

        void OnTriggerStay2D(Collider2D other)
        {
            Hero hero = other.GetComponent<Hero>();
            if (hero == null || hero.State == HeroState.Dead || hero.State == HeroState.Won) return;
            StageController.I.Win(transform.position);
        }
    }
}
