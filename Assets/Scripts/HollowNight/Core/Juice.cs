using System;
using System.Collections;
using UnityEngine;

namespace HollowNight
{
    public static class Ease
    {
        public static float OutCubic(float t)
        {
            t = 1f - Mathf.Clamp01(t);
            return 1f - t * t * t;
        }

        public static float InOut(float t)
        {
            t = Mathf.Clamp01(t);
            return t * t * (3f - 2f * t);
        }

        /// <summary>Overshoots past 1 then settles: used for pop-in animations.</summary>
        public static float OutBack(float t)
        {
            t = Mathf.Clamp01(t) - 1f;
            const float s = 1.70158f;
            return t * t * ((s + 1f) * t + s) + 1f;
        }
    }

    /// <summary>Small coroutine tweens. All use unscaled time so they keep running while the game is paused.</summary>
    public static class Tween
    {
        public static IEnumerator Run(float duration, Action<float> step, float delay = 0f)
        {
            if (delay > 0f)
            {
                float wait = 0f;
                while (wait < delay)
                {
                    wait += Time.unscaledDeltaTime;
                    yield return null;
                }
            }
            float t = 0f;
            while (t < duration)
            {
                t += Time.unscaledDeltaTime;
                step(Mathf.Clamp01(t / duration));
                yield return null;
            }
            step(1f);
        }

        public static IEnumerator Pop(Transform target, float duration = 0.35f, float delay = 0f, float scale = 1f)
        {
            if (target == null) yield break;
            target.localScale = Vector3.zero;
            yield return Run(duration, t =>
            {
                if (target != null) target.localScale = Vector3.one * (scale * Ease.OutBack(t));
            }, delay);
        }

        public static IEnumerator Fade(CanvasGroup group, float from, float to, float duration)
        {
            yield return Run(duration, t =>
            {
                if (group != null) group.alpha = Mathf.Lerp(from, to, t);
            });
        }
    }

    /// <summary>Gentle floating motion around the start position.</summary>
    public class Bob : MonoBehaviour
    {
        public Vector2 amplitude = new Vector2(0f, 0.15f);
        public float speed = 2f;
        public float phase;
        Vector3 origin;

        void Start()
        {
            origin = transform.localPosition;
        }

        void Update()
        {
            float t = Time.time * speed + phase;
            transform.localPosition = origin + new Vector3(Mathf.Cos(t * 0.7f) * amplitude.x, Mathf.Sin(t) * amplitude.y, 0f);
        }
    }

    public class Spin : MonoBehaviour
    {
        public float degreesPerSecond = 90f;

        void Update()
        {
            transform.Rotate(0f, 0f, degreesPerSecond * Time.deltaTime);
        }
    }

    /// <summary>Breathing scale animation.</summary>
    public class Pulse : MonoBehaviour
    {
        public float amount = 0.08f;
        public float speed = 3f;
        public bool unscaled;
        Vector3 origin;

        void Start()
        {
            origin = transform.localScale;
        }

        void Update()
        {
            float time = unscaled ? Time.unscaledTime : Time.time;
            transform.localScale = origin * (1f + Mathf.Sin(time * speed) * amount);
        }
    }

    /// <summary>Swaps between sprites at a fixed rate (bat wings, idle loops).</summary>
    public class FrameLoop : MonoBehaviour
    {
        public Sprite[] frames;
        public float fps = 8f;
        SpriteRenderer target;

        void Awake()
        {
            target = GetComponent<SpriteRenderer>();
        }

        void Update()
        {
            if (frames == null || frames.Length == 0 || target == null) return;
            target.sprite = frames[(int)(Time.time * fps) % frames.Length];
        }
    }

    /// <summary>One particle of a burst: moves, spins, shrinks and fades, then destroys itself.</summary>
    public class Mote : MonoBehaviour
    {
        public Vector2 velocity;
        public float gravity;
        public float life = 0.6f;
        public float spin;
        public float grow;
        SpriteRenderer target;
        Color color;
        Vector3 scale;
        float age;

        void Start()
        {
            target = GetComponent<SpriteRenderer>();
            color = target != null ? target.color : Color.white;
            scale = transform.localScale;
        }

        void Update()
        {
            float dt = Time.deltaTime;
            age += dt;
            if (age >= life)
            {
                Destroy(gameObject);
                return;
            }
            velocity.y -= gravity * dt;
            transform.position += (Vector3)(velocity * dt);
            transform.Rotate(0f, 0f, spin * dt);
            float k = age / life;
            transform.localScale = scale * (grow > 0f ? 1f + grow * k : 1f - 0.6f * k);
            if (target != null)
            {
                Color c = color;
                c.a = color.a * (1f - k * k);
                target.color = c;
            }
        }
    }

    /// <summary>Particle-like effects made from plain sprites.</summary>
    public static class Fx
    {
        public static void Burst(Vector2 position, string sprite, int count, Color color, float speed, float life,
            float size, float gravity = 6f)
        {
            for (int i = 0; i < count; i++)
            {
                SpriteRenderer renderer = Art.Make(sprite, null, position, size * UnityEngine.Random.Range(0.6f, 1.2f), Layer.Fx, "fx");
                renderer.color = color;
                renderer.transform.Rotate(0f, 0f, UnityEngine.Random.Range(0f, 360f));
                Mote mote = renderer.gameObject.AddComponent<Mote>();
                float angle = UnityEngine.Random.Range(0f, Mathf.PI * 2f);
                mote.velocity = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * speed * UnityEngine.Random.Range(0.4f, 1f);
                mote.gravity = gravity;
                mote.life = life * UnityEngine.Random.Range(0.7f, 1.1f);
                mote.spin = UnityEngine.Random.Range(-360f, 360f);
            }
        }

        /// <summary>Expanding soft ring/flash.</summary>
        public static void Flash(Vector2 position, Color color, float size, float life = 0.35f)
        {
            SpriteRenderer renderer = Art.Make("glow", null, position, size * 0.4f, Layer.Fx, "flash");
            renderer.color = color;
            Mote mote = renderer.gameObject.AddComponent<Mote>();
            mote.life = life;
            mote.grow = 2.5f;
        }

        public static void Dust(Vector2 position, float strength)
        {
            int count = Mathf.Clamp((int)(strength * 1.2f), 3, 10);
            Burst(position, "dot", count, new Color(1f, 1f, 1f, 0.7f), 1.5f + strength * 0.2f, 0.45f, 0.3f, -1f);
        }
    }
}
