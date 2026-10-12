using UnityEngine;

namespace HollowNight
{
    /// <summary>
    /// Portrait camera: the level is always 12 units wide on screen, the camera follows the hero
    /// vertically and carries the parallax background.
    /// </summary>
    public class CameraRig : MonoBehaviour
    {
        const float MinSize = 8f;
        const float Bottom = -1.5f;

        Camera cam;
        Transform target;
        Transform backdrop;
        float levelHeight;
        float shakeTime;
        float shakeDuration;
        float shakeAmount;
        float y;
        float focusOffset;

        public void Setup(Camera camera, Transform follow, float height, string background)
        {
            cam = camera;
            target = follow;
            levelHeight = height;
            Resize();

            SpriteRenderer sky = Art.Make(background, transform, new Vector3(0f, 0f, 10f), 1f, Layer.Background, "Backdrop");
            backdrop = sky.transform;
            FitBackdrop(sky);

            y = ClampY(target != null ? target.position.y + 2f : 0f);
            transform.position = new Vector3(0f, y, -10f);
        }

        void Resize()
        {
            float aspect = Mathf.Max(0.1f, cam.aspect);
            cam.orthographicSize = Mathf.Max(LevelData.HalfWidth / aspect, MinSize);
        }

        void FitBackdrop(SpriteRenderer sky)
        {
            Vector2 size = sky.sprite.bounds.size;
            float viewHeight = cam.orthographicSize * 2f;
            float viewWidth = viewHeight * cam.aspect;
            // Cover the view with some spare height for the parallax scroll.
            float scale = Mathf.Max(viewWidth / size.x, viewHeight * 1.25f / size.y);
            sky.transform.localScale = new Vector3(scale, scale, 1f);
        }

        float ClampY(float value)
        {
            float half = cam.orthographicSize;
            float min = Bottom + half;
            float max = levelHeight - half;
            if (max < min) return min;
            return Mathf.Clamp(value, min, max);
        }

        /// <summary>Shifts the view while aiming so the player can see where the shot goes.</summary>
        public void Focus(float offset)
        {
            focusOffset = offset;
        }

        public void Shake(float amount, float duration)
        {
            if (amount < shakeAmount && shakeTime > 0f) return;
            shakeAmount = amount;
            shakeDuration = duration;
            shakeTime = duration;
        }

        void LateUpdate()
        {
            if (cam == null) return;
            float goal = ClampY((target != null ? target.position.y + 2f : y) + focusOffset);
            y = Mathf.Lerp(y, goal, 1f - Mathf.Exp(-Time.deltaTime * 5f));

            Vector3 position = new Vector3(0f, y, -10f);
            if (shakeTime > 0f)
            {
                shakeTime -= Time.unscaledDeltaTime;
                float k = Mathf.Clamp01(shakeTime / Mathf.Max(0.01f, shakeDuration));
                position += (Vector3)(Random.insideUnitCircle * shakeAmount * k);
            }
            transform.position = position;

            if (backdrop != null)
            {
                float half = cam.orthographicSize;
                float min = Bottom + half;
                float max = Mathf.Max(min + 0.01f, levelHeight - half);
                float progress = Mathf.InverseLerp(min, max, y);
                float spare = cam.orthographicSize * 0.25f;
                backdrop.localPosition = new Vector3(0f, Mathf.Lerp(spare, -spare, progress), 10f);
            }
        }
    }

    /// <summary>Dotted preview of the launch arc. Stops at the first solid surface.</summary>
    public class Trajectory : MonoBehaviour
    {
        const int Dots = 22;
        const float Step = 0.07f;

        Transform[] dots;
        SpriteRenderer[] renderers;

        public void Setup()
        {
            dots = new Transform[Dots];
            renderers = new SpriteRenderer[Dots];
            for (int i = 0; i < Dots; i++)
            {
                float size = Mathf.Lerp(0.34f, 0.14f, i / (float)(Dots - 1));
                SpriteRenderer dot = Art.Make("dot", transform, Vector3.zero, size, Layer.Trajectory, "Dot");
                dots[i] = dot.transform;
                renderers[i] = dot;
            }
            Hide();
        }

        public void Show(Vector2 origin, Vector2 velocity, float gravity, Color color, float radius)
        {
            gameObject.SetActive(true);
            Vector2 previous = origin;
            bool blocked = false;
            for (int i = 0; i < Dots; i++)
            {
                float t = Step * (i + 1);
                Vector2 point = origin + velocity * t + 0.5f * t * t * new Vector2(0f, -gravity);
                if (!blocked && i > 0 && Blocked(previous, point, radius)) blocked = true;
                renderers[i].enabled = !blocked;
                if (!blocked)
                {
                    dots[i].position = point;
                    Color c = color;
                    c.a = Mathf.Lerp(1f, 0.25f, i / (float)(Dots - 1));
                    renderers[i].color = c;
                }
                previous = point;
            }
        }

        static bool Blocked(Vector2 from, Vector2 to, float radius)
        {
            Vector2 delta = to - from;
            float distance = delta.magnitude;
            if (distance < 0.0001f) return false;
            RaycastHit2D[] hits = Physics2D.CircleCastAll(from, radius * 0.6f, delta / distance, distance);
            for (int i = 0; i < hits.Length; i++)
            {
                Collider2D c = hits[i].collider;
                if (c != null && !c.isTrigger && c.GetComponent<Solid>() != null) return true;
            }
            return false;
        }

        public void Hide()
        {
            gameObject.SetActive(false);
        }
    }
}
